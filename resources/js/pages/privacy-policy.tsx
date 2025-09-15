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
        description: 'Penjelasan mengenai bagaimana LawanJudol mengelola dan melindungi data pribadi pengguna.',
        lastUpdated: 'Terakhir diperbarui: September 2025',
    },
    en: {
        title: 'Privacy Policy',
        description: 'Explanation of how LawanJudol manages and protects user personal data.',
        lastUpdated: 'Last updated: September 2025',
    },
};

export default function PrivacyPolicy() {
    const [language, setLanguage] = useState<'id' | 'en'>('id');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kebijakan Privasi" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading title="Kebijakan Privasi" description="Penjelasan mengenai bagaimana LawanJudol mengelola dan melindungi data pribadi pengguna." />

                <Card className="pt-0 pb-0">
                    <CardContent className="space-y-4 p-4 text-sm lg:space-y-6 lg:p-6">
                        <Select value={language} onValueChange={(val) => setLanguage(val as 'id' | 'en')}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Pilih bahasa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                                <SelectItem value="en">🇺🇸 English</SelectItem>
                            </SelectContent>
                        </Select>

                        {language === 'id' ? (
                            <>
                                <div>
                                    <h3 className="mb-3 text-base font-semibold">1. Pendahuluan</h3>
                                    <p>Kebijakan Privasi ini mengatur bagaimana LawanJudol ("Kami", "Aplikasi", atau "Layanan") mengumpulkan, menggunakan, menyimpan, melindungi, dan membagikan data pribadi pengguna ("Anda").</p>
                                    <p className="mt-2">
                                        Dengan mengakses atau menggunakan aplikasi ini, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui ketentuan dalam Kebijakan Privasi ini. Apabila Anda tidak menyetujui, maka Anda disarankan untuk tidak menggunakan aplikasi ini.
                                    </p>
                                    <p className="mt-2">Kebijakan Privasi ini merupakan bagian integral dari Ketentuan Layanan kami dan harus dibaca bersama dengan dokumen tersebut.</p>
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

                                    <div className="mb-4">
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
                                        <li>Melakukan analisis komentar guna mendeteksi konten perjudian online menggunakan teknologi machine learning dan artificial intelligence.</li>
                                        <li>Menyediakan hasil analisis, label, dan laporan di dalam aplikasi.</li>
                                        <li>Memfasilitasi pengguna dalam melakukan moderasi komentar secara langsung melalui aplikasi.</li>
                                        <li>Menyediakan dashboard analitik dan wawasan statistik terkait aktivitas komentar pada video pengguna.</li>
                                        <li>Meningkatkan kualitas layanan dan mengembangkan fitur baru.</li>
                                       
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">Kami tidak menggunakan data Anda untuk tujuan iklan, pemasaran komersial, atau penjualan kepada pihak ketiga di luar ruang lingkup aplikasi.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">4. Retensi dan Penghapusan Data</h3>
                                    <div className="mb-3">
                                        <h4 className="mb-2 font-medium">a. Periode Penyimpanan</h4>
                                        <p className="mb-2">Data akan disimpan dengan periode sebagai berikut:</p>
                                        <ul className="list-disc space-y-1 pl-6">
                                            <li>Data komentar dan metadata video: Selama akun Anda aktif</li>
                                            <li>Token OAuth: Selama Anda memberikan otorisasi akses</li>
                                        </ul>
                                    </div>

                                    <div className="mb-3">
                                        <h4 className="mb-2 font-medium">b. Penghapusan Data</h4>
                                        <p className="mb-2">
                                            Jika akun dihapus atau Anda meminta penghapusan data, kami akan menghapus data terkait secara permanen dalam jangka waktu maksimal <span className="font-semibold">7 (tujuh) hari kalender</span>.
                                        </p>
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

                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">
                                        Jika akses dicabut, aplikasi tidak lagi dapat mengakses data baru dari YouTube. Namun, data yang sudah tersimpan akan tetap ada hingga Anda meminta penghapusan atau menghapus akun.
                                    </blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">5. Keamanan Data</h3>
                                    <p className="mb-2">Kami menerapkan langkah-langkah keamanan teknis dan organisasi untuk melindungi data Anda, termasuk:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Enkripsi untuk token OAuth dan data sensitif</li>

                                        <li>Pembatasan akses internal hanya kepada tim yang berwenang</li>
                                        <li>Monitoring sistem dan audit keamanan secara berkala</li>
                                    </ul>

                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">
                                        Meskipun demikian, tidak ada metode transmisi atau penyimpanan data yang sepenuhnya aman. Kami tidak dapat menjamin keamanan absolut dari data Anda, namun kami berkomitmen untuk melindungi data Anda dengan standar keamanan tertinggi.
                                    </blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">6. Berbagi dan Pengungkapan Informasi</h3>
                                    <p className="mb-2">Kami tidak akan menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga untuk tujuan komersial.</p>
                                    <p className="mb-2">Namun, data dapat dibagikan dalam kondisi berikut:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Kepada penyedia layanan pihak ketiga yang terpercaya (misalnya penyedia layanan cloud, database, atau analitik) yang membantu pengoperasian aplikasi dengan perjanjian kerahasiaan yang ketat.</li>
                                        <li>Jika diwajibkan oleh hukum, regulasi, atau permintaan resmi dari otoritas yang berwenang.</li>
                                        <li>Untuk melindungi hak, properti, atau keselamatan LawanJudol, pengguna, atau publik.</li>
                                        <li>Dalam hal merger, akuisisi, atau penjualan aset perusahaan (dengan pemberitahuan kepada pengguna).</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">Semua pihak ketiga yang memiliki akses ke data Anda terikat oleh kewajiban kerahasiaan yang sama dengan yang kami patuhi.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">7. Hak-Hak Pengguna</h3>
                                    <p className="mb-2">Sebagai pengguna, Anda memiliki hak-hak berikut sesuai dengan peraturan perlindungan data yang berlaku:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>
                                            <span className="font-medium">Hak Akses:</span> Mengetahui data apa saja yang kami kumpulkan dan bagaimana data tersebut digunakan.
                                        </li>
                                        <li>
                                            <span className="font-medium">Hak Pembetulan:</span> Meminta koreksi data pribadi yang tidak akurat atau tidak lengkap.
                                        </li>
                                        <li>
                                            <span className="font-medium">Hak Penghapusan:</span> Meminta penghapusan data pribadi Anda ("right to be forgotten").
                                        </li>
                                        <li>
                                            <span className="font-medium">Hak Portabilitas Data:</span> Meminta salinan data pribadi Anda dalam format yang dapat dibaca mesin.
                                        </li>
                                        <li>
                                            <span className="font-medium">Hak Mencabut Izin:</span> Mencabut persetujuan OAuth kapan saja tanpa mempengaruhi keabsahan pemrosesan sebelumnya.
                                        </li>
                                    </ul>
                                    <div className="mt-3 rounded-lg border p-3">
                                        <p className="mb-2 font-medium">Cara Menggunakan Hak Anda:</p>
                                        <p className="text-sm">Untuk menggunakan hak-hak di atas, silakan hubungi kami melalui email: keviniansyah05@gmail.com. Kami akan merespons permintaan Anda dalam waktu maksimal 30 hari kalender.</p>
                                    </div>
                                </div>

                                {/* <div>
                                    <h3 className="mb-3 text-base font-semibold">8. Transfer Data Lintas Batas</h3>
                                    <p className="mb-2">Data Anda dapat diproses atau disimpan di server yang berlokasi di luar Indonesia. Jika hal ini terjadi, kami akan memastikan bahwa:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Negara tujuan memiliki tingkat perlindungan data yang memadai, atau</li>
                                        <li>Penerapan safeguards yang sesuai seperti Standard Contractual Clauses atau sertifikasi Privacy Shield.</li>
                                    </ul>
                                    <p className="mt-2">Saat ini, data utama disimpan di server yang berlokasi di Indonesia untuk meminimalkan risiko transfer lintas batas.</p>
                                </div> */}

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">8. Kepatuhan terhadap Kebijakan Pihak Ketiga</h3>
                                    <p className="mb-2">Karena aplikasi ini menggunakan YouTube Data API, penggunaan Anda juga tunduk pada kebijakan privasi dan ketentuan layanan pihak ketiga:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>
                                            <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                Google Privacy Policy
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                YouTube Terms of Service
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                YouTube API Services Terms of Service
                                            </a>
                                        </li>
                                    </ul>
                                    <p className="mt-2">Kami tidak bertanggung jawab atas praktik privasi pihak ketiga dan menyarankan Anda untuk membaca kebijakan privasi mereka.</p>
                                </div>

                                {/* <div>
                                    <h3 className="mb-3 text-base font-semibold">10. Privasi Anak</h3>
                                    <p className="mb-2">Layanan kami tidak ditujukan untuk anak-anak di bawah usia 13 tahun (atau usia minimum yang ditetapkan oleh hukum setempat). Kami tidak secara sengaja mengumpulkan informasi pribadi dari anak-anak.</p>
                                    <p>Jika Anda mengetahui bahwa anak Anda telah memberikan informasi pribadi kepada kami, silakan hubungi kami dan kami akan mengambil langkah-langkah untuk menghapus informasi tersebut.</p>
                                </div> */}

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">9. Perubahan Kebijakan Privasi</h3>
                                    <p className="mb-2">Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk menyesuaikan dengan:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Perubahan fitur dan layanan aplikasi</li>
                                        <li>Perubahan regulasi dan hukum perlindungan data yang berlaku</li>

                                        <li>Masukan dan feedback dari pengguna</li>
                                        <li>Perkembangan teknologi dan praktik keamanan terbaru</li>
                                    </ul>
                                    <p className="mt-2">Perubahan material akan diberitahukan melalui email, notifikasi aplikasi, atau pengumuman di website minimal 30 hari sebelum perubahan berlaku. Perubahan non-material dapat dilakukan tanpa pemberitahuan sebelumnya.</p>
                                    <p className="mt-2">Dengan tetap menggunakan layanan setelah perubahan berlaku, Anda dianggap menyetujui kebijakan yang telah diperbarui.</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">10. Dasar Hukum Pemrosesan Data</h3>
                                    <p className="mb-2">Kami memproses data pribadi Anda berdasarkan dasar hukum berikut:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>
                                            <span className="font-medium">Persetujuan:</span> Untuk akses data YouTube melalui OAuth 2.0
                                        </li>
                                        <li>
                                            <span className="font-medium">Pelaksanaan Kontrak:</span> Untuk menyediakan layanan sesuai Ketentuan Layanan
                                        </li>
                                        <li>
                                            <span className="font-medium">Kepentingan Sah:</span> Untuk peningkatan layanan, keamanan, dan analitik
                                        </li>
                                        <li>
                                            <span className="font-medium">Kewajiban Hukum:</span> Untuk mematuhi peraturan yang berlaku
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">11. Kontak Kami</h3>
                                    <p className="mb-2">Jika Anda memiliki pertanyaan, keluhan, atau permintaan terkait data pribadi dan privasi, silakan hubungi kami melalui:</p>
                                    <div className="mb-3 space-y-1">
                                        <p>
                                            <span className="font-medium">Email:</span> keviniansyah05@gmail.com
                                        </p>
                                        <p>
                                            <span className="font-medium">Website:</span> https://lawanjudol.com
                                        </p>
                                    </div>
                                    {/* <div className="bg-muted rounded-lg p-3">
                                        <p className="mb-1 font-medium">Waktu Respons:</p>
                                        <ul className="list-disc space-y-1 pl-4 text-sm">
                                            <li>Pertanyaan umum: Maksimal 2x24 jam pada hari kerja</li>
                                            <li>Permintaan terkait hak data pribadi: Maksimal 30 hari kalender</li>
                                            <li>Laporan insiden keamanan: Maksimal 24 jam</li>
                                        </ul>
                                    </div> */}
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <h3 className="mb-3 text-base font-semibold">1. Introduction</h3>
                                    <p>This Privacy Policy explains how LawanJudol ("We", "Application", or "Service") collects, uses, stores, protects, and shares your personal data ("You").</p>
                                    <p className="mt-2">By accessing or using this application, you acknowledge that you have read, understood, and agreed to the terms of this Privacy Policy. If you do not agree, you are advised not to use this application.</p>
                                    <p className="mt-2">This Privacy Policy is an integral part of our Terms of Service and should be read together with that document.</p>
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

                                    <div className="mb-4">
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
                                        <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">The system does not automatically moderate comments. All moderation actions are performed solely based on your decision.</blockquote>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">3. Purpose of Information Use</h3>
                                    <p className="mb-2">The information collected is used to:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Analyze comments to detect indications of online gambling content using machine learning and artificial intelligence technology.</li>
                                        <li>Provide analysis results, labels, and reports within the application.</li>
                                        <li>Enable you to moderate comments directly through the application.</li>
                                        <li>Provide analytics dashboard and statistical insights related to comment activity on your videos.</li>
                                        <li>Improve service quality and develop new features.</li>
                                       
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">We do not use your data for advertising, commercial marketing, or selling to third parties outside the scope of this application.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">4. Data Retention and Deletion</h3>
                                    <div className="mb-3">
                                        <h4 className="mb-2 font-medium">a. Retention Period</h4>
                                        <p className="mb-2">Data will be stored for the following periods:</p>
                                        <ul className="list-disc space-y-1 pl-6">
                                            <li>Comment data and video metadata: As long as your account remains active</li>
                                            <li>OAuth tokens: As long as you grant access authorization</li>
                                        </ul>
                                    </div>

                                    <div className="mb-3">
                                        <h4 className="mb-2 font-medium">b. Data Deletion</h4>
                                        <p className="mb-2">
                                            If your account is deleted or you request data deletion, we will permanently remove the related data within a maximum of <span className="font-semibold">seven (7) calendar days</span>.
                                        </p>
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

                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">
                                        If access is revoked, the application will no longer be able to access new data from YouTube. However, previously stored data will remain until you request deletion or delete your account.
                                    </blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">5. Data Security</h3>
                                    <p className="mb-2">We implement technical and organizational measures to protect your data, including:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Encryption for OAuth tokens and sensitive data</li>
                                        <li>Restricted internal access limited to authorized team members</li>
                                        <li>Regular system monitoring and security audits</li>
                                    </ul>

                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">
                                        However, no transmission or storage method is 100% secure. We cannot guarantee absolute security of your data, but we are committed to protecting your data with the highest security standards.
                                    </blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">6. Information Sharing and Disclosure</h3>
                                    <p className="mb-2">We will not sell, rent, or trade your personal data to third parties for commercial purposes.</p>
                                    <p className="mb-2">However, data may be shared under the following conditions:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>With trusted third-party service providers (e.g., cloud, database, or analytics providers) that support application operations under strict confidentiality agreements.</li>
                                        <li>If required by law, regulations, or official requests from authorized authorities.</li>
                                        <li>To protect the rights, property, or safety of LawanJudol, users, or the public.</li>
                                        <li>In the event of merger, acquisition, or sale of company assets (with user notification).</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">All third parties with access to your data are bound by the same confidentiality obligations that we adhere to.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">7. Your Rights</h3>
                                    <p className="mb-2">As a user, you have the following rights in accordance with applicable data protection regulations:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>
                                            <span className="font-medium">Right of Access:</span> Know what data we collect and how that data is used.
                                        </li>
                                        <li>
                                            <span className="font-medium">Right of Rectification:</span> Request correction of inaccurate or incomplete personal data.
                                        </li>
                                        <li>
                                            <span className="font-medium">Right of Erasure:</span> Request deletion of your personal data ("right to be forgotten").
                                        </li>
                                        <li>
                                            <span className="font-medium">Right to Data Portability:</span> Request a copy of your personal data in machine-readable format.
                                        </li>
                                        <li>
                                            <span className="font-medium">Right to Withdraw Consent:</span> Withdraw OAuth consent at any time without affecting the lawfulness of previous processing.
                                        </li>
                                    </ul>
                                    <div className="mt-3 rounded-lg border p-3">
                                        <p className="mb-2 font-medium">How to Exercise Your Rights:</p>
                                        <p className="text-sm">To exercise the above rights, please contact us via email: keviniansyah05@gmail.com. We will respond to your request within a maximum of 30 calendar days.</p>
                                    </div>
                                </div>

                                {/* <div>
                                    <h3 className="mb-3 text-base font-semibold">8. Cross-Border Data Transfer</h3>
                                    <p className="mb-2">Your data may be processed or stored on servers located outside Indonesia. If this occurs, we will ensure that:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>The destination country has an adequate level of data protection, or</li>
                                        <li>Implementation of appropriate safeguards such as Standard Contractual Clauses or Privacy Shield certification.</li>
                                    </ul>
                                    <p className="mt-2">Currently, primary data is stored on servers located in Indonesia to minimize cross-border transfer risks.</p>
                                </div> */}

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">8. Compliance with Third-Party Policies</h3>
                                    <p className="mb-2">Since this application uses the YouTube Data API, your usage is also subject to third-party privacy policies and terms of service:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>
                                            <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                Google Privacy Policy
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                YouTube Terms of Service
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                YouTube API Services Terms of Service
                                            </a>
                                        </li>
                                    </ul>
                                    <p className="mt-2">We are not responsible for third-party privacy practices and recommend that you read their privacy policies.</p>
                                </div>

                                {/* <div>
                                    <h3 className="mb-3 text-base font-semibold">10. Children's Privacy</h3>
                                    <p className="mb-2">Our services are not intended for children under the age of 13 (or the minimum age established by local law). We do not knowingly collect personal information from children.</p>
                                    <p>If you become aware that your child has provided us with personal information, please contact us and we will take steps to delete such information.</p>
                                </div> */}

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">9. Changes to This Privacy Policy</h3>
                                    <p className="mb-2">We may update this Privacy Policy from time to time to accommodate:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Changes in application features and services</li>
                                        <li>Changes in applicable data protection regulations and laws</li>
                                        <li>User input and feedback</li>
                                        <li>Developments in technology and latest security practices</li>
                                    </ul>
                                    <p className="mt-2">Material changes will be notified via email, application notifications, or website announcements at least 30 days before the changes take effect. Non-material changes may be made without prior notice.</p>
                                    <p className="mt-2">By continuing to use the service after changes take effect, you are deemed to agree to the updated policy.</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">10. Legal Basis for Data Processing</h3>
                                    <p className="mb-2">We process your personal data based on the following legal grounds:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>
                                            <span className="font-medium">Consent:</span> For YouTube data access through OAuth 2.0
                                        </li>
                                        <li>
                                            <span className="font-medium">Contract Performance:</span> To provide services according to the Terms of Service
                                        </li>
                                        <li>
                                            <span className="font-medium">Legitimate Interest:</span> For service improvement, security, and analytics
                                        </li>
                                        <li>
                                            <span className="font-medium">Legal Obligation:</span> To comply with applicable regulations
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">11. Contact Us</h3>
                                    <p className="mb-2">If you have questions, complaints, or requests regarding personal data and privacy, please contact us through:</p>
                                    <div className="mb-3 space-y-1">
                                        <p>
                                            <span className="font-medium">Email:</span> keviniansyah05@gmail.com
                                        </p>
                                        <p>
                                            <span className="font-medium">Website:</span> https://lawanjudol.com
                                        </p>
                                    </div>
                                    {/* <div className="bg-muted rounded-lg p-3">
                                        <p className="mb-1 font-medium">Response Time:</p>
                                        <ul className="list-disc space-y-1 pl-4 text-sm">
                                            <li>General inquiries: Maximum 2x24 hours on business days</li>
                                            <li>Personal data rights requests: Maximum 30 calendar days</li>
                                            <li>Security incident reports: Maximum 24 hours</li>
                                        </ul>
                                    </div> */}
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
