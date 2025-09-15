import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panduan Pengguna',
        href: '/guides',
    },
];

export default function Guides() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panduan Pengguna" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading
                    title="Panduan Pengguna"
                    description="Panduan lengkap untuk menggunakan fitur LawanJudol dengan mudah."
                />
            </div>
        </AppLayout>
    );
}
