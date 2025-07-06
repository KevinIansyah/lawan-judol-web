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
import { Bell, Clock, FileCheck, FileX, LoaderIcon, Wrench } from 'lucide-react';

export default function NotificationDropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="group relative mr-2 h-9 w-9 cursor-pointer rounded-md"
                >
                    <Bell className="size-4.5" />
                    <span className="bg-chart-2 absolute right-1.5 bottom-2 h-2 w-2 rounded-full" />
                    <span className="sr-only">Notifikasi</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="ml-4 w-[calc(100vw-32px)] md:ml-0 md:w-100" align="end">
                <DropdownMenuLabel>
                    <span>
                        Notifikasi{' '}
                        <Badge variant="outline" className="ml-2">
                            10
                        </Badge>
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="max-h-[50vh] overflow-y-auto md:max-h-[40vh] lg:max-h-[55vh]">
                    {/* 1. Berhasil memasukkan ke antrian */}
                    <DropdownMenuItem className="focus:bg-secondary-foreground/20 bg-secondary-foreground/10">
                        <div className="flex w-full items-center gap-2">
                            <div className="bg-muted flex min-h-8 min-w-8 items-center justify-center rounded-md">
                                <Clock className="text-white" />
                            </div>
                            <div className="flex w-full flex-col justify-center">
                                <div className="flex items-start justify-between">
                                    <p className="text-foreground text-sm font-medium">
                                        Video masuk ke antrian
                                    </p>
                                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                                        5 jam yang lalu
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Video Anda berhasil dimasukkan ke dalam antrian dan akan segera
                                    diproses.
                                </p>
                            </div>
                        </div>
                    </DropdownMenuItem>

                    {/* 2. Sedang diproses */}
                    <DropdownMenuItem className="focus:bg-secondary-foreground/20">
                        <div className="flex w-full items-center gap-2">
                            <div className="bg-chart-3 flex min-h-8 min-w-8 items-center justify-center rounded-md">
                                <LoaderIcon className="text-black" />
                            </div>
                            <div className="flex w-full flex-col justify-center">
                                <div className="flex items-start justify-between">
                                    <p className="text-foreground text-sm font-medium">
                                        Sedang menganalisis video
                                    </p>
                                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                                        5 jam yang lalu
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Sistem sedang memproses video untuk mendeteksi komentar terkait
                                    judi.
                                </p>
                            </div>
                        </div>
                    </DropdownMenuItem>

                    {/* 3. Sukses dianalisis */}
                    <DropdownMenuItem className="focus:bg-secondary-foreground/20">
                        <div className="flex w-full items-center gap-2">
                            <div className="bg-chart-4 flex min-h-8 min-w-8 items-center justify-center rounded-md">
                                <FileCheck className="text-black" />
                            </div>
                            <div className="flex w-full flex-col justify-center">
                                <div className="flex items-start justify-between">
                                    <p className="text-foreground text-sm font-medium">
                                        Video berhasil dianalisis
                                    </p>
                                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                                        5 jam yang lalu
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Hasil analisis video sudah tersedia dan dapat Anda lihat di
                                    halaman detail.
                                </p>
                            </div>
                        </div>
                    </DropdownMenuItem>

                    {/* 4. Gagal dianalisis */}
                    <DropdownMenuItem className="focus:bg-secondary-foreground/20 bg-secondary-foreground/10">
                        <div className="flex w-full items-center gap-2">
                            <div className="bg-chart-1 flex min-h-8 min-w-8 items-center justify-center rounded-md">
                                <FileX className="text-white" />
                            </div>
                            <div className="flex w-full flex-col justify-center">
                                <div className="flex items-start justify-between">
                                    <p className="text-foreground text-sm font-medium">
                                        Gagal menganalisis video
                                    </p>
                                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                                        5 jam yang lalu
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Proses analisis video mengalami kegagalan. Silakan coba lagi
                                    beberapa saat.
                                </p>
                            </div>
                        </div>
                    </DropdownMenuItem>

                    {/* 5. Pembaruan sistem */}
                    <DropdownMenuItem className="focus:bg-secondary-foreground/20">
                        <div className="flex w-full items-center gap-2">
                            <div className="bg-chart-5 flex min-h-8 min-w-8 items-center justify-center rounded-md">
                                <Wrench className="text-white" />
                            </div>
                            <div className="flex w-full flex-col justify-center">
                                <div className="flex items-start justify-between">
                                    <p className="text-foreground text-sm font-medium">
                                        Pembaruan sistem
                                    </p>
                                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                                        5 jam yang lalu
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Sistem telah diperbarui untuk meningkatkan performa dan akurasi
                                    analisis.
                                </p>
                            </div>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
