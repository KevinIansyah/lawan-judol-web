import { ChartClasification } from '@/components/chart-clasification';
import DataTableGambling from '@/components/data-table-gambling';
import DataTableNonGambling from '@/components/data-table-non-gambling';
import Heading from '@/components/heading';
import KeywordActions from '@/components/keyword-action';
import KeywordList from '@/components/keyword-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoMetadata from '@/components/video-metadata';
import AppLayout from '@/layouts/app-layout';
import { Analysis, CommentChunk, Keyword, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface DetailProps {
    analysis: Analysis;
    gambling: CommentChunk;
    gamblingCount: number;
    nonGambling: CommentChunk;
    nonGamblingCount: number;
    keyword: Keyword[];
    keywordCount: number;
    [key: string]: unknown;
}

export default function Detail() {
    const { props, url } = usePage<DetailProps>();
    const {
        analysis,
        gambling,
        gamblingCount,
        nonGambling,
        nonGamblingCount,
        keyword,
        keywordCount,
    } = props;
    const [activeTab, setActiveTab] = useState('summary');

    const isPublic = url.includes('public-video');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: isPublic ? 'Video Publik' : 'Video Anda',
            href: isPublic ? '/analysis/public-videos' : '/analysis/your-videos',
        },
        {
            title: 'Detail',
            href: url,
        },
    ];

    useEffect(() => {
        const savedTab = localStorage.getItem('active-analysis-tab');
        if (savedTab) setActiveTab(savedTab);

        return () => {
            localStorage.removeItem('active-analysis-tab');
        };
    }, []);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        localStorage.setItem('active-analysis-tab', value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading
                    title="Detail Analisis"
                    description="Detail hasil analisis komentar pada video yang dipilih."
                />

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full gap-4">
                    <TabsList className="grid grid-cols-4 gap-1 md:w-[60%] lg:w-[40%]">
                        <TabsTrigger value="summary">Ringkasan</TabsTrigger>
                        <TabsTrigger value="gambling">Judi Online</TabsTrigger>
                        <TabsTrigger value="non-gambling">Bukan Judi</TabsTrigger>
                        <TabsTrigger value="keyword">Kata Kunci</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary">
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card relative h-full rounded-xl border px-4 py-2">
                                <VideoMetadata analysis={analysis} />
                            </div>
                            <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border">
                                <ChartClasification
                                    title="Distribusi Komentar"
                                    description="Perbandingan komentar judi online dan bukan judi"
                                    data="comments"
                                    gamblingCount={gamblingCount}
                                    nonGamblingCount={nonGamblingCount}
                                />
                            </div>
                            <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border">
                                <ChartClasification
                                    title="Distribusi Kata Kunci"
                                    description="Jumlah kata kunci judi online yang terdeteksi"
                                    data="keywords"
                                    keywordCount={keywordCount}
                                />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="gambling">
                        <DataTableGambling analysis_id={analysis.id} data={gambling} />
                    </TabsContent>
                    <TabsContent value="non-gambling">
                        <DataTableNonGambling analysis_id={analysis.id} data={nonGambling} />
                    </TabsContent>
                    <TabsContent value="keyword">
                        <KeywordList
                            data={keyword}
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
