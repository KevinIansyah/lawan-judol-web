import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorIcon, getRetryButtonText, getUserFriendlyError } from '@/lib/utils';
import { ApiResponseAnalysis, ApiResponseComment, ApiResponseVideo, MergeVideoData, SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Loader2, Play, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DialogPublicVideo() {
    const { auth } = usePage<SharedData>().props;
    const [videoId, setVideoId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'network' | 'server' | 'validation' | null>(null);
    const [loadingVideo, setLoadingVideo] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleProceed = (): void => {
        setError(null);
        setErrorType(null);
        setLoadingVideo(true);
        fetchVideo();
    };

    const resetForm = () => {
        setVideoId('');
        setError(null);
        setErrorType(null);
        setLoadingVideo(false);
        setLoadingComments(false);
        setLoadingAnalysis(false);
    };

    const fetchVideo = async (): Promise<void> => {
        try {
            const params = new URLSearchParams();
            params.append('video_id', videoId);

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/youtube/video?${params.toString()}`, {
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

    const fetchAnalysis = async (mergedData: MergeVideoData): Promise<void> => {
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
                        video: mergedData,
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
            open={isDialogOpen}
            onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                    resetForm();
                }
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <PlusIcon />
                    <span className="hidden lg:inline">Tambah Analisis</span>
                    <span className="lg:hidden">Analisis</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="flex min-h-[50vh] flex-col overflow-hidden md:min-h-[40vh] lg:min-h-[45vh] xl:min-h-[65vh]">
                <DialogTitle>Analisis Video</DialogTitle>
                <DialogDescription>
                    Masukkan ID video YouTube yang ingin dianalisis. Pelajari cara menemukan ID video{' '}
                    <a href="https://support.google.com/youtube/answer/171780?hl=id" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        di sini!
                    </a>
                </DialogDescription>

                {!auth.user.youtube_permission_granted ? (
                    <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                        <div className="mb-4">{getErrorIcon(errorType)}</div>
                        <div className="space-y-2 text-center">
                            <p className="font-medium">Akses YouTube Belum Diberikan</p>
                            <p className="text-muted-foreground max-w-sm text-sm">Untuk melanjutkan, Anda perlu memberikan izin akses ke akun YouTube Anda terlebih dahulu.</p>
                        </div>
                        <Button variant="outline" className="mt-6" asChild>
                            <Link href="/settings/youtube-access">Berikan Akses</Link>
                        </Button>
                    </div>
                ) : loadingVideo ? (
                    <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                        <div className="mb-4">
                            <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                        </div>
                        <div className="space-y-2 text-center">
                            <p className="font-medium">Memeriksa ketersediaan video</p>
                            <p className="text-muted-foreground mt-1 text-sm">Mohon tunggu, proses ini mungkin memerlukan beberapa saat.</p>
                        </div>
                    </div>
                ) : loadingComments ? (
                    <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                        <div className="mb-4">
                            <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                        </div>
                        <div className="space-y-2 text-center">
                            <p className="font-medium">Mengambil data komentar dari YouTube</p>
                            <p className="text-muted-foreground mt-1 text-sm">Mohon tunggu, sistem sedang memuat komentar.</p>
                        </div>
                    </div>
                ) : loadingAnalysis ? (
                    <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                        <div className="mb-4">
                            <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
                        </div>
                        <div className="space-y-2 text-center">
                            <p className="font-medium">Menambahkan analisis ke dalam antrean</p>
                            <p className="text-muted-foreground mt-1 text-sm">Mohon tunggu, permintaan Anda sedang diproses.</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-1 flex-col items-center justify-center overflow-hidden">
                        <div className="mb-4">{getErrorIcon(errorType)}</div>
                        <div className="space-y-2 text-center">
                            <p className="font-medium">Oops! Ada masalah</p>
                            <p className="text-muted-foreground max-w-sm text-sm">{error}</p>
                        </div>
                        <Button variant="outline" className="mt-6" onClick={() => resetForm()}>
                            {getRetryButtonText(errorType)}
                        </Button>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden">
                        <div className="grid gap-3">
                            <Label htmlFor="video-id">ID Video Youtube</Label>
                            <Input id="video-id" name="video_id" placeholder="9UEFQ90AhE" onChange={(e) => setVideoId(e.target.value)} value={videoId} />
                        </div>
                    </div>
                )}
                <DialogFooter className="border-t pt-4">
                    <div className="flex w-full justify-end">
                        <Button onClick={handleProceed} disabled={!videoId.trim() || loadingVideo || loadingComments || loadingAnalysis || !!error} className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Analisis Video
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
