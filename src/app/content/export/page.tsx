'use client';
import { AppSidebar } from '@/components/app-sidebar';

import { ContentTransferTool } from '@/components/content-export/tool';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { IInstance } from '@/models/IInstance';
import { Separator } from '@radix-ui/react-separator';
import { useEffect, useState } from 'react';

export default function ContentExportPage() {
  const [instances, setInstances] = useState<IInstance[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem('instances');
    if (saved) {
      try {
        const parsedInstances = JSON.parse(saved);
        setInstances(parsedInstances);
      } catch (error) {
        console.error('Error parsing instances from sessionStorage:', error);
      }
    }
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
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Content Export Tool</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="container mx-auto py-6 px-4">
          <div className="border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <ContentTransferTool instances={instances} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
