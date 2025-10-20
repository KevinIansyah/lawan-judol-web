import DataTableUser from '@/components/data-table-user';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { Paginator, User, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengguna',
        href: '/users',
    },
];

export default function Users() {
    const { users } = usePage<{ users: Paginator<User> }>().props;
    const { data, current_page, last_page, per_page, total } = users;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    useEffect(() => {
        setPageIndex(current_page - 1);
    }, [current_page]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengguna" />
            <div className="flex h-full flex-1 flex-col rounded-xl px-4 py-6">
                <Heading title="Daftar Pengguna" description="Lihat daftar pengguna yang menggunakan aplikasi LawanJudol." />
                <DataTableUser data={data} pageIndex={pageIndex} setPageIndex={setPageIndex} totalPages={last_page} totalItems={total} perPage={per_page} />
            </div>
        </AppLayout>
    );
}
