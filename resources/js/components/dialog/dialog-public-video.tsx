import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiResponseVideo } from '@/types';
import { Loader2, Play, PlusIcon } from 'lucide-react';
import { useState } from 'react';

export function DialogPublicVideo() {
    const [videoId, setVideoId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loadingVideoCheck, setLoadingVideoCheck] = useState(false);
    // const [loadingComments, setLoadingComments] = useState(false);

    const handleProceed = (): void => {
        setLoadingVideoCheck(true);
        fetchVideo();
    };

    const fetchVideo = async (): Promise<void> => {
        try {
            const params = new URLSearchParams();
            params.append('video_id', videoId);

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const response = await fetch(`/video?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponseVideo = await response.json();

            if (data.success) {
                console.log(data);
            } else {
                setError(data.message || 'Failed to fetch videos');
                console.log(error);
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Network error. Please try again.';
            setError(errorMessage);
            console.error('Error fetching videos:', err);
        } finally {
            setLoadingVideoCheck(false);
        }
    };

    const fetchComments = async (): Promise<void> => {};

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <PlusIcon />
                        <span className="hidden lg:inline">Tambah Analisis</span>
                        <span className="lg:hidden">Analisis</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Analisis Video</DialogTitle>
                        <DialogDescription>
                            Masukkan ID video YouTube yang ingin dianalisis. Pelajari cara menemukan
                            ID video{' '}
                            <a
                                href="https://support.google.com/youtube/answer/171780?hl=id"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                            >
                                di sini!
                            </a>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        {loadingVideoCheck ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />

                                <p className="text-center font-medium">
                                    Memeriksa apakah video tersedia...
                                </p>
                                <p className="text-muted-foreground mt-1 text-center text-sm">
                                    Mohon tunggu, ini mungkin memakan waktu beberapa saat
                                </p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="text-center text-red-500">
                                    <p className="font-medium">Terjadi kesalahan</p>
                                    <p className="mt-1 text-sm">{error}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => {
                                        setLoadingVideoCheck(false);
                                        setError(null);
                                        setVideoId('');
                                    }}
                                >
                                    Coba Lagi
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                <Label htmlFor="video-id">ID Video Youtube</Label>
                                <Input
                                    id="video-id"
                                    name="video_id"
                                    placeholder="9UEFQ90AhE"
                                    onChange={(e) => setVideoId(e.target.value)}
                                    value={videoId}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleProceed}
                            disabled={!videoId.trim() || loadingVideoCheck || !!error}
                            className="flex items-center gap-2"
                        >
                            <Play className="h-4 w-4" />
                            Analisis Video
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
