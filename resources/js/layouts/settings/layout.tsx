import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profil',
        url: '/settings/profile',
        icon: null,
    },
    // {
    //     title: 'Kata Sandi',
    //     url: '/settings/password',
    //     icon: null,
    // },
    {
        title: 'Tampilan',
        url: '/settings/appearance',
        icon: null,
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading title="Pengaturan" description="Kelola profil dan pengaturan akun Anda" />

            <div className="flex flex-col space-y-1 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full md:max-w-[50vw] lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={item.url}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.url,
                                })}
                            >
                                <Link href={item.url} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 lg:max-w-2xl">
                    <section className="space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
