import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getErrorIcon, getRetryButtonText, getUserFriendlyError } from '@/lib/utils';
import { Analysis } from '@/types';
import { router } from '@inertiajs/react';
import { Loader2, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type DialogDeleteAnalysisProps = {
    analysis: Analysis;
};

export default function DialogDeleteAnalysis({ analysis }: DialogDeleteAnalysisProps) {
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'network' | 'server' | 'validation' | null>(null);

    const resetForm = () => {
        setError(null);
        setErrorType(null);
        setLoadingDelete(false);
    };

    const handleDelete = async () => {
        setLoadingDelete(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/analyses/${analysis.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            if (result.success) {
                setIsDialogOpen(false);

                router.reload();

                toast.success('Berhasil Dihapus', {
                    description: `Analisis "${analysis.video.title}" telah berhasil dihapus.`,
                });
            } else {
                const friendlyError = getUserFriendlyError(result.message);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
            }
        } catch (err) {
            const friendlyError = getUserFriendlyError(err);
            setError(friendlyError.message);
            setErrorType(friendlyError.type);
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                    resetForm();
                }
            }}
        >
            <Tooltip>
                <DialogTrigger asChild>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-7 w-7 rounded-md" disabled={['on_process', 'queue'].includes(analysis.status)}>
                            <Trash className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                </DialogTrigger>
                <TooltipContent>
                    <p>Hapus analisis</p>
                </TooltipContent>
            </Tooltip>

            <DialogContent>
                <DialogTitle>Apakah Anda yakin ingin menghapus analisis Anda?</DialogTitle>
                <DialogDescription>Setelah analisis dihapus, semua sumber daya dan data terkait juga akan dihapus secara permanen.</DialogDescription>

                <div className="space-y-6">
                    {loadingDelete ? (
                        <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                            <div className="mb-4">
                                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="font-medium">Menghapus analisis</p>
                                <p className="text-muted-foreground mt-1 text-sm">Mohon tunggu, permintaan Anda sedang diproses.</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                            <div className="mb-4">{getErrorIcon(errorType)}</div>
                            <div className="space-y-2 text-center">
                                <p className="font-medium">Oops! Ada masalah</p>
                                <p className="text-muted-foreground max-w-sm text-sm">{error}</p>
                            </div>
                            <Button variant="outline" className="mt-6" onClick={() => resetForm()}>
                                {getRetryButtonText(errorType)}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableBody>
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableCell className="font-semibold">Judul</TableCell>
                                        <TableCell className="text-muted-foreground break-words whitespace-normal">{analysis.video.title}</TableCell>
                                    </TableRow>
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableCell className="font-semibold">Channel</TableCell>
                                        <TableCell className="text-muted-foreground break-words whitespace-normal">{analysis.video.channel_title}</TableCell>
                                    </TableRow>
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableCell className="font-semibold">Komentar</TableCell>
                                        <TableCell className="text-muted-foreground break-words whitespace-normal">{analysis.video?.comments_total?.toLocaleString() || '0'}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <DialogFooter className="border-t pt-4">
                        <Button onClick={handleDelete} variant="destructive" disabled={loadingDelete} className="flex items-center gap-2">
                            <Trash />
                            Hapus Analisis
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
