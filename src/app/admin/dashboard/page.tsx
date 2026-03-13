'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useLangStore } from '@/store/useLangStore';
import { getTranslation } from '@/lib/i18n/translations';
import { TagInput } from '@/components/ui/tag-input';

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [dates, setDates] = useState<string[]>([]);
    const [zipcodes, setZipcodes] = useState<string[]>([]);
    const [pickups, setPickups] = useState<string[]>([]);
    const [topDescription, setTopDescription] = useState('');
    const [footerInfo, setFooterInfo] = useState('');

    const [products, setProducts] = useState<Record<string, unknown>[]>([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [addingProduct, setAddingProduct] = useState(false);
    const { language } = useLangStore();
    const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

    useEffect(() => {
        fetchSettingsAndProducts();
    }, []);

    const fetchSettingsAndProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('store_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (data && !error) {
            setDates(data.allowed_dates || []);
            setZipcodes(data.valid_zipcodes || []);
            setPickups(data.pickup_locations || []);
            setTopDescription(data.top_description || '');
            setFooterInfo(data.footer_info || '');
        }

        const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: true });
        if (prodData) {
            setProducts(prodData);
        }

        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            allowed_dates: dates.filter(Boolean),
            valid_zipcodes: zipcodes.filter(Boolean),
            pickup_locations: pickups.filter(Boolean),
            top_description: topDescription,
            footer_info: footerInfo,
        };

        const { error } = await supabase
            .from('store_settings')
            .update(payload)
            .eq('id', 1);

        setSaving(false);
        if (error) {
            alert(t('savedError') + ' ' + error.message);
        } else {
            alert(t('savedSuccess'));
        }
    };

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price) {
            alert(t('nameRequired'));
            return;
        }
        setAddingProduct(true);

        let finalImageUrl: string | null = null;

        // 1. Upload Image if exists
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `menu-images/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
                .from('product-images')
                .upload(filePath, imageFile);

            if (uploadError) {
                alert('Afbeelding uploaden mislukt (Image upload failed): ' + uploadError.message);
                setAddingProduct(false);
                return;
            }

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
            finalImageUrl = publicUrl;
        }

        // 2. Insert Product
        const { error } = await supabase.from('products').insert([{
            name: newProduct.name,
            price: parseFloat(newProduct.price),
            description: newProduct.description,
            image_url: finalImageUrl
        }]);
        setAddingProduct(false);

        if (error) {
            alert('Error adding product: ' + error.message);
        } else {
            setNewProduct({ name: '', price: '', description: '' });
            setImageFile(null);
            fetchSettingsAndProducts(); // Refresh list
        }
    };

    const handleDeleteProduct = async (id: string, imageUrl: string) => {
        if (confirm(t('deleteConfirm'))) {
            // Delete product (optional: also delete image from storage to save space) // TODO
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) {
                alert('Error deleting product: ' + error.message);
            } else {
                fetchSettingsAndProducts();
            }
        }
    };

    if (loading) return <div className="p-6">{t('loading')}</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('adminDashboard')}</h1>
                <p className="text-zinc-500 mt-2">{t('settingsDesc')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('deliveryPickupSettings')}</CardTitle>
                    <CardDescription>
                        {t('deliveryPickupDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t('topDescriptionLabel')}</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                            value={topDescription}
                            onChange={(e) => setTopDescription(e.target.value)}
                            placeholder="Welcome to Hanok..."
                        />
                        <p className="text-xs text-zinc-500">
                            {t('topDescriptionSub')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('footerInfoLabel')}</Label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                            value={footerInfo}
                            onChange={(e) => setFooterInfo(e.target.value)}
                            placeholder="Contact: 0612345678&#10;KVK: 12345678"
                        />
                        <p className="text-xs text-zinc-500">
                            {t('footerInfoSub')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('allowedDates')}</Label>
                        <TagInput
                            tags={dates}
                            setTags={setDates}
                            placeholder="e.g. 2026-03-05"
                        />
                        <p className="text-xs text-zinc-500">
                            {t('allowedDatesSub')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('validZipcodes')}</Label>
                        <TagInput
                            tags={zipcodes}
                            setTags={setZipcodes}
                            placeholder="e.g. 1012"
                        />
                        <p className="text-xs text-zinc-500">
                            {t('validZipcodesSub')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('pickupLocations')}</Label>
                        <TagInput
                            tags={pickups}
                            setTags={setPickups}
                            placeholder="e.g. Amsterdam Centrum"
                        />
                        <p className="text-xs text-zinc-500">
                            {t('pickupLocationsSub')}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? t('saving') : t('save')}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('manageProducts')}</CardTitle>
                    <CardDescription>
                        {t('manageProductsDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* List Existing Products */}
                    <div className="space-y-4">
                        {products.map((p: any) => (
                            <div key={p.id as string} className="flex items-center justify-between p-4 bg-zinc-50 border rounded-lg hover:shadow-sm transition-shadow">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 w-16 h-16 bg-zinc-200 rounded-md overflow-hidden relative border border-zinc-200">
                                        {p.image_url && p.image_url !== 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=600&auto=format&fit=crop' ? (
                                            <img src={p.image_url} alt={p.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{p.name}</h4>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 rounded-sm border border-emerald-100">€ {Number(p.price).toFixed(2)}</span>
                                            <span className="text-xs text-zinc-500 line-clamp-1 max-w-[200px]">{p.description}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600 flex-shrink-0" onClick={() => handleDeleteProduct(p.id, p.image_url)}>
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        ))}
                        {products.length === 0 && <p className="text-sm text-zinc-500 italic">{t('noProducts')}</p>}
                    </div>

                    {/* Add New Product Form */}
                    <div className="pt-6 border-t space-y-4">
                        <h4 className="font-semibold text-lg">{t('addNewProduct')}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('productName')} *</Label>
                                <Input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. Kimchi Fried Rice" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('productPrice')} *</Label>
                                <Input type="number" step="0.5" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="12.50" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>{t('productDesc')}</Label>
                                <Input value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="A delicious Korean dish..." />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>{t('uploadImage')}</Label>
                                <div className="flex items-center space-x-4">
                                    <Input
                                        type="file"
                                        accept="image/jpeg, image/png, image/webp"
                                        className="cursor-pointer file:cursor-pointer"
                                        onChange={e => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setImageFile(e.target.files[0]);
                                            } else {
                                                setImageFile(null);
                                            }
                                        }}
                                    />
                                    {imageFile && <span className="text-sm text-emerald-600 font-medium whitespace-nowrap">✓ {t('fileSelected')}</span>}
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">{t('uploadHint')}</p>
                            </div>
                        </div>
                        <Button className="w-full mt-2" onClick={handleAddProduct} disabled={addingProduct}>
                            <Plus className="w-4 h-4 mr-2" /> {addingProduct ? t('saving') : t('add')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
