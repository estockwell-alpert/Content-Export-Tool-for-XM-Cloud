'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { ContentExportStats } from '@/components/stats/content-export';
import { CopilotRequestStats } from '@/components/stats/copilot-requests';
import { InstanceStats } from '@/components/stats/instance';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Welcome } from '@/components/welcome';
import { enumInstanceType, IInstance } from '@/models/IInstance';
import { Separator } from '@radix-ui/react-separator';
import { useEffect, useState } from 'react';

export default function Home() {
  const [instances, setInstances] = useState<IInstance[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('instances');
    if (saved) {
      try {
        const parsedInstances = JSON.parse(saved);
        setInstances(parsedInstances);
      } catch (error) {
        console.error('Error parsing instances from localStorage:', error);
      }
    }

    const defaultEdgeInstance: IInstance = {
      id: 'Edge Default Instance',
      name: 'Edge Default Instance',
      instanceType: enumInstanceType.edge,
      clientId: '',
      clientSecret: '',
      graphQlEndpoint: 'https://edge.sitecorecloud.io/api/graphql/v1',
      apiToken: 'SVNQKzlEcVJrQW1aNmE1M2RzSHo4bE9HZFo0S1g2a3hPdTAzVWhCd2lRTT18Y25oLWU2MTYyY2Nj',
    };

    const updatedInstances = [...instances, defaultEdgeInstance];
    setInstances(updatedInstances);
  }, []);

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
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="container mx-auto py-6 px-4 md:px-6">
          <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
          {instances ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InstanceStats />
                <ContentExportStats />
                <CopilotRequestStats />
              </div>
            </>
          ) : (
            <Welcome />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
