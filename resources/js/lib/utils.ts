import { type ClassValue, clsx } from 'clsx';
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
            lower.includes('exception') ||
            lower.includes('call to') ||
            lower.includes('undefined') ||
            lower.includes('sql') ||
            lower.includes('stack');

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
            msg.includes('stack');

        if (!isSensitive) {
            message = error.message;
        }
    }

    return {
        message,
        type: 'server',
    };
}
