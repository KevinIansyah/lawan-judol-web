import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Analysis } from '@/types';

export function TableCellViewer({ item }: { item: Analysis }) {
    const videoData = item.video;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="link"
                    className="text-foreground block h-auto w-[600px] px-0 text-left leading-snug break-words whitespace-normal"
                >
                    {videoData.title}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col [&>button.absolute]:hidden">
                <SheetHeader>
                    <SheetTitle>{videoData.title}</SheetTitle>
                    <SheetDescription>Video Status Overview</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-4">
                    <form className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" defaultValue={videoData.title} disabled />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Input id="status" defaultValue={item.status} disabled />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="created_at">Created At</Label>
                            <Input id="created_at" defaultValue={item.created_at} disabled />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="updated_at">Updated At</Label>
                            <Input id="updated_at" defaultValue={item.updated_at} disabled />
                        </div>
                    </form>
                </div>
                <SheetFooter className="mt-auto flex gap-2 sm:flex-col">
                    <SheetClose asChild>
                        <Button variant="outline" className="w-full">
                            Close
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

// import { Button } from '@/components/ui/button';
// import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Separator } from '@/components/ui/separator';
// import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
// import { useIsMobile } from '@/hooks/use-mobile';
// import { TrendingUpIcon } from 'lucide-react';
// import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
// import { z } from 'zod';

// const chartData = [
//     { month: 'January', desktop: 186, mobile: 80 },
//     { month: 'February', desktop: 305, mobile: 200 },
//     { month: 'March', desktop: 237, mobile: 120 },
//     { month: 'April', desktop: 73, mobile: 190 },
//     { month: 'May', desktop: 209, mobile: 130 },
//     { month: 'June', desktop: 214, mobile: 140 },
// ];

// const chartConfig = {
//     desktop: {
//         label: 'Desktop',
//         color: 'var(--primary)',
//     },
//     mobile: {
//         label: 'Mobile',
//         color: 'var(--primary)',
//     },
// } satisfies ChartConfig;

// export function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
//     const isMobile = useIsMobile();
//     return (
//         <Sheet>
//             <SheetTrigger asChild>
//                 <Button variant="link" className="text-foreground w-fit px-0 text-left">
//                     {item.header}
//                 </Button>
//             </SheetTrigger>
//             <SheetContent side="right" className="flex flex-col">
//                 <SheetHeader className="gap-1">
//                     <SheetTitle>{item.header}</SheetTitle>
//                     <SheetDescription>Showing total visitors for the last 6 months</SheetDescription>
//                 </SheetHeader>
//                 <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm">
//                     {!isMobile && (
//                         <>
//                             <ChartContainer config={chartConfig}>
//                                 <AreaChart
//                                     accessibilityLayer
//                                     data={chartData}
//                                     margin={{
//                                         left: 0,
//                                         right: 10,
//                                     }}
//                                 >
//                                     <CartesianGrid vertical={false} />
//                                     <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} hide />
//                                     <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
//                                     <Area dataKey="mobile" type="natural" fill="var(--color-mobile)" fillOpacity={0.6} stroke="var(--color-mobile)" stackId="a" />
//                                     <Area dataKey="desktop" type="natural" fill="var(--color-desktop)" fillOpacity={0.4} stroke="var(--color-desktop)" stackId="a" />
//                                 </AreaChart>
//                             </ChartContainer>
//                             <Separator />
//                             <div className="grid gap-2">
//                                 <div className="flex gap-2 leading-none font-medium">
//                                     Trending up by 5.2% this month <TrendingUpIcon className="size-4" />
//                                 </div>
//                                 <div className="text-muted-foreground">Showing total visitors for the last 6 months. This is just some random text to test the layout. It spans multiple lines and should wrap around.</div>
//                             </div>
//                             <Separator />
//                         </>
//                     )}
//                     <form className="flex flex-col gap-4">
//                         <div className="flex flex-col gap-3">
//                             <Label htmlFor="header">Header</Label>
//                             <Input id="header" defaultValue={item.header} />
//                         </div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="flex flex-col gap-3">
//                                 <Label htmlFor="type">Type</Label>
//                                 <Select defaultValue={item.type}>
//                                     <SelectTrigger id="type" className="w-full">
//                                         <SelectValue placeholder="Select a type" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="Table of Contents">Table of Contents</SelectItem>
//                                         <SelectItem value="Executive Summary">Executive Summary</SelectItem>
//                                         <SelectItem value="Technical Approach">Technical Approach</SelectItem>
//                                         <SelectItem value="Design">Design</SelectItem>
//                                         <SelectItem value="Capabilities">Capabilities</SelectItem>
//                                         <SelectItem value="Focus Documents">Focus Documents</SelectItem>
//                                         <SelectItem value="Narrative">Narrative</SelectItem>
//                                         <SelectItem value="Cover Page">Cover Page</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                             <div className="flex flex-col gap-3">
//                                 <Label htmlFor="status">Status</Label>
//                                 <Select defaultValue={item.status}>
//                                     <SelectTrigger id="status" className="w-full">
//                                         <SelectValue placeholder="Select a status" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="Done">Done</SelectItem>
//                                         <SelectItem value="In Progress">In Progress</SelectItem>
//                                         <SelectItem value="Not Started">Not Started</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="flex flex-col gap-3">
//                                 <Label htmlFor="target">Target</Label>
//                                 <Input id="target" defaultValue={item.target} />
//                             </div>
//                             <div className="flex flex-col gap-3">
//                                 <Label htmlFor="limit">Limit</Label>
//                                 <Input id="limit" defaultValue={item.limit} />
//                             </div>
//                         </div>
//                         <div className="flex flex-col gap-3">
//                             <Label htmlFor="reviewer">Reviewer</Label>
//                             <Select defaultValue={item.reviewer}>
//                                 <SelectTrigger id="reviewer" className="w-full">
//                                     <SelectValue placeholder="Select a reviewer" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
//                                     <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
//                                     <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </form>
//                 </div>
//                 <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
//                     <Button className="w-full">Submit</Button>
//                     <SheetClose asChild>
//                         <Button variant="outline" className="w-full">
//                             Done
//                         </Button>
//                     </SheetClose>
//                 </SheetFooter>
//             </SheetContent>
//         </Sheet>
//     );
// }
