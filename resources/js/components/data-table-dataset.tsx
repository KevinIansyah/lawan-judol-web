import { DatePicker } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePreventScroll } from '@/hooks/use-prevent-scroll';
import { formatDate } from '@/lib/utils';
import { Dataset } from '@/types';
import { router } from '@inertiajs/react';
import {
    ColumnDef,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
    CheckCircle2Icon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    ColumnsIcon,
    Download,
    Filter,
    MoreVerticalIcon,
    SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

dayjs.extend(relativeTime);
dayjs.locale('id');

type DataTableProps = {
    data: Dataset[];
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    totalItems: number;
    perPage: number;
    initialFilters?: {
        search?: string;
    };
};

export default function DataTableDataset({
    data,
    pageIndex,
    setPageIndex,
    totalPages,
    totalItems,
    perPage,
    initialFilters = {},
}: DataTableProps) {
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    usePreventScroll(isDialogOpen);

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
            accessorKey: 'tanggal ditambahkan',
            header: 'Tanggal Ditambahkan',
            cell: ({ row }) => {
                return (
                    <div className="text-foreground text-left">
                        {formatDate(row.original.created_at)}
                    </div>
                );
            },
        },
        {
            accessorKey: 'label',
            header: 'Label',
            cell: ({ row }) => (
                <Badge
                    className={`flex gap-1 px-1.5 whitespace-nowrap [&_svg]:size-3 ${
                        ['non_judol'].includes(row.original.true_label)
                            ? 'text-[oklch(0.2178_0_0)]'
                            : 'text-[oklch(1_0_0)]'
                    }`}
                    style={{
                        backgroundColor:
                            row.original.true_label === 'judol'
                                ? 'var(--chart-1)'
                                : row.original.true_label === 'non_judol'
                                  ? 'var(--chart-4)'
                                  : undefined,
                    }}
                >
                    {row.original.true_label === 'judol' && (
                        <CheckCircle2Icon className="text-[oklch(1_0_0)]" />
                    )}
                    {row.original.true_label === 'non_judol' && (
                        <CheckCircle2Icon className="text-[oklch(0.2178_0_0)]" />
                    )}
                    {
                        {
                            judol: 'Judi Online',
                            non_judol: 'Bukan Judi',
                        }[row.original.true_label]
                    }
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: () => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="text-muted-foreground data-[state=open]:bg-primary flex size-8 data-[state=open]:text-white"
                            size="icon"
                        >
                            <MoreVerticalIcon />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem>Ulang</DropdownMenuItem>
                        <DropdownMenuItem>Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const getSearchFromUrl = () => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('search') || '';
        }
        return '';
    };

    const [searchValue, setSearchValue] = useState(() => {
        const urlSearch = getSearchFromUrl();
        return urlSearch || initialFilters.search || '';
    });

    useEffect(() => {
        const urlSearch = getSearchFromUrl();
        const newSearchValue = urlSearch || initialFilters.search || '';
        setSearchValue(newSearchValue);
    }, [initialFilters.search]);

    const buildUrlWithParams = (params: Record<string, string | number | undefined>) => {
        const currentUrl = new URL(window.location.href);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                currentUrl.searchParams.set(key, value.toString());
            } else {
                currentUrl.searchParams.delete(key);
            }
        });

        return currentUrl.toString();
    };

    const debouncedSearch = useDebouncedCallback((searchTerm: string) => {
        const url = buildUrlWithParams({
            search: searchTerm || undefined,
            page: 1,
        });

        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            only: ['datasets'],
        });
    }, 500);

    const goToPage = (page: number) => {
        const newPage = Math.max(0, Math.min(page, totalPages - 1));
        setPageIndex(newPage);

        const url = buildUrlWithParams({
            page: newPage + 1,
            search: getSearchFromUrl(),
        });
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            only: ['datasets'],
        });
    };

    const changePageSize = (newPerPage: number) => {
        const currentSearch = getSearchFromUrl();
        const url = buildUrlWithParams({
            per_page: newPerPage,
            page: 1,
            search: currentSearch || undefined,
        });

        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            only: ['datasets'],
        });
    };

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

    const canPreviousPage = pageIndex > 0;
    const canNextPage = pageIndex < totalPages - 1;

    return (
        <div className="flex w-full flex-col justify-start gap-4">
            <div className="relative flex flex-col gap-4 overflow-auto">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="flex w-full justify-center gap-2 md:order-2 md:justify-end">
                        <div className="flex-1 md:flex-none">
                            <Dialog
                                modal={false}
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <SlidersHorizontal />
                                        Filter atau Unduh
                                    </Button>
                                </DialogTrigger>

                                {isDialogOpen && (
                                    <div
                                        className="animate-in fade-in-0 fixed inset-0 z-50 bg-black/80"
                                        onClick={() => setIsDialogOpen(false)}
                                    />
                                )}

                                <DialogContent className="flex min-h-[50vh] flex-col overflow-hidden md:min-h-[40vh] lg:min-h-[45vh] xl:min-h-[65vh]">
                                    <DialogTitle>Tindakan Moderasi Komentar</DialogTitle>
                                    <DialogDescription>
                                        Komentar yang telah Anda pilih akan diproses dan dilakukan
                                        moderasi.
                                    </DialogDescription>

                                    <div className="flex-1 space-y-4 overflow-hidden">
                                        <div className="grid w-full gap-3">
                                            <Label htmlFor="start-date">Tanggal Ditambahkan</Label>
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                <DatePicker
                                                    placeholder="Pilih tanggal awal"
                                                    value={startDate}
                                                    onChange={setStartDate}
                                                    id="start-date"
                                                />
                                                <DatePicker
                                                    placeholder="Pilih tanggal akhir"
                                                    value={endDate}
                                                    onChange={setEndDate}
                                                    id="end-date"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid w-full gap-3">
                                            <Label htmlFor="start-date">Label</Label>
                                            <RadioGroup
                                                defaultValue="option-one"
                                                className="grid grid-cols-1 gap-3 md:grid-cols-2"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="judol" id="judol" />
                                                    <Label htmlFor="option-one">Judi Online</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="non_judol"
                                                        id="non_judol"
                                                    />
                                                    <Label htmlFor="option-two">Bukan Judi</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>

                                    <DialogFooter className="border-t pt-4">
                                        <div className="flex w-full justify-end gap-2">
                                            <Button className="flex items-center gap-2">
                                                <Filter className="h-4 w-4" />
                                                Filter
                                            </Button>
                                            <Button className="flex items-center gap-2">
                                                <Download className="h-4 w-4" />
                                                Unduh
                                            </Button>
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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
                            </DropdownMenu>
                        </div>
                    </div>

                    <Input
                        placeholder="Cari komentar..."
                        value={searchValue}
                        onChange={handleSearchChange}
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
                        <TableBody>
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
                                        {searchValue
                                            ? 'Tidak ada hasil yang ditemukan.'
                                            : 'Tidak ada data.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        Menampilkan {Math.min(pageIndex * perPage + 1, totalItems)} sampai{' '}
                        {Math.min((pageIndex + 1) * perPage, totalItems)} dari {totalItems} hasil
                        {searchValue && <span className="ml-1">untuk "{searchValue}"</span>}
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Baris per halaman
                            </Label>
                            <Select
                                value={`${perPage}`}
                                onValueChange={(value) => changePageSize(Number(value))}
                            >
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
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => goToPage(0)}
                                disabled={!canPreviousPage}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeftIcon />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => goToPage(pageIndex - 1)}
                                disabled={!canPreviousPage}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeftIcon />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => goToPage(pageIndex + 1)}
                                disabled={!canNextPage}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRightIcon />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => goToPage(totalPages - 1)}
                                disabled={!canNextPage}
                            >
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
