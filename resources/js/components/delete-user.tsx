import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function DeleteUser() {
    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        confirmation: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="Hapus Akun" description="Hapus akun Anda beserta semua sumber daya yang terkait" />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Peringatan</p>
                    <p className="text-sm">Harap berhati-hati, tindakan ini tidak dapat dibatalkan.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Hapus Akun</Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogTitle>Apakah Anda yakin ingin menghapus akun Anda?</DialogTitle>
                        <DialogDescription>
                            Jika akun dihapus, semua data terkait akan dihapus secara permanen dalam jangka waktu maksimal 7 (tujuh) hari kalender. Anda bisa login kembali ke sistem sebelum batas 7 hari untuk membatalkan penghapusan. Ketik{' '}
                            <strong>HAPUS AKUN</strong> di bawah untuk mengonfirmasi penghapusan.
                        </DialogDescription>

                        <form className="space-y-6" onSubmit={deleteUser}>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmation" className='sr-only'>Konfirmasi Penghapusan</Label>

                                <Input id="confirmation" name="confirmation" value={data.confirmation} onChange={(e) => setData('confirmation', e.target.value)} placeholder="Ketik HAPUS AKUN" />

                                <InputError message={errors.confirmation} />
                            </div>

                            <DialogFooter className="gap-2 border-t pt-4">
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={closeModal}>
                                        Batal
                                    </Button>
                                </DialogClose>

                                <Button variant="destructive" disabled={processing || data.confirmation !== 'HAPUS AKUN'} asChild>
                                    <button type="submit">Hapus Akun</button>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
