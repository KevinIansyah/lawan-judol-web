import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getErrorIcon, getRetryButtonText, getUserFriendlyError } from '@/lib/utils';
import { Analysis } from '@/types';
import { router } from '@inertiajs/react';
import { Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type DialogRetryAnalysisProps = {
    analysis: Analysis;
};

export default function DialogRetryAnalysis({ analysis }: DialogRetryAnalysisProps) {
    const [loadingRetry, setLoadingRetry] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'network' | 'server' | 'validation' | null>(null);

    const resetForm = () => {
        setError(null);
        setErrorType(null);
        setLoadingRetry(false);
    };

    const handleRetry = async () => {
        setLoadingRetry(true);
        setError(null);
        setErrorType(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/analyses/${analysis.id}/retry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorResponse = await response.json().catch(() => ({}));
                const friendlyError = getUserFriendlyError(errorResponse.message, response.status);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
                return;
            }

            const result = await response.json();

            if (result.success) {
                setIsDialogOpen(false);

                router.reload();

                toast.success('Berhasil!', {
                    description: `Analisis "${analysis.video.title}" telah dimasukkan kembali ke dalam antrean.`,
                });
            } else {
                const friendlyError = getUserFriendlyError(result.message);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
            }
        } catch (err) {
            console.error('Error retry analysis:', err);
            const friendlyError = getUserFriendlyError(err);
            setError(friendlyError.message);
            setErrorType(friendlyError.type);
        } finally {
            setLoadingRetry(false);
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
                        <Button variant="secondary" size="icon" className="h-7 w-7 rounded-md" disabled={analysis.status !== 'failed'} title="Ulangi Analisis">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                </DialogTrigger>
                <TooltipContent>
                    <p>Ulang analisis</p>
                </TooltipContent>
            </Tooltip>

            <DialogContent>
                <DialogTitle>Ulangi Analisis</DialogTitle>
                <DialogDescription>Analisis ini sebelumnya gagal diproses. Apakah Anda ingin mencoba mengulang proses analisis?</DialogDescription>

                <div className="space-y-6">
                    {loadingRetry ? (
                        <div className="flex flex-1 flex-col items-center justify-center overflow-hidden py-8">
                            <div className="mb-4">
                                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="font-medium">Memasukkan ke antrean analisis</p>
                                <p className="text-muted-foreground mt-1 text-sm">Mohon tunggu, permintaan Anda sedang diproses.</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-1 flex-col items-center justify-center overflow-hidden py-8">
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

                    {!loadingRetry && !error && (
                        <DialogFooter className="border-t pt-4">
                            <div className="flex w-full justify-end">
                                <Button onClick={handleRetry} variant="default" className="flex items-center gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    Ulang Analisis
                                </Button>
                            </div>
                        </DialogFooter>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
