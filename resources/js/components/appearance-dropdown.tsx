import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppearance } from '@/hooks/use-appearance';
import { Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleDropdown({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const getCurrentIcon = () => {
        const baseClass = 'size-4.5';
        switch (appearance) {
            case 'dark':
                return <Moon className={baseClass} />;
            case 'light':
                return <Sun className={baseClass} />;
            default:
                return <Monitor className={baseClass} />;
        }
    };

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="group h-9 w-9 rounded-md">
                        {getCurrentIcon()}
                        <span className="sr-only">Ganti tampilan</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Tampilan</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => updateAppearance('light')}
                        className={
                            appearance === 'light' ? 'bg-primary text-white' : ''
                        }
                    >
                        <span className="flex items-center gap-2">
                            <Sun className="h-5 w-5 dark:text-white" />
                            Terang
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => updateAppearance('dark')}
                        className={
                            appearance === 'dark' ? 'bg-primary text-white' : ''
                        }
                    >
                        <span className="flex items-center gap-2">
                            <Moon className="h-5 w-5 dark:text-white" />
                            Gelap
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => updateAppearance('system')}
                        className={
                            appearance === 'system' ? 'bg-primary text-white' : ''
                        }
                    >
                        <span className="flex items-center gap-2">
                            <Monitor className="h-5 w-5 dark:text-white" />
                            Sistem
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
