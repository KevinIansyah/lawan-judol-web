import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { Analysis } from '@/lib/schemas/analysis-schema';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DataTable } from '../../components/data-table-analysis';
import data from './data-analysis.json';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Your Video',
        href: '/analysis/your-video',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Your Video" />

            <div className="flex h-full flex-1 flex-col rounded-xl p-4">
                <Heading
                    title="Analisis Video Saya"
                    description="Lihat riwayat analisis video dan mulai analisis baru kapan saja."
                />
                <DataTable data={data as Analysis[]} />
            </div>
        </AppLayout>
    );
}
