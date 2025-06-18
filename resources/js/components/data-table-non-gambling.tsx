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
import { Comment } from '@/lib/schemas/comment-schema';
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
import { ArrowUpDown, CheckCircle2Icon, FileTextIcon, PlusIcon } from 'lucide-react';
import * as React from 'react';

dayjs.extend(relativeTime);

const columns: ColumnDef<Comment>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <div className="flex w-8 items-center justify-center">
                <Checkbox
                    className="dark:border-white/25"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'text',
        header: () => <div className="w-full text-left">Teks Komentar</div>,
        cell: ({ row }) => {
            const text = row.getValue('text');
            const timestamp = row.original.timestamp;
            const user = row.original.user_metadata;

            return (
                <div className="flex items-start gap-3">
                    <img
                        src={user.profile_url}
                        alt={user.username}
                        className="h-6 w-6 rounded-full object-cover"
                    />
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="text-muted-foreground text-xs font-medium">
                                {user.username.replace(/^@/, '')}
                            </div>
                            <Badge variant={'timestamp'}>{dayjs(timestamp).fromNow()}</Badge>
                        </div>
                        <div
                            className="text-sm whitespace-normal"
                            dangerouslySetInnerHTML={{ __html: text as string }}
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
                className="text-muted-foreground flex gap-1 px-1.5 [&_svg]:size-3"
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
                {row.original.status === 'database' && (
                    <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
                )}
                {
                    {
                        reject: 'Ditolak',
                        heldForReview: 'Ditahan untuk Review',
                        draft: 'Draf',
                        database: 'Ditambahkan ke Database',
                    }[row.original.status]
                }
            </Badge>
        ),
    },
];

export default function DataTableNonGambling({ data: initialData }: { data: Comment[] }) {
    const [data] = React.useState(() => initialData);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const multiColumnFilter: FilterFn<Comment> = (row, columnId, value) => {
        const search = String(value).toLowerCase();
        return ['text', 'status'].some((key) =>
            String(row.getValue(key) || '')
                .toLowerCase()
                .includes(search),
        );
    };
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
        enableRowSelection: true,
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

    return (
        <div className="flex w-full flex-col justify-start gap-4">
            <div className="relative flex flex-col gap-4 overflow-auto">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex w-full gap-2 md:order-2 md:justify-end">
                        <div className="flex-1 md:flex-none">
                            {/* <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full md:w-auto">
                                        <ColumnsIcon />
                                        <span className="hidden lg:inline">Sesuaikan Kolom</span>
                                        <span className="lg:hidden">Kolom</span>
                                        <ChevronDownIcon />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    {table
                                        .getAllColumns()
                                        .filter(
                                            (column) =>
                                                typeof column.accessorFn !== 'undefined' &&
                                                column.getCanHide(),
                                        )
                                        .map((column) => (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu> */}
                            <Button variant="outline" className="w-full">
                                <PlusIcon />
                                <span>Tambah ke Dataset</span>
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
                        <TableBody className="**:data-[slot=table-cell]:first:w-8">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
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

                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground flex flex-1 text-sm">
                        {table.getFilteredSelectedRowModel().rows.length} dari{' '}
                        {table.getFilteredRowModel().rows.length} baris dipilih.
                    </div>
                </div>
            </div>
        </div>
    );
}
