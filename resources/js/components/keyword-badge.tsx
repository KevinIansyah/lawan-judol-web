import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Keyword } from '@/lib/schemas/keyword-schema';
import { CircleCheck, CircleX } from 'lucide-react';

export default function KeywordBadge({ item, onToggle }: { item: Keyword; onToggle: () => void }) {
    return (
        <Badge
            variant={item.label === 1 ? 'secondary' : 'destructive'}
            className="flex items-center py-0 transition-colors duration-200"
        >
            {item.keyword}
            <Button variant="link" size="icon" className="ml-2" onClick={onToggle}>
                {item.label === 1 ? (
                    <CircleX className="dark:text-white" />
                ) : (
                    <CircleCheck className="text-white" />
                )}
            </Button>
        </Badge>
    );
}
