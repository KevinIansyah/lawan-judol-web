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
        title: 'Ketentuan Layanan',
        href: '/terms-of-service',
    },
];

const content = {
    id: {
        title: 'Ketentuan Layanan',
        description: 'Syarat dan ketentuan penggunaan aplikasi LawanJudol dan layanan yang disediakan.',
        lastUpdated: 'Terakhir diperbarui: September 2025',
    },
    en: {
        title: 'Terms of Service',
        description: 'Terms and conditions for using the LawanJudol application and its services.',
        lastUpdated: 'Last updated: September 2025',
    },
};

export default function TermsOfService() {
    const [language, setLanguage] = useState<'id' | 'en'>('id');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ketentuan Layanan" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading title="Ketentuan Layanan" description="Syarat dan ketentuan penggunaan aplikasi LawanJudol dan layanan yang disediakan." />

                <Card>
                    <CardContent className="space-y-4 text-sm lg:space-y-6">
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
                                    <h3 className="mb-3 text-base font-semibold">1. Penerimaan Ketentuan</h3>
                                    <p>Dengan mengakses atau menggunakan aplikasi LawanJudol ("Aplikasi", "Layanan", atau "Kami"), Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat dengan Ketentuan Layanan ini.</p>
                                    <p className="mt-2">Jika Anda tidak setuju dengan ketentuan ini, mohon untuk tidak menggunakan layanan ini.</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">2. Deskripsi Layanan</h3>
                                    <p className="mb-2">LawanJudol menyediakan layanan berikut:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Analisis komentar YouTube untuk mendeteksi indikasi konten perjudian online menggunakan teknologi machine learning dan artificial intelligence.</li>
                                        <li>Fitur moderasi komentar melalui integrasi dengan YouTube Data API, termasuk kemampuan untuk menahan, menolak, atau memblokir komentar.</li>
                                        <li>Dashboard analitik untuk memberikan wawasan statistik terkait aktivitas komentar pada video pengguna.</li>
                                        <li>Laporan dan visualisasi data hasil analisis komentar.</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">
                                        Layanan ini dirancang untuk membantu kreator YouTube dalam mengelola komentar yang berpotensi mengandung konten perjudian online, namun keputusan akhir moderasi tetap sepenuhnya di tangan pengguna.
                                    </blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">3. Kewajiban Pengguna</h3>
                                    <p className="mb-2">Sebagai pengguna layanan, Anda wajib untuk:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Menggunakan layanan sesuai dengan hukum yang berlaku di Indonesia dan yurisdiksi tempat Anda berada.</li>
                                        <li>Tidak menggunakan aplikasi untuk tujuan ilegal, termasuk namun tidak terbatas pada penyalahgunaan data, spam, atau aktivitas yang melanggar hukum.</li>
                                        <li>Bertanggung jawab penuh atas semua keputusan moderasi komentar yang Anda lakukan (hapus, tahan, tolak, atau blokir akun pengirim komentar).</li>
                                        <li>Menjaga kerahasiaan informasi akun dan kredensial akses Anda.</li>
                                        <li>Tidak melakukan tindakan yang dapat merusak, mengganggu, atau membahayakan sistem dan infrastruktur aplikasi.</li>
                                        <li>Tidak membagikan akun atau memberikan akses kepada pihak lain tanpa izin.</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">Anda memahami bahwa segala konsekuensi dari keputusan moderasi yang Anda lakukan sepenuhnya menjadi tanggung jawab Anda.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">4. Batasan Tanggung Jawab</h3>
                                    <p className="mb-2">LawanJudol dan penyedia layanan terkait tidak bertanggung jawab atas:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Konten komentar yang dipublikasikan oleh pihak ketiga di platform YouTube.</li>
                                        <li>Kerugian atau dampak negatif yang timbul dari keputusan moderasi yang Anda lakukan.</li>
                                        <li>Gangguan teknis, bug, downtime, atau ketidaktersediaan layanan yang bersifat sementara atau permanen.</li>
                                        <li>Kehilangan data, gangguan bisnis, atau kerugian finansial yang mungkin timbul dari penggunaan layanan.</li>
                                        <li>Ketidakakuratan hasil analisis atau deteksi yang dilakukan oleh sistem artificial intelligence.</li>
                                        <li>Perubahan kebijakan atau API dari pihak ketiga (seperti YouTube/Google) yang dapat mempengaruhi fungsionalitas aplikasi.</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">
                                        Kami berusaha memberikan layanan terbaik, namun tidak dapat menjamin bahwa layanan akan selalu tersedia, akurat, atau bebas dari kesalahan. Penggunaan layanan ini sepenuhnya atas risiko Anda sendiri.
                                    </blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">5. Hak Kekayaan Intelektual</h3>
                                    <p className="mb-2">Seluruh hak kekayaan intelektual atas aplikasi ini, termasuk namun tidak terbatas pada:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Kode sumber dan algoritma aplikasi</li>
                                        <li>Desain antarmuka pengguna</li>
                                        <li>Logo, merek dagang, dan identitas visual</li>
                                        <li>Dokumentasi dan materi pelatihan</li>
                                        <li>Model machine learning dan artificial intelligence yang digunakan</li>
                                    </ul>
                                    <p className="mt-2">Adalah milik LawanJudol dan dilindungi oleh hukum hak cipta serta undang-undang kekayaan intelektual yang berlaku.</p>
                                    <div className="text-muted-foreground mt-3 rounded-lg border p-3">
                                        <p className="mb-2 font-medium">Larangan:</p>
                                        <ul className="list-disc space-y-1 pl-4">
                                            <li>Menggandakan, menyalin, atau mendistribusikan aplikasi atau bagian darinya tanpa izin tertulis.</li>
                                            <li>Melakukan reverse engineering, decompile, atau disassemble aplikasi.</li>
                                            <li>Menggunakan merek dagang atau identitas visual untuk kepentingan komersial tanpa izin.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">6. Perubahan Layanan</h3>
                                    <p>Kami berhak untuk melakukan hal-hal berikut kapan saja, dengan atau tanpa pemberitahuan sebelumnya:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Mengubah, memodifikasi, atau memperbarui fitur dan fungsionalitas aplikasi.</li>
                                        <li>Menghentikan atau membatasi sebagian atau seluruh layanan.</li>
                                        <li>Mengubah struktur harga atau model bisnis (jika applicable).</li>
                                        <li>Menambahkan syarat dan ketentuan baru.</li>
                                        <li>Melakukan maintenance atau upgrade sistem.</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">Kami akan berusaha memberikan pemberitahuan yang wajar untuk perubahan signifikan yang dapat mempengaruhi penggunaan layanan Anda.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">7. Pemutusan Akses</h3>
                                    <p className="mb-2">Kami berhak untuk menonaktifkan akun atau mencabut akses Anda jika:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Ditemukan pelanggaran terhadap Ketentuan Layanan ini.</li>
                                        <li>Penggunaan layanan yang tidak sesuai dengan tujuan yang dimaksudkan.</li>
                                        <li>Aktivitas yang dapat membahayakan keamanan sistem atau pengguna lain.</li>
                                        <li>Tidak mematuhi hukum yang berlaku atau kebijakan platform pihak ketiga.</li>
                                        <li>Penggunaan layanan untuk tujuan komersial tanpa izin (jika applicable).</li>
                                    </ul>
                                    <p className="mt-2">Pemutusan akses dapat dilakukan secara sementara atau permanen, tergantung pada tingkat pelanggaran yang dilakukan.</p>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">Dalam kasus pemutusan akses, data yang tersimpan akan dihapus sesuai dengan kebijakan retensi data yang tercantum dalam Kebijakan Privasi kami.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">8. Kepatuhan terhadap Platform Pihak Ketiga</h3>
                                    <p className="mb-2">Karena aplikasi ini terintegrasi dengan YouTube Data API, penggunaan Anda juga tunduk pada:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>
                                            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                YouTube Terms of Service
                                            </a>
                                        </li>
                                        <li>
                                            <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                Google Privacy Policy
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                YouTube API Services Terms of Service
                                            </a>
                                        </li>
                                    </ul>
                                    <p className="mt-2">Pelanggaran terhadap ketentuan platform pihak ketiga dapat mengakibatkan pembatasan atau pemutusan akses ke layanan kami.</p>
                                </div>

                                {/* <div>
                                    <h3 className="mb-3 text-base font-semibold">9. Hukum yang Berlaku dan Penyelesaian Sengketa</h3>
                                    <p className="mb-2">Ketentuan Layanan ini tunduk pada dan diinterpretasikan sesuai dengan hukum yang berlaku di Republik Indonesia.</p>
                                    <p className="mb-2">Segala sengketa yang timbul dari atau berkaitan dengan Ketentuan Layanan ini akan diselesaikan melalui:</p>
                                    <ol className="list-decimal space-y-1 pl-6">
                                        <li>Musyawarah dan negosiasi langsung antara para pihak.</li>
                                        <li>Mediasi melalui lembaga mediasi yang disepakati bersama.</li>
                                        <li>Arbitrase atau pengadilan yang berwenang di Indonesia jika cara penyelesaian sebelumnya tidak berhasil.</li>
                                    </ol>
                                </div> */}

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">9. Perubahan Ketentuan Layanan</h3>
                                    <p className="mb-2">Kami dapat memperbarui Ketentuan Layanan ini dari waktu ke waktu untuk menyesuaikan dengan:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Perubahan fitur dan layanan aplikasi</li>
                                        <li>Perubahan regulasi dan hukum yang berlaku</li>
                                        <li>Kebijakan internal perusahaan</li>
                                        <li>Masukan dan feedback dari pengguna</li>
                                    </ul>
                                    <p className="mt-2">Perubahan signifikan akan diberitahukan melalui aplikasi, email, atau website. Dengan tetap menggunakan layanan setelah perubahan berlaku, Anda dianggap menyetujui ketentuan yang telah diperbarui.</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">10. Kontak Kami</h3>
                                    <p className="mb-2">Jika Anda memiliki pertanyaan, keluhan, atau permintaan terkait Ketentuan Layanan ini, silakan hubungi kami melalui:</p>
                                    <div className="space-y-1">
                                        <p>
                                            <span className="font-medium">Email:</span> keviniansyah05@gmail.com
                                        </p>
                                        <p>
                                            <span className="font-medium">Website:</span> https://lawanjudol.com
                                        </p>
                                    </div>
                                    {/* <p className="text-muted-foreground mt-3">Kami akan merespon pertanyaan Anda dalam waktu maksimal 2x24 jam pada hari kerja.</p> */}
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <h3 className="mb-3 text-base font-semibold">1. Acceptance of Terms</h3>
                                    <p>By accessing or using the LawanJudol application ("Application", "Service", or "We"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
                                    <p className="mt-2">If you do not agree to these terms, please refrain from using this service.</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">2. Service Description</h3>
                                    <p className="mb-2">LawanJudol provides the following services:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>YouTube comment analysis to detect indications of online gambling content using machine learning and artificial intelligence technology.</li>
                                        <li>Comment moderation features through integration with the YouTube Data API, including the ability to hold, reject, or block comments.</li>
                                        <li>Analytics dashboard to provide statistical insights related to comment activity on user videos.</li>
                                        <li>Reports and data visualization of comment analysis results.</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">
                                        This service is designed to help YouTube creators manage comments that potentially contain online gambling content, but the final moderation decisions remain entirely in the hands of the user.
                                    </blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">3. User Obligations</h3>
                                    <p className="mb-2">As a user of the service, you are obligated to:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Use the service in compliance with applicable laws in Indonesia and the jurisdiction where you are located.</li>
                                        <li>Not use the application for illegal purposes, including but not limited to data misuse, spam, or activities that violate the law.</li>
                                        <li>Take full responsibility for all comment moderation decisions you make (delete, hold, reject, or block comment sender accounts).</li>
                                        <li>Maintain the confidentiality of your account information and access credentials.</li>
                                        <li>Not perform actions that could damage, disrupt, or endanger the application's systems and infrastructure.</li>
                                        <li>Not share accounts or provide access to others without permission.</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">You understand that all consequences of the moderation decisions you make are entirely your responsibility.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">4. Limitation of Liability</h3>
                                    <p className="mb-2">LawanJudol and related service providers are not responsible for:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Comment content published by third parties on the YouTube platform.</li>
                                        <li>Losses or negative impacts arising from moderation decisions you make.</li>
                                        <li>Technical disruptions, bugs, downtime, or temporary or permanent service unavailability.</li>
                                        <li>Data loss, business disruption, or financial losses that may arise from service usage.</li>
                                        <li>Inaccuracy of analysis results or detection performed by the artificial intelligence system.</li>
                                        <li>Policy changes or APIs from third parties (such as YouTube/Google) that may affect application functionality.</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">
                                        We strive to provide the best service, but cannot guarantee that the service will always be available, accurate, or error-free. Use of this service is entirely at your own risk.
                                    </blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">5. Intellectual Property Rights</h3>
                                    <p className="mb-2">All intellectual property rights over this application, including but not limited to:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Application source code and algorithms</li>
                                        <li>User interface design</li>
                                        <li>Logos, trademarks, and visual identity</li>
                                        <li>Documentation and training materials</li>
                                        <li>Machine learning and artificial intelligence models used</li>
                                    </ul>
                                    <p className="mt-2">Are owned by LawanJudol and protected by copyright law and applicable intellectual property legislation.</p>
                                    <div className="text-muted-foreground mt-3 rounded-lg border p-3">
                                        <p className="mb-2 font-medium">Prohibitions:</p>
                                        <ul className="list-disc space-y-1 pl-4">
                                            <li>Duplicating, copying, or distributing the application or parts thereof without written permission.</li>
                                            <li>Reverse engineering, decompiling, or disassembling the application.</li>
                                            <li>Using trademarks or visual identity for commercial purposes without permission.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">6. Changes to the Service</h3>
                                    <p>We reserve the right to perform the following at any time, with or without prior notice:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Change, modify, or update application features and functionality.</li>
                                        <li>Discontinue or limit part or all of the service.</li>
                                        <li>Change pricing structure or business model (if applicable).</li>
                                        <li>Add new terms and conditions.</li>
                                        <li>Perform system maintenance or upgrades.</li>
                                    </ul>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">We will strive to provide reasonable notice for significant changes that may affect your use of the service.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">7. Termination of Access</h3>
                                    <p className="mb-2">We reserve the right to deactivate accounts or revoke your access if:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Violations of these Terms of Service are found.</li>
                                        <li>Service usage that does not align with intended purposes.</li>
                                        <li>Activities that may endanger system security or other users.</li>
                                        <li>Non-compliance with applicable laws or third-party platform policies.</li>
                                        <li>Use of services for commercial purposes without permission (if applicable).</li>
                                    </ul>
                                    <p className="mt-2">Access termination may be temporary or permanent, depending on the severity of the violation committed.</p>
                                    <blockquote className="border-muted text-muted-foreground mt-3 border-l-4 pl-4">In cases of access termination, stored data will be deleted in accordance with the data retention policy outlined in our Privacy Policy.</blockquote>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">8. Compliance with Third-Party Platforms</h3>
                                    <p className="mb-2">Since this application integrates with the YouTube Data API, your usage is also subject to:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>
                                            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                YouTube Terms of Service
                                            </a>
                                        </li>
                                        <li>
                                            <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                Google Privacy Policy
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline">
                                                YouTube API Services Terms of Service
                                            </a>
                                        </li>
                                    </ul>
                                    <p className="mt-2">Violations of third-party platform terms may result in restrictions or termination of access to our services.</p>
                                </div>

                                {/* <div>
                                    <h3 className="mb-3 text-base font-semibold">9. Governing Law and Dispute Resolution</h3>
                                    <p className="mb-2">These Terms of Service are governed by and interpreted in accordance with the applicable laws of the Republic of Indonesia.</p>
                                    <p className="mb-2">Any disputes arising from or related to these Terms of Service will be resolved through:</p>
                                    <ol className="list-decimal space-y-1 pl-6">
                                        <li>Direct consultation and negotiation between the parties.</li>
                                        <li>Mediation through a mutually agreed mediation institution.</li>
                                        <li>Arbitration or competent courts in Indonesia if previous resolution methods are unsuccessful.</li>
                                    </ol>
                                </div> */}

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">9. Changes to Terms of Service</h3>
                                    <p className="mb-2">We may update these Terms of Service from time to time to accommodate:</p>
                                    <ul className="list-disc space-y-1 pl-6">
                                        <li>Changes in application features and services</li>
                                        <li>Changes in applicable regulations and laws</li>
                                        <li>Internal company policies</li>
                                        <li>User input and feedback</li>
                                    </ul>
                                    <p className="mt-2">Significant changes will be notified through the application, email, or website. By continuing to use the service after changes take effect, you are deemed to agree to the updated terms.</p>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-base font-semibold">10. Contact Us</h3>
                                    <p className="mb-2">If you have questions, complaints, or requests regarding these Terms of Service, please contact us through:</p>
                                    <div className="space-y-1">
                                        <p>
                                            <span className="font-medium">Email:</span> keviniansyah05@gmail.com
                                        </p>
                                        <p>
                                            <span className="font-medium">Website:</span> https://lawanjudol.com
                                        </p>
                                    </div>
                                    {/* <p className="text-muted-foreground mt-3">We will respond to your inquiries within a maximum of 2x24 hours on business days.</p> */}
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
