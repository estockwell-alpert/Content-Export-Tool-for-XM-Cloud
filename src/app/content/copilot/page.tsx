'use client';
import { AppSidebar } from '@/components/app-sidebar';
import { CopilotChat } from '@/components/copilot/copilot-chat';

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
import { enumTokenTypes, IToken } from '@/models/IToken';
import { Separator } from '@radix-ui/react-separator';
import { useEffect, useState } from 'react';

export default function CopilotPage() {
  const [instances, setInstances] = useState<IInstance[]>([]);
  const [openAiToken, setOpenAIToken] = useState<IToken | undefined>();

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

  useEffect(() => {
    const savedTokens = sessionStorage.getItem('api-tokens');
    if (savedTokens) {
      try {
        const parsedTokens = JSON.parse(savedTokens);
        const openAIConfig = parsedTokens.find((token: any) => token.type === enumTokenTypes.OpenAI);
        if (openAIConfig) {
          setOpenAIToken(openAIConfig);
        }
      } catch (error) {
        console.error('Error parsing tokens from sessionStorage:', error);
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
                  <BreadcrumbPage>Content Copilot</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="container mx-auto py-6 px-4">
          <div className="">
            <div className="p-6">
              {openAiToken ? (
                <CopilotChat token={openAiToken} instances={instances} />
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Please configure an OpenAI API token in settings to use the Content Copilot.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
