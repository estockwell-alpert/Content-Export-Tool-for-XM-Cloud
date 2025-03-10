import { IInstance } from '@/models/IInstance';
import { ISettings } from '@/models/ISettings';
import { GenerateContentExport } from '@/services/sitecore/contentExportToolUtil';
import { FC, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { SaveSettingsModal } from './save-settings-modal';

interface ExportToolProps {
  activeInstance: IInstance | undefined;
  setExportOpen: (open: boolean) => void;
  exportOpen: boolean;
}

export const ExportTool: FC<ExportToolProps> = ({ activeInstance, setExportOpen, exportOpen }) => {
  const [startItem, setStartItem] = useState<string>();
  const [templates, setTemplates] = useState<string>();
  const [templateNames, setTemplateNames] = useState<string>();
  const [fields, setFields] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedSettings, setSavedSettings] = useState<ISettings[]>([]);

  const handleStartItem = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStartItem(event.target.value);
  };
  const handleTemplates = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplates(event.target.value);
  };
  const handleFields = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFields(event.target.value);
  };
  const handleTemplateNames = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplateNames(event.target.value);
  };

  const runExport = () => {
    if (!activeInstance || !activeInstance.name) {
      alert('Please select an instance. If you do not have any instances, configure one now');
      return;
    }

    GenerateContentExport(activeInstance.graphQlEndpoint, activeInstance.apiToken, startItem, templates, fields);
  };

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved) as ISettings[];
        setSavedSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const handleSaveSettings = (newSettings: Omit<ISettings, 'id'>) => {
    const settings: ISettings = {
      ...newSettings,
      id: crypto.randomUUID(),
      startItem: startItem ?? '',
      templates: templates ?? '',
      fields: fields ?? '',
    };

    // check if setting with name already exists
    const filteredSettings = savedSettings.filter((settings) => settings.name !== newSettings.name);

    // add
    const updatedSavedSettings = [...filteredSettings, settings];

    setSavedSettings(updatedSavedSettings);
    sessionStorage.setItem('settings', JSON.stringify(updatedSavedSettings));

    setIsModalOpen(false);
  };

  const handleSelectSettings = (value: string) => {
    const setting = savedSettings.find((setting) => setting.name === value);

    if (!setting) {
      alert("Something went wrong, couldn't find settings");
      return;
    }

    setStartItem(setting.startItem);
    setTemplates(setting.templates);
    setFields(setting.fields);
  };

  return (
    <>
      <Card className="rounded-sm border bg-card p-6 mb-6">
        <div className="space-y-4">
          <div className="container">
            <div className="row">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Saved Settings</h2>

                {savedSettings && savedSettings.length > 0 && (
                  <>
                    <div className="flex flex-col space-y-4">
                      <Select onValueChange={handleSelectSettings}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Saved Configuration" />
                        </SelectTrigger>
                        <SelectContent>
                          {savedSettings.map((settings) => (
                            <SelectItem key={settings.id} value={settings.name}>
                              {settings.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card className="rounded-sm border bg-card p-6">
        <CardHeader>
          <CardTitle>Export Content</CardTitle>
          <CardDescription>Export content from your Sitecore instance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Start Items Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Start Item(s)</label>
                <Button variant="ghost" size="sm" onClick={() => setStartItem('')}>
                  Clear
                </Button>
              </div>
              <Textarea
                value={startItem}
                onChange={handleStartItem}
                placeholder="e.g. {D4D93D21-A8B4-4C0F-8025-251A38D9A04D}"
                className="font-mono text-sm"
              />
              <Alert variant="default" className="mt-2">
                <AlertDescription className="text-xs">
                  Enter GUIDs of starting nodes separated by commas. Only content beneath these nodes will be exported.
                </AlertDescription>
              </Alert>
            </div>

            {/* Templates Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Templates</label>
                <Button variant="ghost" size="sm" onClick={() => setTemplates('')}>
                  Clear
                </Button>
              </div>
              <Textarea
                value={templates}
                onChange={handleTemplates}
                placeholder="e.g. {CC92A3D8-105C-4016-8BD7-22162C1ED919}"
                className="font-mono text-sm"
              />
              <Alert variant="default" className="mt-2">
                <AlertDescription className="text-xs">
                  Enter template GUIDs separated by commas. Leave blank to include all templates.
                </AlertDescription>
              </Alert>
            </div>

            {/* Fields Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Fields</label>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setFields('')}>
                    Clear
                  </Button>
                </div>
              </div>
              <Textarea
                value={fields}
                onChange={handleFields}
                placeholder="e.g. title, image, taxonomies"
                className="text-sm"
              />

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="default" size="sm" onClick={runExport}>
                    Run Export
                  </Button>

                  <Button variant="default" size="sm" onClick={() => setIsModalOpen(true)}>
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <SaveSettingsModal open={isModalOpen} onOpenChange={setIsModalOpen} onSubmit={handleSaveSettings} />
        </CardContent>
      </Card>
    </>
  );
};
