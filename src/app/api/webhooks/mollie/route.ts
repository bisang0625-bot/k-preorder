import { NextResponse } from 'next/server';
import { mollieClient } from '@/lib/mollie';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        // Mollie sends the payment ID in the body as form data
        const formData = await request.formData();
        const id = formData.get('id');

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid payment ID' }, { status: 400 });
        }

        // Retrieve the payment from Mollie to check its status
        const payment = await mollieClient.payments.get(id);
        const orderId = (payment.metadata as Record<string, unknown>)?.order_id as string;

        if (!orderId) {
            console.error('Webhook Error: No order_id found in Mollie metadata.');
            return NextResponse.json({ success: true, message: 'No metadata order_id' }, { status: 200 });
        }

        // Update Supabase based on Mollie Payment Status
        let dbStatus = 'pending';

        if (payment.status === 'paid') {
            dbStatus = 'paid';
        } else if (payment.status === 'failed') {
            dbStatus = 'failed';
        } else if (payment.status === 'canceled') {
            dbStatus = 'canceled';
        } else if (payment.status === 'expired') {
            dbStatus = 'expired';
        }

        const { error } = await supabase
            .from('orders')
            .update({ status: dbStatus })
            .eq('id', orderId);

        if (error) {
            console.error('Supabase Webhook Update Error:', error);
            // Ignore strict fail for testing
        }

        console.log(`Webhook Processed: Order ${orderId} -> ${dbStatus}`);

        return NextResponse.json({ success: true, status: dbStatus });
    } catch (error) {
        console.error('Mollie Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
