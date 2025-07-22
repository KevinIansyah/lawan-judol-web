import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { cn } from '@/lib/utils';
import { SharedData, type User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, Settings, ShieldCheck } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const page = usePage<SharedData>();
    const cleanup = useMobileNavigation();

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className={cn(
                            'block w-full',
                            page.url.startsWith('/settings') && 'bg-primary text-[oklch(1_0_0)]',
                        )}
                        href={route('profile.edit')}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2 dark:text-[oklch(1_0_0)]" />
                        Pengaturan
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className={cn(
                            'block w-full',
                            page.url.startsWith('/guide') && 'bg-primary text-[oklch(1_0_0)]',
                        )}
                        href={route('profile.edit')}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <ShieldCheck className="mr-2 dark:text-[oklch(1_0_0)]" />
                        Kebijakan Privasi
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    method="post"
                    href={route('logout')}
                    as="button"
                    onClick={cleanup}
                >
                    <LogOut className="mr-2 dark:text-[oklch(1_0_0)]" />
                    Keluar
                </Link>
            </DropdownMenuItem>
        </>
    );
}
