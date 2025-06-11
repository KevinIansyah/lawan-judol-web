import { ClasificationChart } from '@/components/clasification-chart';
import Heading from '@/components/heading';
import { KeywordActions } from '@/components/keyword/keyword-action';
import { KeywordList } from '@/components/keyword/keyword-list';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Comment } from '@/lib/schemas/comment-schema';
import { formatDate } from '@/lib/utils';
import { Analysis, Keyword, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { CheckCircle2Icon, CircleX, LoaderIcon, Youtube } from 'lucide-react';
import DataTableGambling from '../../components/data-table-gambling';
import DataTableNonGambling from '../../components/data-table-non-gambling';
import dataKeyword from './data-keyword.json';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Public Video',
        href: '/analysis/public-video',
    },
];

interface DetailProps {
    analysis: Analysis;
    gamblingComments: Comment[];
    nonGamblingComments: Comment[];
    [key: string]: unknown;
}

export default function Detail() {
    const { props } = usePage<DetailProps>();
    const { analysis, gamblingComments, nonGamblingComments } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Public Video" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
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
                            <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border px-4 py-2">
                                <Table>
                                    <TableBody>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableCell className="font-semibold">Judul</TableCell>
                                            <TableCell className="text-muted-foreground break-words whitespace-normal">
                                                {analysis.video.title}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableCell className="font-semibold">Channel</TableCell>
                                            <TableCell className="text-muted-foreground break-words whitespace-normal">
                                                {analysis.video.channel_title}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableCell className="font-semibold">
                                                Tanggal Rilis
                                            </TableCell>
                                            <TableCell className="text-muted-foreground break-words whitespace-normal">
                                                {formatDate(analysis.video.published_at)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableCell className="font-semibold">
                                                Thumbnail
                                            </TableCell>
                                            <TableCell className="text-muted-foreground break-words whitespace-normal">
                                                <a
                                                    href={analysis.video.youtube_url}
                                                    target="_blank"
                                                >
                                                    <img
                                                        src={analysis.video.thumbnail}
                                                        alt={analysis.video.title}
                                                        className="h-auto w-full rounded object-cover"
                                                    />
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableCell className="font-semibold">Status</TableCell>
                                            <TableCell className="text-muted-foreground break-words whitespace-normal">
                                                <Badge
                                                    variant="outline"
                                                    className="text-muted-foreground flex gap-1 px-1.5 [&_svg]:size-3"
                                                >
                                                    {analysis.status === 'success' && (
                                                        <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
                                                    )}
                                                    {analysis.status === 'on_process' && (
                                                        <LoaderIcon className="animate-spin text-yellow-500 dark:text-yellow-400" />
                                                    )}
                                                    {analysis.status === 'failed' && (
                                                        <CircleX className="text-red-500 dark:text-red-400" />
                                                    )}
                                                    {analysis.status === 'queue' && (
                                                        <LoaderIcon className="text-muted-foreground" />
                                                    )}
                                                    {
                                                        {
                                                            success: 'Selesai',
                                                            on_process: 'Sedang Diproses',
                                                            failed: 'Gagal',
                                                            queue: 'Antrian',
                                                        }[analysis.status]
                                                    }
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableCell className="font-semibold">Tipe</TableCell>
                                            <TableCell className="text-muted-foreground break-words whitespace-normal">
                                                <Badge
                                                    variant="outline"
                                                    className="text-muted-foreground flex gap-1 px-1.5 [&_svg]:size-3"
                                                >
                                                    <Youtube className="text-muted-foreground" />
                                                    {
                                                        {
                                                            your: 'Video Anda',
                                                            public: 'Video Publik',
                                                        }[analysis.type]
                                                    }
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableCell className="font-semibold">
                                                Tanggal Analisis
                                            </TableCell>
                                            <TableCell className="text-muted-foreground break-words whitespace-normal">
                                                {formatDate(analysis.created_at)}
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
                        <DataTableGambling data={gamblingComments} />
                    </TabsContent>
                    <TabsContent value="non-gambling">
                        <DataTableNonGambling data={nonGamblingComments} />
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
