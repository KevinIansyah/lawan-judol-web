import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Analysis } from '@/types';
import { CheckCircle2Icon, CircleX, LoaderIcon, Youtube } from 'lucide-react';
import { Badge } from './ui/badge';

interface VideoMetadataProps {
    analysis: Analysis;
}

export default function VideoMetadata({ analysis }: VideoMetadataProps) {
    return (
        <Table>
            <TableBody>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Judul</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">
                        {analysis.video.title}
                    </TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Channel</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">
                        {analysis.video.channel_title}
                    </TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Tanggal Rilis</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">
                        {formatDate(analysis.video.published_at)}
                    </TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Thumbnail</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">
                        <a href={analysis.video.youtube_url} target="_blank">
                            <img
                                src={analysis.video.thumbnail}
                                alt={analysis.video.title}
                                className="h-auto w-full rounded object-cover"
                            />
                        </a>
                    </TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                    <TableCell className="font-semibold">Status</TableCell>
                    <TableCell className="text-muted-foreground break-words whitespace-normal">
                        <Badge
                            variant="outline"
                            className="text-muted-foreground flex gap-1 px-1.5 [&_svg]:size-3"
                        >
                            {analysis.status === 'success' && (
                                <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
                            )}
                            {analysis.status === 'on_process' && (
                                <LoaderIcon className="animate-spin text-yellow-500 dark:text-yellow-400" />
                            )}
                            {analysis.status === 'failed' && (
                                <CircleX className="text-red-500 dark:text-red-400" />
                            )}
                            {analysis.status === 'queue' && (
                                <LoaderIcon className="text-muted-foreground" />
                            )}
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
                        <Badge
                            variant="outline"
                            className="text-muted-foreground flex gap-1 px-1.5 [&_svg]:size-3"
                        >
                            <Youtube className="text-muted-foreground" />
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
                    <TableCell className="text-muted-foreground break-words whitespace-normal">
                        {formatDate(analysis.created_at)}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}
