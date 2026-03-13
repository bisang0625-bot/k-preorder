'use client';

import { useCartStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLangStore } from '@/store/useLangStore';
import { getTranslation } from '@/lib/i18n/translations';

export function OrderSummary() {
    const { items } = useCartStore();
    const { language } = useLangStore();
    const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

    const totalAmount = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    if (items.length === 0) {
        return (
            <Card className="sticky top-6">
                <CardHeader>
                    <CardTitle>{t('orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-zinc-500 text-sm">{t('emptyCart')}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="sticky top-6 border-zinc-200 shadow-sm">
            <CardHeader className="bg-zinc-50 border-b border-zinc-100 rounded-t-xl pb-4">
                <CardTitle className="text-lg">{t('orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="flex-1 font-medium text-zinc-700">
                                {item.quantity}x {item.name}
                            </span>
                            <span className="font-semibold tabular-nums text-zinc-900">
                                €{(item.price * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))}

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>{t('total')}</span>
                        <span className="text-emerald-600">€{totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
