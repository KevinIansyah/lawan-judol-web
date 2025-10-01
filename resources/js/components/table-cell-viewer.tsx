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