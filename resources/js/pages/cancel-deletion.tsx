import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';

interface CancelDeletionProps {
    deletion_info: {
        scheduled_deletion_at: string;
        days_remaining: number;
        hours_remaining: number;
        can_cancel: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Batalkan Penghapusan',
        href: '/cancel-deletion',
    },
];

export default function CancelDeletion({ deletion_info }: CancelDeletionProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [isLoading, setIsLoading] = useState(false);
    const { days_remaining, hours_remaining } = deletion_info;

    const { post, processing } = useForm();

    const handleCancelDeletion = () => {
        setIsLoading(true);
        post(route('cancel-deletion.confirm'), {
            onFinish: () => setIsLoading(false),
        });
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const formatTimeRemaining = () => {
        let result = '';
        if (days_remaining > 0) result += `${days_remaining} hari`;
        if (hours_remaining > 0) result += `${result ? ' ' : ''}${hours_remaining} jam`;

        return result || 'kurang dari 1 jam';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Batalkan Penghapusan" />
            <div className="mx-auto flex h-full w-full max-w-none flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-4xl">
                    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                    <AlertTriangle className="text-primary h-8 w-8" />
                                </div>
                                <CardTitle className="text-xl font-semibold tracking-tight">Akun Akan Dihapus</CardTitle>
                                <CardDescription>
                                    Akun <span className="text-muted-foreground text-sm">{auth.user.email}</span> akan dihapus secara permanen
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <div className="rounded-lg border p-4">
                                    <div className="mb-3 flex items-center gap-3">
                                        <h3 className="font-semibold">Informasi Penghapusan</h3>
                                    </div>
                                    <div className="grid gap-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Waktu Tersisa:</span>
                                            <span className="text-primary font-medium">{formatTimeRemaining()}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                                            <span className="text-muted-foreground">Tanggal Penghapusan:</span>
                                            <span className="font-medium">
                                                {new Date(deletion_info.scheduled_deletion_at).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-muted-foreground space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                                        <p>
                                            Setelah tanggal tersebut, semua data Anda akan dihapus <strong className="text-foreground">secara permanen</strong> dan tidak dapat dipulihkan.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                                        <p>Data yang akan dihapus meliputi: profil akun, riwayat analisis, file yang diunggah, dan semua data terkait.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-chart-4 mt-2 h-2 w-2 flex-shrink-0 rounded-full" />
                                        <p>Anda masih dapat membatalkan penghapusan dengan menekan tombol "Batalkan Penghapusan" di bawah.</p>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-4 border-t pt-6">
                                {deletion_info.can_cancel ? (
                                    <>
                                        <Button onClick={handleCancelDeletion} disabled={processing || isLoading} className="w-full">
                                            <Shield className="mr-2 h-4 w-4" />
                                            {processing || isLoading ? 'Membatalkan...' : 'Batalkan Penghapusan'}
                                        </Button>

                                        <div className="text-muted-foreground flex w-full flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                                            <span>Atau jika Anda tetap ingin menghapus akun:</span>
                                            <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Logout
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full text-center">
                                        <p className="mb-4 font-medium text-red-600 dark:text-red-400">Waktu untuk membatalkan penghapusan telah habis</p>
                                        <Button variant="outline" onClick={handleLogout} className="w-full">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Button>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Pertanyaan yang Sering Diajukan</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger className="text-sm">Apa yang terjadi jika saya membatalkan penghapusan?</AccordionTrigger>
                                        <AccordionContent className="flex flex-col gap-4 text-balance">
                                            <p>Akun Anda akan kembali normal dan Anda dapat menggunakan semua fitur seperti biasa. Jadwal penghapusan akan dibatalkan sepenuhnya.</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-2">
                                        <AccordionTrigger className="text-sm"> Bisakah saya meminta penghapusan lagi nanti?</AccordionTrigger>
                                        <AccordionContent className="flex flex-col gap-4 text-balance">
                                            <p>Ya, Anda dapat meminta penghapusan akun kembali melalui halaman pengaturan profil kapan saja.</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-3">
                                        <AccordionTrigger className="text-sm">Apakah data saya masih aman selama periode grace?</AccordionTrigger>
                                        <AccordionContent className="flex flex-col gap-4 text-balance">
                                            <p>Ya, semua data Anda masih utuh dan aman. Penghapusan hanya akan terjadi setelah periode 7 hari berakhir.</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
{
    /* <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <details className="group">
                                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                                    Apa yang terjadi jika saya membatalkan penghapusan?
                                    <span className="transition group-open:rotate-180">↓</span>
                                </summary>
                                <p className="text-muted-foreground mt-2 text-sm">Akun Anda akan kembali normal dan Anda dapat menggunakan semua fitur seperti biasa. Jadwal penghapusan akan dibatalkan sepenuhnya.</p>
                            </details>

                            <details className="group">
                                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                                    Bisakah saya meminta penghapusan lagi nanti?
                                    <span className="transition group-open:rotate-180">↓</span>
                                </summary>
                                <p className="text-muted-foreground mt-2 text-sm">Ya, Anda dapat meminta penghapusan akun kembali melalui halaman pengaturan profil kapan saja.</p>
                            </details>

                            <details className="group">
                                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                                    Apakah data saya masih aman selama periode grace?
                                    <span className="transition group-open:rotate-180">↓</span>
                                </summary>
                                <p className="text-muted-foreground mt-2 text-sm">Ya, semua data Anda masih utuh dan aman. Penghapusan hanya akan terjadi setelah periode 7 hari berakhir.</p>
                            </details>
                        </CardContent>
                    </Card> */
}
