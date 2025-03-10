import { IInstance } from '@/models/IInstance';
import { PostMutationQuery } from '@/services/sitecore/contentExportToolUtil';
import Papa from 'papaparse';
import { FC, useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

interface ImportToolProps {
  activeInstance: IInstance | undefined;
}

export const ImportTool: FC<ImportToolProps> = ({ activeInstance }) => {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isUpdate, setIsUpdate] = useState<boolean>(true);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const onFileChange = (event: any) => {
    // Update the state
    setSelectedFile(event.target.files[0]);
  };

  const onFileUpload = () => {
    if (!selectedFile) {
      alert('No file selected');
      return;
    }

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        console.log(results.data);

        if (isUpdate) {
          PostMutationQuery(true, activeInstance?.graphQlEndpoint, activeInstance?.apiToken, results.data);
        } else if (isCreate) {
          PostMutationQuery(false, activeInstance?.graphQlEndpoint, activeInstance?.apiToken, results.data);
        }
      },
    });
  };

  const fileData = () => {
    if (selectedFile) {
      return (
        <div>
          <h2>File Details:</h2>
          <p>File Name: {selectedFile.name}</p>

          <p>File Type: {selectedFile.type}</p>

          <p>
            Last Modified:
            {selectedFile.lastModified}
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <br />
          <h4>Choose before Pressing the Upload button</h4>
        </div>
      );
    }
  };
  return (
    <Card className="rounded-sm border bg-card">
      <CardHeader>
        <CardTitle>Import Content</CardTitle>
        <CardDescription>
          Import content from CSV files into your Sitecore instance <br />
          <b>Note</b>: At this time, Import is not working because requests to the GraphQL Authoring API are blocked by
          CORS policy. However, you can see the generated mutation queries logged in the browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Input type="file" accept=".csv" onChange={onFileChange} className="cursor-pointer" />
          <Button onClick={onFileUpload} disabled={!selectedFile}>
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
                  <li>Supports string, image, and link fields</li>
                  <li>Add Language column for specific versions</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
