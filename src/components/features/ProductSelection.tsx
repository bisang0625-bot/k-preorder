'use client';

import { useCartStore, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Image as ImageIcon } from 'lucide-react';
import { useLangStore } from '@/store/useLangStore';
import { getTranslation } from '@/lib/i18n/translations';

interface ProductSelectionProps {
    products: Product[];
}

export function ProductSelection({ products }: ProductSelectionProps) {
    const { items, addItem, updateQuantity } = useCartStore();
    const { language } = useLangStore();
    const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

    const getQuantity = (id: string) => {
        return items.find((item) => item.id === id)?.quantity || 0;
    };

    const handleMinus = (product: Product) => {
        const qty = getQuantity(product.id);
        if (qty > 0) {
            updateQuantity(product.id, qty - 1);
        }
    };

    const handlePlus = (product: Product) => {
        const qty = getQuantity(product.id);
        if (qty === 0) {
            addItem(product);
        } else {
            updateQuantity(product.id, qty + 1);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">1. {t('ourMenu')}</h2>
            {(!products || products.length === 0) ? (
                <p className="text-zinc-500">{t('noProducts')}</p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                    {products.map((product) => {
                        const qty = getQuantity(product.id);
                        return (
                            <Card key={product.id} className="overflow-hidden border-zinc-200">
                                <div className="relative h-48 w-full bg-zinc-100/80 border-b border-zinc-100 group">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex w-full h-full items-center justify-center text-zinc-300">
                                            <ImageIcon className="w-12 h-12" strokeWidth={1.5} />
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                                        <span className="font-bold text-lg text-emerald-600">
                                            €{product.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mb-4 h-10">{product.description}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-sm font-medium text-zinc-700">{t('quantity')}</span>
                                        <div className="flex items-center space-x-3 bg-zinc-100/50 p-1 rounded-full border border-zinc-200">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-white hover:text-red-500 transition-colors"
                                                onClick={() => handleMinus(product)}
                                                disabled={qty === 0}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-6 text-center font-semibold text-lg">{qty}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-white border hover:border-zinc-200 transition-colors"
                                                onClick={() => handlePlus(product)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
