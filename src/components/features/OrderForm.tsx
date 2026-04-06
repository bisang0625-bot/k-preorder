'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrderSchema, OrderFormValues } from '@/schemas/orderSchema';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerField } from '@/components/features/DatePickerField';
import { Loader2 } from 'lucide-react';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useLangStore } from '@/store/useLangStore';
import { getTranslation } from '@/lib/i18n/translations';

interface OrderFormSettings {
    allowedDates: string[];
    zipcodes: string[];
    pickups: string[];
}

const MIN_ORDER_AMOUNT = 200;

export function OrderForm({ settings }: { settings: OrderFormSettings }) {
    const { items, setDeliveryMethod } = useCartStore();
    const { language } = useLangStore();
    const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const schema = useMemo(() => createOrderSchema(settings.zipcodes, settings.pickups), [settings]);

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            deliveryMethod: 'delivery',
            name: '',
            email: '',
            confirmEmail: '',
            phone: '',
            address: '',
            zipcode: '',
            pickupLocation: '',
            specialRequest: '',
        },
    });

    const watchDeliveryMethod = form.watch('deliveryMethod');

    // Pickup has no minimum order, delivery requires €200
    const isMinOrderMet = watchDeliveryMethod === 'pickup' || totalAmount >= MIN_ORDER_AMOUNT;

    // Sync delivery method to global store so OrderSummary can access it
    useEffect(() => {
        setDeliveryMethod(watchDeliveryMethod);
    }, [watchDeliveryMethod, setDeliveryMethod]);

    async function onSubmit(data: OrderFormValues) {
        if (items.length === 0) {
            alert('Please select at least one item before ordering.');
            return;
        }

        if (data.deliveryMethod === 'delivery' && totalAmount < MIN_ORDER_AMOUNT) {
            alert(`최소 주문 금액은 €${MIN_ORDER_AMOUNT}입니다. 현재 금액: €${totalAmount.toFixed(2)}\n(Minimum order is €${MIN_ORDER_AMOUNT}. Current total: €${totalAmount.toFixed(2)})`);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, items }),
            });

            const result = await response.json();

            if (response.ok) {
                // Redirect to Mollie checkout page (or dummy success page)
                window.location.href = result.paymentUrl;
            } else {
                console.error('Validation/Server Error:', result.details || result.error);
                alert(result.error ? `${result.error}\n\nDetails: ${result.details || ''}` : 'Failed to place order. Check console for details.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Network error occurred.');
            setIsSubmitting(false);
        }
    }

    return (
        <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight mb-6">2. {t('deliveryOrPickup')}</h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* 1. Date Selection */}
                    <FormField
                        control={form.control}
                        name="deliveryDate"
                        render={({ field }) => (
                            <DatePickerField
                                value={field.value}
                                onChange={field.onChange}
                                allowedDates={settings.allowedDates}
                            />
                        )}
                    />

                    {/* 2. Customer Info */}
                    <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('fullName')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Jan Jansen" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefoon (Phone)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+31 6 12345678" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('email')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="jan@example.com" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('confirmEmail')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="jan@example.com" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* 3. Delivery Method Selection */}
                    <div className="space-y-4 pt-4 border-t">
                        <FormField
                            control={form.control}
                            name="deliveryMethod"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="delivery" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {t('delivery')}
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="pickup" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {t('pickup')}
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* 4. Conditional Fields (Delivery Address vs Pickup Point) */}
                    <div className="space-y-4 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        {watchDeliveryMethod === 'delivery' ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="zipcode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('zipcode')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('zipcodeHint')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>{t('address')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('addressHint')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ) : (
                            <FormField
                                control={form.control}
                                name="pickupLocation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('choosePickup')}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('selectLocation')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {settings.pickups.map((loc, idx) => (
                                                    <SelectItem key={idx} value={loc}>{loc}</SelectItem>
                                                ))}
                                                {settings.pickups.length === 0 && (
                                                    <SelectItem value="none" disabled>Geen locaties beschikbaar</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    {/* 5. Special Requests */}
                    <div className="space-y-4 pt-4 border-t">
                        <FormField
                            control={form.control}
                            name="specialRequest"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('specialRequest')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('specialRequestHint')}
                                            className="resize-none h-24"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {!isMinOrderMet && items.length > 0 && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 text-center">
                            ⚠️ 최소 주문 금액 €{MIN_ORDER_AMOUNT} 미달 — €{(MIN_ORDER_AMOUNT - totalAmount).toFixed(2)} 더 추가해주세요
                        </div>
                    )}
                    <Button
                        type="submit"
                        className="w-full text-lg h-12"
                        disabled={items.length === 0 || isSubmitting || !isMinOrderMet}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {t('submitting')}
                            </>
                        ) : (
                            t('checkout')
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
