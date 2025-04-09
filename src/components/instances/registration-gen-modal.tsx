'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { enumInstanceType, IInstance } from '@/models/IInstance';
import { getAccessToken } from '@/services/sitecore/generateAccessToken';
import { getXmCloudToken } from '@/services/sitecore/getXmCloudToken';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      identityServerUrl: '',
      sitecoreUsername: '',
      sitecorePassword: '',
      clientId: '',
      clientSecret: '',
      graphQlEndpoint: '',
      instanceType: enumInstanceType.auth,
    },
  });

  const [hasError, setHasError] = useState<boolean>(false);

  const instanceType = form.watch('instanceType');

  const handleSubmit = async (values: FormValues) => {
    try {
      setHasError(false);
      let tokenResponse;
      if (instanceType === enumInstanceType.auth) {
        tokenResponse = await getXmCloudToken(values.clientId, values.clientSecret);
      } else {
        tokenResponse = await getAccessToken(
          values.identityServerUrl,
          values.sitecoreUsername,
          values.sitecorePassword,
          values.clientId,
          values.clientSecret
        );
      }

      onSubmit({
        name: values.name,
        graphQlEndpoint: values.graphQlEndpoint,
        instanceType: values.instanceType,
        apiToken: tokenResponse.access_token,
        expiration: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
      });

      form.reset();
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
          <DialogDescription>Fill in the details to register a new instance to your configuration.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="instanceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instance Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select instance type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={enumInstanceType.auth}>Sitecore XM Cloud</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instance Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Production Server" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="graphQlEndpoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GraphQL Endpoint</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/graphql" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input placeholder="client-id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="client-secret" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {hasError && (
              <DialogDescription className="error">
                An error occurred in the token request. Things to check: username and password; Client ID and Client
                Secret; Identity Server URL is publicly accessible; Token request works in Postman
              </DialogDescription>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Register Instance</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
