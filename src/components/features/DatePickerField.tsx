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
import { useLangStore } from '@/store/useLangStore';
import { getTranslation } from '@/lib/i18n/translations';

interface DatePickerFieldProps {
    value: Date | undefined;
    onChange: SelectSingleEventHandler;
    allowedDates: string[]; // array of 'YYYY-MM-DD' strings
}

export function DatePickerField({ value, onChange, allowedDates }: DatePickerFieldProps) {
    const { language } = useLangStore();
    const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

    // Disable all dates except those explicitly defined in the allowedDates array
    const isDateDisabled = (date: Date) => {
        // Simple string comparison for 'YYYY-MM-DD'
        const dateString = format(date, 'yyyy-MM-dd');
        return !allowedDates.includes(dateString);
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
                                <span>{t('chooseDate')}</span>
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
