import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export default function NotificationDropdown() {
    const [position, setPosition] = useState('bottom');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="relative mr-2 flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="group h-9 w-9 cursor-pointer rounded-md"
                    >
                        <Bell className="size-4.5 opacity-80 group-hover:opacity-100" />
                        <span className="sr-only">Notifikasi</span>
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-76 md:w-100" align="end">
                {/* <UserMenuContent user={auth.user} /> */}
                <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                    <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
