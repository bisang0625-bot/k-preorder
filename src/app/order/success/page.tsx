import { SuccessClient } from './SuccessClient';

export default async function OrderSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const orderId = params.orderId as string;

    return <SuccessClient orderId={orderId} />;
}
