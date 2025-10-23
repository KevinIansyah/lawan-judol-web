import { DialogFilterDataset } from '@/components/dialog-filter-dataset';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTablePagination } from '@/hooks/use-table-pagination';
import { useUrlSearch } from '@/hooks/use-url-search';
import { formatDate } from '@/lib/utils';
import { Dataset } from '@/types';
import { ColumnDef, VisibilityState, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { CheckCircle2Icon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ColumnsIcon } from 'lucide-react';
import { useState } from 'react';

import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.locale('id');

interface DataTableProps {
    data: Dataset[];
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    totalItems: number;
    perPage: number;
    initialFilters?: {
        search?: string;
    };
}

export default function DataTableDataset({ data, pageIndex, setPageIndex, totalPages, totalItems, perPage, initialFilters = {} }: DataTableProps) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { searchValue, setSearchValue, getSearchFromUrl } = useUrlSearch(initialFilters.search);
    const { debouncedSearch, goToPage, changePageSize, canPreviousPage, canNextPage } = useTablePagination({
        pageIndex,
        setPageIndex,
        totalPages,
        getSearchFromUrl,
        onlyFields: ['datasets'],
    });

    const columns: ColumnDef<Dataset>[] = [
        {
            accessorKey: 'text',
            header: () => <div className="w-full text-left">Teks Komentar</div>,
            cell: ({ row }) => {
                const text = row.original.comment.text as string;
                const timestamp = row.original.comment.timestamp;
                const user = row.original.comment.user_metadata;

                return (
                    <div className="flex items-start gap-3">
                        <img src={user.profile_url} alt={user.username} className="h-6 w-6 flex-shrink-0 rounded-full object-cover" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="truncate text-xs font-medium">{user.username.replace(/^@/, '')}</div>
                                <div className="text-muted-foreground truncate text-xs font-medium">{dayjs(timestamp).fromNow()}</div>
                            </div>
                            <div className="text-sm break-words whitespace-normal" dangerouslySetInnerHTML={{ __html: text }} />
                        </div>
                    </div>
                );
            },
            enableHiding: false,
        },
        {
            accessorKey: 'pengguna',
            header: 'Pengguna',
            cell: ({ row }) => {
                return (
                    <div className="text-foreground text-left">
                        {row.original.user?.id} | {row.original.user?.name}
                    </div>
                );
            },
        },
        {
            accessorKey: 'tanggal ditambahkan',
            header: 'Tanggal Ditambahkan',
            cell: ({ row }) => {
                return <div className="text-foreground text-left">{formatDate(row.original.created_at)}</div>;
            },
        },
        {
            accessorKey: 'label',
            header: 'Label',
            cell: ({ row }) => {
                const isNonJudol = row.original.true_label === 'non_judol';
                const isJudol = row.original.true_label === 'judol';

                return (
                    <Badge
                        className={`flex gap-1 px-1.5 whitespace-nowrap [&_svg]:size-3 ${isNonJudol ? 'text-[oklch(0.2178_0_0)]' : 'text-[oklch(1_0_0)]'}`}
                        style={{
                            backgroundColor: isJudol ? 'var(--chart-1)' : isNonJudol ? 'var(--chart-4)' : undefined,
                        }}
                    >
                        {isJudol && <CheckCircle2Icon className="text-[oklch(1_0_0)]" />}
                        {isNonJudol && <CheckCircle2Icon className="text-[oklch(0.2178_0_0)]" />}
                        {isJudol ? 'Judi Online' : isNonJudol ? 'Bukan Judi' : row.original.true_label}
                    </Badge>
                );
            },
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
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex w-full justify-center gap-2 md:order-2 md:justify-end">
                        <div className="flex-1 md:flex-none">
                            <DialogFilterDataset isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
                        </div>

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

                    <Input placeholder="Cari komentar atau label (judol/non_judol)..." value={searchValue} onChange={handleSearchChange} className="max-w-sm md:order-1" />
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

                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        Menampilkan {Math.min(pageIndex * perPage + 1, totalItems)} sampai {Math.min((pageIndex + 1) * perPage, totalItems)} dari {totalItems} hasil
                        {searchValue && <span className="ml-1">untuk "{searchValue}"</span>}
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
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

                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Halaman {pageIndex + 1} dari {totalPages}
                        </div>

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
