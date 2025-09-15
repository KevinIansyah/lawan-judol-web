import GrantAccess from '@/components/grant-access';
import RevokeAccess from '@/components/revoke-access';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan Izin',
        href: '/settings/youtube-access',
    },
];

export default function YoutubeAccess() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Izin" />

            <SettingsLayout>{auth.user.youtube_permission_granted ? <RevokeAccess /> : <GrantAccess />}</SettingsLayout>
        </AppLayout>
    );
}
