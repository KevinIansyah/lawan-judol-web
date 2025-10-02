import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, TrendingUp } from 'lucide-react';

interface StatCardProps {
    title: string;
    description: string;
    count: number;
}

export default function StatCard({ title, description, count }: StatCardProps) {
    const Icon = count > 0 ? TrendingUp : Minus;

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-4">{count}</CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    {description} <Icon className="size-4" />
                </div>
                <div className="text-muted-foreground">Total {title.toLowerCase()} sejauh ini</div>
            </CardFooter>
        </Card>
    );
}
