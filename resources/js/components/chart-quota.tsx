import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Label, Pie, PieChart } from 'recharts';

export const description = 'Kuota analisis video';

const chartConfig = {
    value: {
        label: 'Kuota',
    },
    dipakai: {
        label: 'Dipakai',
        color: 'var(--chart-1)',
    },
    sisa: {
        label: 'Sisa',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

type ChartQuotaProps = {
    title?: string;
    description?: string;
    quota: {
        limit: number;
        used: number;
        remaining: number;
    };
};

export function ChartQuota({ title, description, quota }: ChartQuotaProps) {
    const chartData = [
        { type: 'dipakai', value: quota.used, fill: 'var(--chart-1)' },
        { type: 'sisa', value: quota.remaining, fill: 'var(--chart-2)' },
    ];

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData} dataKey="value" nameKey="type" innerRadius={60} strokeWidth={5}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                    {quota.limit}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                                    Limit
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="bg-muted h-2 w-2 rounded-[2px]"></span>
                        <span>Limit: {quota.limit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-[2px] bg-[var(--chart-1)]"></span>
                        <span>Dipakai: {quota.used}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-[2px] bg-[var(--chart-2)]"></span>
                        <span>Sisa: {quota.remaining}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
