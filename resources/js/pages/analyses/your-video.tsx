import DataTableAnalysis from '@/components/data-table-analysis';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { Analysis, Paginator, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Your Video',
        href: '/analysis/your-video',
    },
];

export default function YourVideo() {
    const { analyses } = usePage<{ analyses: Paginator<Analysis> }>().props;
    const { data, current_page, last_page, per_page, total } = analyses;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    useEffect(() => {
        setPageIndex(current_page - 1);
    }, [current_page]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Your Video" />

            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading
                    title="Analisis Video Saya"
                    description="Lihat riwayat analisis video dan mulai analisis baru kapan saja."
                />
                <DataTableAnalysis
                    data={data}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    totalPages={last_page}
                    totalItems={total}
                    perPage={per_page}
                />
            </div>
        </AppLayout>
    );
}
