import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kebijakan Privasi',
        href: '/privacy-policy',
    },
];

const content = {
    id: {
        title: 'Kebijakan Privasi',
        description: 'Penjelasan mengenai bagaimana LawanJudol.ID mengelola dan melindungi data pribadi pengguna.',
        lastUpdated: 'Terakhir diperbarui: September 2025',
    },
    en: {
        title: 'Privacy Policy',
        description: 'Explanation of how LawanJudol.ID manages and protects user personal data.',
        lastUpdated: 'Last updated: September 2025',
    },
};

export default function PrivacyPolicy() {
    const [language, setLanguage] = useState<'id' | 'en'>('id');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kebijakan Privasi" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading title="Kebijakan Privasi" description="Penjelasan mengenai bagaimana LawanJudol.ID mengelola dan melindungi data pribadi pengguna." />

                <Card className="pt-0 pb-0">
                    <CardContent className="space-y-4 p-4 text-sm lg:space-y-6 lg:p-6">
                        <Select value={language} onValueChange={(val) => setLanguage(val as 'id' | 'en')}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Pilih bahasa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                                <SelectItem value="en">en English</SelectItem>
                            </SelectContent>
                        </Select>

                        {language === 'id' ? (
                            <>
                                <div>
                                    <h3 className="mb-3 text-base font-semibold">1. Pendahuluan</h3>
                                    <p>Kebijakan Privasi ini mengatur bagaimana LawanJudol.ID ("Kami", "Aplikasi", atau "Layanan") mengumpulkan, menggunakan, menyimpan, melindungi, dan membagikan data pribadi pengguna ("Anda").</p>
                                    <p className="mt-2">
                                        Dengan mengakses atau menggunakan aplikasi ini, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui ketentuan dalam Kebijakan Privasi ini. Apabila Anda tidak menyetujui, maka Anda disarankan untuk tidak menggunakan aplikasi ini.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">2. Informasi yang Dikumpulkan</h3>

                                    <div className="mb-4">
                                        <h4 className="mb-2 font-medium">a. Data Umum Pengguna</h4>
                                        <p className="mb-2">Saat Anda membuat akun dan masuk ke aplikasi menggunakan akun Google, kami dapat mengakses informasi dasar berikut:</p>
                                        <ul className="list-disc space-y-1 pl-6">
                                            <li>Nama lengkap</li>
                                            <li>Alamat email</li>
                                            <li>Foto profil akun Google</li>
                                            <li>Informasi identitas dasar lain yang tersedia secara publik</li>
                                        </ul>
                                        <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">Informasi ini digunakan untuk tujuan autentikasi, identifikasi, dan komunikasi dengan Anda.</blockquote>
                                    </div>

                                    <div>
                                        <h4 className="mb-2 font-medium">b. Data dari YouTube Data API</h4>
                                        <p className="mb-2">Dengan izin eksplisit melalui OAuth 2.0, aplikasi ini dapat mengakses data tertentu dari akun YouTube Anda, yang terbatas pada:</p>
                                        <ul className="list-disc space-y-1 pl-6">
                                            <li>
                                                <span className="font-medium">Channel</span> – Informasi dasar tentang channel YouTube Anda (misalnya ID channel, nama channel, dan metadata publik).
                                            </li>
                                            <li>
                                                <span className="font-medium">Video & Playlist</span> – Daftar video dan playlist yang Anda miliki, termasuk metadata publik seperti judul video dan jumlah komentar.
                                            </li>
                                            <li>
                                                <span className="font-medium">Komentar</span> – Komentar yang dipublikasikan (published) pada video yang Anda pilih untuk dianalisis. Komentar ini digunakan untuk mendeteksi indikasi konten perjudian online.
                                            </li>
                                            <li>
                                                <span className="font-medium">Moderasi Komentar</span> – Fitur untuk mengubah status moderasi komentar (misalnya heldForReview atau rejected). Pengguna memiliki kendali penuh atas keputusan moderasi, termasuk opsi tambahan untuk memblokir akun pengirim
                                                komentar (banAuthor).
                                            </li>
                                        </ul>
                                        <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">Sistem tidak melakukan moderasi komentar secara otomatis. Segala tindakan moderasi dilakukan sesuai dengan keputusan pengguna.</blockquote>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">3. Tujuan Penggunaan Informasi</h3>
                                    <p className="mb-2">Informasi yang dikumpulkan digunakan untuk:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Melakukan analisis komentar guna mendeteksi konten perjudian online.</li>
                                        <li>Menyediakan hasil analisis, label, dan laporan di dalam aplikasi.</li>
                                        <li>Memfasilitasi pengguna dalam melakukan moderasi komentar secara langsung melalui aplikasi.</li>
                                        <li>Menyediakan wawasan statistik terkait aktivitas komentar pada video pengguna.</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">Kami tidak menggunakan data Anda untuk tujuan iklan, pemasaran, atau komersial di luar ruang lingkup aplikasi.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">4. Retensi dan Penghapusan Data</h3>
                                    <p className="mb-3">
                                        Data komentar dan metadata video akan tetap disimpan selama akun Anda aktif. Jika akun dihapus, data terkait akan dihapus secara permanen dalam jangka waktu maksimal <span className="font-semibold">7 (tujuh) hari kalender</span>.
                                    </p>
                                    <p className="mb-3">Token OAuth disimpan dengan aman menggunakan enkripsi, dan hanya berlaku selama Anda memberikan otorisasi.</p>
                                    <div className="mb-3">
                                        <p className="mb-2">Anda dapat mencabut akses kapan saja melalui:</p>
                                        <ul className="list-disc space-y-1 pl-6">
                                            <li>Menu Cabut Akses di dalam aplikasi, atau</li>
                                            <li>
                                                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                    Google Security Settings
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">Jika akses dicabut, aplikasi tidak lagi dapat mengakses data baru dari YouTube. Namun, data yang sudah tersimpan akan tetap ada hingga akun Anda dihapus.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">5. Keamanan Data</h3>
                                    <p className="mb-2">Kami menerapkan langkah-langkah keamanan teknis dan organisasi untuk melindungi data Anda, termasuk namun tidak terbatas pada:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Enkripsi token OAuth dan data sensitif.</li>
                                        <li>Pembatasan akses internal hanya kepada tim berwenang.</li>
                                        <li>Monitoring sistem dan audit keamanan secara berkala.</li>
                                    </ul>
                                    <p className="text-muted-foreground mt-3">Meskipun demikian, tidak ada metode transmisi atau penyimpanan data yang sepenuhnya aman. Kami tidak dapat menjamin keamanan absolut dari data Anda.</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">6. Berbagi Informasi</h3>
                                    <p className="mb-2">Kami tidak akan menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga.</p>
                                    <p className="mb-2">Namun, data dapat dibagikan dalam kondisi berikut:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Kepada penyedia layanan pihak ketiga (misalnya penyedia layanan cloud atau database) yang membantu pengoperasian aplikasi.</li>
                                        <li>Jika diwajibkan oleh hukum atau permintaan resmi dari otoritas yang berwenang.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">7. Hak-Hak Pengguna</h3>
                                    <p className="mb-2">Sebagai pengguna, Anda memiliki hak-hak berikut:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Hak untuk mengetahui data yang kami akses dari akun YouTube Anda.</li>
                                        <li>Hak untuk mencabut akses OAuth kapan saja.</li>
                                        <li>Hak untuk meminta penghapusan data yang tersimpan di server kami.</li>
                                        <li>Hak untuk menghubungi kami terkait pertanyaan, keluhan, atau permintaan terkait privasi.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">8. Kepatuhan terhadap Kebijakan Google</h3>
                                    <p>
                                        Karena aplikasi ini menggunakan YouTube Data API, penggunaan Anda juga tunduk pada Kebijakan Privasi Google yang tersedia di:{' '}
                                        <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                            http://www.google.com/policies/privacy
                                        </a>
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">9. Perubahan Kebijakan Privasi</h3>
                                    <p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk menyesuaikan dengan perubahan layanan, regulasi, atau kebijakan internal. Perubahan akan diberitahukan melalui aplikasi atau email, dan versi terbaru akan selalu tersedia di aplikasi.</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">10. Kontak Kami</h3>
                                    <p className="mb-2">Jika Anda memiliki pertanyaan, keluhan, atau permintaan terkait data pribadi dan privasi, silakan hubungi kami melalui:</p>
                                    <div className="space-y-1">
                                        <p>Email: support@lawanjudol.id</p>
                                        <p>Website: https://lawanjudol.id</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <h3 className="mb-3 text-base font-semibold">1. Introduction</h3>
                                    <p>This Privacy Policy explains how LawanJudol.ID ("We", "Application", or "Service") collects, uses, stores, protects, and shares your personal data ("You").</p>
                                    <p className="mt-2">By accessing or using this application, you acknowledge that you have read, understood, and agreed to the terms of this Privacy Policy. If you do not agree, you are advised not to use this application.</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">2. Information Collected</h3>

                                    <div className="mb-4">
                                        <h4 className="mb-2 font-medium">a. General User Data</h4>
                                        <p className="mb-2">When you create an account and sign in using your Google account, we may access the following basic information:</p>
                                        <ul className="list-disc space-y-1 pl-6">
                                            <li>Full name</li>
                                            <li>Email address</li>
                                            <li>Google account profile picture</li>
                                            <li>Other basic identity information publicly available</li>
                                        </ul>
                                        <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">This information is used for authentication, identification, and communication with you.</blockquote>
                                    </div>

                                    <div>
                                        <h4 className="mb-2 font-medium">b. Data from the YouTube Data API</h4>
                                        <p className="mb-2">With your explicit permission through OAuth 2.0, this application may access certain data from your YouTube account, limited to:</p>
                                        <ul className="list-disc space-y-1 pl-6">
                                            <li>
                                                <span className="font-medium">Channel</span> – Basic information about your YouTube channel (e.g., channel ID, channel name, and public metadata).
                                            </li>
                                            <li>
                                                <span className="font-medium">Videos & Playlists</span> – Lists of videos and playlists you own, including public metadata such as video titles and comment counts.
                                            </li>
                                            <li>
                                                <span className="font-medium">Comments</span> – Published comments on the videos you choose to analyze. These comments are used to detect indications of online gambling content.
                                            </li>
                                            <li>
                                                <span className="font-medium">Comment Moderation</span> – Features to change the moderation status of comments (e.g., held for review or rejected). You have full control over moderation actions, including an additional option to block the author of a
                                                comment (banAuthor).
                                            </li>
                                        </ul>
                                        <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">Note: The system does not automatically moderate comments. All moderation actions are performed solely based on your decision.</blockquote>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">3. Purpose of Information Use</h3>
                                    <p className="mb-2">The information collected is used to:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Analyze comments to detect indications of online gambling content.</li>
                                        <li>Provide analysis results, labels, and reports within the application.</li>
                                        <li>Enable you to moderate comments directly through the application.</li>
                                        <li>Provide statistical insights related to comment activity on your videos.</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">We do not use your data for advertising, marketing, or commercial purposes outside the scope of this application.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">4. Data Retention and Deletion</h3>
                                    <p className="mb-3">
                                        Comment data and video metadata will be stored as long as your account remains active. If your account is deleted, the related data will be permanently removed within a maximum of <span className="font-semibold">seven (7) calendar days</span>.
                                    </p>
                                    <p className="mb-3">OAuth tokens are securely stored with encryption and are only valid while you grant authorization.</p>
                                    <div className="mb-3">
                                        <p className="mb-2">You may revoke access at any time via:</p>
                                        <ul className="list-disc space-y-1 pl-6">
                                            <li>The Revoke Access menu in the application, or</li>
                                            <li>
                                                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                    Google Security Settings
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">If access is revoked, the application will no longer be able to access new data from YouTube. However, previously stored data will remain until your account is deleted.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">5. Data Security</h3>
                                    <p className="mb-2">We implement technical and organizational measures to protect your data, including but not limited to:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Encryption of OAuth tokens and sensitive data.</li>
                                        <li>Restricted internal access limited to authorized team members.</li>
                                        <li>Regular system monitoring and security audits.</li>
                                    </ul>
                                    <p className="text-muted-foreground mt-3">However, no transmission or storage method is 100% secure. We cannot guarantee absolute security of your data.</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">6. Information Sharing</h3>
                                    <p className="mb-2">We will not sell, rent, or trade your personal data to third parties. However, data may be shared under the following conditions:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>With third-party service providers (e.g., cloud or database providers) that support the operation of the application.</li>
                                        <li>If required by law or an official request from an authorized authority.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">7. Your Rights</h3>
                                    <p className="mb-2">As a user, you have the following rights:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>The right to know what data we access from your YouTube account.</li>
                                        <li>The right to revoke OAuth access at any time.</li>
                                        <li>The right to request deletion of data stored on our servers.</li>
                                        <li>The right to contact us with questions, complaints, or requests related to privacy.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">8. Compliance with Google Policies</h3>
                                    <p>
                                        Since this application uses the YouTube Data API, your usage is also subject to the Google Privacy Policy available at:{' '}
                                        <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                            http://www.google.com/policies/privacy
                                        </a>
                                    </p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">9. Changes to This Privacy Policy</h3>
                                    <p>We may update this Privacy Policy from time to time to reflect changes in our services, regulations, or internal policies. Updates will be notified through the application or email, and the latest version will always be available within the application.</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">10. Contact Us</h3>
                                    <p className="mb-2">If you have questions, complaints, or requests related to personal data and privacy, please contact us through:</p>
                                    <div className="space-y-1">
                                        <p>Email: support@lawanjudol.id</p>
                                        <p>Website: https://lawanjudol.id</p>
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />

                        <p className="text-muted-foreground text-xs">{content[language].lastUpdated}</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
