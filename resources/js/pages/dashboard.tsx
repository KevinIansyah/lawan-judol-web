import { ChartClasification } from '@/components/chart-clasification';
import { HistoryChart } from '@/components/history-chart';
import { ListChart } from '@/components/list-chart';
import { SpiderChart } from '@/components/spider-chart';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
                {/* <Heading
                    title="Dasbor"
                    description="Ringkasan data dan aktivitas sistem LawanJudol.ID."
                /> */}

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border">
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        <ChartClasification data="comments" />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border">
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        <SpiderChart />
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative h-full rounded-xl border">
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        <ListChart />
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 rounded-xl border">
                    {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                    <HistoryChart />
                </div>
            </div>
        </AppLayout>
    );
}
