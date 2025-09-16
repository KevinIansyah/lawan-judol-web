import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import welcomeImage from '../../../public/assets/images/welcome.webp';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Beranda',
        href: '/',
    },
];

export default function Home() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Beranda" />
            <div className="flex min-h-[calc(100vh-70px)] w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                <main className="flex w-full max-w-[335px] flex-col-reverse py-8 lg:max-w-4xl lg:flex-row">
                    <div className="flex-1 flex-col justify-center rounded-br-lg rounded-bl-lg p-6 leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:flex lg:rounded-tl-lg lg:rounded-br-none lg:px-15 dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                        <h1 className="mb-1 text-base font-bold">Bersama Kita Lawan Judi Online</h1>
                        <p className="text-muted-foreground mb-2 text-sm">
                            Judi online bukan sekadar permainan, ini ancaman bagi masa depan kita. Mari bersatu menciptakan ruang digital yang sehat. Gunakan platform kami untuk
                            <strong> mendeteksi dan menghapus komentar-komentar judi online</strong> secara otomatis dari video YouTube Anda.
                        </p>
                        <ul className="mb-4 flex flex-col text-sm font-medium lg:mb-6">
                            <li className="relative flex items-center gap-4 py-2 before:absolute before:top-1/2 before:bottom-0 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                <span className="relative bg-white py-1 dark:bg-[#161615]">
                                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]" />
                                    </span>
                                </span>
                                <span>
                                    Ketahui lebih lanjut di
                                    <br />
                                    <a href="/guides" className="text-primary ml-1 inline-flex items-center space-x-1 font-medium underline underline-offset-4">
                                        <span>Dokumentasi Platform</span>
                                        <svg width={10} height={11} viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5">
                                            <path d="M7.70833 6.95834V2.79167H3.54167M2.5 8L7.5 3.00001" stroke="currentColor" strokeLinecap="square" />
                                        </svg>
                                    </a>
                                </span>
                            </li>
                            <li className="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                <span className="relative bg-white py-1 dark:bg-[#161615]">
                                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]" />
                                    </span>
                                </span>
                                <span>
                                    Tonton cara kerja kami di
                                    <br />
                                    <a href="https://laracasts.com" target="_blank" className="text-primary ml-1 inline-flex items-center space-x-1 font-medium underline underline-offset-4">
                                        <span>Video Tutorial</span>
                                        <svg width={10} height={11} viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5">
                                            <path d="M7.70833 6.95834V2.79167H3.54167M2.5 8L7.5 3.00001" stroke="currentColor" strokeLinecap="square" />
                                        </svg>
                                    </a>
                                </span>
                            </li>
                        </ul>
                        <Button asChild>
                            <Link href={auth.user ? '/analysis/your-videos' : '/login'}>Analisis Video Sekarang!</Link>
                        </Button>
                    </div>

                    <div className="relative h-full w-full rounded-t-lg bg-red-50 lg:w-[438px] lg:rounded-t-none lg:rounded-r-lg dark:bg-red-700/10">
                        <img src={welcomeImage} fetchPriority="high" alt="Logo" className="h-full w-full overflow-hidden object-cover transition-all duration-750 starting:translate-y-6 starting:opacity-0 lg:rounded-br-lg lg:rounded-tr-lg" />

                        <div className="absolute inset-0 rounded-t-lg shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-t-none lg:rounded-r-lg dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]" />
                    </div>
                </main>
            </div>
        </AppLayout>
    );
}
