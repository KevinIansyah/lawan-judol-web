import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Guide',
        href: '/guide',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Guide" />
            <div className="flex h-full flex-1 flex-col rounded-xl p-4">
                <Heading
                    title="Panduan Pengguna"
                    description="Panduan lengkap untuk menggunakan fitur LawanJudol.ID dengan mudah."
                />
            </div>
        </AppLayout>
    );
}
