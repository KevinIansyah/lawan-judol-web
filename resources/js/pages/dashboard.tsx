import { ChartHistory } from '@/components/chart-history';
import { ChartQuota } from '@/components/chart-quota';
import StatCard from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';
import { DashboardData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    // const page = usePage<SharedData>();
    // const { auth } = page.props;
    const { dashboard } = usePage<{ dashboard: DashboardData }>().props;
    const { dataset_count, keyword_count, your_analysis_count, public_analysis_count, quota } = dashboard;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6 mt-6">
                {/* <Heading title={`Haii ${auth.user.name}`} description="Selamat datang di Dasbor LawanJudol." /> */}

                <div className="mb-4 grid auto-rows-min gap-4 md:grid-cols-4">
                    <StatCard title="Dataset" description="Kontribusi dataset Anda" count={dataset_count} />
                    <StatCard title="Kata Kunci" description="Kontribusi kata kunci Anda" count={keyword_count} />
                    <StatCard title="Analisis Video Anda" description="Analisis video Anda" count={your_analysis_count} />
                    <StatCard title="Analisis Video Publik" description="Analisis video publik" count={public_analysis_count} />
                </div>

                <div className="mb-4 grid auto-rows-min gap-4 md:grid-cols-2">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border">
                        <ChartQuota title="Kuota Analisis Video" description="Penggunaan kuota analisis video hari ini" quota={quota.video_analysis} />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border">
                        <ChartQuota title="Kuota Moderasi Komentar" description="Penggunaan kuota moderasi komentar hari ini" quota={quota.comment_moderation} />
                    </div>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl border">
                    <ChartHistory />
                </div>
            </div>
        </AppLayout>
    );
}
