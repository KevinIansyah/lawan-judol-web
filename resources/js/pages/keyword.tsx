import Heading from '@/components/heading';
import KeywordDataTable from '@/components/keyword-data-table';
import AppLayout from '@/layouts/app-layout';
import { Keyword, Paginator, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kata Kunci',
        href: '/keywords',
    },
];

export default function Keywords() {
    const { keywords } = usePage<{ keywords: Paginator<Keyword> }>().props;
    const { data, current_page, last_page, per_page, total } = keywords;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    useEffect(() => {
        setPageIndex(current_page - 1);
    }, [current_page]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kata Kunci" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading
                    title="Kamus Kata Kunci"
                    description={
                        <>
                            Filter komentar promosi judi online dengan kata kunci. Pelajari caranya di{' '}
                            <a href="/guides" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                sini!
                            </a>
                            .
                        </>
                    }
                />

                <KeywordDataTable data={data} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} />
            </div>
        </AppLayout>
    );
}
