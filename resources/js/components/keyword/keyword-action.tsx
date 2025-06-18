import { ArrowUpFromLine, Copy, Filter, RotateCcw, Save } from 'lucide-react';
import { Button } from '../ui/button';

type KeywordActionsProps = {
    onCopy?: () => void;
    onReset?: () => void;
    onSave?: () => void;
    onUpload?: () => void;
    onFilter?: () => void;
};

export default function KeywordActions({
    onCopy,
    onReset,
    onSave,
    onUpload,
    onFilter,
}: KeywordActionsProps) {
    return (
        <div className="mb-4 flex flex-wrap gap-2">
            {onCopy && (
                <Button variant="outline" onClick={onCopy}>
                    Salin
                    <Copy className="ml-1 size-4" />
                </Button>
            )}
            {onReset && (
                <Button variant="outline" onClick={onReset}>
                    Reset
                    <RotateCcw className="ml-1 size-4" />
                </Button>
            )}
            {onSave && (
                <Button variant="outline" onClick={onSave}>
                    Simpan
                    <Save className="ml-1 size-4" />
                </Button>
            )}
            {onUpload && (
                <Button variant="outline" onClick={onUpload}>
                    Unggah
                    <ArrowUpFromLine className="ml-1 size-4" />
                </Button>
            )}
            {onFilter && (
                <Button variant="outline" onClick={onUpload}>
                    Filter
                    <Filter className="ml-1 size-4" />
                </Button>
            )}
        </div>

        // <div className="mb-4 flex flex-wrap gap-2">
        //     {onCopy && (
        //         <Tooltip>
        //             <TooltipTrigger asChild>
        //                 <Button variant="outline" onClick={onCopy}>
        //                     Salin
        //                     <Copy className="ml-1 size-4" />
        //                 </Button>
        //             </TooltipTrigger>
        //             <TooltipContent>
        //                 <p>Salin seluruh daftar kata kunci ke clipboard</p>
        //             </TooltipContent>
        //         </Tooltip>
        //     )}

        //     {onReset && (
        //         <Tooltip>
        //             <TooltipTrigger asChild>
        //                 <Button variant="outline" onClick={onReset}>
        //                     Reset
        //                     <RotateCcw className="ml-1 size-4" />
        //                 </Button>
        //             </TooltipTrigger>
        //             <TooltipContent>
        //                 <p>Kembalikan daftar kata kunci ke kondisi semula</p>
        //             </TooltipContent>
        //         </Tooltip>
        //     )}

        //     {onSave && (
        //         <Tooltip>
        //             <TooltipTrigger asChild>
        //                 <Button variant="outline" onClick={onSave}>
        //                     Simpan
        //                     <Save className="ml-1 size-4" />
        //                 </Button>
        //             </TooltipTrigger>
        //             <TooltipContent>
        //                 <p>Simpan perubahan yang telah dilakukan</p>
        //             </TooltipContent>
        //         </Tooltip>
        //     )}

        //     {onUpload && (
        //         <Tooltip>
        //             <TooltipTrigger asChild>
        //                 <Button variant="outline" onClick={onUpload}>
        //                     Unggah
        //                     <ArrowUpFromLine className="ml-1 size-4" />
        //                 </Button>
        //             </TooltipTrigger>
        //             <TooltipContent>
        //                 <p>Unggah kata kunci ke kamus</p>
        //             </TooltipContent>
        //         </Tooltip>
        //     )}

        //     {onFilter && (
        //         <Tooltip>
        //             <TooltipTrigger asChild>
        //                 <Button variant="outline" onClick={onFilter}>
        //                     Filter
        //                     <Filter className="ml-1 size-4" />
        //                 </Button>
        //             </TooltipTrigger>
        //             <TooltipContent>
        //                 <p>Filter kata kunci berdasarkan tanggal</p>
        //             </TooltipContent>
        //         </Tooltip>
        //     )}
        // </div>
    );
}
