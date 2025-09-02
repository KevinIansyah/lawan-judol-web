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
        const selectedKeywords = data.filter((item) => item.label === 0);

        if (selectedKeywords.length === 0) {
            toast.warning('Peringatan', {
                description: 'Tidak ada kata kunci yang dipilih untuk diunggah.',
            });
            return;
        }

        console.log('Keywords to save:', selectedKeywords);
    };

    const handleUpload = () => {
        // Filter keyword yang labelnya 1
        const selectedKeywords = data.filter((item) => item.label === 1);

        if (selectedKeywords.length === 0) {
            toast.warning('Peringatan', {
                description: 'Tidak ada kata kunci yang dipilih untuk diunggah.',
            });
            return;
        }

        // Di sini Anda bisa melakukan proses upload
        console.log('Keywords to upload:', selectedKeywords);

        // Contoh: kirim ke API
        // try {
        //     const response = await fetch('/api/keywords/upload', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             keywords: selectedKeywords
        //         }),
        //     });
        //
        //     if (response.ok) {
        //         toast('Berhasil', {
        //             description: `${selectedKeywords.length} kata kunci berhasil diunggah ke kamus.`,
        //         });
        //     } else {
        //         throw new Error('Upload failed');
        //     }
        // } catch (error) {
        //     toast('Error', {
        //         description: 'Gagal mengunggah kata kunci ke kamus.',
        //     });
        // }

        // Untuk demo, tampilkan toast dengan jumlah keyword yang akan diunggah
        toast('Berhasil', {
            description: `${selectedKeywords.length} kata kunci berhasil diunggah ke kamus.`,
        });
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
