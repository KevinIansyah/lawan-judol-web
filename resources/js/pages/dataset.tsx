import DataTableDataset from '@/components/data-table-dataset';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { Dataset, Paginator, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dataset',
        href: '/datasets',
    },
];

export default function Datasets() {
    const { datasets } = usePage<{ datasets: Paginator<Dataset> }>().props;
    const { data, current_page, last_page, per_page, total } = datasets;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    useEffect(() => {
        setPageIndex(current_page - 1);
    }, [current_page]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dataset" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading
                    title="Daftar Dataset"
                    description="Lihat daftar dataset yang telah diunggah dan dikelola."
                />
                <DataTableDataset
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
