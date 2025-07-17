import KeywordBadge from '@/components/keyword-badge';
import { Keyword } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

type KeywordListProps = {
    data: Keyword[];
    ActionButtons?: (utils: {
        onCopy: () => void;
        onReset: () => void;
        onSave: () => void;
        onUpload: () => void;
        onFilter: () => void;
    }) => React.ReactNode;
};

export default function KeywordList({ data: initialData, ActionButtons }: KeywordListProps) {
    const [data, setData] = useState<Keyword[]>(() => initialData);
    const [originalData] = useState<Keyword[]>(() => initialData);

    const toggleLabel = (id: number) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, label: item.label === 1 ? 0 : 1 } : item,
            ),
        );
    };

    const handleCopy = () => {
        const copiedText = data
            .filter((item) => item.label === 1)
            .map((item) => item.keyword)
            .join(', ');
        navigator.clipboard.writeText(copiedText);
        toast('Berhasil', {
            description: 'Semua kata kunci dengan label aktif telah disalin ke clipboard.',
        });
    };

    const handleReset = () => {
        setData(originalData);
        toast('Berhasil', {
            description: 'Semua perubahan label telah dikembalikan ke kondisi semula.',
        });
    };

    const handleSave = () => {
        // setData(originalData);
    };

    const handleUpload = () => {
        // setData(originalData);
    };

    const handleFilter = () => {
        // setData(originalData);
    };

    return (
        <div className="rounded-xl border p-4">
            <div className="mb-4 flex flex-wrap gap-2">
                {ActionButtons?.({
                    onCopy: handleCopy,
                    onReset: handleReset,
                    onSave: handleSave,
                    onUpload: handleUpload,
                    onFilter: handleFilter,
                })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {data.map((item) => (
                    <KeywordBadge key={item.id} item={item} onToggle={() => toggleLabel(item.id)} />
                ))}
            </div>
        </div>
    );
}
