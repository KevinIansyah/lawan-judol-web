import { Keyword } from '@/lib/schemas/keyword-schema';
import { ArrowUpFromLine, CircleCheck, CircleX, Copy, RotateCcw, Save } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export default function Keyword1({ data: initialData }: { data: Keyword[] }) {
    const [data, setData] = React.useState<Keyword[]>(() => initialData);
    const [originalData] = React.useState<Keyword[]>(() => initialData);

    const toggleLabel = (id: number) => {
        setData((prevData) => prevData.map((item) => (item.id === id ? { ...item, label: item.label === 1 ? 0 : 1 } : item)));
    };

    const handleCopy = () => {
        const copiedText = data
            .filter((item) => item.label === 1)
            .map((item) => item.keyword)
            .join(', ');
        navigator.clipboard.writeText(copiedText);
        toast('Kata kunci berhasil disalin!', {
            description: 'Semua kata kunci dengan label aktif telah disalin ke clipboard.',
        });
    };

    const handleReset = () => {
        setData(originalData); // Kembalikan ke data awal
        toast('Kata kunci berhasil direset!', {
            description: 'Semua perubahan label telah dikembalikan ke kondisi semula.',
            duration: Infinity,
        });
    };

    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 rounded-xl border p-4">
            <div className="mb-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleCopy}>
                    Salin
                    <Copy className="ml-1 size-4" />
                </Button>
                <Button variant="outline" onClick={handleReset}>
                    Reset
                    <RotateCcw className="ml-1 size-4" />
                </Button>
                <Button variant="outline">
                    Simpan
                    <Save className="ml-1 size-4" />
                </Button>
                <Button variant="outline">
                    Unggah
                    <ArrowUpFromLine className="ml-1 size-4" />
                </Button>
            </div>

            {/* <div className="flex flex-wrap gap-2">
                {data.map((item) => (
                    <Badge key={item.id} variant="outline" className={`flex items-center border px-2.5 py-0 pr-0 pl-2 text-xs font-medium ${item.label === 1 ? 'border-[var(--secondary)] bg-[var(--secondary)] dark:text-white' : 'border-[hsl(0,72.2%,50.6%)] bg-[hsl(0,72.2%,50.6%)] text-white'}`}>
                        {item.keyword}
                        <Button variant="link" size="icon" className="ml-2" onClick={() => toggleLabel(item.id)}>
                            {item.label === 1 ? <CircleX /> : <CircleCheck className="text-white" />}
                        </Button>
                    </Badge>
                ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
                {data.map((item) => (
                    <Badge key={item.id} variant="outline" className={`flex items-center border px-2.5 py-0 pr-0 pl-2 text-xs font-medium ${item.label === 1 ? 'border-[var(--secondary)] bg-[var(--secondary)] dark:text-white' : 'border-[hsl(0,72.2%,50.6%)] bg-red-600 text-white'}`}>
                        {item.keyword}
                        <Button variant="link" size="icon" className="ml-2" onClick={() => toggleLabel(item.id)}>
                            {item.label === 1 ? <CircleX /> : <CircleCheck className="text-white" />}
                        </Button>
                    </Badge>
                ))}
            </div> */}
            <div className="mt-4 flex flex-wrap gap-2">
                {data.map((item) => (
                    <Badge key={item.id} variant={item.label === 1 ? 'secondary' : 'destructive'} className="py-0">
                        {item.keyword}
                        <Button variant="link" size="icon" className="ml-2" onClick={() => toggleLabel(item.id)}>
                            {item.label === 1 ? <CircleX className="dark:text-white" /> : <CircleCheck className="text-white" />}
                        </Button>
                    </Badge>
                ))}
            </div>
        </div>
    );
}
