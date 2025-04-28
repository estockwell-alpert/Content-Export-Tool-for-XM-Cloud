import { ITemplateSchema } from '@/app/api/export/schema/route';
import { IInstance } from '@/models/IInstance';
import { PostCreateTemplateQuery, PostMutationQuery, ResultsToXslx } from '@/services/sitecore/contentExportToolUtil';
import Papa from 'papaparse';
import { FC, useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface ImportToolProps {
  activeInstance: IInstance | undefined;
}

export const ImportTool: FC<ImportToolProps> = ({ activeInstance }) => {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [selectedSchemaFile, setSelectedSchemaFile] = useState<File>();
  const [isUpdate, setIsUpdate] = useState<boolean>(true);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [parsedCsvData, setParsedCsvData] = useState<any>();
  const [errors, setErrors] = useState<string[]>([]);
  const [fileKey, setFileKey] = useState<string>('');
  const [schemaFileKey, setSchemaFileKey] = useState<string>('');
  const [schemaImportMessages, setSchemaImportMessages] = useState<string[]>([]);
  const [contentImport, setContentImport] = useState<boolean>(true);

  const clearSchemaFileInput = () => {
    //const inpt = document.getElementById("inptFile");
    //inpt.value
    setSchemaFileKey(Math.random().toString(36));
    setSelectedSchemaFile(undefined);
  };

  const clearFileInput = () => {
    //const inpt = document.getElementById("inptFile");
    //inpt.value
    setFileKey(Math.random().toString(36));
    setSelectedFile(undefined);
  };

  const onFileChange = (event: any) => {
    setErrors([]);
    setSchemaImportMessages([]);
    setParsedCsvData(null);
    // Update the state
    const file = event.target.files[0];
    setSelectedFile(file);

    try {
      if (!file) {
        alert('No file selected');
        return;
      }

      if (file.type === 'text/csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            setParsedCsvData(results.data);
          },
        });
      }
    } catch (error) {
      console.error('Error parsing file:', error);
    }
  };

  const onSchemaFileChange = (event: any) => {
    setErrors([]);
    setSchemaImportMessages([]);
    setParsedCsvData(null);
    // Update the state
    const file = event.target.files[0];
    setSelectedSchemaFile(file);

    // parse if csv
    try {
      if (file.type === 'text/csv') {
        Papa.parse(file, {
          header: false,
          skipEmptyLines: true,
          complete: function (results) {
            setParsedCsvData(results.data);
          },
        });
      }
    } catch (error) {
      console.error('Error parsing file:', error);
    }
  };

  const downloadExample = async () => {
    let templates: ITemplateSchema[] = [];

    templates.push({
      templateName: 'Promo',
      templatePath: '{7479293E-4A3A-47C8-9370-2D32EF37E07C}',
      folder: 'Templates',
      sections: [
        {
          name: 'Content',
          fields: [
            {
              template: '',
              path: '',
              section: '',
              name: 'Image',
              machineName: 'image',
              fieldType: 'Image',
              source: '',
            },
            {
              template: '',
              path: '',
              section: '',
              name: 'Heading',
              machineName: 'heading',
              fieldType: 'Single-Line Text',
              source: '',
              defaultValue: '$name',
            },
            {
              template: '',
              path: '',
              section: '',
              name: 'Link 1',
              machineName: 'link1',
              fieldType: 'General Link',
              source: '',
            },
          ],
        },
        {
          name: 'Search',
          fields: [
            {
              template: '',
              path: '',
              section: '',
              name: 'Content Type',
              machineName: 'contentType',
              fieldType: 'Droplist',
              source: 'query:$site/Search/Enumerations/Content Type/*',
            },
            {
              template: '',
              path: '',
              section: '',
              name: 'Taxonomies',
              machineName: 'taxonomies',
              fieldType: 'Multiroot Treelist',
              source: '{5344462B-31B3-443B-8FD5-8A7A881A66A3}',
              helpText: 'not displayed, only used for search',
            },
          ],
        },
      ],
    });

    const headers = [
      'Template',
      'Parent',
      'Section',
      'Field Name',
      'Machine Name',
      'Field Type',
      'Source',
      'Default Value',
      'Help Text',
      ' ',
      ' ',
    ];

    ResultsToXslx(templates, 'Example Schema Import', headers);
  };

  const handleRunSchemaImport = async () => {
    if (!activeInstance) {
      alert('No instance selected');
      return;
    }

    if (!selectedSchemaFile) {
      alert('You must upload a file first');
      return;
    }

    const messages = await PostCreateTemplateQuery(activeInstance, selectedSchemaFile, parsedCsvData);

    setSchemaImportMessages(messages);
    setParsedCsvData(null);

    if (messages && messages.length > 1) {
      alert('Completed template import with errors; review error messages');
    } else {
      alert(messages[0]);
    }
  };

  const handleRunImport = async () => {
    setSchemaImportMessages([]);
    try {
      if (!parsedCsvData) {
        alert('Please upload a file');
        return;
      }

      if (!activeInstance) {
        alert('No instance selected');
        return;
      }

      if (isUpdate) {
        const errors = await PostMutationQuery(activeInstance, true, activeInstance?.graphQlEndpoint, parsedCsvData);
        console.log(errors);
        setErrors(errors);
      } else if (isCreate) {
        const errors = await PostMutationQuery(activeInstance, false, activeInstance?.graphQlEndpoint, parsedCsvData);
        setErrors(errors);
      }

      const message = isUpdate ? 'Update' : 'Create';

      if (errors && errors.length > 0) {
        alert(message + ' completed with errors; check error messages');
      } else {
        alert(message + 'd ' + parsedCsvData.length + ' items');
      }
      // clear out csv data
      setParsedCsvData(null);
    } catch (error) {
      console.error('Error importing content:', error);
    }
  };

  return (
    <>
      <Tabs defaultValue={contentImport ? 'content' : 'schema'} className="w-full">
        <TabsList className="grid w-full grid-cols-2 border-b border-border">
          <TabsTrigger value="content" className="">
            Content Import
          </TabsTrigger>
          <TabsTrigger value="schema" className="">
            Template Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="pt-6">
          <Card className="rounded-sm border bg-card">
            <CardHeader>
              <CardTitle>Import Content</CardTitle>
              <CardDescription>
                Import content from CSV files into your Sitecore instance <br />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className={errors.length > 1 ? 'errors' : ''}>
                {errors.map((message, index) => (
                  <span key={index}>{message}</span>
                ))}
              </p>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <div className="flex justify-between gap-4">
                  <Input
                    key={fileKey}
                    id="inptFile"
                    type="file"
                    accept=".csv"
                    onChange={onFileChange}
                    className="cursor-pointer"
                  />
                  <a onClick={clearFileInput}>Clear</a>
                </div>

                <Button onClick={handleRunImport} disabled={!selectedFile}>
                  Import
                </Button>
              </div>

              {selectedFile && (
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">File Details</h3>
                  <div className="space-y-1 text-sm">
                    <p>File Name: {selectedFile.name}</p>
                    <p>Type: {selectedFile.type}</p>
                    <p>Modified: {new Date(selectedFile.lastModified).toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="importOptions">
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      value="update"
                      checked={isUpdate}
                      onChange={() => {
                        setIsUpdate(true);
                        setIsCreate(false);
                      }}
                    />
                    Update
                  </label>
                </div>
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      value="create"
                      checked={isCreate}
                      onChange={() => {
                        setIsCreate(true);
                        setIsUpdate(false);
                      }}
                    />
                    Create
                  </label>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <div className="space-y-4">
                    <h3 className="font-medium">Getting Started</h3>
                    <p>Required CSV columns for updating items:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        <strong>Item Path</strong> - Item path string e.g. /sitecore/content/Home
                      </li>
                    </ul>
                    <p>Required CSV columns for new items:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        <strong>Item Path</strong> - Parent item ID (GUID)
                      </li>
                      <li>
                        <strong>Template</strong> - Item template (GUID)
                      </li>
                      <li>
                        <strong>Name</strong> - Item name (string)
                      </li>
                    </ul>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="font-medium">Important Notes</h3>
                      <ul className="list-disc pl-4 space-y-1 text-sm">
                        <li>Review all modified items before publishing</li>
                        <li>Only CSV format is supported</li>
                        <li>Item Path must be string for Update, GUID for Create</li>
                        <li>
                          Supports all field types, formatted as <b>raw values</b>
                        </li>
                        <li>Add Language column for specific versions</li>
                      </ul>
                      <h3 className="font-medium">Tips</h3>
                      <p>
                        The best way to make sure your file is formatted correctly is to export your content first, edit
                        in Excel, and then import the same file; it will already be formatted correctly.
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="schema" className="pt-6">
          <Card className="rounded-sm border bg-card">
            <CardHeader>
              <CardTitle>Import Templates</CardTitle>
              <CardDescription>
                Import templates into your Sitecore instance <br />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className={schemaImportMessages.length > 1 ? 'errors' : ''}>
                {schemaImportMessages.map((message, index) => (
                  <span key={index}>{message}</span>
                ))}
              </p>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <div className="flex justify-between gap-4">
                  <Input
                    key={schemaFileKey}
                    id="inptSchemaFile"
                    type="file"
                    accept=".csv, .xlsx"
                    onChange={onSchemaFileChange}
                    className="cursor-pointer"
                  />
                  <a onClick={clearSchemaFileInput}>Clear</a>
                </div>
                <Button onClick={handleRunSchemaImport} disabled={!selectedSchemaFile}>
                  Import Schema
                </Button>
              </div>

              {selectedSchemaFile && (
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">File Details</h3>
                  <div className="space-y-1 text-sm">
                    <p>File Name: {selectedSchemaFile.name}</p>
                    <p>Type: {selectedSchemaFile.type}</p>
                    <p>Modified: {new Date(selectedSchemaFile.lastModified).toLocaleString()}</p>
                  </div>
                </div>
              )}

              <Alert>
                <AlertDescription>
                  <div className="space-y-4">
                    <h3 className="font-medium">Getting Started</h3>
                    <p>Required CSV columns:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        <strong>Template</strong> - Template Name
                      </li>
                      <li>
                        <strong>Parent</strong> - Parent Item ID (GUID)
                      </li>
                      <li>
                        <strong>Section</strong> - section name for field
                      </li>
                      <li>
                        <strong>Field Name</strong> - field name (put display name here if different from machine name)
                      </li>

                      <li>
                        <strong>Field Type</strong> - e.g. Single-Line Text, Checkbox, Droptree, General Link
                      </li>
                    </ul>
                    <p>Optional CSV columns:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>
                        <strong>Machine Name</strong> - (optional) name of field, if different from display name
                      </li>
                      <li>
                        <strong>Default Value</strong> - (optional) default value
                      </li>
                      <li>
                        <strong>Help Text</strong> - (optional) field description
                      </li>
                    </ul>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="font-medium">Important Notes</h3>
                      <ul className="list-disc pl-4 space-y-1 text-sm">
                        <li>XLSX and CSV supported</li>
                      </ul>

                      <a className="link" onClick={downloadExample}>
                        Download Example
                      </a>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};
