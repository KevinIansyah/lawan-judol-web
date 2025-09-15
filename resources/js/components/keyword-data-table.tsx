import KeywordBadge from '@/components/keyword-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTablePagination } from '@/hooks/use-table-pagination';
import { useUrlSearch } from '@/hooks/use-url-search';
import { Keyword, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Copy, Info, RotateCcw, Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type KeywordDataTableProps = {
    data: Keyword[];
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    totalItems: number;
    perPage: number;
    initialFilters?: {
        search?: string;
    };
};

export default function KeywordDataTable({ data: initialData, pageIndex, setPageIndex, totalPages, totalItems, perPage, initialFilters = {} }: KeywordDataTableProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [data, setData] = useState<Keyword[]>(() => initialData);
    const [originalData, setOriginalData] = useState<Keyword[]>(() => initialData);
    const [changedItems, setChangedItems] = useState<Set<number>>(new Set());

    useEffect(() => {
        setData(initialData);
        setOriginalData(initialData);
        setChangedItems(new Set());
    }, [initialData]);

    const { searchValue, setSearchValue, getSearchFromUrl } = useUrlSearch(initialFilters.search);
    const { debouncedSearch, goToPage, changePageSize, canPreviousPage, canNextPage } = useTablePagination({
        pageIndex,
        setPageIndex,
        totalPages,
        getSearchFromUrl,
        onlyFields: ['keywords'],
    });

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

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchValue(value);
        debouncedSearch(value);
    };

    const changeStats = getChangeStats();
    const startIndex = pageIndex * perPage;
    const endIndex = Math.min(startIndex + perPage, totalItems);

    return (
        <div className="flex w-full flex-col justify-start gap-4">
            <div className="relative flex flex-col gap-4 overflow-auto">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex w-full justify-center gap-2 md:order-2 md:justify-end">
                        {/* Additional Action Buttons */}
                        <div className="flex-1 md:flex-none">
                            <Button variant="outline" className="w-full" onClick={handleCopy}>
                                <Copy className="ml-1 size-4" /> Salin
                            </Button>
                        </div>
                        <div className="flex-1 md:flex-none">
                            <Button variant="outline" className="w-full" onClick={handleReset}>
                                <RotateCcw className="ml-1 size-4" />
                                Reset
                            </Button>
                        </div>
                        {auth?.user?.role === 'admin' && (
                            <div className="flex-1 md:flex-none">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/import/keyword">
                                        <Upload className="ml-1 size-4" />
                                        Import
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Search Input */}
                    <Input placeholder="Cari kata kunci..." value={searchValue} onChange={handleSearchChange} className="max-w-sm md:order-1" />
                </div>

                {changeStats.totalChanged > 0 && (
                    <Alert>
                        <Info />
                        <AlertTitle>Perubahan</AlertTitle>
                        <AlertDescription>
                            <div>
                                <p>
                                    {changeStats.totalChanged} item diubah ({changeStats.changedToActive} diaktifkan, {changeStats.changedToInactive} dinonaktifkan)
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="overflow-hidden rounded-lg border p-4">
                    <div className="flex flex-wrap gap-2">
                        {data.length > 0 ? (
                            data.map((item) => (
                                <div key={item.id} className="relative">
                                    <KeywordBadge item={item} onToggle={() => toggleLabel(item.id)} />
                                    {changedItems.has(item.id) && <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500"></div>}
                                </div>
                            ))
                        ) : (
                            <div className="flex h-24 w-full items-center justify-center">
                                <span className="text-muted-foreground text-center text-sm">{searchValue ? 'Tidak ditemukan kata kunci yang cocok.' : 'Tidak ada kata kunci.'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination Section */}
                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        Menampilkan {Math.min(startIndex + 1, totalItems)} sampai {Math.min(endIndex, totalItems)} dari {totalItems} hasil
                        {searchValue && <span className="ml-1">untuk "{searchValue}"</span>}
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        {/* Page Size Selector */}
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Kata kunci per halaman
                            </Label>
                            <Select value={`${perPage}`} onValueChange={(value) => changePageSize(Number(value))}>
                                <SelectTrigger className="w-20" id="rows-per-page">
                                    <SelectValue placeholder={perPage} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[100, 150, 200, 250].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Page Info */}
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Halaman {pageIndex + 1} dari {totalPages}
                        </div>

                        {/* Pagination Controls */}
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => goToPage(0)} disabled={!canPreviousPage}>
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeftIcon />
                            </Button>
                            <Button variant="outline" className="size-8" size="icon" onClick={() => goToPage(pageIndex - 1)} disabled={!canPreviousPage}>
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeftIcon />
                            </Button>
                            <Button variant="outline" className="size-8" size="icon" onClick={() => goToPage(pageIndex + 1)} disabled={!canNextPage}>
                                <span className="sr-only">Go to next page</span>
                                <ChevronRightIcon />
                            </Button>
                            <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => goToPage(totalPages - 1)} disabled={!canNextPage}>
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRightIcon />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
