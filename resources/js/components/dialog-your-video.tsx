import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDate, getErrorIcon, getRetryButtonText, getUserFriendlyError } from '@/lib/utils';
import { ApiResponseAnalysis, ApiResponseComment, ApiResponseVideos, MergeVideoData, SharedData, Video } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Check, Loader2, Play, PlusIcon, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DialogYourVideo() {
    const { auth } = usePage<SharedData>().props;
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loadingVideo, setLoadingVideo] = useState<boolean>(false);
    const [loadingComments, setLoadingComments] = useState<boolean>(false);
    const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'network' | 'server' | 'validation' | null>(null);
    const [hasInitialLoad, setHasInitialLoad] = useState<boolean>(false);

    const handleModalOpen = (): void => {
        setIsDialogOpen(true);

        if (!hasInitialLoad || videos.length === 0) {
            // console.log('First time opening dialog or no videos cached, fetching from API...');
            fetchVideos();
        } else {
            // console.log('Dialog reopened, using existing data (cached or previously loaded)');
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
        // console.log('Manual refresh requested, fetching fresh data from YouTube API...');
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

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/youtube/videos?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
            });

            const result = await response.json();

            if (result.quota_exceeded) {
                const friendlyError = getUserFriendlyError('Kuota YouTube Data API telah habis. Silakan coba lagi besok.');
                setError(friendlyError.message);
                setErrorType(friendlyError.type);

                return;
            }

            if (!response.ok) {
                const friendlyError = getUserFriendlyError(result.message, response.status);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);

                return;
            }

            const data: ApiResponseVideos = await result;

            if (data.success) {
                setVideos(data.videos);
                setHasInitialLoad(true);

                // console.log(`Videos loaded successfully`);
                // console.log(`Total videos: ${data.videos.length}`);
            } else {
                const friendlyError = getUserFriendlyError(data.message);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
            }
        } catch (err) {
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

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/youtube/comments?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                credentials: 'same-origin',
            });

            const result = await response.json();

            if (result.quota_exceeded) {
                const friendlyError = getUserFriendlyError('Kuota YouTube Data API telah habis. Silakan coba lagi besok.');
                setError(friendlyError.message);
                setErrorType(friendlyError.type);

                return;
            }

            if (!response.ok) {
                const friendlyError = getUserFriendlyError(result.message, response.status);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);

                return;
            }

            const commentData: ApiResponseComment = result;

            if (commentData.success) {
                const mergeData = {
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
                fetchAnalysis(mergeData);
            } else {
                const friendlyError = getUserFriendlyError(commentData.message);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
            }
        } catch (err) {
            const friendlyError = getUserFriendlyError(err);
            setError(friendlyError.message);
            setErrorType(friendlyError.type);
        } finally {
            setLoadingComments(false);
        }
    };

    const fetchAnalysis = async (mergeData: MergeVideoData): Promise<void> => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/analyses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                },
                body: JSON.stringify({
                    data: {
                        video: mergeData,
                        type: 'your',
                    },
                }),
                credentials: 'same-origin',
            });

            const result = await response.json();

            if (!response.ok) {
                const friendlyError = getUserFriendlyError(result.message, response.status);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);

                return;
            }

            const analysisData: ApiResponseAnalysis = result;

            if (analysisData.success) {
                setIsDialogOpen(false);
                router.reload();

                toast.success('Berhasil!', {
                    description: 'Video telah masuk ke antrean analisis dan akan diproses segera.',
                });
            } else {
                const friendlyError = getUserFriendlyError(analysisData.message);
                setError(friendlyError.message);
                setErrorType(friendlyError.type);
            }
        } catch (err) {
            const friendlyError = getUserFriendlyError(err);
            setError(friendlyError.message);
            setErrorType(friendlyError.type);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    return (
        <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
                setIsDialogOpen(open);
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
                <DialogTitle className="flex items-center justify-between">Analisis Video</DialogTitle>
                <DialogDescription>Pilih video YouTube Anda yang ingin dianalisis.</DialogDescription>

                <div className="flex-1 overflow-hidden">
                    {!auth.user.youtube_permission_granted ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4">{getErrorIcon(errorType)}</div>
                            <div className="space-y-2 text-center">
                                <p className="font-medium">Akses YouTube belum diberikan</p>
                                <p className="text-muted-foreground max-w-sm text-sm">Untuk melanjutkan, Anda perlu memberikan izin akses ke akun YouTube Anda terlebih dahulu.</p>
                            </div>
                            <Button variant="outline" className="mt-6" asChild>
                                <Link href="/settings/youtube-access">Berikan Akses</Link>
                            </Button>
                        </div>
                    ) : loadingVideo ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4">
                                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="font-medium">Memeriksa ketersediaan video</p>
                                <p className="text-muted-foreground max-w-sm text-sm">Mohon tunggu, proses ini mungkin memerlukan beberapa saat.</p>
                            </div>
                        </div>
                    ) : loadingComments ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4">
                                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="font-medium"> Mengambil data komentar dari YouTube</p>
                                <p className="text-muted-foreground max-w-sm text-sm">Mohon tunggu, sistem sedang memuat komentar.</p>
                            </div>
                        </div>
                    ) : loadingAnalysis ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4">
                                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="font-medium">Menambahkan analisis ke dalam antrean</p>
                                <p className="text-muted-foreground max-w-sm text-sm">Mohon tunggu, permintaan Anda sedang diproses.</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4">{getErrorIcon(errorType)}</div>
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
                                {getRetryButtonText(errorType)}
                            </Button>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="mb-4">{getErrorIcon(errorType)}</div>
                            <div className="space-y-2 text-center">
                                <p className="font-medium">Video tidak ditemukan</p>
                                <p className="text-muted-foreground max-w-sm text-sm">Pastikan Anda memiliki video di channel YouTube.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {videos.map((video) => (
                                    <div key={video.video_id} className="relative h-full cursor-pointer rounded-xl transition-all hover:shadow-lg" onClick={() => handleVideoSelect(video)}>
                                        <img src={video.thumbnail} alt={video.title} className="h-40 w-full rounded object-cover" />

                                        {selectedVideo?.video_id === video.video_id && (
                                            <div className="absolute inset-0 flex h-40 items-center justify-center rounded bg-black/80 text-white">
                                                <Check className="h-8 w-8" />
                                            </div>
                                        )}

                                        <div className="mt-2 flex items-start gap-2">
                                            <div>
                                                <p className="line-clamp-2 text-sm font-semibold">{video.title}</p>
                                                <span className="text-muted-foreground text-sm">{formatDate(video.published_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 border-t pt-4">
                    <Button variant="secondary" onClick={handleRefresh} disabled={refreshing || loadingVideo || loadingComments || loadingAnalysis || !!error} className="flex items-center gap-2">
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Memperbarui...' : 'Perbarui'}
                    </Button>

                    <Button onClick={handleProceed} disabled={!selectedVideo || loadingVideo || loadingComments || loadingAnalysis || refreshing || !!error} className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Analisis Video
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
