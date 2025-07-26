import Heading from '@/components/heading';
import KeywordActions from '@/components/keyword-action';
import KeywordList from '@/components/keyword-list';
import AppLayout from '@/layouts/app-layout';
import { Keyword, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import dataKeyword from './analyses/data-keyword.json';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kata Kunci',
        href: '/keywords',
    },
];

export default function Keywords() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kata Kunci" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading
                    title="Kamus Kata Kunci"
                    description={
                        <>
                            Filter komentar promosi judi online dengan kata kunci. Pelajari caranya{' '}
                            <a
                                href="https://support.google.com/youtube/answer/100178"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                            >
                                di sini!
                            </a>
                            .
                        </>
                    }
                />

                <KeywordList
                    data={dataKeyword as Keyword[]}
                    ActionButtons={({ onCopy, onReset, onFilter }) => (
                        <KeywordActions onCopy={onCopy} onReset={onReset} onFilter={onFilter} />
                    )}
                />
            </div>
        </AppLayout>
    );
}
