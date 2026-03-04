import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccessPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const orderId = searchParams.orderId as string;

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-zinc-200">
                <div className="flex justify-center mb-6">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight mb-2">
                    Bedankt voor uw bestelling!
                </h1>
                <p className="text-zinc-500 mb-6">
                    (Thank you for your order!)
                </p>

                <div className="bg-zinc-50 rounded-lg p-4 mb-8 text-left border border-zinc-100">
                    <p className="text-sm text-zinc-600 mb-1">Ordernummer (Order ID):</p>
                    <p className="font-mono font-medium">{orderId || 'Unknown'}</p>
                </div>

                <p className="text-sm text-zinc-600 mb-8 leading-relaxed">
                    We hebben u een bevestigingsmail gestuurd. <br />
                    Als u vragen heeft, neem dan contact met ons op.
                </p>

                <div className="space-y-3">
                    <Button asChild className="w-full">
                        <Link href="/">Terug naar home (Return Home)</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
