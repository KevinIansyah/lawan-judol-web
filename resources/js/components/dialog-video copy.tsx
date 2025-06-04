import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInitials } from '@/hooks/use-initials';
import { ApiResponse, ChannelInfo, SharedData, Video } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Loader2, Play, PlusIcon, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function DialogVideo() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
    const [fromCache, setFromCache] = useState<boolean>(false);

    // Fetch videos when modal opens
    const fetchVideos = async (forceRefresh: boolean = false): Promise<void> => {
        if (forceRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError(null);

        try {
            const params = new URLSearchParams();
            if (forceRefresh) {
                params.append('refresh', 'true');
            }

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch(`/api/videos/all?${params.toString()}`, {
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

            const data: ApiResponse = await response.json();

            if (data.success) {
                setVideos(data.videos);
                setChannelInfo(data.channel_info);
                setFromCache(data.from_cache);
                console.log(data.videos);
                console.log(data.channel_info);
            } else {
                setError(data.message || 'Failed to fetch videos');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Network error. Please try again.';
            setError(errorMessage);
            console.error('Error fetching videos:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Handle modal open
    const handleModalOpen = (): void => {
        setIsOpen(true);
        // Only fetch if we don't have videos yet
        if (videos.length === 0) {
            fetchVideos();
        }
    };

    // Handle video selection
    const handleVideoSelect = (video: Video): void => {
        setSelectedVideo(video);
    };

    // Handle proceed with selected video
    const handleProceed = (): void => {
        if (selectedVideo) {
            // Navigate to analysis page with selected video
            router.visit(`/analysis/${selectedVideo.video_id}`, {
                method: 'get',
                data: {
                    title: selectedVideo.title,
                    thumbnail: selectedVideo.thumbnail,
                },
                // Preserve current state to avoid refetching
                preserveState: true,
                preserveScroll: true,
            });
            setIsOpen(false);
        }
    };

    // Format date
    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Format numbers
    const formatNumber = (num: number | undefined): string => {
        if (!num) return '0';

        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={handleModalOpen}>
                    <PlusIcon />
                    <span className="hidden lg:inline">Tambah Analisis</span>
                    <span className="lg:hidden">Analisis</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden sm:max-w-[calc(100vw-32px)] xl:max-w-6xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Pilih Video</span>
                        {fromCache && !loading && !refreshing && <span className="text-sm font-normal text-green-600">Data dari cache</span>}
                    </DialogTitle>
                    <DialogDescription>Pilih salah satu video YouTube Anda yang ingin dianalisis. Kami akan mendeteksi dan menandai komentar promosi judi online secara otomatis.</DialogDescription>

                    {/* {channelInfo && (
                        <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{formatNumber(channelInfo.subscriber_count)} subscriber</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Play className="h-4 w-4" />
                                <span>{formatNumber(channelInfo.video_count)} video</span>
                            </div>
                        </div>
                    )} */}
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
                            <p className="font-medium">Mengambil video dari YouTube...</p>
                            <p className="text-muted-foreground mt-1 text-sm">Mohon tunggu, ini mungkin memakan waktu beberapa saat</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="text-center text-red-500">
                                <p className="font-medium">Gagal mengambil video</p>
                                <p className="mt-1 text-sm">{error}</p>
                            </div>
                            <Button variant="outline" className="mt-4" onClick={() => fetchVideos()}>
                                Coba Lagi
                            </Button>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="font-medium">Tidak ada video ditemukan</p>
                            <p className="text-muted-foreground mt-1 text-sm">Pastikan Anda memiliki video di channel YouTube</p>
                        </div>
                    ) : (
                        <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                            {/* <div className="grid gap-3 py-4"> */}
                            {/* {videos.map((video) => (
                                    <div key={video.video_id} className={`flex cursor-pointer gap-4 rounded-lg border p-4 transition-all hover:bg-gray-50 ${selectedVideo?.video_id === video.video_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => handleVideoSelect(video)}>
                                        <div className="flex-shrink-0">
                                            <img src={video.thumbnail} alt={video.title} className="h-20 w-32 rounded object-cover" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="line-clamp-2 leading-tight font-medium text-gray-900">{video.title}</h3>
                                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{video.description || 'Tidak ada deskripsi'}</p>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(video.published_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-shrink-0 items-center">
                                            {selectedVideo?.video_id === video.video_id && (
                                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))} */}
                            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                                {videos.map((video) => (
                                    <div key={video.video_id} className="h-full cursor-pointer rounded-xl" onClick={() => handleVideoSelect(video)}>
                                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                                        <img src={video.thumbnail} alt={video.title} className="h-40 w-full rounded object-cover" />
                                        <div className="mt-2 flex items-start gap-2">
                                            {/* <Avatar className="size-8 overflow-hidden rounded-full">
                                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">{getInitials(auth.user.name)}</AvatarFallback>
                                            </Avatar> */}
                                            <div>
                                                <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
                                                {/* <p className="text-muted-foreground text-xs">{video.channel_title}</p> */}
                                                <span className="text-muted-foreground text-xs">{formatDate(video.published_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* </div> */}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    <div className="flex w-full justify-between">
                        <Button variant="outline" onClick={() => fetchVideos(true)} disabled={refreshing || loading} className="flex items-center gap-2">
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Memperbarui...' : 'Perbarui'}
                        </Button>

                        <Button onClick={handleProceed} disabled={!selectedVideo || loading} className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Analisis Video
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
