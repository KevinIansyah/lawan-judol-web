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

export interface Video {
    video_id: string;
    title: string;
    channel_title: string;
    description: string | null;
    thumbnail: string;
    published_at: string;
}

export interface ChannelInfo {
    subscriber_count: number;
    video_count: number;
}

export interface ApiResponseAllVideos {
    success: boolean;
    videos: Video[];
    channel_info: ChannelInfo;
    from_cache: boolean;
    message?: string;
}

export interface ApiResponseVideo {
    success: boolean;
    videos: Video[];
    message?: string;
}

export interface Analysis {
    id: number;
    title: string;
    status: 'queued' | 'in_process' | 'failed' | 'done';
    created_at: string;
    updated_at: string;
}

export interface Comment {
    comment_id: string;
    text: string;
    label: 0 | 1;
    source: string;
    timestamp: string;
    is_reply: boolean;
    user_metadata: {
        username: string;
        user_id: string;
        profile_url: string;
    };
    status: 'heldForReview' | 'reject' | 'draft' | 'database';
    parent_id?: string;
}

export interface Keyword {
    id: number;
    keyword: string;
    label: 0 | 1;
}
