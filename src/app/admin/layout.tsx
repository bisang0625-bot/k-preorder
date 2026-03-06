'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ShoppingCart, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // Do not show the navigation bar on the login page itself
    const isLoginPage = pathname === '/admin';

    const handleLogout = async () => {
        // Simple logout by clearing the cookie via a new API route or client side.
        // For simplicity, we can just hit an API route that clears it
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/admin');
        router.refresh();
    };

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
            {/* Sidebar navigation */}
            <aside className="w-full md:w-64 bg-zinc-900 text-zinc-100 flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold tracking-tight">Admin</h2>
                    <p className="text-sm text-zinc-400 mt-1">Beheerderspaneel</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link
                        href="/admin/dashboard"
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/admin/dashboard'
                            ? 'bg-zinc-800 text-white'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Menu & Instellingen
                    </Link>

                    <Link
                        href="/admin/orders"
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/admin/orders'
                            ? 'bg-zinc-800 text-white'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Bestellingen (Orders)
                    </Link>
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Uitloggen
                    </Button>
                </div>
            </aside>

            {/* Main content area */}
            <main className="flex-1 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
