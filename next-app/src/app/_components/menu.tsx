'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menu = [
  {
    text: 'Minecraft',
    href: '/minecraft',
  },
  {
    text: 'Valheim',
    href: '/valheim',
  },
];

export default function Menu({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();
  const game = pathname.split('/').at(1);

  if (loggedIn)
    return (
      <div>
        <NavigationMenu>
          <NavigationMenuList className="px-2">
            <Gamepad2 className="me-2" />
            {menu.map((menuItem) => (
              <NavigationMenuItem key={menuItem.href}>
                <Link href={menuItem.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    active={game === menuItem.text.toLowerCase()}
                    className={navigationMenuTriggerStyle()}
                  >
                    {menuItem.text}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <Separator className="mb-2" />
      </div>
    );
}
