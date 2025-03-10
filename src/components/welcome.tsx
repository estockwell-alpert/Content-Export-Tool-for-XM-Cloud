import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export const Welcome = () => {
  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="">
        <CardTitle className="mb-2">Welcome to Sitecore Content Export</CardTitle>
        <CardDescription className="text-base space-y-2">
          <p>This tool helps you manage content across your Sitecore Content Management instances. With it, you can:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Export/Import content from any Sitecore XM/XP/XMC instance</li>
            <li>
              A Content AI Copilot that helps a marketer transform and analyze the content from their Sitecore instance
            </li>
          </ul>

          <p>
            This app is unique, because you Bring Your Own keys and everything is stored in session storage. This means
            you can get started managing your environment right away!
          </p>
          <p>Before you begin, make sure you configure a Sitecore Instance or configure your API Key</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/settings/instance">
          <Button className="mr-2">
            Configure Instance
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/settings/config">
          <Button>
            Configure API Keys
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
