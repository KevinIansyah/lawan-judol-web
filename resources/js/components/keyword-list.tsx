import { DialogAddKeyword } from '@/components/dialog-add-keyword';
import { DialogUpdateKeyword } from '@/components/dialog-update-keyword';
import KeywordBadge from '@/components/keyword-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Keyword } from '@/types';
import { usePage } from '@inertiajs/react';
import { AlertCircleIcon, Copy, Filter, RotateCcw } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

type KeywordListProps = {
    analysis_id: number;
    data: Keyword[];
};

export default function KeywordList({ analysis_id, data: initialData }: KeywordListProps) {
    const [data, setData] = useState<Keyword[]>(() => initialData);
    const [originalData] = useState<Keyword[]>(() => initialData);
    const [changedItems, setChangedItems] = useState<Set<number>>(new Set());

    const { url } = usePage();
    const isAnalysisPage = url.startsWith('/analysis');

    const toggleLabel = (id: number) => {
        setData((prev) => {
            const newData = prev.map((item) => {
                if (item.id === id) {
                    const newLabel: 0 | 1 = item.label === 1 ? 0 : 1;
                    return { ...item, label: newLabel };
                }
                return item;
            });

            const updatedItem = newData.find((item) => item.id === id);
            if (updatedItem) {
                setChangedItems((prevChanged) => {
                    const newChanged = new Set(prevChanged);
                    const originalItem = originalData.find((orig) => orig.id === id);

                    if (originalItem && originalItem.label !== updatedItem.label) {
                        newChanged.add(id);
                    } else {
                        newChanged.delete(id);
                    }

                    return newChanged;
                });
            }

            return newData;
        });
    };

    const getChangedData = useCallback((): Keyword[] => {
        return data.filter((item) => changedItems.has(item.id));
    }, [data, changedItems]);

    const getChangeStats = useCallback(() => {
        const changedData = getChangedData();
        const totalChanged = changedData.length;
        const changedToActive = changedData.filter((item) => item.label === 1).length;
        const changedToInactive = changedData.filter((item) => item.label === 0).length;

        return {
            totalChanged,
            changedToActive,
            changedToInactive,
            changedData,
        };
    }, [getChangedData]);

    const handleCopy = () => {
        const copiedText = data
            .filter((item) => item.label === 1)
            .map((item) => item.keyword)
            .join(', ');
        navigator.clipboard.writeText(copiedText);
        toast.success('Berhasil', {
            description: 'Semua kata kunci dengan label aktif telah disalin ke clipboard.',
        });
    };

    const handleReset = () => {
        setData(originalData);
        setChangedItems(new Set());
        toast.success('Berhasil', {
            description: 'Semua perubahan label telah dikembalikan ke kondisi semula.',
        });
    };

    const handleFilter = () => {
        // Implementasi filter
    };

    const getSelectedKeywords = data.filter((item) => item.label === 1);
    const selectedCount = Object.keys(getSelectedKeywords).length;
    const changeStats = getChangeStats();

    return (
        <>
            <TooltipProvider>
                {data.length > 0 ? (
                    <div className="rounded-xl border p-4">
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" onClick={handleCopy}>
                                        <Copy className="ml-1 size-4" />
                                        Salin
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Salin kata kunci</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" onClick={handleReset}>
                                        <RotateCcw className="ml-1 size-4" />
                                        Reset
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Reset perubahan kata kunci</p>
                                </TooltipContent>
                            </Tooltip>

                            {isAnalysisPage ? (
                                <>
                                    <DialogUpdateKeyword analysisId={analysis_id} selectedCount={changeStats.totalChanged} getSelectedKeyword={changeStats.changedData} />

                                    <DialogAddKeyword selectedCount={selectedCount} getSelectedKeyword={getSelectedKeywords} />
                                </>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" onClick={handleFilter}>
                                            <Filter className="ml-1 size-4" />
                                            Filter
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Filter kata kunci</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>

                        {changeStats.totalChanged > 0 && (
                            <Alert>
                                <AlertCircleIcon />
                                <AlertTitle>Informasi Data Kata Kunci</AlertTitle>
                                <AlertDescription>
                                    <ul className="ml-4 list-outside list-disc text-sm">
                                        <li>
                                            {changeStats.totalChanged} item diubah ({changeStats.changedToActive} diaktifkan, {changeStats.changedToInactive} dinonaktifkan)
                                        </li>
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                            {data.map((item) => (
                                <div key={item.id} className="relative">
                                    <KeywordBadge item={item} onToggle={() => toggleLabel(item.id)} />
                                    {changedItems.has(item.id) && <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500"></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex h-24 items-center justify-center rounded-xl border p-4">
                        <span className="text-center text-sm">Tidak ditemukan kata kunci judi online.</span>
                    </div>
                )}
            </TooltipProvider>
        </>
    );
}
