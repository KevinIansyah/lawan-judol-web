/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { getUserFriendlyError } from '@/lib/utils';
import {
    ApiResponseAnalysis,
    ApiResponseComment,
    ApiResponseVideo,
    MergedVideoData,
} from '@/types';
import { router } from '@inertiajs/react';
import { AlertCircle, Loader2, Play, PlusIcon, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DialogPublicVideo() {
    const [videoId, setVideoId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'network' | 'server' | 'validation' | null>(null);
    const [loadingVideo, setLoadingVideo] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleProceed = (): void => {
        setError(null);
        setErrorType(null);
        setLoadingVideo(true);
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
                const errorResponse = await response.json().catch(() => ({}));
                const friendlyError = getUserFriendlyError(errorResponse.message, response.status);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
                return;
            }

            const videoData: ApiResponseVideo = await response.json();

            if (videoData.success) {
                setLoadingComments(true);
                fetchComments(videoData);
            } else {
                const friendlyError = getUserFriendlyError(videoData.message);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
            }
        } catch (err) {
            console.log(err);
            console.error('Error fetching video:', err);
            const friendlyError = getUserFriendlyError(err);
            setError(friendlyError.message);
            setErrorType(friendlyError.type);
        } finally {
            setLoadingVideo(false);
        }
    };

    const fetchComments = async (videoData: ApiResponseVideo): Promise<void> => {
        try {
            const params = new URLSearchParams();
            params.append('video_id', videoId);

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const response = await fetch(`/video/comment?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorResponse = await response.json().catch(() => ({}));
                const friendlyError = getUserFriendlyError(errorResponse.message, response.status);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
                return;
            }

            const commentData: ApiResponseComment = await response.json();

            if (commentData.success && videoData.video) {
                const mergedData = {
                    video_id: videoData.video.video_id,
                    title: videoData.video.title,
                    description: videoData.video.description,
                    published_at: videoData.video.published_at,
                    thumbnail: videoData.video.thumbnail,
                    channel_title: videoData.video.channel_title,
                    youtube_url: videoData.video.youtube_url,
                    comments_path: commentData.comments,
                    comments_total: commentData.total,
                };

                setLoadingAnalysis(true);
                fetchAnalysis(mergedData);
            } else {
                const friendlyError = getUserFriendlyError(commentData.message);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
            const friendlyError = getUserFriendlyError(err);
            setError(friendlyError.message);
            setErrorType(friendlyError.type);
        } finally {
            setLoadingComments(false);
        }
    };

    const fetchAnalysis = async (mergedData: MergedVideoData): Promise<void> => {
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const response = await fetch(`/analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                body: JSON.stringify({
                    data: {
                        mergedData,
                        type: 'public',
                    },
                }),
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorResponse = await response.json().catch(() => ({}));
                const friendlyError = getUserFriendlyError(errorResponse.message, response.status);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
                return;
            }

            const analysisData: ApiResponseAnalysis = await response.json();

            if (analysisData.success) {
                setVideoId('');
                setIsOpen(false);

                router.reload();

                toast('Analisis berhasil ditambahkan!', {
                    description: 'Video telah masuk ke antrean analisis dan akan diproses segera.',
                });
            } else {
                const friendlyError = getUserFriendlyError(analysisData.message);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
            }
        } catch (err) {
            console.error('Error fetching analysis:', err);
            const friendlyError = getUserFriendlyError(err);
            setError(friendlyError.message);
            setErrorType(friendlyError.type);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    const resetForm = () => {
        setVideoId('');
        setError(null);
        setErrorType(null);
        setLoadingVideo(false);
        setLoadingComments(false);
        setLoadingAnalysis(false);
    };

    const getErrorIcon = () => {
        switch (errorType) {
            case 'network':
                return <WifiOff className="text-primary h-8 w-8" />;
            default:
                return <AlertCircle className="text-primary h-8 w-8" />;
        }
    };

    const getRetryButtonText = () => {
        switch (errorType) {
            case 'network':
                return 'Periksa Koneksi & Coba Lagi';
            default:
                return 'Coba Lagi';
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) {
                    resetForm();
                }
            }}
        >
            <form>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <PlusIcon />
                        <span className="hidden lg:inline">Tambah Analisis</span>
                        <span className="lg:hidden">Analisis</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="flex min-h-[50vh] flex-col overflow-hidden sm:max-w-[425px] md:min-h-[40vh] lg:min-h-[45vh] xl:min-h-[65vh]">
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
                    {loadingVideo ? (
                        <div className="flex flex-1 items-center overflow-hidden">
                            <div className="flex w-full flex-col items-center justify-center">
                                <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
                                <p className="text-center font-medium">
                                    Memeriksa ketersediaan video...
                                </p>
                                <p className="text-muted-foreground mt-1 text-center text-sm">
                                    Mohon tunggu, proses ini mungkin memerlukan beberapa saat.
                                </p>
                            </div>
                        </div>
                    ) : loadingComments ? (
                        <div className="flex flex-1 items-center overflow-hidden">
                            <div className="flex w-full flex-col items-center justify-center">
                                <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
                                <p className="text-center font-medium">
                                    Mengambil data komentar dari YouTube...
                                </p>
                                <p className="text-muted-foreground mt-1 text-center text-sm">
                                    Mohon tunggu, sistem sedang memuat komentar.
                                </p>
                            </div>
                        </div>
                    ) : loadingAnalysis ? (
                        <div className="flex flex-1 items-center overflow-hidden">
                            <div className="flex w-full flex-col items-center justify-center">
                                <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
                                <p className="text-center font-medium">
                                    Menambahkan analisis ke dalam antrean...
                                </p>
                                <p className="text-muted-foreground mt-1 text-center text-sm">
                                    Mohon tunggu, permintaan Anda sedang diproses.
                                </p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-1 items-center overflow-hidden">
                            <div className="flex w-full flex-col items-center justify-center text-center">
                                <div className="mb-4">{getErrorIcon()}</div>
                                <div className="space-y-2">
                                    <p className="font-medium">Oops! Ada masalah</p>
                                    <p className="text-muted-foreground max-w-sm text-sm">
                                        {error}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="mt-6"
                                    onClick={() => resetForm()}
                                >
                                    {getRetryButtonText()}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden">
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
                        </div>
                    )}
                    <DialogFooter className="border-t pt-4">
                        <div className="flex w-full justify-end">
                            <Button
                                onClick={handleProceed}
                                disabled={
                                    !videoId.trim() ||
                                    loadingVideo ||
                                    loadingComments ||
                                    loadingAnalysis ||
                                    !!error
                                }
                                className="flex items-center gap-2"
                            >
                                <Play className="h-4 w-4" />
                                Analisis Video
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
