import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { SharedData, type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface AppHeaderLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppHeaderLayout({ children, breadcrumbs }: AppHeaderLayoutProps) {
    const { error, success, info } = usePage<SharedData>().props;

    useEffect(() => {
        if (error) {
            toast.error('Gagal!', { description: error });
        }

        if (success) {
            toast.success('Berhasil!', { description: success });
        }

        if (info) {
            toast('Informasi!', { description: info });
        }
    }, [error, success, info]);

    return (
        <AppShell>
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
            {/* <AppFooter /> */}
        </AppShell>
    );
}
