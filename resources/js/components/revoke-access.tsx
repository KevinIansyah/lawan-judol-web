import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function RevokeAccess() {
    const { delete: destroy, processing } = useForm();
    const [open, setOpen] = useState(false);

    const revokePermission: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('youtube-access.revoke'), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
            },
            onError: () => {
                setOpen(false);
            },
        });
    };

    return (
        <div className="space-y-6">
            <HeadingSmall
                title="Cabut Akses YouTube"
                description="Cabut akses aplikasi ke akun YouTube Anda"
            />

            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Peringatan</p>
                    <p className="text-sm">
                        Setelah Anda mencabut akses, aplikasi tidak dapat mengakses data YouTube
                        Anda sampai Anda memberikan akses kembali.
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Cabut Akses</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Yakin ingin mencabut akses YouTube?</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan memutus koneksi antara aplikasi dan akun YouTube Anda.
                            Anda dapat memberikan akses kembali kapan saja jika diperlukan.
                        </DialogDescription>

                        <form onSubmit={revokePermission}>
                            <DialogFooter className="gap-2 pt-4">
                                <Button
                                    variant="secondary"
                                    type="button"
                                    onClick={() => setOpen(false)}
                                >
                                    Batal
                                </Button>

                                <Button variant="destructive" type="submit" disabled={processing}>
                                    Cabut Akses
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
