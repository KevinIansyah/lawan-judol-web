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
    ArrowUpDown,
    CheckCircle2Icon,
    FileTextIcon,
    InfoIcon,
    Loader2,
    ShieldEllipsis,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Comment } from '@/types';

dayjs.extend(relativeTime);

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
                            <div className="text-muted-foreground truncate text-xs font-medium">
                                {user.username.replace(/^@/, '')}
                            </div>
                            <Badge variant={'timestamp'}>{dayjs(timestamp).fromNow()}</Badge>
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
                variant="outline"
                className="text-muted-foreground flex gap-1 px-1.5 whitespace-nowrap [&_svg]:size-3"
            >
                {row.original.status === 'reject' && (
                    <CheckCircle2Icon className="text-red-500 dark:text-red-400" />
                )}
                {row.original.status === 'heldForReview' && (
                    <CheckCircle2Icon className="text-yellow-500 dark:text-yellow-400" />
                )}
                {row.original.status === 'draft' && (
                    <FileTextIcon className="text-gray-500 dark:text-gray-400" />
                )}
                {row.original.status === 'dataset' && (
                    <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
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

interface DataTableGamblingProps {
    data: Comment[];
    onModerationComplete?: (updatedComments: Comment[]) => void;
}

export default function DataTableGambling({
    data: initialData,
    onModerationComplete,
}: DataTableGamblingProps) {
    const [data] = useState(() => initialData);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const fetchModeration = async (): Promise<void> => {
        const selectedCommentIds = getSelectedCommentIds();
        console.log('Selected Comment IDs:', selectedCommentIds);
        console.log('Row Selection State:', rowSelection);

        if (selectedCommentIds.length === 0) {
            toast('Tidak ada komentar yang dipilih', {
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
            // toast.success('Moderasi berhasil', {
            //     description: `${selectedCommentIds.length} komentar telah diproses.`,
            // });
            // // Reset selection setelah berhasil
            // setRowSelection({});
            // // Callback untuk update data di parent component jika ada
            // if (onModerationComplete && result.updatedComments) {
            //     onModerationComplete(result.updatedComments);
            // }
            // console.log(`Berhasil memproses ${selectedCommentIds.length} komentar`);
        } catch (error) {
            console.error('Error processing moderation:', error);

            toast.error('Gagal memproses moderasi', {
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
    const draftCount = table
        .getFilteredRowModel()
        .rows.filter((row) => row.original.status === 'draft').length;

    return (
        <div className="flex w-full flex-col justify-start gap-4">
            <div className="relative flex flex-col gap-4 overflow-auto">
                {draftCount > 0 && (
                    <Alert>
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>Komentar Siap Dimoderasi</AlertTitle>
                        <AlertDescription>
                            Ada {draftCount} komentar draft yang menunggu moderasi.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex w-full gap-2 md:order-2 md:justify-end">
                        <div className="flex-1 md:flex-none">
                            <Button
                                variant="outline"
                                onClick={fetchModeration}
                                className="w-full"
                                disabled={selectedCount === 0 || isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <ShieldEllipsis />
                                )}
                                <span>
                                    {isLoading ? 'Memproses...' : 'Tindakan Moderasi'}
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

                <div className="overflow-hidden rounded-lg border">
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
                                        className={
                                            row.original.status !== 'draft' ? 'opacity-60' : ''
                                        }
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
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
                </div>

                <div className="flex items-center justify-between px-2">
                    <div className="text-muted-foreground flex flex-1 text-sm">
                        {table.getFilteredSelectedRowModel().rows.length} dari{' '}
                        {table.getFilteredRowModel().rows.length} baris dipilih.
                    </div>
                </div>
            </div>
        </div>
    );
}
