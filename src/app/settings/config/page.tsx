'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { AddTokenModal } from '@/components/tokens/add-token-modal';
import { TokenTable } from '@/components/tokens/token-table';
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
import { IToken } from '@/models/IToken';
import { Separator } from '@radix-ui/react-separator';
import { PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TokenConfigPage() {
  const [tokens, setTokens] = useState<IToken[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('api-tokens');
      if (saved) {
        setTokens(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  }, []);

  const handleAddToken = (newToken: Omit<IToken, 'id'>) => {
    const token: IToken = {
      ...newToken,
      id: crypto.randomUUID(),
    };
    const updatedTokens = [...tokens, token];
    setTokens(updatedTokens);
    localStorage.setItem('api-tokens', JSON.stringify(updatedTokens));
    setIsModalOpen(false);
  };

  const handleDeleteToken = (id: string) => {
    const updatedTokens = tokens.filter((token) => token.id !== id);
    setTokens(updatedTokens);
    localStorage.setItem('api-tokens', JSON.stringify(updatedTokens));
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
                  <BreadcrumbPage>API Tokens</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="container mx-auto py-6 px-4">
          <div className="border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">API Token Configuration</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Token
                </Button>
              </div>

              <AddTokenModal open={isModalOpen} onOpenChange={setIsModalOpen} onSubmit={handleAddToken} />

              <TokenTable tokens={tokens} onDelete={handleDeleteToken} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
