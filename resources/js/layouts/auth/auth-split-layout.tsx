import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-red-50 bg-[url('/assets/images/welcome.svg')] bg-cover bg-center dark:bg-red-700/10" />
                <div className="absolute inset-0 bg-black/80" />

                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    <AppLogoIcon />
                    <span className="ml-2">{name}</span>
                </Link>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-neutral-300">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon />
                    </Link>
                    <div className="mb-0 flex flex-col items-center gap-2 text-center">
                        <h1 className="text-xl font-bold">{title}</h1>
                        <p className="text-muted-foreground text-sm text-balance">{description}</p>
                    </div>
                    {children}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className="text-muted-foreground text-sm text-balance">
                            Dengan masuk, Anda menyetujui
                            <br />{' '}
                            <a href="/privacy-policy" className="underline">
                                Kebijakan Privasi
                            </a>{' '}
                            dan{' '}
                            <a href="/terms-of-service" className="underline">
                                Ketentuan Layanan
                            </a>
                            <br /> kami.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
