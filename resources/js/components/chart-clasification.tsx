import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Label, Pie, PieChart } from 'recharts';

interface ClasificationChartProps {
    title?: string;
    description?: string;
    data: 'comments' | 'keywords';
    gamblingCount?: number;
    nonGamblingCount?: number;
    keywordCount?: number;
}

// const chartData = [
//     { browser: 'chrome', visitors: 345, fill: 'var(--color-chrome)' },
//     { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
//     { browser: 'firefox', visitors: 287, fill: 'var(--color-firefox)' },
//     { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
//     { browser: 'other', visitors: 190, fill: 'var(--color-other)' },
// ];

// const chartConfig = {
//     visitors: {
//         label: 'Visitors',
//     },
//     chrome: {
//         label: 'Bukan Judi',
//         color: 'hsl(var(--chart-1))',
//     },
//     safari: {
//         label: 'Judi Online',
//         color: 'hsl(var(--chart-2))',
//     },
//     firefox: {
//         label: 'Firefox',
//         color: 'hsl(var(--chart-3))',
//     },
//     edge: {
//         label: 'Edge',
//         color: 'hsl(var(--chart-4))',
//     },
//     other: {
//         label: 'Other',
//         color: 'hsl(var(--chart-5))',
//     },
// } satisfies ChartConfig;

export function ChartClasification({
    title = 'Chart Title',
    description = 'Chart Description',
    data,
    gamblingCount = 0,
    nonGamblingCount = 0,
    keywordCount = 0,
}: ClasificationChartProps) {
    const isCommentChart = data === 'comments';

    const chartData = isCommentChart
        ? [
              { category: 'Judi Online', visitors: gamblingCount, fill: 'var(--chart-1)' },
              { category: 'Bukan Judi', visitors: nonGamblingCount, fill: 'var(--chart-4)' },
          ]
        : [
              { category: 'Kata Kunci', visitors: keywordCount, fill: 'var(--chart-2)' },
              { category: 'kosong', visitors: 0, fill: 'transparent' },
          ];

    const total = isCommentChart ? gamblingCount + nonGamblingCount : keywordCount;

    return (
        <Card className="h-full border-0">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-center">{title}</CardTitle>
                <CardDescription className="text-center">{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={{}} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={chartData}
                            dataKey="visitors"
                            nameKey="category"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {total}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {isCommentChart ? 'Komentar' : 'Kata Kunci'}
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
                {isCommentChart && (
                    <CardFooter className="flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 text-center font-medium">
                            Total komentar: {gamblingCount + nonGamblingCount}
                        </div>
                        <div className="text-muted-foreground text-center">
                            {gamblingCount} komentar <strong>judi online</strong> dan{' '}
                            {nonGamblingCount} komentar <strong>bukan judi</strong>
                        </div>
                    </CardFooter>
                )}
                {!isCommentChart && (
                    <CardFooter className="flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 text-center font-medium">
                            Total kata kunci: {keywordCount}
                        </div>
                        <div className="text-muted-foreground text-center">
                            Analisis kata kunci berdasarkan komentar pada video
                        </div>
                    </CardFooter>
                )}
            </CardFooter>
        </Card>
    );
}
