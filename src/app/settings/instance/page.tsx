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
import { IInstance } from '@/models/IInstance';
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
