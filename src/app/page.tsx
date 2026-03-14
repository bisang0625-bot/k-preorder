import { ProductSelection } from '@/components/features/ProductSelection';
import { OrderSummary } from '@/components/features/OrderSummary';
import { OrderForm } from '@/components/features/OrderForm';
import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Ensures the page stays dynamic

export default async function Home() {
  // Fetch real data from Supabase DB on every page load
  const { data: productsData } = await supabase.from('products').select('*').eq('is_active', true);
  const { data: settingsData } = await supabase.from('store_settings').select('*').eq('id', 1).single();

  const products = (productsData || []).map(p => {
    const isFallbackUrl = p.image_url === 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=600&auto=format&fit=crop';

    return {
      ...p,
      imageUrl: isFallbackUrl ? null : p.image_url, // map snake_case from DB to camelCase for frontend, avoiding fallback
    };
  });
  const settings = {
    allowedDates: settingsData?.allowed_dates || [],
    zipcodes: settingsData?.valid_zipcodes || [],
    pickups: settingsData?.pickup_locations || [],
    topDescription: settingsData?.top_description || "Experience authentic Korean flavors. Select your favorite dishes and pick a delivery or pickup date.",
    footerInfo: settingsData?.footer_info || "Hanok Pre-order\nEmail: info@hanok.nl",
  };
  return (
    <main className="min-h-screen bg-zinc-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-4">
            Hanok Pre-order
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto whitespace-pre-wrap">
            {settings.topDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-12">
            <ProductSelection products={products} />
            
            <div className="block lg:hidden">
              <OrderSummary />
            </div>

            <OrderForm settings={settings} />
          </div>

          <div className="hidden lg:block lg:col-span-4">
            <OrderSummary />
          </div>
        </div>

        {/* Dynamic Footer Area */}
        <div className="mt-20 pt-8 border-t border-zinc-200 text-center">
          <p className="text-sm text-zinc-500 whitespace-pre-wrap leading-relaxed">
            {settings.footerInfo}
          </p>
        </div>
      </div>
    </main>
  );
}
