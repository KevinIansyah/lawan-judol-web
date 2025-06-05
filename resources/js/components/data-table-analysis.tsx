import { TableCellViewer } from '@/components/table-cell-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Analysis } from '@/lib/schemas/analysis-schema';
import { Link, usePage } from '@inertiajs/react';
import { ColumnDef, ColumnFiltersState, FilterFn, SortingState, VisibilityState, flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { CheckCircle2Icon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, CircleX, ColumnsIcon, LoaderIcon, MoreVerticalIcon } from 'lucide-react';
import * as React from 'react';
import { DialogVideo } from './dialog-video';

const columns: ColumnDef<Analysis>[] = [
    {
        accessorKey: 'title',
        header: 'Judul',
        cell: ({ row }) => {
            return <TableCellViewer item={row.original} />;
        },
        enableHiding: false,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <Badge variant="outline" className="text-muted-foreground flex gap-1 px-1.5 [&_svg]:size-3">
                {row.original.status === 'done' && <CheckCircle2Icon className="text-green-500 dark:text-green-400" />}
                {row.original.status === 'in_process' && <LoaderIcon className="animate-spin text-yellow-500 dark:text-yellow-400" />}
                {row.original.status === 'failed' && <CircleX className="text-red-500 dark:text-red-400" />}
                {row.original.status === 'queued' && <LoaderIcon className="text-muted-foreground" />}
                {
                    {
                        done: 'Selesai',
                        in_process: 'Sedang Diproses',
                        failed: 'Gagal',
                        queued: 'Antrian',
                    }[row.original.status]
                }
            </Badge>
        ),
    },
    // {
    //     accessorKey: 'reviewer',
    //     header: 'Peninjau',
    //     cell: ({ row }) => {
    //         return <div className="text-foreground text-left">{row.original.reviewer}</div>;
    //     },
    // },
    {
        id: 'actions',
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-muted-foreground data-[state=open]:bg-muted flex size-8" size="icon">
                        <MoreVerticalIcon />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem asChild>
                        <Link href={`/analysis/public-video/detail`}>Detail</Link>
                    </DropdownMenuItem>
                    {/* <DropdownMenuSeparator /> */}
                    <DropdownMenuItem>Batalkan</DropdownMenuItem>
                    <DropdownMenuItem>Hapus</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export function DataTable({ data: initialData }: { data: Analysis[] }) {
    const [data, setData] = React.useState(() => initialData);
    const [tabValue, setTabValue] = React.useState('outline');
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const { url } = usePage();
    const multiColumnFilter: FilterFn<Analysis> = (row, columnId, value) => {
        const search = String(value).toLowerCase();
        return ['header', 'status'].some((key) =>
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
            columnVisibility,
            columnFilters,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: multiColumnFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    return (
        <Tabs value={tabValue} onValueChange={setTabValue} className="flex w-full flex-col justify-start gap-4">
            <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex w-full justify-center gap-2 md:order-2 md:justify-end">
                        <div className="flex-1 md:flex-none">
                            <DropdownMenu>
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
                                        .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                                        .map((column) => (
                                            <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex-1 md:flex-none">{url === '/analysis/your-video' && <DialogVideo />}</div>
                    </div>

                    <Input placeholder="Cari header atau status..." value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} className="max-w-sm md:order-1" />
                </div>

                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Tidak ada hasil.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris dipilih.
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Baris per halaman
                            </Label>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value));
                                }}
                            >
                                <SelectTrigger className="w-20" id="rows-per-page">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeftIcon />
                            </Button>
                            <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeftIcon />
                            </Button>
                            <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                <span className="sr-only">Go to next page</span>
                                <ChevronRightIcon />
                            </Button>
                            <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRightIcon />
                            </Button>
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="past-performance" className="flex flex-col">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>

            <TabsContent value="key-personnel" className="flex flex-col">
                <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
            </TabsContent>
        </Tabs>
    );
}
