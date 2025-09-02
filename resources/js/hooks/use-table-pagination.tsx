import { router } from '@inertiajs/react';
import { useDebouncedCallback } from 'use-debounce';

interface UsePaginationProps {
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    getSearchFromUrl: () => string;
    onlyFields?: string[];
}

export const useTablePagination = ({ pageIndex, setPageIndex, totalPages, getSearchFromUrl, onlyFields = ['analyses'] }: UsePaginationProps) => {
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
            only: onlyFields,
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
            only: onlyFields,
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
            only: onlyFields,
        });
    };

    const canPreviousPage = pageIndex > 0;
    const canNextPage = pageIndex < totalPages - 1;

    return {
        debouncedSearch,
        goToPage,
        changePageSize,
        canPreviousPage,
        canNextPage,
        buildUrlWithParams,
    };
};
