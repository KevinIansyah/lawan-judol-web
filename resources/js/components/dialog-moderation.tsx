import { ProcessStatusComment } from '@/components/process-status-comment';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useProcessLogs } from '@/hooks/use-process-logs';
import { Comment } from '@/types';
import { AlertCircle, FileText, ShieldEllipsis } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';

interface DialogModerationProps {
    selectedCount: number;
    analysisId: number;
    getSelectedComments: () => Comment[];
    onComplete?: (updatedComments: Comment[]) => void;
    onDataUpdate: (updater: (prevData: Comment[]) => Comment[]) => void;
    onRowSelectionReset: () => void;
}

export const DialogModeration = ({ selectedCount, analysisId, getSelectedComments, onComplete, onDataUpdate, onRowSelectionReset }: DialogModerationProps) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [moderationStatus, setModerationStatus] = useState('heldForReview');
    const [banAuthor, setBanAuthor] = useState(false);

    const { processLogs, successCount, errorCount, finished, setSuccessCount, setErrorCount, setFinished, addLogEntry, updateLogEntry, resetLogs } = useProcessLogs();

    const fetchModeration = async (): Promise<void> => {
        const selectedComments = getSelectedComments();

        if (selectedComments.length === 0) {
            toast('Informasi!', {
                description: 'Silakan pilih minimal satu komentar untuk melanjutkan.',
            });
            return;
        }

        setLoading(true);
        resetLogs();

        let success = 0;
        let failed = 0;

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const updatedComments: Comment[] = [];

            for (const selectedComment of selectedComments) {
                addLogEntry(selectedComment.comment_id, 'processing', `Memproses komentar dengan ID ${selectedComment.comment_id}`);

                try {
                    const response = await fetch('/youtube/moderation', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                        },
                        body: JSON.stringify({
                            data: {
                                analysis_id: analysisId,
                                comment_id: selectedComment.comment_id,
                                moderation_status: moderationStatus,
                                ban_author: banAuthor,
                            },
                        }),
                    });

                    if (!response.ok) {
                        const errorBody = await response.json();
                        throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();

                    if (result.quota_exceeded) {
                        updateLogEntry(selectedComment.comment_id, 'error', `Komentar dengan ID ${selectedComment.comment_id} gagal dimoderasi. Kuota API terlampaui.`);
                        failed++;

                        const currentIndex = selectedComments.indexOf(selectedComment);
                        const remainingComments = selectedComments.slice(currentIndex + 1);
                        remainingComments.forEach((comment) => {
                            addLogEntry(comment.comment_id, 'error', `Komentar dengan ID ${comment.comment_id} gagal dimoderasi. Kuota API terlampaui.`);
                            failed++;
                        });

                        toast.error('Kuota Terlampaui!', {
                            description: 'Kuota API YouTube telah terlampaui. Proses dihentikan.',
                        });

                        break;
                    }

                    if (result.success) {
                        success++;
                        const banAuthorText = banAuthor && moderationStatus === 'reject' ? ' dan author diblokir' : '';
                        updateLogEntry(selectedComment.comment_id, 'success', `Komentar dengan ID ${selectedComment.comment_id} berhasil dimoderasi sebagai ${moderationStatus}${banAuthorText}.`);

                        const updatedComment = { ...selectedComment, status: moderationStatus as 'heldForReview' | 'reject' | 'draft' | 'dataset' };
                        updatedComments.push(updatedComment);
                    } else {
                        throw new Error(result.message || 'Unknown error');
                    }
                } catch (error) {
                    failed++;
                    console.error(`Error processing comment ${selectedComment.comment_id}:`, error);

                    let message = 'Terjadi kesalahan saat menyimpan data.';
                    if (error instanceof Error) {
                        message = error.message;
                    } else if (typeof error === 'string') {
                        message = error;
                    }

                    updateLogEntry(selectedComment.comment_id, 'error', `Komentar dengan ID ${selectedComment.comment_id} gagal ditambahkan ke dimoderasi. ${message}`);
                }

                await new Promise((resolve) => setTimeout(resolve, 300));
            }

            if (updatedComments.length > 0) {
                onDataUpdate((prevData) =>
                    prevData.map((comment) => {
                        const updatedComment = updatedComments.find((updated) => updated.comment_id === comment.comment_id);
                        return updatedComment || comment;
                    }),
                );
            }

            setSuccessCount(success);
            setErrorCount(failed);

            if (failed === 0) {
                toast.success('Berhasil!', {
                    description: `${success} komentar berhasil dimoderasi.`,
                });
            } else if (success === 0) {
                toast.error('Gagal!', {
                    description: `${failed} komentar gagal dimoderasi.`,
                });
            } else {
                toast.warning('Sebagian Berhasil!', {
                    description: `${success} berhasil, ${failed} gagal dimoderasi.`,
                });
            }

            onRowSelectionReset();

            if (onComplete && updatedComments.length > 0) {
                onComplete(updatedComments);
            }
        } catch (error) {
            console.error('Error processing comment:', error);
            toast.error('Gagal!', {
                description: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
            });
        } finally {
            setFinished(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(() => {
            setLoading(false);
            resetLogs();
        }, 300);
    };

    const handleModerationStatusChange = (value: string) => {
        setModerationStatus(value);
        if (value !== 'reject') {
            setBanAuthor(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) {
                    handleClose();
                }
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full" disabled={selectedCount === 0}>
                    <ShieldEllipsis />
                    Tindakan Moderasi {selectedCount > 0 && ` (${selectedCount} Komentar)`}
                </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden">
                <DialogTitle>Tindakan Moderasi Komentar</DialogTitle>
                <DialogDescription>Komentar yang telah Anda pilih akan diproses dan dilakukan moderasi.</DialogDescription>

                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <ProcessStatusComment finished={finished} successCount={successCount} errorCount={errorCount} selectedCount={selectedCount} processLogs={processLogs} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="mb-4">
                                <AlertCircle className="text-primary h-8 w-8" />
                            </div>
                            <div className="mb-4 space-y-2 text-center">
                                <p className="font-medium">{`${selectedCount} komentar dipilih`}</p>
                                <p className="text-muted-foreground max-w-sm text-sm">Pastikan komentar yang Anda pilih sudah benar sebelum melanjutkan.</p>
                            </div>
                            <div className="mb-4 w-full space-y-4">
                                <p className="text-sm font-medium">Pilih Tindakan Moderasi</p>
                                <RadioGroup value={moderationStatus} onValueChange={handleModerationStatusChange}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="heldForReview" id="heldForReview" />
                                        <Label htmlFor="heldForReview">HeldForReview (Tahan komentar untuk ditinjau)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="reject" id="reject" />
                                        <Label htmlFor="reject">Reject (Tolak komentar)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {moderationStatus === 'reject' && (
                                <div className="w-full space-y-4">
                                    <p className="text-sm font-medium">Tindakan Opsional</p>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="ban_author" checked={banAuthor} onCheckedChange={(checked) => setBanAuthor(checked === true)} />
                                        <Label htmlFor="ban_author">BanAuthor (Blokir pengguna)</Label>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button onClick={fetchModeration} disabled={loading} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Moderasi Komentar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
