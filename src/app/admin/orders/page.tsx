'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { useLangStore } from '@/store/useLangStore';
import { getTranslation } from '@/lib/i18n/translations';

export default function AdminOrdersPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD string
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const { language } = useLangStore();
    const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOrders(data);
        }
        setLoading(false);
    };

    // Derived state for filtering and pagination
    const filteredOrders = orders.filter((order) => {
        // Tab Status Filter
        if (activeTab === 'paid' && order.status !== 'paid') return false;
        if (activeTab === 'pending' && order.status !== 'pending') return false;
        if (activeTab === 'failed' && order.status !== 'failed' && order.status !== 'canceled') return false;

        // Search Query Filter (Name or Email)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const nameMatch = order.customer_name?.toLowerCase().includes(query);
            const emailMatch = order.customer_email?.toLowerCase().includes(query);
            if (!nameMatch && !emailMatch) return false;
        }

        // Date Filter (Delivery Date)
        if (selectedDate) {
            // Compare the YYYY-MM-DD parts using local timezone instead of ISO string
            // Because ISO string converts to UTC causing off-by-one errors in European/Korean timezones
            const orderDateObj = new Date(order.delivery_date);
            const orderDateLocalStr = format(orderDateObj, 'yyyy-MM-dd'); // using date-fns format
            if (orderDateLocalStr !== selectedDate) return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleTabChange = (tab: 'all' | 'paid' | 'pending' | 'failed') => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to first page when filtering changes
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('adminOrders')}</h1>
                <p className="text-zinc-500 mt-2">{t('orderListDesc')}</p>
            </div>

            {/* Status Tabs */}
            <div className="flex space-x-2 border-b pb-4">
                <button
                    onClick={() => handleTabChange('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                    All Orders
                </button>
                <button
                    onClick={() => handleTabChange('paid')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'paid' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                    Paid
                </button>
                <button
                    onClick={() => handleTabChange('pending')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                    Pending
                </button>
                <button
                    onClick={() => handleTabChange('failed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'failed' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                    Canceled / Failed
                </button>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
                <div className="w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Search by Name or Email..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                </div>
                {(searchQuery || selectedDate) && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedDate('');
                            setCurrentPage(1);
                        }}
                        className="text-sm text-zinc-500 hover:text-zinc-900 underline underline-offset-4"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('orderListTitle')} <span className="text-zinc-400 text-sm font-normal ml-2">({filteredOrders.length} orders)</span></CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-zinc-500">{t('loading')}</p>
                    ) : orders.length === 0 ? (
                        <p className="text-sm text-zinc-500">{t('noOrders')}</p>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm border-collapse">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">Status</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[200px]">Datum Aanmaak</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[200px]">Leveringsdatum</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[250px]">Klant</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Adres/Pickup</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[200px]">{t('orderedItems')}</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Totaal</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {paginatedOrders.map((order) => (
                                        <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'failed' || order.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.status === 'paid' ? t('statusPaid') : order.status === 'canceled' ? t('statusCanceled') : t('statusPending')}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle font-medium text-zinc-600">
                                                {format(new Date(order.created_at), 'dd-MM-yyyy HH:mm')}
                                            </td>
                                            <td className="p-4 align-middle font-medium">
                                                {format(new Date(order.delivery_date), 'dd MMMM yyyy')}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="font-semibold">{order.customer_name}</div>
                                                <div className="text-zinc-500 text-xs">{order.customer_email}</div>
                                            </td>
                                            <td className="p-4 align-middle text-sm text-zinc-600">
                                                {order.delivery_address?.pickupLocation
                                                    ? `📍 Pickup: ${order.delivery_address.pickupLocation}`
                                                    : `🏠 ${order.delivery_address?.address || '-'}, ${order.delivery_address?.zipcode || '-'}`
                                                }
                                            </td>
                                            <td className="p-4 align-middle text-sm">
                                                {Array.isArray(order.order_items) ? (
                                                    <ul className="list-disc list-inside text-zinc-700">
                                                        {order.order_items.map((item: Record<string, unknown>, idx: number) => (
                                                            <li key={idx} className="whitespace-nowrap">
                                                                <span className="font-semibold">{String(item.quantity)}x</span> {String(item.name)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-zinc-400 italic">No details</span>
                                                )}
                                                {order.special_request && (
                                                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-100 whitespace-pre-wrap">
                                                        <strong>{t('specialRequest')}:</strong> {order.special_request}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle text-right font-medium text-zinc-900">
                                                € {Number(order.total_amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}</span> of <span className="font-medium">{filteredOrders.length}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {[...Array(totalPages)].map((_, idx) => {
                                            const page = idx + 1;
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${currentPage === page ? 'z-10 bg-zinc-900 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
