import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import { Analysis, Paginator, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { DataTable } from '../../components/data-table-analysis';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Public Video',
        href: '/analysis/public-video',
    },
];

export default function PublicVideo() {
    const { props } = usePage<{ analyses: Paginator<Analysis> }>();
    const { data, current_page, last_page } = props.analyses;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Public Video" />
            <div className="flex h-full flex-1 flex-col rounded-xl p-4">
                <Heading
                    title="Analisis Video Publik"
                    description="Lihat riwayat analisis video dan mulai analisis baru kapan saja."
                />
                <DataTable
                    data={data}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    totalPages={last_page}
                />
            </div>
        </AppLayout>
    );
}
