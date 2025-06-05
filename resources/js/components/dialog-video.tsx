import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ApiResponse, Video } from '@/types';
import { router } from '@inertiajs/react';
import { Check, Loader2, Play, PlusIcon, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function DialogVideo() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [error, setError] = useState<string | null>(null);
    // const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
    // const [fromCache, setFromCache] = useState<boolean>(false);
    const [hasInitialLoad, setHasInitialLoad] = useState<boolean>(false);

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
                // setChannelInfo(data.channel_info);
                // setFromCache(data.from_cache);
                setHasInitialLoad(true);

                // Log the data source for debugging
                // console.log(`Videos loaded from: ${data.from_cache ? 'Cache' : 'YouTube API'}`);
                // console.log(`Total videos: ${data.videos.length}`);

                // if (!data.from_cache) {
                //     console.log('Fresh data fetched from YouTube API');
                // } else {
                //     console.log('Data loaded from 24-hour cache');
                // }
            } else {
                setError(data.message || 'Failed to fetch videos');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Network error. Please try again.';
            setError(errorMessage);
            // console.error('Error fetching videos:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Handle modal open
    const handleModalOpen = (): void => {
        setIsOpen(true);

        // Always fetch on first open, or if we don't have videos yet
        if (!hasInitialLoad || videos.length === 0) {
            console.log('First time opening dialog or no videos cached, fetching from API...');
            fetchVideos();
        } else {
            console.log('Dialog reopened, using existing data (cached or previously loaded)');
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

    // Handle refresh button click
    const handleRefresh = (): void => {
        console.log('Manual refresh requested, fetching fresh data from YouTube API...');
        fetchVideos(true);
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
    // const formatNumber = (num: number | undefined): string => {
    //     if (!num) return '0';

    //     if (num >= 1000000) {
    //         return (num / 1000000).toFixed(1) + 'M';
    //     }
    //     if (num >= 1000) {
    //         return (num / 1000).toFixed(1) + 'K';
    //     }
    //     return num.toString();
    // };

    // Get cache status text
    // const getCacheStatusText = (): string => {
    //     if (loading || refreshing) return '';
    //     if (!hasInitialLoad) return '';

    //     if (fromCache) {
    //         return 'Data dari cache (24 jam)';
    //     } else {
    //         return 'Data terbaru dari YouTube';
    //     }
    // };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                        <span>Pilih Video</span>
                        {/* {getCacheStatusText() && <span className={`text-sm font-normal ${fromCache ? 'text-blue-600' : 'text-green-600'}`}>{getCacheStatusText()}</span>} */}
                    </DialogTitle>
                    <DialogDescription>
                        Pilih salah satu video YouTube Anda yang ingin dianalisis. Kami akan mendeteksi dan menandai komentar promosi judi online secara otomatis.
                        {/* {fromCache && <span className="mt-1 block text-xs text-blue-600">Cache akan diperbarui otomatis setelah 24 jam, atau klik tombol Perbarui untuk data terbaru.</span>} */}
                    </DialogDescription>
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
                            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {videos.map((video) => (
                                    <div key={video.video_id} className="relative h-full cursor-pointer rounded-xl" onClick={() => handleVideoSelect(video)}>
                                        <img src={video.thumbnail} alt={video.title} className="h-40 w-full rounded object-cover" />

                                        {selectedVideo?.video_id === video.video_id && (
                                            <div className="absolute inset-0 flex h-40 items-center justify-center rounded bg-black/80 text-white">
                                                <Check />
                                            </div>
                                        )}

                                        <div className="mt-2 flex items-start gap-2">
                                            <div>
                                                <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
                                                <span className="text-muted-foreground text-xs">{formatDate(video.published_at)}</span>
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
                        <Button variant="outline" onClick={handleRefresh} disabled={refreshing || loading} className="flex items-center gap-2">
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Memperbarui...' : 'Perbarui'}
                        </Button>

                        <Button onClick={handleProceed} disabled={!selectedVideo || loading || refreshing} className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Analisis Video
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
