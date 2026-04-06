'use client';

import { useCartStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLangStore } from '@/store/useLangStore';
import { getTranslation } from '@/lib/i18n/translations';

const MIN_ORDER_AMOUNT = 200;

export function OrderSummary() {
    const { items, deliveryMethod } = useCartStore();
    const { language } = useLangStore();
    const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

    const totalAmount = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const isPickup = deliveryMethod === 'pickup';
    const remaining = Math.max(0, MIN_ORDER_AMOUNT - totalAmount);
    const isMinMet = isPickup || totalAmount >= MIN_ORDER_AMOUNT;

    if (items.length === 0) {
        return (
            <Card className="sticky top-6">
                <CardHeader>
                    <CardTitle>{t('orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-zinc-500 text-sm">{t('emptyCart')}</p>
                    {!isPickup && (
                        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                            ⚠️ Minimale bestelling: €{MIN_ORDER_AMOUNT} (Minimum order: €{MIN_ORDER_AMOUNT})
                        </div>
                    )}
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
                        <span className={isMinMet ? 'text-emerald-600' : 'text-zinc-900'}>
                            €{totalAmount.toFixed(2)}
                        </span>
                    </div>

                    {/* Minimum order notice — only for delivery */}
                    {!isPickup && (
                        isMinMet ? (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                                ✅ 최소 주문 금액 충족 (Minimum order met)
                            </div>
                        ) : (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                                <p className="font-semibold mb-1">⚠️ 최소 주문 금액: €{MIN_ORDER_AMOUNT}</p>
                                <p>€{remaining.toFixed(2)} 더 추가하면 결제 가능합니다.</p>
                                <p className="text-red-400 mt-0.5">(Add €{remaining.toFixed(2)} more to proceed)</p>
                            </div>
                        )
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

