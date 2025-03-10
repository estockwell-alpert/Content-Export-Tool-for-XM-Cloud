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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  identityServerUrl: z.string().url({ message: 'Please enter a valid URL' }),
  sitecoreUsername: z.string().min(2, { message: 'Username must be at least 2 characters' }),
  sitecorePassword: z.string().min(1, { message: 'Password must be at least 5 characters' }),
  clientId: z.string().min(2, { message: 'Client ID must be at least 2 characters' }),
  clientSecret: z.string().min(2, { message: 'Client Secret must be at least 2 characters' }),
  graphQlEndpoint: z.string().url({ message: 'Please enter a valid URL' }),
  apiToken: z.string().min(5, { message: 'API token must be at least 5 characters' }),
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
      apiToken: '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      const tokenResponse = await getAccessToken(
        values.identityServerUrl,
        values.sitecoreUsername,
        values.sitecorePassword,
        values.clientId
      );

      onSubmit({
        name: values.name,
        graphQlEndpoint: values.graphQlEndpoint,
        instanceType: enumInstanceType.xp,
        apiToken: tokenResponse.access_token,
      });
      form.reset();
    } catch (error) {
      console.error(error);
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
              name="identityServerUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identity Server URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://identity.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sitecoreUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitecore Username</FormLabel>
                  <FormControl>
                    <Input placeholder="sitecore-username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sitecorePassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitecore Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="sitecore-password" {...field} />
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
              name="apiToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Token</FormLabel>
                  <FormControl>
                    <Input placeholder="api-token-xxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
