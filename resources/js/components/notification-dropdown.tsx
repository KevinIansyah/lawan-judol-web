import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notification, SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bell, Clock, FileCheck, FileX, LoaderIcon } from 'lucide-react';

dayjs.extend(relativeTime);
dayjs.locale('id');

export default function NotificationDropdown() {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    const notifications = (auth.notifications || []) as Notification[];

    const getIcon = (status: string) => {
        switch (status) {
            case 'queue':
                return <Clock className="text-white" />;
            case 'on_process':
                return <LoaderIcon className="text-black" />;
            case 'success':
                return <FileCheck className="text-black" />;
            case 'failed':
                return <FileX className="text-white" />;
            default:
                return <Clock className="text-white" />;
        }
    };

    const getIconBg = (status: string) => {
        switch (status) {
            case 'queue':
                return 'bg-secondary-foreground/10';
            case 'on_process':
                return 'bg-chart-3';
            case 'success':
                return 'bg-chart-4';
            case 'failed':
                return 'bg-chart-1';
            default:
                return 'bg-secondary-foreground/10';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="group relative mr-2 h-9 w-9 cursor-pointer rounded-md"
                >
                    <Bell className="size-5 lg:size-4.5" />
                    {notifications.some((n) => n.read_at === null) && (
                        <span className="bg-chart-2 absolute right-1.5 bottom-2 h-2 w-2 rounded-full" />
                    )}
                    <span className="sr-only">Notifikasi</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="ml-4 w-[calc(100vw-32px)] md:ml-0 md:w-100" align="end">
                <DropdownMenuLabel>
                    <span>
                        Notifikasi{' '}
                        <Badge variant="outline" className="ml-2">
                            {notifications.length}
                        </Badge>
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup className="max-h-[50vh] space-y-1 overflow-y-auto md:max-h-[40vh] lg:max-h-[55vh]">
                    {notifications.length === 0 ? (
                        <DropdownMenuItem>
                            <p className="text-muted-foreground text-sm">Tidak ada notifikasi.</p>
                        </DropdownMenuItem>
                    ) : (
                        notifications.map((notif) => (
                            <DropdownMenuItem
                                key={notif.id}
                                className={`first:mt-0 last:mb-0 focus:bg-secondary-foreground/20 ${
                                    notif.read_at === null ? 'bg-secondary-foreground/10' : ''
                                }`}
                            >
                                <a
                                    href={route('notification.redirect', notif.id)}
                                    className="flex w-full items-center gap-2"
                                >
                                    <div
                                        className={`${getIconBg(
                                            notif.data.status,
                                        )} flex min-h-8 min-w-8 items-center justify-center rounded-md`}
                                    >
                                        {getIcon(notif.data.status)}
                                    </div>
                                    <div className="flex w-full flex-col justify-center">
                                        <div className="flex items-start justify-between">
                                            <p className="text-foreground text-sm font-medium">
                                                {notif.data.title}
                                            </p>
                                            <span className="text-muted-foreground text-xs whitespace-nowrap">
                                                {dayjs(notif.created_at).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground text-sm">
                                            {notif.data.message}
                                        </p>
                                    </div>
                                </a>
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
