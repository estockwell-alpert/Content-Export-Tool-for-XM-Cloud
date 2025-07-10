'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { enumInstanceType, IInstance } from '@/models/IInstance';
import { getXmCloudToken } from '@/services/sitecore/getXmCloudToken';
import { ChangeEvent, useState } from 'react';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  identityServerUrl: z.string(),
  sitecoreUsername: z.string(),
  sitecorePassword: z.string(),
  clientId: z.string().min(2, { message: 'Client ID must be at least 2 characters' }),
  clientSecret: z.string().min(2, { message: 'Client Secret must be at least 2 characters' }),
  graphQlEndpoint: z.string().url({ message: 'Please enter a valid URL' }),
  instanceType: z.nativeEnum(enumInstanceType, { message: 'Please select an instance type' }),
});

type FormValues = z.infer<typeof formSchema>;

interface InstanceRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Omit<IInstance, 'id'>) => void;
}

export const RegistrationGenModal = ({ open, onOpenChange, onSubmit }: InstanceRegistrationModalProps) => {
  const [instanceName, setInstanceName] = useState<string>('');
  const [endpoint, setEndpoint] = useState<string>('');
  const [clientid, setClientid] = useState<string>('');
  const [clientsecret, setClientsecret] = useState<string>('');

  const [hasError, setHasError] = useState<boolean>(false);

  const handleInstanceName = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setInstanceName(inputValue);
  };
  const handleEndpoint = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setEndpoint(inputValue);
  };
  const handleClientId = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setClientid(inputValue);
  };
  const handleClientSecret = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setClientsecret(inputValue);
  };

  const handleSubmit = async () => {
    try {
      setHasError(false);
      let tokenResponse;
      tokenResponse = await getXmCloudToken(clientid, clientid);

      onSubmit({
        name: instanceName,
        graphQlEndpoint: endpoint,
        instanceType: enumInstanceType.auth,
        apiToken: tokenResponse.access_token,
        expiration: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
        clientId: clientid,
        clientSecret: clientsecret,
      });

      setInstanceName('');
      setEndpoint('');
      setClientid('');
      setClientsecret('');
    } catch (error) {
      console.error(error);
      setHasError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Register New Instance</DialogTitle>
          <DialogDescription>
            Fill in the details to register a new XM Cloud Authoring instance to your configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm leading-none font-medium">Instance Name</label>
            <Input
              value={instanceName}
              onChange={handleInstanceName}
              placeholder="My XM Cloud Site"
              className={'font-mono text-sm'}
            />
          </div>
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm leading-none font-medium">GraphQL Endpoint</label>
            <Input
              value={endpoint}
              onChange={handleEndpoint}
              placeholder="https://xmc-myapp.sitecorecloud.io/sitecore/api/authoring/graphql/v1"
              className={'font-mono text-sm'}
            />
          </div>
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm leading-none font-medium">Client ID</label>
            <Input
              value={clientid}
              onChange={handleClientId}
              placeholder="yj92f9ar3lep6sQeiWOeriKsRPH2nEXE"
              className={'font-mono text-sm'}
            />
          </div>
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm leading-none font-medium">Client Secret</label>
            <Input
              value={clientsecret}
              type="password"
              onChange={handleClientSecret}
              placeholder="Bl9OuReXSQ...."
              className={'font-mono text-sm'}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSubmit()}>Register Instance</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
