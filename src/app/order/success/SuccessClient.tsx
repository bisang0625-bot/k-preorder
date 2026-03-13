'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useLangStore } from '@/store/useLangStore';
import { getTranslation } from '@/lib/i18n/translations';

export function SuccessClient({ orderId }: { orderId: string }) {
    const { language } = useLangStore();
    const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-zinc-200">
                <div className="flex justify-center mb-6">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight mb-2">
                    {t('thankYou')}
                </h1>
                <p className="text-zinc-500 mb-6">
                    {t('thankYouSub')}
                </p>

                <div className="bg-zinc-50 rounded-lg p-4 mb-8 text-left border border-zinc-100">
                    <p className="text-sm text-zinc-600 mb-1">{t('orderId')}:</p>
                    <p className="font-mono font-medium">{orderId || 'Unknown'}</p>
                </div>

                <p className="text-sm text-zinc-600 mb-8 leading-relaxed whitespace-pre-wrap">
                    {t('successHint')}
                </p>

                <div className="space-y-3">
                    <Button asChild className="w-full">
                        <Link href="/">{t('returnHome')}</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
