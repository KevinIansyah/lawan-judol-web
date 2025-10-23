import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    notifications: Notification[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    success?: string;
    error?: string;
    info?: string;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin';
    youtube_permission_granted: boolean;
    email_verified_at: string | null;
    delete_account: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Video {
    video_id: string;
    title: string;
    description: string;
    thumbnail: string;
    published_at: string;
    channel_title: string;
    youtube_url: string;
}

export interface ApiResponseVideo {
    success: boolean;
    video: Video | null;
    total: number;
    message?: string;
}

export interface ChannelInfo {
    title: string;
    description: string;
    subscriber_count: number;
    video_count: number;
    view_count: number;
}

export interface ApiResponseVideos {
    success: boolean;
    videos: Video[];
    total: number;
    channel_info: ChannelInfo | null;
    cached_at?: string;
    requests_made?: number;
    from_cache: boolean;
    message?: string;
}

export interface UserCommentMetadata {
    username: string;
    user_id: string;
    profile_url: string;
}

export interface Comment {
    comment_id: string;
    text: string;
    label: number;
    source: string;
    timestamp: string;
    user_metadata: UserCommentMetadata;
    status: 'heldForReview' | 'reject' | 'draft' | 'dataset';
}

export interface Chunk {
    chunk_id: number;
    comments: Comment[];
}

export interface CommentChunk {
    total_comments: number;
    total_chunks: number;
    chunks: Chunk[];
}

export interface ApiResponseComment {
    success: boolean;
    comments: string;
    total: number;
    requests_made?: number;
    message?: string;
}

export interface MergeVideoData {
    video_id: string;
    title: string;
    description: string;
    published_at: string;
    thumbnail: string;
    channel_title: string;
    youtube_url: string;
    comments_path: string;
    comments_total: number;
}

export interface Analysis {
    id: number;
    user_id: number;
    video: MergeVideoData;
    status: 'queue' | 'on_process' | 'failed' | 'success';
    type: 'public' | 'your';
    gambling_file_path: string | null;
    nongambling_file_path: string | null;
    keyword_file_path: string | null;
    created_at: string;
    updated_at: string;
}

export interface ApiResponseAnalysis {
    success: boolean;
    analysis: Analysis;
    message?: string;
}

export interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        title: string;
        message: string;
        url?: string | null;
        status: 'queue' | 'on_process' | 'failed' | 'success';
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Keyword {
    id: number;
    keyword: string;
    label: 0 | 1;
    created_at?: string;
    updated_at?: string;
}

export interface Dataset {
    id: number;
    comment: Comment;
    true_label: 'judol' | 'non_judol';
    created_at: string;
    updated_at: string;
    user: Pick<User, 'id' | 'name'> | null;
}

export interface ApiResponseDataset {
    success: boolean;
    datasets: string;
    total: number;
    link?: string;
    message?: string;
}

export interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    path: string;
    first_page_url: string;
    last_page_url: string;
}

export interface ProcessLog {
    comment_id: string;
    status: 'processing' | 'success' | 'error';
    message: string;
}

export interface DashboardData {
    dataset_count: number;
    keyword_count: number;
    your_analysis_count: number;
    public_analysis_count: number;
    your_analysis: {
        three_months: Record<string, number>;
        one_month: Record<string, number>;
        seven_days: Record<string, number>;
    };
    public_analysis: {
        three_months: Record<string, number>;
        one_month: Record<string, number>;
        seven_days: Record<string, number>;
    };
    quota: {
        video_analysis: {
            limit: number;
            used: number;
            remaining: number;
        };
        comment_moderation: {
            limit: number;
            used: number;
            remaining: number;
        };
        youtube_api: {
            used: number;
        };
        date: string;
        resets_at: string;
    };
}
