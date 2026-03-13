'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { useLangStore } from '@/store/useLangStore';
import { getTranslation } from '@/lib/i18n/translations';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { language } = useLangStore();
    const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                // Redirect to dashboard on success
                router.push('/admin/dashboard');
                router.refresh(); // Refresh to ensure middleware cookie is read
            } else {
                setError(t('invalidPassword'));
            }
        } catch (err) {
            setError(t('invalidPassword'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-sm border border-zinc-200">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-zinc-600" />
                    </div>
                    <CardTitle className="text-xl font-bold">{t('adminLogin')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder={t('password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t('loading') : t('login')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
