'use client';

import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SelectSingleEventHandler } from 'react-day-picker';

// Admin specified dates (e.g., this coming Friday/Saturday)
const availableDates = [
    new Date('2026-03-06T00:00:00'), // Friday
    new Date('2026-03-07T00:00:00'), // Saturday
    new Date('2026-03-13T00:00:00'), // Next Friday
    new Date('2026-03-14T00:00:00'), // Next Saturday
];

interface DatePickerFieldProps {
    value: Date | undefined;
    onChange: SelectSingleEventHandler;
}

export function DatePickerField({ value, onChange }: DatePickerFieldProps) {
    // Disable all dates except those explicitly defined
    const isDateDisabled = (date: Date) => {
        return !availableDates.some(
            (available) =>
                date.getDate() === available.getDate() &&
                date.getMonth() === available.getMonth() &&
                date.getFullYear() === available.getFullYear()
        );
    };

    return (
        <FormItem className="flex flex-col">
            <FormLabel>Datum / Date</FormLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                            variant={'outline'}
                            className={cn(
                                'w-full pl-3 text-left font-normal',
                                !value && 'text-muted-foreground'
                            )}
                        >
                            {value ? (
                                format(value, 'PPP', { locale: nl })
                            ) : (
                                <span>Kies een datum (Pick a date)</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onChange}
                        disabled={isDateDisabled}
                        initialFocus
                        locale={nl}
                    />
                </PopoverContent>
            </Popover>
            <FormMessage />
        </FormItem>
    );
}
