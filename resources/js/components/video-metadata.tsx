import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Analysis } from '@/types';
import { CheckCircle2Icon, CircleX, LoaderIcon, Youtube } from 'lucide-react';

interface VideoMetadataProps {
    analysis: Analysis;
}

export default function VideoMetadata({ analysis }: VideoMetadataProps) {
    return (
        <Table>
            <TableBody>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Judul</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">{analysis.video.title}</TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Channel</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">{analysis.video.channel_title}</TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Tanggal Rilis</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">{formatDate(analysis.video.published_at)}</TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Thumbnail</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">
                        <a href={analysis.video.youtube_url} target="_blank">
                            <img src={analysis.video.thumbnail} alt={analysis.video.title} className="h-auto w-full rounded object-cover" />
                        </a>
                    </TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Status</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">
                        <Badge
                            className={`flex gap-1 px-1.5 [&_svg]:size-3 ${['success', 'on_process'].includes(analysis.status) ? 'text-black' : 'text-white'}`}
                            style={{
                                backgroundColor: analysis.status === 'success' ? 'var(--chart-4)' : analysis.status === 'on_process' ? 'var(--chart-3)' : analysis.status === 'failed' ? 'var(--chart-1)' : analysis.status === 'queue' ? 'var(--muted)' : undefined,
                            }}
                        >
                            {analysis.status === 'success' && <CheckCircle2Icon className="text-black" />}
                            {analysis.status === 'on_process' && <LoaderIcon className="animate-spin text-black" />}
                            {analysis.status === 'failed' && <CircleX className="text-white" />}
                            {analysis.status === 'queue' && <LoaderIcon className="text-white" />}
                            {
                                {
                                    success: 'Selesai',
                                    on_process: 'Sedang Diproses',
                                    failed: 'Gagal',
                                    queue: 'Antrian',
                                }[analysis.status]
                            }
                        </Badge>
                    </TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Tipe</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">
                        <Badge style={{ backgroundColor: 'var(--muted)' }} className="flex gap-1 px-1.5 text-white [&_svg]:size-3">
                            <Youtube className="text-white" />
                            {
                                {
                                    your: 'Video Anda',
                                    public: 'Video Publik',
                                }[analysis.type]
                            }
                        </Badge>
                    </TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Tanggal Analisis</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">{formatDate(analysis.created_at)}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}
