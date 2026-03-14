import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

interface OrderData {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_date: string;
    delivery_address: {
        address?: string;
        zipcode?: string;
        pickupLocation?: string;
    };
    order_items: Array<{ name: string; quantity: number; price: number }>;
    special_request?: string | null;
    total_amount: number;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatDeliveryInfo(address: OrderData['delivery_address']): string {
    if (address?.pickupLocation) {
        return `📍 Pickup: ${address.pickupLocation}`;
    }
    return `🏠 ${address?.address || '-'}, ${address?.zipcode || '-'}`;
}

function buildItemsHtml(items: OrderData['order_items']): string {
    return items
        .map(
            (item) =>
                `<tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333;">${item.name}</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333; text-align: center;">${item.quantity}</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333; text-align: right;">€ ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>`
        )
        .join('');
}

function customerEmailHtml(order: OrderData): string {
    return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #1a1a1a; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">한옥</h1>
            <p style="color: #a0a0a0; margin: 8px 0 0 0; font-size: 14px;">주문 확인 메일</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
            <p style="font-size: 16px; color: #333; margin: 0 0 24px 0;">
                안녕하세요, <strong>${order.customer_name}</strong>님!<br/>
                주문해 주셔서 감사합니다. 결제가 완료되었습니다. ✅
            </p>

            <!-- Order Info -->
            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="font-size: 13px; color: #888; padding: 4px 0;">주문번호</td>
                        <td style="font-size: 13px; color: #333; padding: 4px 0; text-align: right; font-family: monospace;">${order.id.slice(0, 8)}...</td>
                    </tr>
                    <tr>
                        <td style="font-size: 13px; color: #888; padding: 4px 0;">배달/픽업 날짜</td>
                        <td style="font-size: 13px; color: #333; padding: 4px 0; text-align: right;">${formatDate(order.delivery_date)}</td>
                    </tr>
                    <tr>
                        <td style="font-size: 13px; color: #888; padding: 4px 0;">배달/픽업 정보</td>
                        <td style="font-size: 13px; color: #333; padding: 4px 0; text-align: right;">${formatDeliveryInfo(order.delivery_address)}</td>
                    </tr>
                </table>
            </div>

            <!-- Order Items -->
            <h3 style="font-size: 15px; color: #333; margin: 0 0 12px 0;">주문 상품</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <thead>
                    <tr style="border-bottom: 2px solid #eee;">
                        <th style="text-align: left; padding: 8px 0; font-size: 12px; color: #888; font-weight: 600;">상품</th>
                        <th style="text-align: center; padding: 8px 0; font-size: 12px; color: #888; font-weight: 600;">수량</th>
                        <th style="text-align: right; padding: 8px 0; font-size: 12px; color: #888; font-weight: 600;">금액</th>
                    </tr>
                </thead>
                <tbody>
                    ${buildItemsHtml(order.order_items)}
                </tbody>
            </table>

            <!-- Total -->
            <div style="text-align: right; padding: 12px 0; border-top: 2px solid #1a1a1a;">
                <span style="font-size: 18px; font-weight: 700; color: #1a1a1a;">합계: € ${Number(order.total_amount).toFixed(2)}</span>
            </div>

            ${order.special_request ? `
            <div style="margin-top: 20px; padding: 12px 16px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
                <p style="margin: 0; font-size: 13px; color: #92400e;"><strong>특별 요청:</strong> ${order.special_request}</p>
            </div>
            ` : ''}
        </div>

        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 24px 32px; text-align: center;">
            <p style="font-size: 14px; color: #333; margin: 0 0 8px 0; font-weight: 600;">
                📞 Hanok 전화번호: +31 6 8113 2233
            </p>
            <p style="font-size: 12px; color: #888; margin: 0;">
                문의사항이 있으시면 이 이메일에 답장하거나 위 번호로 연락해 주세요.<br/>
                감사합니다 — 한옥 팀
            </p>
        </div>
    </div>`;
}

function adminEmailHtml(order: OrderData): string {
    return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="background-color: #dc2626; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">🔔 새 주문이 들어왔습니다!</h1>
        </div>

        <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #888;">주문번호</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #333; font-family: monospace;">${order.id}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #888;">고객 이름</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #333; font-weight: 600;">${order.customer_name}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #888;">고객 이메일</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #333;">${order.customer_email}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #888;">고객 전화번호</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #333; font-weight: 600;">${order.customer_phone}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #888;">배달/픽업</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #333;">${formatDeliveryInfo(order.delivery_address)}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #888;">배달 날짜</td>
                    <td style="padding: 6px 0; font-size: 13px; color: #333;">${formatDate(order.delivery_date)}</td>
                </tr>
            </table>

            <h3 style="font-size: 14px; color: #333; margin: 0 0 8px 0;">주문 상품</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
                ${buildItemsHtml(order.order_items)}
            </table>

            <div style="text-align: right; padding: 8px 0; border-top: 2px solid #333;">
                <strong style="font-size: 16px; color: #333;">합계: € ${Number(order.total_amount).toFixed(2)}</strong>
            </div>

            ${order.special_request ? `
            <div style="margin-top: 16px; padding: 10px 14px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
                <p style="margin: 0; font-size: 13px; color: #92400e;"><strong>⚠️ 특별 요청:</strong> ${order.special_request}</p>
            </div>
            ` : ''}
        </div>
    </div>`;
}

export async function sendOrderConfirmation(order: OrderData): Promise<boolean> {
    try {
        await transporter.sendMail({
            from: `"한옥" <${process.env.GMAIL_USER}>`,
            to: order.customer_email,
            subject: `[한옥] 주문이 확인되었습니다 — #${order.id.slice(0, 8)}`,
            html: customerEmailHtml(order),
        });

        console.log(`✅ Customer confirmation email sent to ${order.customer_email}`);
        return true;
    } catch (err) {
        console.error('Customer email exception:', err);
        return false;
    }
}

export async function sendAdminNotification(order: OrderData): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || '';

    try {
        await transporter.sendMail({
            from: `"한옥 주문알림" <${process.env.GMAIL_USER}>`,
            to: adminEmail,
            subject: `[새 주문] ${order.customer_name} — € ${Number(order.total_amount).toFixed(2)}`,
            html: adminEmailHtml(order),
        });

        console.log(`✅ Admin notification email sent to ${adminEmail}`);
        return true;
    } catch (err) {
        console.error('Admin email exception:', err);
        return false;
    }
}
