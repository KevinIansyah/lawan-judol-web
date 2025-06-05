import { ArrowUpFromLine, Copy, RotateCcw, Save } from 'lucide-react';
import { Button } from '../ui/button';

type KeywordActionsProps = {
    onCopy?: () => void;
    onReset?: () => void;
    onSave?: () => void;
    onUpload?: () => void;
};

export function KeywordActions({ onCopy, onReset, onSave, onUpload }: KeywordActionsProps) {
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
        </div>
    );
}
