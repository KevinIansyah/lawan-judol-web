import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

const chartConfig = {
    your: {
        label: 'Video Anda',
        color: 'var(--chart-1)',
    },
    public: {
        label: 'Video Publik',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

export function ChartHistory() {
    const { dashboard } = usePage<{ dashboard: DashboardData }>().props;
    const { your_analysis, public_analysis } = dashboard;

    const [timeRange, setTimeRange] = useState<'90d' | '30d' | '7d'>('7d');

    const getData = () => {
        let yourData: Record<string, number> = {};
        let publicData: Record<string, number> = {};

        if (timeRange === '90d') {
            yourData = your_analysis.three_months;
            publicData = public_analysis.three_months;
        } else if (timeRange === '30d') {
            yourData = your_analysis.one_month;
            publicData = public_analysis.one_month;
        } else if (timeRange === '7d') {
            yourData = your_analysis.seven_days;
            publicData = public_analysis.seven_days;
        }

        return Object.keys(yourData).map((date) => ({
            date,
            your: yourData[date] ?? 0,
            public: publicData[date] ?? 0,
        }));
    };

    const chartData = getData();

    return (
        <Card className="h-full border-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Riwayat Analisis</CardTitle>
                    <CardDescription>Perbandingan analisis video Anda dan video publik</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={(v: '90d' | '30d' | '7d') => setTimeRange(v)}>
                    <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a value">
                        <SelectValue placeholder="Pilih rentang waktu" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="90d" className="rounded-lg">
                            3 Bulan
                        </SelectItem>
                        <SelectItem value="30d" className="rounded-lg">
                            30 Hari
                        </SelectItem>
                        <SelectItem value="7d" className="rounded-lg">
                            7 Hari
                        </SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="fillYour" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-your)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-your)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillPublic" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-public)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-public)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('id-ID', {
                                    month: 'short',
                                    day: 'numeric',
                                });
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) =>
                                        new Date(value).toLocaleDateString('id-ID', {
                                            month: 'short',
                                            day: 'numeric',
                                        })
                                    }
                                    indicator="dot"
                                />
                            }
                        />
                        {/* <Area dataKey="your" type="natural" fill="url(#fillYour)" stroke="var(--color-your)" stackId="a" />
                        <Area dataKey="public" type="natural" fill="url(#fillPublic)" stroke="var(--color-public)" stackId="a" /> */}
                        <Area dataKey="your" type="natural" fill="url(#fillYour)" stroke="var(--color-your)" fillOpacity={0.3} />
                        <Area dataKey="public" type="natural" fill="url(#fillPublic)" stroke="var(--color-public)" fillOpacity={0.3} />

                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
