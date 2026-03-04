'use client';

import { useCartStore, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus } from 'lucide-react';
import Image from 'next/image';

const mockProducts: Product[] = [
    {
        id: 'p1',
        name: 'Spicy Tteokbokki (떡볶이)',
        price: 12.5,
        description: 'Chewy rice cakes in a sweet and spicy gochujang sauce.',
        imageUrl: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=600&auto=format&fit=crop', // placeholder
    },
    {
        id: 'p2',
        name: 'Korean Fried Chicken (양념치킨)',
        price: 18.0,
        description: 'Crispy fried chicken coated in a sweet and sticky sauce.',
        imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop', // placeholder
    },
];

export function ProductSelection() {
    const { items, addItem, updateQuantity } = useCartStore();

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
            <h2 className="text-2xl font-bold tracking-tight">1. Menu Selecteren</h2>
            <div className="grid gap-6 sm:grid-cols-2">
                {mockProducts.map((product) => {
                    const qty = getQuantity(product.id);
                    return (
                        <Card key={product.id} className="overflow-hidden border-zinc-200">
                            <div className="relative h-48 w-full bg-zinc-100">
                                {/* Use a simple img tag for placeholder to avoid next/image domain config issues initially */}
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="object-cover w-full h-full"
                                />
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
                                    <span className="text-sm font-medium text-zinc-700">Aantal / Quantity</span>
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
        </div>
    );
}
