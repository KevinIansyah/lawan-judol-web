import { Button } from '@/components/ui/button';
import { Keyword } from '@/types';
import { ArrowUpFromLine, Copy, Filter, RotateCcw, Save } from 'lucide-react';

type KeywordActionsProps = {
    data: Keyword[];
    onCopy?: () => void;
    onReset?: () => void;
    onSave?: () => void;
    onUpload?: () => void;
    onFilter?: () => void;
};

export default function KeywordActions({ data, onCopy, onReset, onSave, onUpload, onFilter }: KeywordActionsProps) {
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
                <Button
                    variant="outline"
                    onClick={() => {
                        console.log('🔖 Save clicked!', data);
                        onUpload();
                    }}
                >
                    Unggah
                    <ArrowUpFromLine className="ml-1 size-4" />
                </Button>
            )}
            {onFilter && (
                <Button variant="outline" onClick={onFilter}>
                    Filter
                    <Filter className="ml-1 size-4" />
                </Button>
            )}
        </div>
    );
}
