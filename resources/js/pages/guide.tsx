import Heading from '@/components/heading';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panduan Pengguna',
        href: '/guides',
    },
];

export default function Guides() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panduan Pengguna" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading title="Panduan Pengguna" description="Panduan lengkap untuk menggunakan fitur LawanJudol dengan mudah." />

                <Card>
                    <CardContent className="space-y-6">
                        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="border-t text-sm">Cara menggunakan fitur analisis video publik</AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <ol className="ml-4 list-outside list-decimal space-y-2 text-sm">
                                        <li>
                                            Pastikan aplikasi telah terhubung dengan YouTube. Jika indikator di navigasi berwarna merah, artinya aplikasi belum terhubung. Anda bisa menghubungkannya di halaman pengaturan akses YouTube:{' '}
                                            <a href="/settings/youtube-access" className="text-primary">
                                                /settings/youtube-access
                                            </a>
                                        </li>
                                        <li>
                                            Kunjungi halaman video publik:{' '}
                                            <a href="/analysis/public-videos" className="text-primary">
                                                /analysis/public-videos
                                            </a>
                                        </li>
                                        <li>Tekan tombol "Tambah Analisis"</li>
                                        <li>
                                            Masukkan ID video YouTube:
                                            <ul className="mt-1 ml-6 list-disc space-y-1">
                                                <li>
                                                    Jika menggunakan YouTube browser, ID video adalah <code className="text-primary">9_ZcmpZ35Mk</code> pada link: <br />
                                                    <code className="text-primary">https://www.youtube.com/watch?v=9_ZcmpZ35Mk</code>
                                                </li>
                                                <li>
                                                    Jika menggunakan aplikasi YouTube di ponsel, ID video adalah <code className="text-primary">P3hJK3HS9NY</code> pada link: <br />
                                                    <code className="text-primary">https://youtu.be/P3hJK3HS9NY?si=4veQL7rYHeKGTHuI</code>
                                                </li>
                                            </ul>
                                        </li>
                                        <li>Tekan tombol "Analisis Video"</li>
                                        <li>Tunggu sampai proses analisis selesai</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-sm">Cara menggunakan fitur analisis video Anda</AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <ol className="ml-4 list-outside list-decimal space-y-2 text-sm">
                                        <li>
                                            Pastikan aplikasi telah terhubung dengan YouTube. Jika indikator di navigasi berwarna merah, artinya aplikasi belum terhubung. Anda bisa menghubungkannya di halaman pengaturan akses YouTube:{' '}
                                            <a href="/settings/youtube-access" className="text-primary">
                                                /settings/youtube-access
                                            </a>
                                        </li>
                                        <li>
                                            Kunjungi halaman video Anda:{' '}
                                            <a href="/analysis/your-videos" className="text-primary">
                                                /analysis/your-videos
                                            </a>
                                        </li>
                                        <li>Tekan tombol "Tambah Analisis"</li>
                                        <li>Pilih video yang akan dianalisis</li>
                                        <li>Tekan tombol "Analisis Video"</li>
                                        <li>Tunggu sampai proses analisis selesai</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-sm">Cara melakukan moderasi komentar</AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <ol className="ml-4 list-outside list-decimal space-y-2 text-sm">
                                        <li>
                                            Pastikan aplikasi telah terhubung dengan YouTube. Jika indikator di navigasi berwarna merah, artinya aplikasi belum terhubung. Anda bisa menghubungkannya di halaman pengaturan akses YouTube:{' '}
                                            <a href="/settings/youtube-access" className="text-primary">
                                                /settings/youtube-access
                                            </a>
                                        </li>
                                        <li>
                                            Kunjungi halaman video Anda:{' '}
                                            <a href="/analysis/your-videos" className="text-primary">
                                                /analysis/your-videos
                                            </a>
                                        </li>
                                        <li>Pilih hasil analisis dengan menekan tombol dengan ikon mata</li>
                                        <li>Setelah masuk halaman detail, pergi ke bagian "Judi Online"</li>
                                        <li>Pilih komentar yang akan dimoderasi</li>
                                        <li>Tekan tombol "Tindakan Moderasi"</li>
                                        <li>
                                            Pilih tindakan moderasi yang akan diterapkan: ada <strong>HeldForReview</strong> dan <strong>Reject</strong>. Jika memilih opsi reject, Anda juga bisa menggunakan opsi <strong>banAuthor</strong>
                                        </li>
                                        <li>Tekan tombol "Moderasi"</li>
                                        <li>Tunggu sampai proses moderasi selesai</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-sm">Cara menambahkan kata kunci ke pengaturan channel YouTube (moderasi: kata yang diblokir)</AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <ol className="ml-4 list-outside list-decimal space-y-2 text-sm">
                                        <li>
                                            Kunjungi halaman kata kunci:{' '}
                                            <a href="/keywords" className="text-primary">
                                                /keywords
                                            </a>
                                        </li>
                                        <li>Salin kata kunci</li>
                                        <li>Buka YouTube di browser</li>
                                        <li>Klik foto profil dan klik "Lihat channel Anda"</li>
                                        <li>Tekan tombol "Sesuaikan channel"</li>
                                        <li>Tekan tombol "Pengaturan"</li>
                                        <li>Tekan tombol "Moderasi komunitas"</li>
                                        <li>Tempel kata kunci yang sudah disalin di bagian "Kata-kata yang diblokir"</li>
                                        <li>Tekan "Simpan"</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
