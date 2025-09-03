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

interface DialogModerationProps {
    selectedCount: number;
    getSelectedCommentIds: () => string[];
    getSelectedComments: () => Comment[];
    onComplete?: (updatedComments: Comment[]) => void;
    onRowSelectionReset: () => void;
}

export const DialogModeration = ({ selectedCount, getSelectedCommentIds, getSelectedComments, onComplete, onRowSelectionReset }: DialogModerationProps) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [moderationType, setModerationType] = useState('heldForReview');

    const { processLogs, successCount, errorCount, finished, setSuccessCount, setErrorCount, setFinished, addLogEntry, updateLogEntry, resetLogs } = useProcessLogs();

    const fetchModeration = async (): Promise<void> => {
        const selectedCommentIds = getSelectedCommentIds();
        const selectedComments = getSelectedComments();

        console.log('Selected Comment IDs:', selectedCommentIds);
        console.log('Selected Comments:', selectedComments);

        if (selectedCommentIds.length === 0) {
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
            // Add processing logs for each comment
            selectedComments.forEach((comment) => {
                addLogEntry(comment.comment_id, 'processing', `Memproses komentar dengan ID ${comment.comment_id}`);
            });

            // Simulate API call - replace with actual implementation
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Mock processing - replace with actual API calls
            for (const comment of selectedComments) {
                try {
                    // Simulate API call
                    await new Promise((resolve) => setTimeout(resolve, 300));

                    // Mock success
                    success++;
                    updateLogEntry(comment.comment_id, 'success', `Komentar dengan ID ${comment.comment_id} berhasil dimoderasi sebagai ${moderationType}.`);
                } catch (error) {
                    failed++;
                    updateLogEntry(comment.comment_id, 'error', `Komentar dengan ID ${comment.comment_id} gagal dimoderasi.`);
                }
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

            // Uncomment when implementing actual API
            // if (onComplete && result.updatedComments) {
            //     onComplete(result.updatedComments);
            // }
        } catch (error) {
            console.error('Error processing moderation:', error);
            toast.error('Gagal!', {
                description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
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
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4">
                                <AlertCircle className="text-primary h-8 w-8" />
                            </div>
                            <div className="mb-4 space-y-2 text-center">
                                <p className="font-medium">{`${selectedCount} komentar dipilih`}</p>
                                <p className="text-muted-foreground max-w-sm text-sm">Pastikan komentar yang Anda pilih sudah benar sebelum melanjutkan.</p>
                            </div>
                            <div className="w-full space-y-4">
                                <p className="text-sm font-medium">Pilih tindakan moderasi</p>
                                <RadioGroup value={moderationType} onValueChange={setModerationType}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="heldForReview" id="heldForReview" />
                                        <Label htmlFor="heldForReview">HeldForReview</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="reject" id="reject" />
                                        <Label htmlFor="reject">Reject</Label>
                                    </div>
                                </RadioGroup>
                            </div>
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
