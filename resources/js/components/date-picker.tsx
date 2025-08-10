import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

interface DatePickerProps {
    label?: string;
    placeholder?: string;
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    className?: string;
    disabled?: boolean;
    id?: string;
}

export function DatePicker({
    label,
    placeholder = 'Pilih tanggal',
    value,
    onChange,
    className = '',
    disabled = false,
    id,
}: DatePickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (selectedDate: Date | undefined) => {
        onChange?.(selectedDate);
        setOpen(false);
    };

    return (
        <div className={`grid gap-3 ${className}`}>
            {label && (
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                </Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id={id}
                        className="w-full justify-between font-normal"
                        disabled={disabled}
                    >
                        {value ? value.toLocaleDateString('id-ID') : placeholder}
                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={handleSelect}
                        captionLayout="dropdown"
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
