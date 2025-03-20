'use client';

import { BookOpen, Code, FileDown, GalleryVerticalEnd, HousePlug, Settings } from 'lucide-react';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { TeamSwitcher } from '@/components/team-switcher';
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Content Export',
      logo: GalleryVerticalEnd,
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: HousePlug,
    },
    {
      title: 'Content',
      url: '#',
      icon: FileDown,
      isActive: true,
      items: [
        {
          title: 'Export Tool',
          url: '/content/export',
        },
        {
          title: 'Import Tool',
          url: '/content/import',
        },
        {
          title: 'Copilot',
          url: '/content/copilot',
        },
      ],
    },

    {
      title: 'Configuration',
      url: '#',
      icon: Settings,
      isActive: true,
      items: [
        {
          title: 'Sitecore Instances',
          url: '/settings/instance',
        },
        {
          title: 'API Tokens',
          url: '/settings/config',
        },
      ],
    },
    {
      title: 'Documentation',
      url: 'https://github.com/estockwell-alpert/Content-Export-Tool-for-XM-Cloud?tab=readme-ov-file#content-export-tool-for-xm-cloud',
      icon: BookOpen,
    },
    {
      title: 'Source Code',
      url: 'https://github.com/estockwell-alpert/Content-Export-Tool-for-XM-Cloud',
      icon: Code,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
