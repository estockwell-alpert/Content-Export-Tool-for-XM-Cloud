'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ISettings } from '@/models/ISettings';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog } from '@radix-ui/react-alert-dialog';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

interface InstanceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Omit<ISettings, 'id' | 'createdAt'>) => void;
}

export const SaveSettingsModal = ({ open, onOpenChange, onSubmit }: InstanceSettingsModalProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const [savedSettings, setSavedSettings] = useState<ISettings[]>([]);
  const [showOverwrite, setShowOverwrite] = useState<boolean>(false);

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

  // Add this line to watch the instanceType field
  const handleSubmit = (values: FormValues) => {
    setShowOverwrite(false);
    const setting = savedSettings.find((setting) => setting.name === values.name);

    if (setting && !showOverwrite) {
      setShowOverwrite(true);
    } else {
      onSubmit(values);
      form.reset();
      alert('Saved!');
    }
  };

  const cancelSave = () => {
    setShowOverwrite(false);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Save Settings</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Whitepaper Export" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!showOverwrite ? (
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    cancelSave();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Settings</Button>
              </DialogFooter>
            ) : (
              <DialogFooter>
                <AlertDialog>Settings with this name already exist! Do you want to overwrite?</AlertDialog>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    cancelSave();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Yes, Overwrite</Button>
              </DialogFooter>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
