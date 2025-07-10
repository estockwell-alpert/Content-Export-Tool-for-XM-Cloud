'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { ListingTable } from '@/components/instances/listing-table';
import { RegistrationGenModal } from '@/components/instances/registration-gen-modal';
import { RegistrationTokenModal } from '@/components/instances/registration-token-modal';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { enumInstanceType, IInstance } from '@/models/IInstance';
import { getXmCloudToken } from '@/services/sitecore/getXmCloudToken';
import { Separator } from '@radix-ui/react-separator';
import { PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function InstanceSetupPage() {
  const [instances, setInstances] = useState<IInstance[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('instances');
      if (saved) {
        const parsedInstances = JSON.parse(saved) as IInstance[];
        setInstances(parsedInstances);
      } else {
        const defaultEdgeInstance: IInstance = {
          id: 'Edge Default Instance',
          name: 'Edge Default Instance',
          instanceType: enumInstanceType.edge,
          clientId: '',
          clientSecret: '',
          graphQlEndpoint: 'https://edge.sitecorecloud.io/api/graphql/v1',
          apiToken: 'SVNQKzlEcVJrQW1aNmE1M2RzSHo4bE9HZFo0S1g2a3hPdTAzVWhCd2lRTT18Y25oLWU2MTYyY2Nj',
        };

        const defaultAuthInstance: IInstance = {
          id: 'Auth Default Instance',
          name: 'Auth Default Instance',
          instanceType: enumInstanceType.auth,
          clientId: 'yj52f8jr3lep6sVeiWOwraKsRPH2nCRE',
          clientSecret: 'Bl9OuReXSQM18jKu-9J1Gbemq-Klbgch0gXGcXRON_WDXAweLpUUV4mA_u5-1eDF',
          graphQlEndpoint:
            'https://xmc-velirstudio1c03-xmcloudacce3bb5-devd6fa.sitecorecloud.io/sitecore/api/authoring/graphql/v1',
          apiToken:
            'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InpnbnhyQk9IaXJ0WXp4dnl1WVhNZyJ9.eyJodHRwczovL2F1dGguc2l0ZWNvcmVjbG91ZC5pby9jbGFpbXMvY2xpZW50X25hbWUiOiJIYWNrYXRob24iLCJodHRwczovL2F1dGguc2l0ZWNvcmVjbG91ZC5pby9jbGFpbXMvdGVuYW50X2lkIjoiNDE2MWQ0Y2EtMTM2Ni00MDZlLTJkN2ItMDhkZDA0MGQ2MGZjIiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL3RlbmFudF9uYW1lIjoidmVsaXJzdHVkaW8xYzAzLXhtY2xvdWRhY2NlM2JiNS1kZXZkNmZhIiwic2Nfc3lzX2lkIjoiNTkwNzYzN2MtY2RkZi00OGU5LWFjZWYtYmQwNmYxYTZiYWI4IiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL3RlbmFudC9jZHBfY2xpZW50X2tleSI6IjQ0NzE2NzdhYTA3YTljZGUyMDQ0YTZkODgyOGU4ZGY0IiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL3RlbmFudC9BSUVtYmVkZGVkVGVuYW50SUQiOiJiZTk0Nzk1NS1kYmE1LTRmYTUtMzcxYy0wOGRkMWExNDliNGUiLCJodHRwczovL2F1dGguc2l0ZWNvcmVjbG91ZC5pby9jbGFpbXMvb3JnX2lkIjoib3JnX3djaFJvRmszTGhFUndmaFYiLCJodHRwczovL2F1dGguc2l0ZWNvcmVjbG91ZC5pby9jbGFpbXMvb3JnX25hbWUiOiJ2ZWxpci1zdHVkaW9zLWluYy0xIiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL29yZ19kaXNwbGF5X25hbWUiOiJWZWxpciBTdHVkaW9zLCBJbmMuIiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL29yZ19hY2NvdW50X2lkIjoiMDAxMU4wMDAwMVV0R0xGUUEzIiwiaHR0cHM6Ly9hdXRoLnNpdGVjb3JlY2xvdWQuaW8vY2xhaW1zL29yZ190eXBlIjoicGFydG5lciIsInNjX29yZ19yZWdpb24iOiJ1c2UiLCJpc3MiOiJodHRwczovL2F1dGguc2l0ZWNvcmVjbG91ZC5pby8iLCJzdWIiOiJ5ajUyZjhqcjNsZXA2c1ZlaVdPd3JhS3NSUEgybkNSRUBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9hcGkuc2l0ZWNvcmVjbG91ZC5pbyIsImlhdCI6MTc1MjE1NTcyNywiZXhwIjoxNzUyMjQyMTI3LCJzY29wZSI6InhtY2xvdWQuY206YWRtaW4geG1jcHViLnF1ZXVlOnIgeG1jcHViLmpvYnMudDpyIHhtY3B1Yi5qb2JzLnQ6dyB4bWNkYXRhLml0ZW1zLnQ6ciB4bWNkYXRhLnBydmRzLnQ6cmMgeG1jZGF0YS5wcnZkcy50OnIgeG1jZGF0YS5wcnZkcy50OncgeG1jZGF0YS5wcnZkcy50OmwiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJ5ajUyZjhqcjNsZXA2c1ZlaVdPd3JhS3NSUEgybkNSRSJ9.D7yufWjMvlTJq6U3GTq8WgNEUKmapyugkWfTxXp01w7-4xmznKgO_MOrsBrP4itEJon5Nl9sagL5KsbgtqDYYIvB3ZFWOYsfZqu7lcMBeerBRygL70OiZS_dTmEUpsLfLhf8nxPMDFNr5ICNtmQqlWHxTeS8isP4ADSYvSs7Dry3WutSLAAzL80zjFThfyChLB4cm-j6HjHBxy-5c4zb9N8DkHtnMQ2eKsjSA4HsHFRsoHC-9Er7DlwXZD6wKbXLpjDpM7SBsHTKUEhs1KjVl39g0S8Cp-sN1oH9sxtCgY-osVR2XQw8KhaBfBgB9svCC2RYf8GbQfepN9K1nbZaJg',
        };

        const updatedInstances = [...instances, defaultEdgeInstance, defaultAuthInstance];
        setInstances(updatedInstances);
      }
    } catch (error) {
      console.error('Error loading instances:', error);
    }
  }, []);

  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  const handleAddInstance = async (newInstance: Omit<IInstance, 'id'>) => {
    console.log('SUBMITTED');
    try {
      const instance: IInstance = {
        ...newInstance,
        id: crypto.randomUUID(),
      };

      const updatedInstances = [...instances, instance];
      setInstances(updatedInstances);
      localStorage.setItem('instances', JSON.stringify(updatedInstances));
      setIsTokenModalOpen(false);
      setIsGenModalOpen(false);
    } catch (error) {
      console.error('Error adding instance:', error);
    }
  };

  const handleDeleteInstance = (id: string) => {
    const updatedInstances = instances.filter((instance) => instance.id !== id);
    setInstances(updatedInstances);
    if (typeof window !== 'undefined') {
      localStorage.setItem('instances', JSON.stringify(updatedInstances));
    }
  };

  const handleRefreshInstance = async (id: string) => {
    const allInstances = instances;
    console.log('Refresh ID: ' + id);
    for (let instance of allInstances) {
      console.log(instance);
      if (instance.id === id) {
        console.log('Refreshing instance...');
        const tokenResponse = await getXmCloudToken(instance.clientId ?? '', instance.clientSecret ?? '');
        if (tokenResponse.access_token) {
          instance.apiToken = tokenResponse.access_token;
          console.log('Updated access token');
        } else {
          console.log(tokenResponse);
        }
      }
    }
    setInstances(allInstances);
    if (typeof window !== 'undefined') {
      localStorage.setItem('instances', JSON.stringify(instances));
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Instance Configuration</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="container mx-auto py-6 px-4">
          <div className="border bg-card text-card-foreground shadow-sm ">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Instance Configuration</h1>
                <div className="flex gap-2">
                  <Button onClick={() => setIsTokenModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Instance
                  </Button>
                  <Button onClick={() => setIsGenModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Generate Token
                  </Button>
                </div>
              </div>

              <RegistrationTokenModal
                open={isTokenModalOpen}
                onOpenChange={setIsTokenModalOpen}
                onSubmit={handleAddInstance}
              />
              <RegistrationGenModal
                open={isGenModalOpen}
                onOpenChange={setIsGenModalOpen}
                onSubmit={handleAddInstance}
              />

              <ListingTable instances={instances} onDelete={handleDeleteInstance} onRefresh={handleRefreshInstance} />
            </div>
          </div>
        </div>
        <div className="container mx-auto py-10"></div>
      </SidebarInset>
    </SidebarProvider>
  );
}
