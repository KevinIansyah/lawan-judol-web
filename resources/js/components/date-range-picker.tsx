import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

interface DateRangePickerProps {
    label?: string;
    placeholder?: string;
    value?: DateRange;
    onChange?: (range: DateRange | undefined) => void;
    className?: string;
    disabled?: boolean;
    id?: string;
}

export function DateRangePicker({
    label = 'Pilih Rentang Tanggal',
    placeholder = 'Pilih tanggal awal dan akhir',
    value,
    onChange,
    className = '',
    disabled = false,
    id,
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (range: DateRange | undefined) => {
        onChange?.(range);
        if (range?.from && range?.to) {
            setOpen(false);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(undefined);
    };

    const formatDateRange = () => {
        if (!value?.from) return placeholder;

        if (value.from && !value.to) {
            return `${value.from.toLocaleDateString('id-ID')} - ...`;
        }

        if (value.from && value.to) {
            return `${value.from.toLocaleDateString('id-ID')} - ${value.to.toLocaleDateString('id-ID')}`;
        }

        return placeholder;
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
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
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                            <span className="truncate">{formatDateRange()}</span>
                        </div>
                        {value?.from && (
                            <X
                                className="h-4 w-4 opacity-50 hover:opacity-100"
                                onClick={handleClear}
                            />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="range"
                        selected={value}
                        onSelect={handleSelect}
                        captionLayout="dropdown"
                        numberOfMonths={2}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
