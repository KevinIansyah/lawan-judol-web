import { ClasificationChart } from '@/components/clasification-chart';
import Heading from '@/components/heading';
import { KeywordActions } from '@/components/keyword/keyword-action';
import { KeywordList } from '@/components/keyword/keyword-list';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Comment } from '@/lib/schemas/comment-schema';
import { Keyword, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle2Icon } from 'lucide-react';
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Public Video" />
            <div className="flex h-full flex-1 flex-col rounded-xl p-4">
                <Heading
                    title="Detail Analisis"
                    description="Detail hasil analisis komentar pada video yang dipilih."
                />

                <Tabs defaultValue="summary" className="w-full gap-4">
                    <TabsList className="grid grid-cols-4 gap-1 md:w-[40%]">
                        <TabsTrigger value="summary">Ringkasan</TabsTrigger>
                        <TabsTrigger value="gambling">Judi Online</TabsTrigger>
                        <TabsTrigger value="non-gambling">Bukan Judi</TabsTrigger>
                        <TabsTrigger value="keyword">Kata Kunci</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary">
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border px-4">
                                {/* <ClasificationChart /> */}
                                <Table>
                                    <TableBody>
                                        <TableRow className="border-none">
                                            <TableCell className="pt-5 font-semibold">
                                                Judul
                                            </TableCell>
                                            <TableCell className="text-muted-foreground pt-5 break-words whitespace-normal">
                                                Catenaccio X Jogo Bonito: Meraba Ramuan Gila Don
                                                Carlo di Seleção!
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-none">
                                            <TableCell className="font-semibold">Status</TableCell>
                                            <TableCell className="text-muted-foreground break-words whitespace-normal">
                                                <Badge
                                                    variant="outline"
                                                    className="text-muted-foreground flex gap-1 px-1.5 [&_svg]:size-3"
                                                >
                                                    <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
                                                    Selesai
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border">
                                <ClasificationChart />
                            </div>
                            <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border">
                                <ClasificationChart />
                            </div>
                        </div>
                    </TabsContent>
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
