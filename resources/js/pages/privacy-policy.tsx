import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kebijakan Privasi',
        href: '/guides',
    },
];

export default function Guides() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kebijakan Privasi" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading title="Kebijakan Privasi" description="Penjelasan mengenai bagaimana LawanJudol.ID mengelola dan melindungi data pribadi pengguna." />

                <Card className="pt-0 pb-0">
                    {/* <CardHeader>
                        <CardTitle>Kebijakan Privasi</CardTitle>
                    </CardHeader> */}
                    <CardContent className="space-y-4 lg:space-y-6 p-4 text-sm lg:p-6">
                        <p>
                            LawanJudol.ID (“Kami”, “Aplikasi”) berkomitmen untuk melindungi privasi dan data pribadi pengguna. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data, khususnya data yang diperoleh melalui integrasi dengan{' '}
                            <span className="font-semibold">YouTube Data API</span>.
                        </p>

                        <Separator />

                        <div>
                            <h3 className="mb-2 font-semibold">1. Informasi yang Kami Kumpulkan</h3>
                            <ul className="list-disc space-y-0.5 pl-6">
                                <li>Data Akun YouTube: ID channel, nama channel, dan metadata publik.</li>
                                <li>Data Video & Komentar: ID video, judul, metadata dasar, serta komentar dan status moderasi.</li>
                                <li>Data Akses: Token OAuth yang memungkinkan aplikasi mengakses akun YouTube sesuai izin Anda.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold">2. Penggunaan Informasi</h3>
                            <p>Data digunakan untuk:</p>
                            <ul className="list-disc space-y-0.5 pl-6">
                                <li>Analisis komentar otomatis untuk mendeteksi konten perjudian online.</li>
                                <li>Menampilkan hasil analisis dan laporan di dashboard.</li>
                                <li>Membantu Anda melakukan moderasi komentar.</li>
                                <li>Menyediakan statistik interaksi video.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold">3. Retensi & Penghapusan Data</h3>
                            <p>
                                Data hanya disimpan sementara untuk analisis. Token OAuth disimpan secara aman dan hanya digunakan selama aplikasi diotorisasi. Anda dapat mencabut akses kapan saja melalui aplikasi ini atau{' '}
                                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline dark:text-blue-400">
                                    Google Security Settings
                                </a>
                                . Semua data akan dihapus maksimal 30 hari setelah akses dicabut.
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold">4. Keamanan Data</h3>
                            <ul className="list-disc space-y-0.5 pl-6">
                                <li>Token OAuth disimpan dengan enkripsi.</li>
                                <li>Akses internal dibatasi hanya untuk tim berwenang.</li>
                                <li>Audit dan monitoring keamanan dilakukan secara berkala.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold">5. Berbagi Informasi</h3>
                            <p>Kami tidak menjual atau menyewakan data Anda. Data hanya dapat dibagikan kepada penyedia layanan cloud pendukung atau jika diwajibkan oleh hukum.</p>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold">6. Hak Pengguna</h3>
                            <ul className="list-disc space-y-0.5 pl-6">
                                <li>Mengetahui data yang diakses dari YouTube.</li>
                                <li>Mencabut akses OAuth kapan saja.</li>
                                <li>Meminta penghapusan data yang tersimpan.</li>
                                <li>Menghubungi kami untuk pertanyaan atau keluhan.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold">7. Kepatuhan Google</h3>
                            <p>
                                Karena aplikasi ini menggunakan YouTube Data API, penggunaan Anda juga tunduk pada{' '}
                                <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline dark:text-blue-400">
                                    Kebijakan Privasi Google
                                </a>
                                .
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold">8. Kontak Kami</h3>
                            <p>
                                Jika ada pertanyaan terkait privasi, silakan hubungi:
                                <br />
                                📧 Email: support@lawanjudol.id <br />
                                🌐 Website: https://lawanjudol.id
                            </p>
                        </div>

                        <Separator />

                        <p className="text-muted-foreground text-xs">Terakhir diperbarui: September 2025</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
