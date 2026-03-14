'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, parse } from 'date-fns';
import { nl, enUS, ko } from 'date-fns/locale';
import { useLangStore } from '@/store/useLangStore';
import { getTranslation } from '@/lib/i18n/translations';
import { CalendarIcon, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function AdminOrdersPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending' | 'fulfilled' | 'expired' | 'failed'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD string
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const { language } = useLangStore();
    const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

    const localeMap = {
        nl: nl,
        en: enUS,
        ko: ko,
    };
    const currentLocale = localeMap[language as keyof typeof localeMap] || nl;

    const dateValue = selectedDate ? parse(selectedDate, 'yyyy-MM-dd', new Date()) : undefined;

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

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (!error) {
            // Update local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            alert(t('statusUpdated'));
        } else {
            alert('Error updating status: ' + error.message);
        }
    };

    // Derived state for filtering and pagination
    const filteredOrders = orders.filter((order) => {
        // Tab Status Filter
        if (activeTab === 'paid' && order.status !== 'paid') return false;
        if (activeTab === 'pending' && order.status !== 'pending') return false;
        if (activeTab === 'fulfilled' && order.status !== 'fulfilled') return false;
        if (activeTab === 'expired' && order.status !== 'expired') return false;
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

        // Column Filters (Excel-like)
        if (columnFilters['status'] && columnFilters['status'].length > 0) {
            if (!columnFilters['status'].includes(order.status)) return false;
        }
        if (columnFilters['delivery_date'] && columnFilters['delivery_date'].length > 0) {
            const dateStr = format(new Date(order.delivery_date), 'dd MMMM yyyy');
            if (!columnFilters['delivery_date'].includes(dateStr)) return false;
        }
        if (columnFilters['customer_name'] && columnFilters['customer_name'].length > 0) {
            if (!columnFilters['customer_name'].includes(order.customer_name)) return false;
        }
        if (columnFilters['customer_address'] && columnFilters['customer_address'].length > 0) {
            const addr = order.delivery_address?.pickupLocation
                ? `📍 Pickup: ${order.delivery_address.pickupLocation}`
                : `🏠 ${order.delivery_address?.address || '-'}, ${order.delivery_address?.zipcode || '-'}`;
            if (!columnFilters['customer_address'].includes(addr)) return false;
        }

        return true;
    });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Reset to first page when sorting changes
    };

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        
        let aValue = a[key] ?? '';
        let bValue = b[key] ?? '';

        // Handle specific nested/calculated columns if necessary
        if (key === 'customer_address') {
            aValue = a.delivery_address?.pickupLocation ? `Pickup ${a.delivery_address.pickupLocation}` : `${a.delivery_address?.address} ${a.delivery_address?.zipcode}`;
            bValue = b.delivery_address?.pickupLocation ? `Pickup ${b.delivery_address.pickupLocation}` : `${b.delivery_address?.address} ${b.delivery_address?.zipcode}`;
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = sortedOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleTabChange = (tab: 'all' | 'paid' | 'pending' | 'fulfilled' | 'expired' | 'failed') => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to first page when filtering changes
    };

    const toggleColumnFilter = (key: string, val: string) => {
        setColumnFilters(prev => {
            const curr = prev[key] || [];
            const next = curr.includes(val) ? curr.filter(v => v !== val) : [...curr, val];
            return { ...prev, [key]: next };
        });
        setCurrentPage(1);
    };

    const getUniqueValues = (key: string) => {
        const vals = new Set<string>();
        orders.forEach(o => {
            if (key === 'status') vals.add(o.status);
            if (key === 'delivery_date') vals.add(format(new Date(o.delivery_date), 'dd MMMM yyyy'));
            if (key === 'customer_name') vals.add(o.customer_name);
            if (key === 'customer_address') {
                 const addr = o.delivery_address?.pickupLocation
                    ? `📍 Pickup: ${o.delivery_address.pickupLocation}`
                    : `🏠 ${o.delivery_address?.address || '-'}, ${o.delivery_address?.zipcode || '-'}`;
                 vals.add(addr);
            }
        });
        return Array.from(vals).filter(Boolean).sort();
    };

    const getDisplayValue = (key: string, val: string) => {
        if (key === 'status') {
            const statusMap: Record<string, string> = {
                pending: t('statusPending'),
                paid: t('statusPaid'),
                fulfilled: t('statusFulfilled'),
                expired: t('statusExpired'),
                canceled: t('statusCanceled'),
                failed: t('statusFailed')
            };
            return statusMap[val] || val;
        }
        return val;
    };

    const renderFilter = (key: string) => {
        const uniqueVals = getUniqueValues(key);
        if (uniqueVals.length === 0) return null;
        const selected = columnFilters[key] || [];
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <button className={`ml-1 focus:outline-none p-1 rounded hover:bg-zinc-200 transition-colors ${selected.length > 0 ? 'text-blue-600 opacity-100 bg-blue-50' : 'text-zinc-400 opacity-40 group-hover:opacity-100'}`} onClick={(e) => e.stopPropagation()}>
                        <Filter className="w-4 h-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                    <div className="text-xs font-semibold text-zinc-500 mb-2 px-1">Filter {key.replace('_', ' ')}</div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                        {uniqueVals.map(val => (
                            <div key={val} className="flex items-center space-x-2 text-sm p-1 hover:bg-zinc-100 rounded cursor-pointer" onClick={() => toggleColumnFilter(key, val)}>
                                <input type="checkbox" checked={selected.includes(val)} readOnly className="rounded border-zinc-300 pointer-events-none" />
                                <span className="truncate select-none" title={getDisplayValue(key, val)}>{getDisplayValue(key, val)}</span>
                            </div>
                        ))}
                    </div>
                    {selected.length > 0 && (
                        <div className="pt-2 mt-2 border-t text-xs text-center text-red-500 cursor-pointer hover:underline" onClick={() => setColumnFilters(p => ({...p, [key]: []}))}>
                            Clear Filter
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        );
    };
    
    const getSortIcon = (columnName: string) => {
        if (!sortConfig || sortConfig.key !== columnName) {
            return <ArrowUpDown className="w-4 h-4 ml-1 inline-block opacity-40 group-hover:opacity-100" />;
        }
        if (sortConfig.direction === 'asc') {
            return <ArrowUp className="w-4 h-4 ml-1 inline-block text-zinc-900" />;
        }
        return <ArrowDown className="w-4 h-4 ml-1 inline-block text-zinc-900" />;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('adminOrders')}</h1>
                <p className="text-zinc-500 mt-2">{t('orderListDesc')}</p>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 border-b pb-4">
                <button
                    onClick={() => handleTabChange('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                    {t('tabAll')}
                </button>
                <button
                    onClick={() => handleTabChange('paid')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'paid' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                    {t('tabPaid')}
                </button>
                <button
                    onClick={() => handleTabChange('pending')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                    {t('tabPending')}
                </button>
                <button
                    onClick={() => handleTabChange('fulfilled')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'fulfilled' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                    {t('tabFulfilled')}
                </button>
                <button
                    onClick={() => handleTabChange('expired')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'expired' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                    {t('tabExpired')}
                </button>
                <button
                    onClick={() => handleTabChange('failed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'failed' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
                >
                    {t('tabFailed')}
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
                <div className="w-full sm:w-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full sm:w-[240px] justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? (
                                    format(dateValue!, "PPP", { locale: currentLocale })
                                ) : (
                                    <span>Filter by Date...</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateValue}
                                onSelect={(date) => {
                                    if (date) {
                                        setSelectedDate(format(date, 'yyyy-MM-dd'));
                                    } else {
                                        setSelectedDate('');
                                    }
                                    setCurrentPage(1);
                                }}
                                initialFocus
                                locale={currentLocale}
                            />
                        </PopoverContent>
                    </Popover>
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
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[120px] group select-none">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center cursor-pointer hover:text-zinc-900" onClick={() => handleSort('status')}>Status {getSortIcon('status')}</div>
                                                {renderFilter('status')}
                                            </div>
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[200px] cursor-pointer hover:text-zinc-900 group select-none" onClick={() => handleSort('created_at')}>
                                            <div className="flex items-center">Datum Aanmaak {getSortIcon('created_at')}</div>
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[210px] group select-none">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center cursor-pointer hover:text-zinc-900" onClick={() => handleSort('delivery_date')}>Leveringsdatum {getSortIcon('delivery_date')}</div>
                                                {renderFilter('delivery_date')}
                                            </div>
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[250px] group select-none">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center cursor-pointer hover:text-zinc-900" onClick={() => handleSort('customer_name')}>Klant {getSortIcon('customer_name')}</div>
                                                {renderFilter('customer_name')}
                                            </div>
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground group select-none">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center cursor-pointer hover:text-zinc-900" onClick={() => handleSort('customer_address')}>Adres/Pickup {getSortIcon('customer_address')}</div>
                                                {renderFilter('customer_address')}
                                            </div>
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[200px]">{t('orderedItems')}</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground cursor-pointer hover:text-zinc-900 group select-none text-right" onClick={() => handleSort('total_amount')}>
                                            <div className="flex items-center justify-end">Totaal {getSortIcon('total_amount')}</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {paginatedOrders.map((order) => (
                                        <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className={`rounded-md px-2.5 py-1 text-xs font-semibold border-0 focus:ring-2 focus:ring-zinc-900 cursor-pointer ${
                                                        order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                                                        order.status === 'failed' || order.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    <option value="pending">{t('statusPending')}</option>
                                                    <option value="paid">{t('statusPaid')}</option>
                                                    <option value="fulfilled">{t('statusFulfilled')}</option>
                                                    <option value="expired">{t('statusExpired')}</option>
                                                    <option value="canceled">{t('statusCanceled')}</option>
                                                    <option value="failed">{t('statusFailed')}</option>
                                                </select>
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
