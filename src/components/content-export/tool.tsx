'use client';
import { enumInstanceType, IInstance } from '@/models/IInstance';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { FC, useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ExportTool } from './export';
import { ImportTool } from './import';

interface ContentTransferToolProps {
  instances: IInstance[];
}

export const ContentTransferTool: FC<ContentTransferToolProps> = ({ instances }) => {
  const [activeInstance, setActiveInstance] = useState<IInstance | undefined>();
  const [configurationOpen, setConfigurationOpen] = useState<boolean>(true);
  const [exportOpen, setExportOpen] = useState<boolean>(true);

  const handleInstanceSelect = (value: string) => {
    console.log('hello');
    const instance = instances.find((instance) => instance.name === value);
    setActiveInstance(
      instance ?? {
        name: '',
        instanceType: enumInstanceType.xmc,
        clientId: '',
        clientSecret: '',
        graphQlEndpoint: '',
        apiToken: '',
        id: '',
      }
    );

    console.log(instance);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Content Export Tool</h1>
      </div>

      {/* Loading Modal */}
      <div className="fixed inset-0 bg-black/50 hidden" id="loading-modal">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <div className="container">
            <div className="row">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Instance Selection</h2>

                {instances && instances.length > 0 && (
                  <>
                    <div className="flex flex-col space-y-4">
                      <Select onValueChange={handleInstanceSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an instance" />
                        </SelectTrigger>
                        <SelectContent>
                          {instances.map((instance) => (
                            <SelectItem key={instance.id} value={instance.name}>
                              {instance.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Link href="/settings/instance">
                        <Button variant="outline" size="sm">
                          <Settings />
                          Configure Additional Instances
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
                {instances?.length === 0 && (
                  <div className="flex flex-col space-y-4">
                    <p>Before you begin, you must configure at least one instance.</p>
                    <Link href="/settings/instance">
                      <Button variant="default" size="sm" className="cursor-pointer">
                        <Settings />
                        Configure Instances
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />

      {activeInstance && (
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2 border-b border-border">
            <TabsTrigger value="export" className="">
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="">
              Import
            </TabsTrigger>
          </TabsList>
          <TabsContent value="export" className="pt-6">
            <ExportTool activeInstance={activeInstance} setExportOpen={setExportOpen} exportOpen={exportOpen} />
          </TabsContent>
          <TabsContent value="import" className="pt-6">
            <ImportTool activeInstance={activeInstance} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
