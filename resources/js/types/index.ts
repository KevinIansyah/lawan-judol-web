import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
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
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Payment {
    id: string;
    amount: number;
    status: 'pending' | 'processing' | 'success' | 'failed';
    email: string;
}

export interface Keyword {
    id: number;
    keyword: string;
    label: 0 | 1;
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

export interface MergedVideoData {
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
    video: MergedVideoData;
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
    message: string;
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
