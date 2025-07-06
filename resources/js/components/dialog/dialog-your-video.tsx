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
import { formatDate, getUserFriendlyError } from '@/lib/utils';
import {
    ApiResponseAnalysis,
    ApiResponseComment,
    ApiResponseVideos,
    MergedVideoData,
    Video,
} from '@/types';
import { router } from '@inertiajs/react';
import { AlertCircle, Check, Loader2, Play, PlusIcon, RefreshCw, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DialogYourVideo() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loadingVideo, setLoadingVideo] = useState<boolean>(false);
    const [loadingComments, setLoadingComments] = useState<boolean>(false);
    const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'network' | 'server' | 'validation' | null>(null);
    const [hasInitialLoad, setHasInitialLoad] = useState<boolean>(false);

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

    const handleModalOpen = (): void => {
        setIsOpen(true);

        if (!hasInitialLoad || videos.length === 0) {
            console.log('First time opening dialog or no videos cached, fetching from API...');
            fetchVideos();
        } else {
            console.log('Dialog reopened, using existing data (cached or previously loaded)');
        }
    };

    const handleVideoSelect = (video: Video): void => {
        setSelectedVideo(video);
    };

    const handleProceed = (): void => {
        if (selectedVideo) {
            setLoadingComments(true);
            fetchComments(selectedVideo);
        }
    };

    const handleRefresh = (): void => {
        console.log('Manual refresh requested, fetching fresh data from YouTube API...');
        fetchVideos(true);
    };

    const resetForm = () => {
        setSelectedVideo(null);
        setError(null);
        setErrorType(null);
        setErrorType(null);
        setLoadingVideo(false);
        setLoadingComments(false);
        setLoadingAnalysis(false);
    };

    const fetchVideos = async (forceRefresh: boolean = false): Promise<void> => {
        if (forceRefresh) {
            setRefreshing(true);
        } else {
            setLoadingVideo(true);
        }

        setError(null);

        try {
            const params = new URLSearchParams();
            if (forceRefresh) {
                params.append('refresh', 'true');
            }

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const response = await fetch(`/video/all?${params.toString()}`, {
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

            const data: ApiResponseVideos = await response.json();

            if (data.success) {
                setVideos(data.videos);
                setHasInitialLoad(true);

                console.log(`Videos loaded successfully`);
                console.log(`Total videos: ${data.videos.length}`);
            } else {
                const friendlyError = getUserFriendlyError(data.message);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
            }
        } catch (err) {
            console.error('Error fetching videos:', err);
            const friendlyError = getUserFriendlyError(err);
            setError(friendlyError.message);
            setErrorType(friendlyError.type);
        } finally {
            setLoadingVideo(false);
            setRefreshing(false);
        }
    };

    const fetchComments = async (selectedVideo: Video): Promise<void> => {
        try {
            const videoId = selectedVideo.video_id;
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

            if (commentData.success) {
                const mergedData = {
                    video_id: selectedVideo.video_id,
                    title: selectedVideo.title,
                    description: selectedVideo.description,
                    published_at: selectedVideo.published_at,
                    thumbnail: selectedVideo.thumbnail,
                    channel_title: selectedVideo.channel_title,
                    youtube_url: selectedVideo.youtube_url,
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
                        type: 'your',
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
                setIsOpen(false);
                router.reload();

                toast.success('Analisis berhasil ditambahkan!', {
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
            <DialogTrigger asChild>
                <Button variant="outline" onClick={handleModalOpen} className="w-full">
                    <PlusIcon />
                    <span className="hidden lg:inline">Tambah Analisis</span>
                    <span className="lg:hidden">Analisis</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden sm:max-w-[calc(100vw-32px)] xl:max-w-6xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Analisis Video</span>
                    </DialogTitle>
                    <DialogDescription>
                        Pilih video YouTube Anda yang ingin dianalisis.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {loadingVideo ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                            <p className="text-center font-medium">
                                Memeriksa ketersediaan video...
                            </p>
                            <p className="text-muted-foreground mt-1 text-center text-sm">
                                Mohon tunggu, proses ini mungkin memerlukan beberapa saat.
                            </p>
                        </div>
                    ) : loadingComments ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                            <p className="text-center font-medium">
                                Mengambil data komentar dari YouTube...
                            </p>
                            <p className="text-muted-foreground mt-1 text-center text-sm">
                                Mohon tunggu, sistem sedang memuat komentar.
                            </p>
                        </div>
                    ) : loadingAnalysis ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                            <p className="text-center font-medium">
                                Menambahkan analisis ke dalam antrean...
                            </p>
                            <p className="text-muted-foreground mt-1 text-center text-sm">
                                Mohon tunggu, permintaan Anda sedang diproses.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4">{getErrorIcon()}</div>
                            <div className="space-y-2 text-center">
                                <p className="font-medium">Oops! Ada masalah</p>
                                <p className="text-muted-foreground max-w-sm text-sm">{error}</p>
                            </div>
                            <Button
                                variant="outline"
                                className="mt-6"
                                onClick={() => {
                                    resetForm();
                                    fetchVideos();
                                }}
                            >
                                {getRetryButtonText()}
                            </Button>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="font-medium">Tidak ada video ditemukan</p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Pastikan Anda memiliki video di channel YouTube
                            </p>
                        </div>
                    ) : (
                        <div
                            className="overflow-y-auto pr-2"
                            style={{ maxHeight: 'calc(80vh - 200px)' }}
                        >
                            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {videos.map((video) => (
                                    <div
                                        key={video.video_id}
                                        className="relative h-full cursor-pointer rounded-xl transition-all hover:shadow-lg"
                                        onClick={() => handleVideoSelect(video)}
                                    >
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="h-40 w-full rounded object-cover"
                                        />

                                        {selectedVideo?.video_id === video.video_id && (
                                            <div className="absolute inset-0 flex h-40 items-center justify-center rounded bg-black/80 text-white">
                                                <Check className="h-8 w-8" />
                                            </div>
                                        )}

                                        <div className="mt-2 flex items-start gap-2">
                                            <div>
                                                <p className="line-clamp-2 text-sm font-semibold">
                                                    {video.title}
                                                </p>
                                                <span className="text-muted-foreground text-sm">
                                                    {formatDate(video.published_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    <div className="flex w-full justify-between">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={
                                refreshing ||
                                loadingVideo ||
                                loadingComments ||
                                loadingAnalysis ||
                                !!error
                            }
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Memperbarui...' : 'Perbarui'}
                        </Button>

                        <Button
                            onClick={handleProceed}
                            disabled={
                                !selectedVideo ||
                                loadingVideo ||
                                loadingComments ||
                                loadingAnalysis ||
                                refreshing ||
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
        </Dialog>
    );
}
