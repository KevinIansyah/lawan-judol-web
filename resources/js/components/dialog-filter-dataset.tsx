import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePreventScroll } from '@/hooks/use-prevent-scroll';
import { getErrorIcon, getRetryButtonText, getUserFriendlyError } from '@/lib/utils';
import { ApiResponseDataset } from '@/types';
import { CheckCircle2Icon, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface DialogFilterDatasetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DialogFilterDataset({ isOpen, onOpenChange }: DialogFilterDatasetProps) {
    usePreventScroll(isOpen);

    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [label, setLabel] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'network' | 'server' | 'validation' | null>(null);
    const [loadingDownload, setLoadingDownload] = useState(false);

    const handleDownload = (): void => {
        setError(null);
        setErrorType(null);
        setLoadingDownload(true);
        fetchDownload();
    };

    const resetForm = () => {
        setStartDate(undefined);
        setEndDate(undefined);
        setLabel(null);
        setSuccess(false);
        setDownloadUrl(null);
        setError(null);
        setErrorType(null);
        setLoadingDownload(false);
    };

    const fetchDownload = async (): Promise<void> => {
        try {
            const params = new URLSearchParams();

            if (startDate) {
                params.append('start_date', startDate.toISOString().split('T')[0]);
            }
            if (endDate) {
                params.append('end_date', endDate.toISOString().split('T')[0]);
            }
            if (label) {
                params.append('label', label);
            }

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/dataset/download?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorResponse = await response.json().catch(() => ({}));
                console.log(errorResponse);
                const friendlyError = getUserFriendlyError(errorResponse.message, response.status);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
                return;
            }

            const datasetData: ApiResponseDataset = await response.json();

            if (datasetData.success) {
                setDownloadUrl(datasetData.link ?? null);
                setSuccess(true);
            } else {
                const friendlyError = getUserFriendlyError(datasetData.message);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
            }

            return console.log(datasetData);
        } catch (err) {
            console.log(err);
            console.error('Error fetching dataset:', err);
            const friendlyError = getUserFriendlyError(err);
            setError(friendlyError.message);
            setErrorType(friendlyError.type);
        } finally {
            setLoadingDownload(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
        if (!open) {
            resetForm();
        }
    };

    return (
        <Dialog modal={false} open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Download />
                    Unduh Komentar
                </Button>
            </DialogTrigger>

            {isOpen && <div className="animate-in fade-in-0 fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />}

            <DialogContent className="flex min-h-[50vh] flex-col overflow-hidden md:min-h-[40vh] lg:min-h-[45vh] xl:min-h-[65vh]">
                <DialogTitle>Unduh Komentar</DialogTitle>
                <DialogDescription>Pilih rentang tanggal dan kategori komentar sebelum mengunduh data.</DialogDescription>

                {loadingDownload ? (
                    <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                        <div className="mb-4">
                            <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                        </div>
                        <div className="space-y-2 text-center">
                            <p className="font-medium">Mengunduh Komentar</p>
                            <p className="text-muted-foreground mt-1 text-sm">Mohon tunggu, proses ini mungkin memerlukan beberapa saat.</p>
                        </div>
                    </div>
                ) : success ? (
                    <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                        <div className="mb-4">
                            <CheckCircle2Icon className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="space-y-2 text-center">
                            <p className="font-medium">Berhasil Mengambil Data</p>
                            <p className="text-muted-foreground max-w-sm text-sm">Data dataset berhasil diambil. Silakan klik tombol di bawah untuk mengunduh file.</p>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <Button variant="outline" asChild>
                                <a href={downloadUrl ?? '#'} download>
                                    Unduh Data
                                </a>
                            </Button>
                            <Button variant="outline" onClick={() => resetForm()}>
                                Kembali
                            </Button>
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
                    <div className="flex-1 space-y-4 overflow-hidden">
                        <div className="grid gap-3">
                            <Label htmlFor="start-date">Tanggal Ditambahkan</Label>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <DatePicker placeholder="Pilih tanggal awal" value={startDate} onChange={setStartDate} id="start-date" />
                                <DatePicker placeholder="Pilih tanggal akhir" value={endDate} onChange={setEndDate} id="end-date" />
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="start-date">Label</Label>
                            <RadioGroup value={label || ''} onValueChange={setLabel} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="judol" id="judol" />
                                    <Label htmlFor="judol" className="font-normal">
                                        Judi Online
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="non_judol" id="non_judol" />
                                    <Label htmlFor="non-judol" className="font-normal">
                                        Bukan Judi
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                )}

                <DialogFooter className="border-t pt-4">
                    <div className="flex w-full justify-end gap-2">
                        <Button onClick={handleDownload} disabled={loadingDownload || !!error || success} className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Unduh
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
