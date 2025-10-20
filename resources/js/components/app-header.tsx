import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Breadcrumbs } from '@/components/breadcrumbs';
import NotificationDropdown from '@/components/notification-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ChevronDown, ChevronRight, FileKey, FileText, LayoutGrid, Menu, Youtube } from 'lucide-react';
import { useState } from 'react';

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [isMobileAnalysisOpen, setIsMobileAnalysisOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsMobileAnalysisOpen(false);
    };

    return (
        <>
            <div className="border-sidebar-border/80 sticky top-0 z-20 border-b bg-white dark:bg-[oklch(0.145_0_0)]">
                <div className={`mx-auto flex h-16 items-center px-4 md:max-w-7xl ${auth.user ? '' : 'justify-between'}`}>
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="size-5 lg:size-4.5" />
                                    <span className="sr-only">Buka menu navigasi</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-sidebar flex h-full w-64 flex-col" aria-describedby={undefined}>
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogo />
                                </SheetHeader>

                                <div className="mt-6 flex h-full flex-1 flex-col">
                                    {auth.user ? (
                                        <nav className="flex flex-col space-y-2">
                                            <Link
                                                href="/dashboard"
                                                className={cn(
                                                    'mx-3 flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                                                    page.url === '/dashboard' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                )}
                                                onClick={closeMobileMenu}
                                            >
                                                <LayoutGrid className="h-4 w-4" />
                                                <span>Dasbor</span>
                                            </Link>

                                            <div className="mx-3 flex flex-col">
                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        'flex h-auto items-center justify-between rounded-lg px-3 py-2 text-sm font-medium',
                                                        page.url.startsWith('/analysis/') ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                    )}
                                                    onClick={() => setIsMobileAnalysisOpen(!isMobileAnalysisOpen)}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <Youtube className="h-4 w-4" />
                                                        <span>Analisis</span>
                                                    </div>
                                                    {isMobileAnalysisOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                </Button>

                                                {isMobileAnalysisOpen && (
                                                    <div className="mt-2 ml-8 flex flex-col space-y-1">
                                                        <Link
                                                            href="/analysis/public-videos"
                                                            className={cn(
                                                                'rounded-md px-3 py-2 text-sm',
                                                                page.url.startsWith('/analysis/public-videos') ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                            )}
                                                            onClick={closeMobileMenu}
                                                        >
                                                            Video Publik
                                                        </Link>
                                                        <Link
                                                            href="/analysis/your-videos"
                                                            className={cn(
                                                                'rounded-md px-3 py-2 text-sm',
                                                                page.url.startsWith('/analysis/your-videos') ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                            )}
                                                            onClick={closeMobileMenu}
                                                        >
                                                            Video Anda
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>

                                            <Link
                                                href="/keywords"
                                                className={cn(
                                                    'mx-3 flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                                                    page.url === '/keywords' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                )}
                                                onClick={closeMobileMenu}
                                            >
                                                <BookOpen className="h-4 w-4" />
                                                <span>Kata Kunci</span>
                                            </Link>

                                            <Link
                                                href="/guides"
                                                className={cn(
                                                    'mx-3 flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                                                    page.url === '/guides' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                )}
                                                onClick={closeMobileMenu}
                                            >
                                                <BookOpen className="h-4 w-4" />
                                                <span>Panduan</span>
                                            </Link>

                                            {auth.user.role === 'admin' && (
                                                <>
                                                    <Link
                                                        href="/datasets"
                                                        className={cn(
                                                            'mx-3 flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                                                            page.url === '/datasets' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                        )}
                                                        onClick={closeMobileMenu}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        <span>Dataset</span>
                                                    </Link>
                                                    <Link
                                                        href="/users"
                                                        className={cn(
                                                            'mx-3 flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                                                            page.url === '/users' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                        )}
                                                        onClick={closeMobileMenu}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        <span>Pengguna</span>
                                                    </Link>
                                                </>
                                            )}
                                        </nav>
                                    ) : (
                                        <nav className="flex flex-col space-y-2">
                                            <Link
                                                href="/keywords"
                                                className={cn(
                                                    'mx-3 flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                                                    page.url === '/keywords' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                )}
                                                onClick={closeMobileMenu}
                                            >
                                                <BookOpen className="h-4 w-4" />
                                                <span>Kata Kunci</span>
                                            </Link>

                                            <Link
                                                href="/guides"
                                                className={cn(
                                                    'mx-3 flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                                                    page.url === '/guides' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                )}
                                                onClick={closeMobileMenu}
                                            >
                                                <BookOpen className="h-4 w-4" />
                                                <span>Panduan</span>
                                            </Link>

                                            <Link
                                                href="/privacy-policy"
                                                className={cn(
                                                    'mx-3 flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                                                    page.url === '/privacy-policy' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                )}
                                                onClick={closeMobileMenu}
                                            >
                                                <FileKey className="h-4 w-4" />
                                                <span>Kebijakan Privasi</span>
                                            </Link>
                                            <Link
                                                href="/terms-of-service"
                                                className={cn(
                                                    'mx-3 flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                                                    page.url === '/terms-of-service' ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
                                                )}
                                                onClick={closeMobileMenu}
                                            >
                                                <FileText className="h-4 w-4" />
                                                <span>Ketentuan Layanan</span>
                                            </Link>
                                        </nav>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href="/" prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    {auth.user ? (
                        <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                            <NavigationMenu className="flex h-full items-stretch">
                                <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <Link href="/dashboard" className={cn(navigationMenuTriggerStyle(), page.url === '/dashboard' && activeItemStyles, 'h-9 px-3')}>
                                            <LayoutGrid className="mr-2 h-4 w-4" />
                                            Dasbor
                                        </Link>
                                        {page.url === '/dashboard' && <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>}
                                    </NavigationMenuItem>

                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <NavigationMenuTrigger>
                                            <Youtube className="mr-2 h-4 w-4" />
                                            Analisis
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[200px] gap-4">
                                                <li>
                                                    <NavigationMenuLink asChild className="mb-1">
                                                        <Link href="/analysis/public-videos" className={cn(page.url.startsWith('/analysis/public-videos') && 'bg-primary text-[oklch(1_0_0)]')}>
                                                            Video Publik
                                                        </Link>
                                                    </NavigationMenuLink>
                                                    <NavigationMenuLink asChild className="mb-[1.5px]">
                                                        <Link href="/analysis/your-videos" className={cn(page.url.startsWith('/analysis/your-videos') && 'bg-primary text-[oklch(1_0_0)]')}>
                                                            Video Saya
                                                        </Link>
                                                    </NavigationMenuLink>
                                                </li>
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <Link href="/keywords" className={cn(navigationMenuTriggerStyle(), page.url === '/keywords' && activeItemStyles, 'h-9 px-3')}>
                                            <FileKey className="mr-2 h-4 w-4" />
                                            Kata Kunci
                                        </Link>
                                        {page.url === '/keywords' && <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>}
                                    </NavigationMenuItem>

                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <Link href="/guides" className={cn(navigationMenuTriggerStyle(), page.url === '/guides' && activeItemStyles, 'h-9 px-3')}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Panduan
                                        </Link>
                                        {page.url === '/guides' && <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>}
                                    </NavigationMenuItem>

                                    {auth.user.role === 'admin' && (
                                        <>
                                            <NavigationMenuItem className="relative flex h-full items-center">
                                                <Link href="/datasets" className={cn(navigationMenuTriggerStyle(), page.url === '/datasets' && activeItemStyles, 'h-9 px-3')}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Dataset
                                                </Link>
                                                {page.url === '/datasets' && <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>}
                                            </NavigationMenuItem>
                                            <NavigationMenuItem className="relative flex h-full items-center">
                                                <Link href="/users" className={cn(navigationMenuTriggerStyle(), page.url === '/users' && activeItemStyles, 'h-9 px-3')}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Pegguna
                                                </Link>
                                                {page.url === '/users' && <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>}
                                            </NavigationMenuItem>
                                        </>
                                    )}
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    ) : (
                        <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                            <NavigationMenu className="flex h-full items-stretch">
                                <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <Link href="/keywords" className={cn(navigationMenuTriggerStyle(), page.url === '/keywords' && activeItemStyles, 'h-9 px-3')}>
                                            <FileKey className="mr-2 h-4 w-4" />
                                            Kata Kunci
                                        </Link>
                                        {page.url === '/keywords' && <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>}
                                    </NavigationMenuItem>

                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <Link href="/guides" className={cn(navigationMenuTriggerStyle(), page.url === '/guides' && activeItemStyles, 'h-9 px-3')}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Panduan
                                        </Link>
                                        {page.url === '/guides' && <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>}
                                    </NavigationMenuItem>

                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <Link href="/privacy-policy" className={cn(navigationMenuTriggerStyle(), page.url === '/privacy-policy' && activeItemStyles, 'h-9 px-3')}>
                                            <FileKey className="mr-2 h-4 w-4" />
                                            Kebijakan Privasi
                                        </Link>
                                        {page.url === '/privacy-policy' && <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>}
                                    </NavigationMenuItem>

                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <Link href="/terms-of-service" className={cn(navigationMenuTriggerStyle(), page.url === '/terms-of-service' && activeItemStyles, 'h-9 px-3')}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Ketentuan Layanan
                                        </Link>
                                        {page.url === '/terms-of-service' && <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>}
                                    </NavigationMenuItem>

                                    {/* <NavigationMenuItem className="relative flex h-full items-center">
                                        <AppearanceToggleDropdown />
                                    </NavigationMenuItem>

                                    <NavigationMenuItem className="relative ml-3 flex h-full items-center">
                                        <Button asChild>
                                            <Link href="/login">Masuk</Link>
                                        </Button>
                                    </NavigationMenuItem> */}
                                </NavigationMenuList>{' '}
                            </NavigationMenu>
                        </div>
                    )}

                    {auth.user ? (
                        <div className="ml-auto flex items-center">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="group h-9 w-9 cursor-pointer rounded-md hover:bg-transparent">
                                        {auth.user.youtube_permission_granted ? <span className="bg-chart-4 h-2 w-2 rounded-full" /> : <span className="bg-chart-1 h-2 w-2 rounded-full" />}
                                        <span className="sr-only">Indikaor akses youtube</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{auth.user.youtube_permission_granted ? <p>Terhubung dengan YouTube</p> : <p>Belum terhubung dengan YouTube</p>}</TooltipContent>
                            </Tooltip>

                            <AppearanceToggleDropdown />
                            <NotificationDropdown />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="size-10 rounded-full p-1">
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">{getInitials(auth.user.name)}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="ml-auto flex items-center gap-3">
                            <AppearanceToggleDropdown />

                            <Button asChild>
                                <Link href={`/login`}>Masuk</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
