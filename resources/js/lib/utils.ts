import { type ClassValue, clsx } from 'clsx';
import { AlertCircle, WifiOff } from 'lucide-react';
import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

type ErrorType = 'network' | 'server' | 'validation';

type FriendlyError = {
    message: string;
    type: ErrorType;
};

function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
    );
}

export function getUserFriendlyError(error: unknown, statusCode?: number): FriendlyError {
    if (!navigator.onLine) {
        return {
            message: 'Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.',
            type: 'network',
        };
    }

    switch (statusCode) {
        case 401:
            return {
                message: 'Sesi Anda telah berakhir. Silakan login ulang.',
                type: 'validation',
            };
        case 500:
            return {
                message: 'Terjadi kesalahan pada server. Tim kami akan segera memperbaikinya.',
                type: 'server',
            };
    }

    let message = 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';

    if (typeof error === 'string') {
        const lower = error.toLowerCase();
        const isSensitive =
            lower.includes('exception') || // pesan error dari PHP/Laravel/Node
            lower.includes('call to') || // error method/function tidak ditemukan
            lower.includes('undefined') || // error JS/TS runtime
            lower.includes('sql') || // query atau error database
            lower.includes('stack') || // stack trace
            lower.includes('trace') || // trace detail error
            lower.includes('not found') || // resource atau route hilang
            lower.includes('could not') || // indikasi internal error
            lower.includes('failed') || // indikasi internal error
            lower.includes('permission') || // info izin yang sensitif
            lower.includes('forbidden') || // status 403
            lower.includes('internal server') || // status 500
            lower.includes('route') || // info route Laravel
            lower.includes('file'); // info file path server

        if (!isSensitive) {
            message = error;
        }
    } else if (isErrorWithMessage(error)) {
        const msg = error.message.toLowerCase();
        const isSensitive =
            msg.includes('exception') ||
            msg.includes('call to') ||
            msg.includes('undefined') ||
            msg.includes('sql') ||
            msg.includes('stack') ||
            msg.includes('trace') ||
            msg.includes('not found') ||
            msg.includes('could not') ||
            msg.includes('failed') ||
            msg.includes('permission') ||
            msg.includes('forbidden') ||
            msg.includes('internal server') ||
            msg.includes('route') ||
            msg.includes('file');

        if (!isSensitive) {
            message = error.message;
        }
    }

    return {
        message,
        type: 'server',
    };
}

export function getErrorIcon(errorType: string | null): ReactNode {
    switch (errorType) {
        case 'network':
            return React.createElement(WifiOff, { className: 'text-primary h-8 w-8' });
        default:
            return React.createElement(AlertCircle, { className: 'text-primary h-8 w-8' });
    }
}

export function getRetryButtonText(errorType: string | null) {
    switch (errorType) {
        case 'network':
            return 'Periksa Koneksi & Coba Lagi';
        default:
            return 'Coba Lagi';
    }
}
