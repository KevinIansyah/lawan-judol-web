import DataTableAnalysis from '@/components/data-table-analysis';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';

import { Analysis, Paginator, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Public Video',
        href: '/analysis/public-video',
    },
];

export default function PublicVideo() {
    const { props } = usePage<{ analyses: Paginator<Analysis> }>();
    const { data, current_page, last_page, per_page, total } = props.analyses;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    useEffect(() => {
        setPageIndex(current_page - 1);
    }, [current_page]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Public Video" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading
                    title="Analisis Video Publik"
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
