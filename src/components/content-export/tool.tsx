'use client';
import { enumInstanceType, IInstance } from '@/models/IInstance';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { ExportTool } from './export';
import { ImportTool } from './import';

interface ContentTransferToolProps {
  instances: IInstance[];
  isExport: boolean;
}

export const ContentTransferTool: FC<ContentTransferToolProps> = ({ instances, isExport }) => {
  const [activeInstance, setActiveInstance] = useState<IInstance | undefined>();
  const [configurationOpen, setConfigurationOpen] = useState<boolean>(true);
  const [exportOpen, setExportOpen] = useState<boolean>(isExport);

  useEffect(() => {
    console.log(instances);
    if (instances.length === 1) {
      setActiveInstance(instances[0]);
    }
  }, [instances]);

  const handleInstanceSelect = (value: string) => {
    const instance = instances.find((instance) => instance.name === value);
    setActiveInstance(
      instance ?? {
        name: '',
        instanceType: enumInstanceType.edge,
        clientId: '',
        clientSecret: '',
        graphQlEndpoint: '',
        apiToken: '',
        id: '',
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {isExport ? 'Content Export Tool' : 'Content Import Tool'}
        </h1>
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
                      <Select
                        onValueChange={handleInstanceSelect}
                        defaultValue={instances.length === 1 ? instances[0].name : ''}
                      >
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

      {
        <Tabs defaultValue={exportOpen ? 'export' : 'import'} className="w-full">
          <TabsList className="grid w-full grid-cols-2 border-b border-border">
            <TabsTrigger onClick={() => (window.location.href = '/content/export')} value="export" className="">
              Export
            </TabsTrigger>
            <TabsTrigger onClick={() => (window.location.href = '/content/import')} value="import" className="">
              Import
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }

      {activeInstance &&
        (exportOpen ? (
          <ExportTool activeInstance={activeInstance} setExportOpen={setExportOpen} exportOpen={exportOpen} />
        ) : (
          <ImportTool activeInstance={activeInstance} />
        ))}
    </div>
  );
};
