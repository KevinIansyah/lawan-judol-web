// import { ClasificationChart } from '@/components/clasification-chart';
import { KeywordActions } from '@/components/keyword/keyword-action';
import { KeywordList } from '@/components/keyword/keyword-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Comment } from '@/lib/schemas/comment-schema';
import { Keyword, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import DataTableGambling from '../../components/data-table-gambling';
import DataTableNonGambling from '../../components/data-table-non-gambling';
import dataGambling from './data-comment-gambling.json';
import dataNonGambling from './data-comment-non-gambling.json';
import dataKeyword from './data-keyword.json';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Public Video',
        href: '/analysis/public-video',
    },
];

export default function Dashboard() {
    // jika pakai validasi
    // const validatedGamblingData = useMemo(() => {
    //     try {
    //         return dataGambling.map((item) => CommentSchema.parse(item));
    //     } catch (error) {
    //         console.error('Validation error for gambling data:', error);
    //         return [] as Comment[];
    //     }
    // }, []);

    // const validatedNonGamblingData = useMemo(() => {
    //     try {
    //         return dataNonGambling.map((item) => CommentSchema.parse(item));
    //     } catch (error) {
    //         console.error('Validation error for non-gambling data:', error);
    //         return [] as Comment[];
    //     }
    // }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Public Video" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border">
                        <ClasificationChart />
                    </div>
                </div> */}

                <Tabs defaultValue="gambling" className="w-full gap-4">
                    <TabsList className="grid grid-cols-3 gap-1 md:w-[40%]">
                        <TabsTrigger value="gambling">Judi Online</TabsTrigger>
                        <TabsTrigger value="non-gambling">Bukan Judi</TabsTrigger>
                        <TabsTrigger value="keyword">Kata Kunci</TabsTrigger>
                    </TabsList>
                    <TabsContent value="gambling">
                        <DataTableGambling data={dataGambling as Comment[]} />
                    </TabsContent>
                    <TabsContent value="non-gambling">
                        <DataTableNonGambling data={dataNonGambling as Comment[]} />
                    </TabsContent>
                    <TabsContent value="keyword">
                        <KeywordList
                            data={dataKeyword as Keyword[]}
                            ActionButtons={({ onCopy, onReset, onSave, onUpload }) => (
                                <KeywordActions
                                    onCopy={onCopy}
                                    onReset={onReset}
                                    onSave={onSave}
                                    onUpload={onUpload}
                                />
                            )}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
