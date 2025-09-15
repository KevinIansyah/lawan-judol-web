/* eslint-disable @typescript-eslint/no-unused-vars */
import { ProcessStatusComment } from '@/components/process-status-comment';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProcessLogs } from '@/hooks/use-process-logs';
import { Comment } from '@/types';
import { AlertCircle, FileText, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DialogAddDatasetProps {
    selectedCount: number;
    analysisId: number;
    trueLabel: string;
    getSelectedComments: () => Comment[];
    onComplete?: (updatedComments: Comment[]) => void;
    onDataUpdate: (updater: (prevData: Comment[]) => Comment[]) => void;
    onRowSelectionReset: () => void;
}

export const DialogAddDataset = ({ selectedCount, analysisId, trueLabel, getSelectedComments, onComplete, onDataUpdate, onRowSelectionReset }: DialogAddDatasetProps) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const { processLogs, successCount, errorCount, finished, setSuccessCount, setErrorCount, setFinished, addLogEntry, updateLogEntry, resetLogs } = useProcessLogs();

    const fetchDataset = async (): Promise<void> => {
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
                    const response = await fetch('/datasets', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                        },
                        body: JSON.stringify({
                            data: {
                                analysis_id: analysisId,
                                comment: selectedComment,
                                true_label: trueLabel,
                            },
                        }),
                    });

                    if (!response.ok) {
                        const errorBody = await response.json();
                        throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
                    }

                    const result = await response.json();

                    if (result.success) {
                        success++;
                        updateLogEntry(selectedComment.comment_id, 'success', `Komentar dengan ID ${selectedComment.comment_id} berhasil ditambahkan ke dataset.`);

                        const updatedComment = { ...selectedComment, status: 'dataset' as const };
                        updatedComments.push(updatedComment);
                    } else {
                        throw new Error(result.message || 'Unknown error');
                    }
                } catch (err) {
                    failed++;
                    // console.error(`Error processing comment ${selectedComment.comment_id}:`, err);

                    let message = 'Terjadi kesalahan saat menyimpan data.';
                    if (err instanceof Error) {
                        message = err.message;
                    } else if (typeof err === 'string') {
                        message = err;
                    }

                    updateLogEntry(selectedComment.comment_id, 'error', `Komentar dengan ID ${selectedComment.comment_id} gagal ditambahkan ke dataset. ${message}`);
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
                    description: `${success} komentar berhasil ditambahkan ke dataset.`,
                });
            } else if (success === 0) {
                toast.error('Gagal!', {
                    description: `${failed} komentar gagal ditambahkan ke dataset.`,
                });
            } else {
                toast.warning('Sebagian Berhasil!', {
                    description: `${success} berhasil, ${failed} gagal ditambahkan ke dataset.`,
                });
            }

            onRowSelectionReset();

            if (onComplete && updatedComments.length > 0) {
                onComplete(updatedComments);
            }
        } catch (err) {
            // console.error('Error processing dataset:', err);
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
                    <PlusIcon />
                    Tambah ke Dataset {selectedCount > 0 && ` (${selectedCount} Komentar)`}
                </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden">
                <DialogTitle>Tambah Komentar ke Dataset</DialogTitle>
                <DialogDescription>Komentar yang telah Anda pilih akan diproses dan ditambahkan ke dataset.</DialogDescription>

                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <ProcessStatusComment finished={finished} successCount={successCount} errorCount={errorCount} selectedCount={selectedCount} processLogs={processLogs} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4">
                                <AlertCircle className="text-primary h-8 w-8" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="font-medium">{`${selectedCount} komentar dipilih`}</p>
                                <p className="text-muted-foreground max-w-sm text-sm">Pastikan komentar yang Anda pilih sudah benar sebelum melanjutkan.</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button onClick={fetchDataset} disabled={loading} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Tambah ke Dataset
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
