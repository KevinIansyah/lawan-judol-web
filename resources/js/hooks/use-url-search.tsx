import { useEffect, useState } from 'react';

export const useUrlSearch = (initialSearch?: string) => {
    const getSearchFromUrl = () => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('search') || '';
        }
        return '';
    };

    const [searchValue, setSearchValue] = useState(() => {
        const urlSearch = getSearchFromUrl();
        return urlSearch || initialSearch || '';
    });

    useEffect(() => {
        const urlSearch = getSearchFromUrl();
        const newSearchValue = urlSearch || initialSearch || '';
        setSearchValue(newSearchValue);
    }, [initialSearch]);

    return { searchValue, setSearchValue, getSearchFromUrl };
};
