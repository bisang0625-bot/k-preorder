'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema, OrderFormValues } from '@/schemas/orderSchema';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerField } from '@/components/features/DatePickerField';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

export function OrderForm() {
    const { items } = useCartStore();

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            deliveryMethod: 'delivery',
            name: '',
            email: '',
            phone: '',
            address: '',
            zipcode: '',
            pickupLocation: '',
        },
    });

    const watchDeliveryMethod = form.watch('deliveryMethod');

    async function onSubmit(data: OrderFormValues) {
        if (items.length === 0) {
            alert('Please select at least one item before ordering.');
            return;
        }

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
                alert('Failed to place order. Check console for details.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Network error occurred.');
        }
    }

    return (
        <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight mb-6">2. Bestelgegevens (Order Details)</h2>

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
                            />
                        )}
                    />

                    {/* 2. Customer Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Klantgegevens (Customer Info)</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Naam (Name)</FormLabel>
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
                                        <FormLabel>Telefoon (Phone) [Optioneel]</FormLabel>
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
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>E-mail (Email)</FormLabel>
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
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Ophaal of Bezorging (Delivery Method)</h3>
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
                                                    Bezorgen (Delivery)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="pickup" />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    Ophalen (Pickup Point)
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
                                            <FormLabel>Postcode (Zipcode)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="1012 AB" {...field} />
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
                                            <FormLabel>Adres en Huisnummer (Address & House Number)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Dam Square 1" {...field} />
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
                                        <FormLabel>Kies een Ophaalpunt (Choose a Pickup Point)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecteer een locatie..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="point-a">A'dam Centraal (Central Station)</SelectItem>
                                                <SelectItem value="point-b">Zuidplein Mall</SelectItem>
                                                <SelectItem value="point-c">Hanok Kitchen (Main Store)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>

                    <Button type="submit" className="w-full text-lg h-12" disabled={items.length === 0}>
                        Afrekenen (Proceed to Payment)
                    </Button>
                </form>
            </Form>
        </div>
    );
}
