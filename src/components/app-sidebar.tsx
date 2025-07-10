'use client';

import {
  mdiBookOpenPageVariantOutline,
  mdiCogOutline,
  mdiHomeVariantOutline,
  mdiShoppingOutline,
  mdiTrayArrowDown,
  mdiTrayArrowUp,
} from '@mdi/js';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { Sidebar } from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Content Export',
      logo: '',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: mdiHomeVariantOutline,
    },
    {
      title: 'Configuration',
      url: '/settings/instance',
      icon: mdiCogOutline,
      isActive: true,
    },
    {
      title: 'Export',
      url: '/content/export',
      icon: mdiTrayArrowDown,
    },
    {
      title: 'Import',
      url: '/content/import',
      icon: mdiTrayArrowUp,
    },
    {
      title: 'Marketplace',
      url: '/marketplace',
      icon: mdiShoppingOutline,
    },
    {
      title: 'Documentation',
      url: 'https://github.com/estockwell-alpert/Content-Export-Tool-for-XM-Cloud?tab=readme-ov-file#using-the-application',
      icon: mdiBookOpenPageVariantOutline,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return <NavMain items={data.navMain} />;
}
