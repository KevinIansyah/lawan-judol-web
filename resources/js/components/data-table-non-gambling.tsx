import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Comment } from '@/types';
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
import { ArrowUpDown, CheckCircle2Icon, FileTextIcon, Info, Loader2, PlusIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

dayjs.extend(relativeTime);
dayjs.locale('id');

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
                        ? 'text-black'
                        : 'text-white'
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
                {row.original.status === 'reject' && <CheckCircle2Icon className="text-white" />}
                {row.original.status === 'heldForReview' && (
                    <CheckCircle2Icon className="text-black" />
                )}
                {row.original.status === 'draft' && <FileTextIcon className="text-white" />}
                {row.original.status === 'dataset' && <CheckCircle2Icon className="text-black" />}
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

interface DataTableGamblingProps {
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

export default function DataTableNonGambling({
    data: apiData,
    onAddDatasetComplete,
}: DataTableGamblingProps) {
    const [data, setData] = useState<Comment[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (apiData && apiData.chunks.length > 0) {
            setData(apiData.chunks[0].comments);
            setCurrentChunk(0);
            setHasMore(apiData.chunks.length > 1);
        }
    }, [apiData]);

    const loadNextChunk = useCallback(async () => {
        if (isLoadingMore || !hasMore || !apiData) return;

        setIsLoadingMore(true);

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

        setIsLoadingMore(false);
    }, [currentChunk, isLoadingMore, hasMore, apiData]);

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

    const getSelectedCommentIds = useCallback((): string[] => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        return selectedRows.map((row) => row.original.comment_id.toString());
    }, [table]);

    const getSelectedComments = useCallback((): Comment[] => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        return selectedRows.map((row) => row.original);
    }, [table]);

    const fetchDataset = async (): Promise<void> => {
        const selectedCommentIds = getSelectedCommentIds();
        const selectedComments = getSelectedComments();
        console.log('Selected Comment IDs:', selectedCommentIds);
        console.log('Selected Comments:', selectedComments);
        console.log('Row Selection State:', rowSelection);

        if (selectedCommentIds.length === 0) {
            toast('Informasi!', {
                description: 'Silakan pilih minimal satu komentar untuk melanjutkan.',
            });
            return;
        }

        setIsLoading(true);

        try {
            // const response = await fetch('/api/moderate-comments', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         comment_ids: selectedCommentIds,
            //         action: 'moderate',
            //     }),
            // });
            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }
            // const result = await response.json();
            // toast.success('Berhasil!', {
            //     description: `${selectedCommentIds.length} komentar telah diproses.`,
            // });
            // // Reset selection setelah berhasil
            // setRowSelection({});
            // // Callback untuk update data di parent component jika ada
            // if (onAddDatasetComplete && result.updatedComments) {
            //     onAddDatasetComplete(result.updatedComments);
            // }
            // console.log(`Berhasil memproses ${selectedCommentIds.length} komentar`);
        } catch (error) {
            console.error('Error processing moderation:', error);

            toast.error('Gagal!', {
                description:
                    error instanceof Error
                        ? error.message
                        : 'Terjadi kesalahan yang tidak diketahui',
            });
        } finally {
            setIsLoading(false);
        }
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
                            <Button
                                variant="outline"
                                onClick={fetchDataset}
                                className="w-full"
                                disabled={selectedCount === 0 || isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <PlusIcon />}
                                <span>
                                    {isLoading ? 'Memproses...' : 'Tambah ke Dataset'}
                                    {selectedCount > 0 && ` (${selectedCount} Komentar)`}
                                </span>
                            </Button>
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
                            {/* <Progress
                                value={(data.length / apiData.total_comments) * 100}
                                className="h-2"
                            /> */}
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
                                    {isLoadingMore ? (
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
