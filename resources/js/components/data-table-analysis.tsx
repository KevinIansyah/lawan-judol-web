import DialogPublicVideo from '@/components/dialog-public-video';
import DialogYourVideo from '@/components/dialog-your-video';
import { TableCellViewer } from '@/components/table-cell-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTablePagination } from '@/hooks/use-table-pagination';
import { useUrlSearch } from '@/hooks/use-url-search';
import { formatDate } from '@/lib/utils';
import { Analysis } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ColumnDef, VisibilityState, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { CheckCircle2Icon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, CircleX, ColumnsIcon, LoaderIcon, MoreVerticalIcon } from 'lucide-react';
import { useState } from 'react';

interface DataTableProps {
    data: Analysis[];
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    totalItems: number;
    perPage: number;
    initialFilters?: {
        search?: string;
    };
}

export default function DataTableAnalysis({ data, pageIndex, setPageIndex, totalPages, totalItems, perPage, initialFilters = {} }: DataTableProps) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const { url } = usePage();
    const { searchValue, setSearchValue, getSearchFromUrl } = useUrlSearch(initialFilters.search);
    const { debouncedSearch, goToPage, changePageSize, canPreviousPage, canNextPage } = useTablePagination({
        pageIndex,
        setPageIndex,
        totalPages,
        getSearchFromUrl,
        onlyFields: ['analyses'],
    });

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
            accessorKey: 'channel',
            header: 'Channel',
            cell: ({ row }) => {
                return <div className="text-foreground text-left">{row.original.video?.channel_title || '-'}</div>;
            },
        },
        {
            accessorKey: 'komentar utama',
            header: 'Komentar Utama',
            cell: ({ row }) => {
                return <div className="text-foreground text-left">{row.original.video?.comments_total || 0}</div>;
            },
        },
        {
            accessorKey: 'tanggal analisis',
            header: 'Tanggal Analisis',
            cell: ({ row }) => {
                return <div className="text-foreground text-left">{formatDate(row.original.created_at)}</div>;
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    className={`flex gap-1 px-1.5 [&_svg]:size-3 ${['success', 'on_process'].includes(row.original.status) ? 'text-[oklch(0.2178_0_0)]' : 'text-white'}`}
                    style={{
                        backgroundColor: row.original.status === 'success' ? 'var(--chart-4)' : row.original.status === 'on_process' ? 'var(--chart-3)' : row.original.status === 'failed' ? 'var(--chart-1)' : row.original.status === 'queue' ? 'var(--muted)' : undefined,
                    }}
                >
                    {row.original.status === 'success' && <CheckCircle2Icon className="text-[oklch(0.2178_0_0)]" />}
                    {row.original.status === 'on_process' && <LoaderIcon className="animate-spin text-[oklch(0.2178_0_0)]" />}
                    {row.original.status === 'failed' && <CircleX className="text-white" />}
                    {row.original.status === 'queue' && <LoaderIcon className="text-white" />}
                    {
                        {
                            success: 'Selesai',
                            on_process: 'Sedang Diproses',
                            failed: 'Gagal',
                            queue: 'Antrian',
                        }[row.original.status]
                    }
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-muted-foreground data-[state=open]:bg-primary flex size-8 data-[state=open]:text-white" size="icon">
                            <MoreVerticalIcon />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem asChild disabled={['failed', 'on_process', 'queue'].includes(row.original.status)}>
                            {url.startsWith('/analysis/your-videos') ? <Link href={`/analysis/your-videos/${row.original.id}`}>Detail</Link> : url.startsWith('/analysis/public-videos') ? <Link href={`/analysis/public-videos/${row.original.id}`}>Detail</Link> : <span>Detail</span>}
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={row.original.status !== 'failed'}>Ulang</DropdownMenuItem>
                        <DropdownMenuItem disabled={row.original.status !== 'success'}>Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchValue(value);
        debouncedSearch(value);
    };

    const table = useReactTable({
        data,
        columns,
        state: {
            columnVisibility,
            pagination: {
                pageIndex,
                pageSize: perPage,
            },
        },
        pageCount: totalPages,
        manualPagination: true,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="flex w-full flex-col justify-start gap-4">
            <div className="relative flex flex-col gap-4 overflow-auto">
                {/* Toolbar Section */}
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex w-full justify-center gap-2 md:order-2 md:justify-end">
                        {/* Additional Action Buttons */}
                        <div className="flex-1 md:flex-none">
                            {url.startsWith('/analysis/your-videos') && <DialogYourVideo />}
                            {url.startsWith('/analysis/public-videos') && <DialogPublicVideo />}
                        </div>

                        {/* Column Visibility Toggle */}
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
                    </div>

                    {/* Search Input */}
                    <Input placeholder="Cari judul, channel, atau status..." value={searchValue} onChange={handleSearchChange} className="max-w-sm md:order-1" />
                </div>

                {/* Table Section */}
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
                        <TableBody>
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
                                        {searchValue ? 'Tidak ada hasil yang ditemukan.' : 'Tidak ada data.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Section */}
                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        Menampilkan {Math.min(pageIndex * perPage + 1, totalItems)} sampai {Math.min((pageIndex + 1) * perPage, totalItems)} dari {totalItems} hasil
                        {searchValue && <span className="ml-1">untuk "{searchValue}"</span>}
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        {/* Page Size Selector */}
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Baris per halaman
                            </Label>
                            <Select value={`${perPage}`} onValueChange={(value) => changePageSize(Number(value))}>
                                <SelectTrigger className="w-20" id="rows-per-page">
                                    <SelectValue placeholder={perPage} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[20, 30, 40, 50].map((pageSize) => (
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
