import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Comment, ProcessLog } from '@/types';
import {
    ColumnDef,
    ColumnFiltersState,
    FilterFn,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
    AlertCircle,
    AlertTriangle,
    ArrowUpDown,
    CheckCircle2Icon,
    CircleCheck,
    CircleX,
    FileText,
    FileTextIcon,
    Info,
    Loader2,
    PlusIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

dayjs.extend(relativeTime);
dayjs.locale('id');

interface DataTableGamblingProps {
    analysis_id: number;
    data: {
        total_comments: number;
        total_chunks: number;
        chunks: Array<{
            chunk_id: number;
            comments: Comment[];
        }>;
    };
    onAddDatasetComplete?: (updatedComments: Comment[]) => void;
}

const columns: ColumnDef<Comment>[] = [
    {
        id: 'select',
        header: ({ table }) => {
            const draftRows = table
                .getFilteredRowModel()
                .rows.filter((row) => row.original.status === 'draft');

            const allDraftSelected = draftRows.every((row) => row.getIsSelected());
            const someDraftSelected =
                draftRows.some((row) => row.getIsSelected()) && !allDraftSelected;

            return (
                <div className="flex w-10 items-center justify-center">
                    <Checkbox
                        className="dark:border-white/25"
                        checked={
                            allDraftSelected ? true : someDraftSelected ? 'indeterminate' : false
                        }
                        onCheckedChange={(value) => {
                            draftRows.forEach((row) => {
                                row.toggleSelected(!!value);
                            });
                        }}
                        aria-label="Select all draft comments"
                        disabled={draftRows.length === 0}
                    />
                </div>
            );
        },
        cell: ({ row }) => {
            const isDraft = row.original.status === 'draft';

            return (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        disabled={!isDraft}
                        className={!isDraft ? 'cursor-not-allowed opacity-30' : ''}
                    />
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'text',
        header: () => <div className="w-full text-left">Teks Komentar</div>,
        cell: ({ row }) => {
            const text = row.getValue('text') as string;
            const timestamp = row.original.timestamp;
            const user = row.original.user_metadata;

            return (
                <div className="flex items-start gap-3">
                    <img
                        src={user.profile_url}
                        alt={user.username}
                        className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="truncate text-xs font-medium">
                                {user.username.replace(/^@/, '')}
                            </div>
                            <div className="text-muted-foreground truncate text-xs font-medium">
                                {dayjs(timestamp).fromNow()}
                            </div>
                        </div>
                        <div
                            className="text-sm break-words whitespace-normal"
                            dangerouslySetInnerHTML={{ __html: text }}
                        />
                    </div>
                </div>
            );
        },
        enableHiding: false,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="hover:bg-transparent hover:text-inherit has-[>svg]:px-0"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                Status <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <Badge
                className={`flex gap-1 px-1.5 whitespace-nowrap [&_svg]:size-3 ${
                    ['heldForReview', 'dataset'].includes(row.original.status)
                        ? 'text-[oklch(0.2178_0_0)]'
                        : 'text-[oklch(1_0_0)]'
                }`}
                style={{
                    backgroundColor:
                        row.original.status === 'reject'
                            ? 'var(--chart-1)'
                            : row.original.status === 'heldForReview'
                              ? 'var(--chart-3)'
                              : row.original.status === 'draft'
                                ? 'var(--muted)'
                                : row.original.status === 'dataset'
                                  ? 'var(--chart-4)'
                                  : undefined,
                }}
            >
                {row.original.status === 'reject' && (
                    <CheckCircle2Icon className="text-[oklch(1_0_0)]" />
                )}
                {row.original.status === 'heldForReview' && (
                    <CheckCircle2Icon className="text-[oklch(0.2178_0_0)]" />
                )}
                {row.original.status === 'draft' && (
                    <FileTextIcon className="text-[oklch(1_0_0)]" />
                )}
                {row.original.status === 'dataset' && (
                    <CheckCircle2Icon className="text-[oklch(0.2178_0_0)]" />
                )}
                {
                    {
                        reject: 'Ditolak',
                        heldForReview: 'Ditahan untuk Review',
                        draft: 'Draf',
                        dataset: 'Ditambahkan ke Dataset',
                    }[row.original.status]
                }
            </Badge>
        ),
    },
];

export default function DataTableNonGambling({
    analysis_id,
    data: apiData,
    onAddDatasetComplete,
}: DataTableGamblingProps) {
    const [data, setData] = useState<Comment[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);

    const [currentChunk, setCurrentChunk] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [loadingDataset, setLoadingDataset] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [processLogs, setProcessLogs] = useState<ProcessLog[]>([]);
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [finished, setFinished] = useState(false);

    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (apiData && apiData.chunks.length > 0) {
            setData(apiData.chunks[0].comments);
            setCurrentChunk(0);
            setHasMore(apiData.chunks.length > 1);
        }
    }, [apiData]);

    const loadNextChunk = useCallback(async () => {
        if (loadingMore || !hasMore || !apiData) return;

        setLoadingMore(true);

        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
            const nextChunkIndex = currentChunk + 1;
            const nextChunk = apiData.chunks[nextChunkIndex];

            if (nextChunk && nextChunk.comments) {
                setData((prev) => [...prev, ...nextChunk.comments]);
                setCurrentChunk(nextChunkIndex);

                setHasMore(nextChunkIndex < apiData.chunks.length - 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading chunk:', error);
            toast.error('Gagal!', {
                description: 'Terjadi kesalahan saat memuat data tambahan',
            });
        }

        setLoadingMore(false);
    }, [currentChunk, loadingMore, hasMore, apiData]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting) {
                    loadNextChunk();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px',
            },
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [loadNextChunk]);

    const multiColumnFilter: FilterFn<Comment> = useCallback((row, columnId, value) => {
        const search = String(value).toLowerCase();
        return ['text', 'status'].some((key) =>
            String(row.getValue(key) || '')
                .toLowerCase()
                .includes(search),
        );
    }, []);

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            sorting,
            rowSelection,
            columnFilters,
        },
        getRowId: (row) => row.comment_id.toString(),
        enableRowSelection: (row) => row.original.status === 'draft',
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: multiColumnFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    const getSelectedComments = useCallback((): Comment[] => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        return selectedRows.map((row) => row.original);
    }, [table]);

    const addLogEntry = (comment_id: string, status: ProcessLog['status'], message: string) => {
        setProcessLogs((prev) => [...prev, { comment_id, status, message }]);
    };

    const updateLogEntry = (comment_id: string, status: ProcessLog['status'], message: string) => {
        setProcessLogs((prev) =>
            prev.map((log) => (log.comment_id === comment_id ? { ...log, status, message } : log)),
        );
    };

    const fetchDataset = async (): Promise<void> => {
        const selectedComments = getSelectedComments();

        if (selectedComments.length === 0) {
            toast('Informasi!', {
                description: 'Silakan pilih minimal satu komentar untuk melanjutkan.',
            });
            return;
        }

        setLoadingDataset(true);
        setProcessLogs([]);
        setSuccessCount(0);
        setErrorCount(0);
        setFinished(false);

        let success = 0;
        let failed = 0;

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const updatedComments: Comment[] = [];

            for (const selectedComment of selectedComments) {
                addLogEntry(
                    selectedComment.comment_id,
                    'processing',
                    `Memproses komentar dengan ID ${selectedComment.comment_id}`,
                );

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
                                analysis_id: analysis_id,
                                comment: selectedComment,
                                true_label: 'judol',
                            },
                        }),
                    });

                    if (!response.ok) {
                        const errorBody = await response.json();
                        throw new Error(
                            errorBody.message || `HTTP error! status: ${response.status}`,
                        );
                    }

                    const result = await response.json();

                    if (result.success) {
                        success++;

                        updateLogEntry(
                            selectedComment.comment_id,
                            'success',
                            `Komentar dengan ID ${selectedComment.comment_id} berhasil ditambahkan ke dataset.`,
                        );

                        const updatedComment = { ...selectedComment, status: 'dataset' as const };
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

                    updateLogEntry(
                        selectedComment.comment_id,
                        'error',
                        `Komentar dengan ID ${selectedComment.comment_id} gagal ditambahkan ke dataset. ${message}`,
                    );
                }

                await new Promise((resolve) => setTimeout(resolve, 300));
            }

            if (updatedComments.length > 0) {
                setData((prevData) =>
                    prevData.map((comment) => {
                        const updatedComment = updatedComments.find(
                            (updated) => updated.comment_id === comment.comment_id,
                        );
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

            setRowSelection({});

            if (onAddDatasetComplete && updatedComments.length > 0) {
                onAddDatasetComplete(updatedComments);
            }
        } catch (error) {
            console.error('Error processing dataset:', error);
            toast.error('Gagal!', {
                description: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
            });
        } finally {
            setFinished(true);
        }
    };

    const handleProceed = () => {
        fetchDataset();
    };

    const handleClose = () => {
        setOpenDialog(false);
        setTimeout(() => {
            setLoadingDataset(false);
            setProcessLogs([]);
            setSuccessCount(0);
            setErrorCount(0);
            setFinished(false);
        }, 300);
    };

    useEffect(() => {
        setRowSelection({});
    }, [data]);

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <div className="flex w-full flex-col justify-start gap-4">
            <div className="relative flex flex-col gap-4 overflow-auto">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex w-full gap-2 md:order-2 md:justify-end">
                        <div className="flex-1 md:flex-none">
                            <Dialog
                                open={openDialog}
                                onOpenChange={(open) => {
                                    setOpenDialog(open);
                                    if (!open) {
                                        handleClose();
                                    }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button variant="outline" className='w-full' disabled={selectedCount === 0}>
                                        <PlusIcon />
                                        Tambah ke Dataset{' '}
                                        {selectedCount > 0 && ` (${selectedCount} Komentar)`}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden">
                                    <DialogTitle>Tambah Komentar ke Dataset</DialogTitle>
                                    <DialogDescription>
                                        Komentar yang telah Anda pilih akan diproses dan ditambahkan
                                        ke dataset.
                                    </DialogDescription>

                                    <div className="flex-1 overflow-hidden">
                                        {loadingDataset ? (
                                            <div className="flex w-full flex-col items-center justify-center">
                                                {finished && successCount > 0 && errorCount > 0 ? (
                                                    <>
                                                        <AlertTriangle className="text-chart-3 mb-4 h-8 w-8" />
                                                        <p className="text-center font-medium">
                                                            {successCount} berhasil, {errorCount}{' '}
                                                            gagal.
                                                        </p>
                                                        <p className="text-muted-foreground mt-1 text-center text-sm">
                                                            Silakan tutup dialog jika tidak
                                                            diperlukan lagi.
                                                        </p>
                                                    </>
                                                ) : finished && successCount > 0 ? (
                                                    <>
                                                        <CircleCheck className="text-chart-4 mb-4 h-8 w-8" />
                                                        <p className="text-center font-medium">
                                                            {successCount} komentar berhasil
                                                            diproses.
                                                        </p>
                                                        <p className="text-muted-foreground mt-1 text-center text-sm">
                                                            Silakan tutup dialog jika tidak
                                                            diperlukan lagi.
                                                        </p>
                                                    </>
                                                ) : finished && errorCount > 0 ? (
                                                    <>
                                                        <CircleX className="text-chart-1 mb-4 h-8 w-8" />
                                                        <p className="text-center font-medium">
                                                            {errorCount} komentar gagal diproses.
                                                        </p>
                                                        <p className="text-muted-foreground mt-1 text-center text-sm">
                                                            Silakan tutup dialog jika tidak
                                                            diperlukan lagi.
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                                                        <p className="text-center font-medium">
                                                            Memproses {selectedCount} komentar
                                                        </p>
                                                        <p className="text-muted-foreground mt-1 text-center text-sm">
                                                            Mohon tunggu hingga proses selesai,
                                                            jangan tinggalkan halaman atau menutup
                                                            dialog ini.
                                                        </p>
                                                    </>
                                                )}
                                                <div className="bg-muted dark:bg-background mt-4 max-h-[170px] w-full overflow-y-auto rounded-md border p-4 pr-2">
                                                    {processLogs.map((log, index) => (
                                                        <div key={index} className="mb-2">
                                                            {log.status === 'processing' && (
                                                                <p className="text-muted-foreground text-sm">
                                                                    {log.message}
                                                                </p>
                                                            )}
                                                            {log.status === 'success' && (
                                                                <div className="flex items-center gap-2">
                                                                    <CircleCheck className="text-chart-4 size-3 flex-shrink-0" />
                                                                    <p className="text-chart-4 text-sm">
                                                                        {log.message}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {log.status === 'error' && (
                                                                <div className="flex items-center gap-2">
                                                                    <CircleX className="text-chart-1 size-3 flex-shrink-0" />
                                                                    <p className="text-chart-1 text-sm">
                                                                        {log.message}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <div className="mb-4">
                                                    <AlertCircle className="text-primary h-8 w-8" />
                                                </div>
                                                <div className="space-y-2 text-center">
                                                    <p className="font-medium">
                                                        {`${selectedCount} komentar dipilih`}
                                                    </p>
                                                    <p className="text-muted-foreground max-w-sm text-sm">
                                                        Pastikan komentar yang Anda pilih sudah
                                                        benar sebelum melanjutkan.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <DialogFooter className="border-t pt-4">
                                        <Button
                                            onClick={handleProceed}
                                            disabled={loadingDataset}
                                            className="flex items-center gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Tambah ke Dataset
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <Input
                        placeholder="Cari teks komentar atau status..."
                        value={globalFilter}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="max-w-sm md:order-1"
                    />
                </div>

                {data.length > 0 && (
                    <Alert>
                        <Info />
                        <AlertTitle>
                            {table.getFilteredSelectedRowModel().rows.length} dari{' '}
                            {table.getFilteredRowModel().rows.length} baris dipilih
                        </AlertTitle>
                        <AlertDescription>
                            <p>
                                Menampilkan {data.length} dari total {apiData.total_comments}{' '}
                                komentar
                            </p>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="custom-scrollbar max-h-[70vh] overflow-hidden overflow-y-auto rounded-lg border">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="**:data-[slot=table-cell]:first:w-10">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className={
                                                    row.original.status !== 'draft' &&
                                                    cell.column.id !== 'status'
                                                        ? 'opacity-60'
                                                        : ''
                                                }
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Tidak ada hasil.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {hasMore && (
                        <div
                            ref={sentinelRef}
                            className={`flex items-center justify-center ${
                                data.length > 0 ? 'bg-muted/20 py-6' : 'py-0'
                            }`}
                        >
                            {data.length > 0 && (
                                <>
                                    {loadingMore ? (
                                        <div className="text-muted-foreground flex items-center gap-3">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm">
                                                Memuat komentar lainnya...
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground text-sm">
                                            Scroll untuk memuat lebih banyak...
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {!hasMore && data.length > 0 && (
                        <div className="bg-muted/20 text-muted-foreground py-6 text-center text-sm">
                            ✨ Semua komentar telah dimuat ({data.length} total)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
