import { ProcessStatusKeyword } from '@/components/process-status-keyword';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProcessLogs } from '@/hooks/use-process-logs';
import { Keyword } from '@/types';
import { AlertCircle, ArrowUpFromLine, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DialogAddKeywordProps {
    selectedCount: number;
    getSelectedKeyword: Keyword[];
}

export const DialogAddKeyword = ({ selectedCount, getSelectedKeyword }: DialogAddKeywordProps) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const { processLogs, successCount, errorCount, finished, setSuccessCount, setErrorCount, setFinished, addLogEntry, updateLogEntry, resetLogs } = useProcessLogs();

    const fetchKeyword = async (): Promise<void> => {
        const selectedKeywords = getSelectedKeyword;

        if (selectedKeywords.length === 0) {
            toast('Informasi!', {
                description: 'Silakan pilih minimal satu kata kunci untuk melanjutkan.',
            });
            return;
        }

        setLoading(true);
        resetLogs();

        let success = 0;
        let failed = 0;

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            for (const selectedKeyword of selectedKeywords) {
                addLogEntry(`${selectedKeyword.id}`, 'processing', `Memproses kata kunci ${selectedKeyword.keyword}`);

                try {
                    const response = await fetch('/keywords', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                        },
                        body: JSON.stringify({
                            data: {
                                keyword: selectedKeyword.keyword,
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
                        updateLogEntry(`${selectedKeyword.id}`, 'success', `Kata kunci ${selectedKeyword.keyword} berhasil ditambahkan ke kamus.`);
                    } else {
                        throw new Error(result.message || 'Unknown error');
                    }
                } catch (error) {
                    failed++;
                    console.error(`Error processing keyword ${selectedKeyword.id}:`, error);

                    let message = 'Terjadi kesalahan saat menyimpan data.';
                    if (error instanceof Error) {
                        message = error.message;
                    } else if (typeof error === 'string') {
                        message = error;
                    }

                    updateLogEntry(`${selectedKeyword.id}`, 'error', `Kata kunci ${selectedKeyword.keyword} gagal ditambahkan ke kamus. ${message}`);
                }

                await new Promise((resolve) => setTimeout(resolve, 300));
            }

            setSuccessCount(success);
            setErrorCount(failed);

            if (failed === 0) {
                toast.success('Berhasil!', {
                    description: `${success} Kata kunci berhasil ditambahkan ke kamus.`,
                });
            } else if (success === 0) {
                toast.error('Gagal!', {
                    description: `${failed} Kata kunci gagal ditambahkan ke kamus.`,
                });
            } else {
                toast.warning('Sebagian Berhasil!', {
                    description: `${success} berhasil, ${failed} gagal ditambahkan ke kamus.`,
                });
            }
        } catch (error) {
            console.error('Error processing kamus:', error);
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
                <Button variant="outline" disabled={selectedCount === 0}>
                    {selectedCount === 0 ? 'Unggah' : `Unggah (${selectedCount})`}
                    <ArrowUpFromLine className="ml-1 size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden">
                <DialogTitle>Tambah Kata Kunci ke Kamus</DialogTitle>
                <DialogDescription>Kata kunci yang telah Anda pilih akan diproses dan ditambahkan ke kamus.</DialogDescription>

                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <ProcessStatusKeyword finished={finished} successCount={successCount} errorCount={errorCount} selectedCount={selectedCount} processLogs={processLogs} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4">
                                <AlertCircle className="text-primary h-8 w-8" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="font-medium">{`${selectedCount} kata kunci dipilih`}</p>
                                {selectedCount === 0 ? <p className="text-muted-foreground max-w-sm text-sm">Silakan pilih minimal satu kata kunci untuk melanjutkan.</p> : <p className="text-muted-foreground max-w-sm text-sm">Pastikan kata kunci yang Anda pilih sudah benar sebelum melanjutkan.</p>}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button onClick={fetchKeyword} disabled={loading || selectedCount === 0} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Tambah ke Kamus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
