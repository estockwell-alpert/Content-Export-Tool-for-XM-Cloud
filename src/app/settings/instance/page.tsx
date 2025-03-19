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
      const saved = sessionStorage.getItem('instances');
      if (saved) {
        const parsedInstances = JSON.parse(saved) as IInstance[];
        setInstances(parsedInstances);
      }
    } catch (error) {
      console.error('Error loading instances:', error);
    }
  }, []);

  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  const handleAddInstance = async (newInstance: Omit<IInstance, 'id'>) => {
    try {
      if (newInstance.instanceType === enumInstanceType.xmc) {
        const tokenResponse = await getXmCloudToken(newInstance.clientId as string, newInstance.clientSecret as string);

        newInstance.authToken = tokenResponse.access_token;

        // Store token expiration if needed
        newInstance.expiration = new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString();
      }

      if (newInstance.instanceType === enumInstanceType.edge) {
        newInstance.exportEndpoint = 'https://edge.sitecorecloud.io/api/graphql/v1';
      } else {
        // automatically generate import and export endpoints
        if (newInstance.graphQlEndpoint && newInstance.graphQlEndpoint.indexOf('/sitecore/api') < 0) {
          const instanceUrl =
            newInstance.graphQlEndpoint.substring(newInstance.graphQlEndpoint.length - 1) === '/'
              ? newInstance.graphQlEndpoint.substring(0, newInstance.graphQlEndpoint.length - 1)
              : newInstance.graphQlEndpoint;

          newInstance.graphQlEndpoint = instanceUrl;

          console.log('Instance URL:' + instanceUrl);

          newInstance.exportEndpoint = instanceUrl + '/sitecore/api/graphql/v1';
          newInstance.importEndpoint = instanceUrl + '/sitecore/api/authoring/graphql/v1';
        } else {
          // if they put in a full URL, we don't know whether it's an import or export endpoint so just set both
          newInstance.importEndpoint = newInstance.graphQlEndpoint;
          newInstance.exportEndpoint = newInstance.graphQlEndpoint;
        }
      }

      const instance: IInstance = {
        ...newInstance,
        id: crypto.randomUUID(),
      };

      const updatedInstances = [...instances, instance];
      setInstances(updatedInstances);
      sessionStorage.setItem('instances', JSON.stringify(updatedInstances));
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
      sessionStorage.setItem('instances', JSON.stringify(updatedInstances));
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
                    Generate Authorization Token
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

              <ListingTable instances={instances} onDelete={handleDeleteInstance} />
            </div>
          </div>
        </div>
        <div className="container mx-auto py-10"></div>
      </SidebarInset>
    </SidebarProvider>
  );
}
