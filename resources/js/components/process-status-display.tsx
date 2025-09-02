import { ProcessLog } from '@/hooks/use-process-logs';
import { AlertTriangle, CircleCheck, CircleX, Loader2 } from 'lucide-react';

interface ProcessStatusDisplayProps {
    finished: boolean;
    successCount: number;
    errorCount: number;
    selectedCount: number;
    processLogs: ProcessLog[];
}

export const ProcessStatusDisplay = ({ finished, successCount, errorCount, selectedCount, processLogs }: ProcessStatusDisplayProps) => {
    return (
        <div className="flex w-full flex-col items-center justify-center">
            {finished && successCount > 0 && errorCount > 0 ? (
                <>
                    <AlertTriangle className="text-chart-3 mb-4 h-8 w-8" />
                    <p className="text-center font-medium">
                        {successCount} berhasil, {errorCount} gagal.
                    </p>
                    <p className="text-muted-foreground mt-1 text-center text-sm">Silakan tutup dialog jika tidak diperlukan lagi.</p>
                </>
            ) : finished && successCount > 0 ? (
                <>
                    <CircleCheck className="text-chart-4 mb-4 h-8 w-8" />
                    <p className="text-center font-medium">{successCount} komentar berhasil diproses.</p>
                    <p className="text-muted-foreground mt-1 text-center text-sm">Silakan tutup dialog jika tidak diperlukan lagi.</p>
                </>
            ) : finished && errorCount > 0 ? (
                <>
                    <CircleX className="text-chart-1 mb-4 h-8 w-8" />
                    <p className="text-center font-medium">{errorCount} komentar gagal diproses.</p>
                    <p className="text-muted-foreground mt-1 text-center text-sm">Silakan tutup dialog jika tidak diperlukan lagi.</p>
                </>
            ) : (
                <>
                    <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                    <p className="text-center font-medium">Memproses {selectedCount} komentar</p>
                    <p className="text-muted-foreground mt-1 text-center text-sm">Mohon tunggu hingga proses selesai, jangan tinggalkan halaman atau menutup dialog ini.</p>
                </>
            )}
            <div className="bg-muted dark:bg-background mt-4 max-h-[170px] w-full overflow-y-auto rounded-md border p-4 pr-2">
                {processLogs.map((log, index) => (
                    <div key={index} className="mb-2">
                        {log.status === 'processing' && <p className="text-muted-foreground text-sm">{log.message}</p>}
                        {log.status === 'success' && (
                            <div className="flex items-center gap-2">
                                <CircleCheck className="text-chart-4 size-3 flex-shrink-0" />
                                <p className="text-chart-4 text-sm">{log.message}</p>
                            </div>
                        )}
                        {log.status === 'error' && (
                            <div className="flex items-center gap-2">
                                <CircleX className="text-chart-1 size-3 flex-shrink-0" />
                                <p className="text-chart-1 text-sm">{log.message}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
