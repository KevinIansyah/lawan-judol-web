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

export interface ApiResponse {
    success: boolean;
    videos: Video[];
    channel_info: ChannelInfo;
    from_cache: boolean;
    message?: string;
}
