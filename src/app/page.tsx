import { ProductSelection } from '@/components/features/ProductSelection';
import { OrderSummary } from '@/components/features/OrderSummary';
import { OrderForm } from '@/components/features/OrderForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-4">
            Hanok Pre-order
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Experience authentic Korean flavors. Select your favorite dishes and pick a delivery or pickup date.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-12">
            <ProductSelection />
            <OrderForm />
          </div>

          <div className="lg:col-span-4">
            <OrderSummary />
          </div>
        </div>
      </div>
    </main>
  );
}
