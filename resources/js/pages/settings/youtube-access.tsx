import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

import GrantAccess from '@/components/grant-access';
import RevokeAccess from '@/components/revoke-access';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useEffect } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'YouTube Access Settings',
        href: '/settings/youtube-access',
    },
];

export default function YoutubeAccess() {
    const { auth, error, success, info } = usePage<
        SharedData & { error?: string; success?: string; info?: string }
    >().props;

    useEffect(() => {
        if (error) {
            toast.error('Akses gagal diberikan!', {
                description: error,
            });
        }

        if (success) {
            toast.success('Akses berhasil diberikan!', {
                description: success,
            });
        }

        if (info) {
            toast('Informasi!', {
                description: info,
            });
        }
    }, [error, success, info]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Izin" />

            <SettingsLayout>
                {auth.user.youtube_permission_granted ? <RevokeAccess /> : <GrantAccess />}
                <GrantAccess />
            </SettingsLayout>
        </AppLayout>
    );
}
