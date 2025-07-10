'use client';

import { ChevronRight } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarMenu, SidebarMenuSub } from '@/components/ui/sidebar';
import { Button, ButtonGroup, Heading, Icon, Stack, StackDivider, Wrap } from '@chakra-ui/react';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: string;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      icon?: string;
    }[];
  }[];
}) {
  return (
    <Stack spacing="10" divider={<StackDivider />}>
      <Wrap direction="column">
        <Heading variant="section">Content Export Tool</Heading>
        <SidebarMenu>
          <ButtonGroup variant="navigation" orientation="vertical" spacing="1" mx="-2">
            {items.map((item) =>
              item.items ? (
                // Collapsible menu item with subitems
                <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
                  <>
                    <CollapsibleTrigger asChild>
                      <Button
                        as="a"
                        leftIcon={
                          <Icon>
                            <path d={item.icon} />
                          </Icon>
                        }
                      >
                        {item.title}
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <Button
                            isActive={window?.location?.pathname === item.url}
                            as="a"
                            href={subItem.url}
                            leftIcon={
                              <Icon>
                                <path d={subItem.icon} />
                              </Icon>
                            }
                          >
                            {subItem.title}
                          </Button>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ) : (
                // Direct link without subitems
                <Button
                  key={item.title}
                  isActive={window?.location?.pathname === item.url}
                  as="a"
                  href={item.url}
                  leftIcon={
                    <Icon>
                      <path d={item.icon} />
                    </Icon>
                  }
                >
                  {item.title}
                </Button>
              )
            )}
          </ButtonGroup>
        </SidebarMenu>
      </Wrap>
    </Stack>
  );
}
