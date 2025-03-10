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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  instanceType: z.nativeEnum(enumInstanceType, { message: 'Please select an instance type' }),
  graphQlEndpoint: z.string().url({ message: 'Please enter a valid URL' }),
  clientId: z.string(),
  clientSecret: z.string(),
  apiToken: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface InstanceRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Omit<IInstance, 'id' | 'createdAt'>) => void;
}

export const RegistrationTokenModal = ({ open, onOpenChange, onSubmit }: InstanceRegistrationModalProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      instanceType: enumInstanceType.xmc,
      clientId: '',
      clientSecret: '',
      graphQlEndpoint: '',
      apiToken: '',
    },
  });

  // Add this line to watch the instanceType field
  const instanceType = form.watch('instanceType');

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Register New Instance</DialogTitle>
          <DialogDescription>
            This form assumes you've already generated a token from XM Cloud or generated a Token from Sitecore XP/XM.
          </DialogDescription>
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
                      <SelectItem value={enumInstanceType.xmc}>Sitecore XM Cloud</SelectItem>
                      <SelectItem value={enumInstanceType.xp}>Sitecore XM/XP</SelectItem>
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

            {instanceType === enumInstanceType.xp ? (
              <FormField
                control={form.control}
                name="graphQlEndpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GraphQL Endpoint</FormLabel>
                    <FormControl>
                      <Input placeholder="https://xmc-*.sitecorecloud.io/sitecore/api/graph/items/master" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <></>
            )}

            {instanceType === enumInstanceType.xmc ? (
              <>
                <FormField
                  control={form.control}
                  name="graphQlEndpoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GraphQL Endpoint</FormLabel>
                      <FormControl>
                        <Input placeholder="https://xmc-*.sitecorecloud.io/sitecore/api/graph/edge/ide/" {...field} />
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
                        <Input placeholder="Enter client ID" {...field} />
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
                        <Input type="password" placeholder="Enter client secret" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <FormField
                control={form.control}
                name="apiToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="api-key-xxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Register Instance</Button>
            </DialogFooter>

            <DialogDescription>
              To create a Content API endpoint, enter a GraphQL content API endpoint (e.g.
              https://mysite.com/sitecore/api/graph/items/master or https://edge.sitecorecloud.io/api/graphql/v1) and
              your{' '}
              <a
                href="https://ericastockwellalpert.wordpress.com/2025/02/03/setting-up-the-sitecore-graphql-api-and-playground-in-xp/"
                target="_blank"
              >
                sc_apikey
              </a>{' '}
              e.g. A9123800-72E8-4182-9567-D5C35C7D3A93
              <br /> <br />
              To create an Authoring endpoint, enter a GraphQL authoring API endpoint e.g.
              https://mysite.com/sitecore/api/authoring/graphql/v1/ and your{' '}
              <a
                target="_blank"
                href="https://ericastockwellalpert.wordpress.com/2025/02/21/setting-up-the-graphql-authoring-api-obtaining-an-authorization-token-through-an-mvc-controller-in-a-custom-applicaton/"
              >
                Auth Token
              </a>{' '}
              e.g. eyJhbGciOiJSUzI1NiIsImtpZ......
            </DialogDescription>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
