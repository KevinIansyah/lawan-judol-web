import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';

export default function GrantAccess() {
    return (
        <div className="space-y-6">
            <HeadingSmall
                title="Berikan Akses YouTube"
                description="Izinkan aplikasi ini mengakses data YouTube Anda melalui akun Google"
            />

            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Informasi</p>
                    <p className="text-sm">
                        Dengan memberikan akses, aplikasi ini dapat membaca dan mengelola data
                        tertentu dari akun YouTube Anda sesuai izin yang Anda setujui.
                    </p>
                </div>
                <Button asChild>
                    <a href="youtube-access/grant">Berikan Akses</a>
                </Button>
            </div>
        </div>
    );
}
