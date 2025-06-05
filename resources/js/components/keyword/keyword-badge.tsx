import { Keyword } from '@/lib/schemas/keyword-schema';
import { CircleCheck, CircleX } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export function KeywordBadge({ item, onToggle }: { item: Keyword; onToggle: () => void }) {
    return (
        <Badge variant={item.label === 1 ? 'secondary' : 'destructive'} className="flex items-center py-0">
            {item.keyword}
            <Button variant="link" size="icon" className="ml-2" onClick={onToggle}>
                {item.label === 1 ? <CircleX className="dark:text-white" /> : <CircleCheck className="text-white" />}
            </Button>
        </Badge>
    );
}
