import * as z from 'zod';

export const deliveryZipcodes = ['1012 AB', '1012AC', '1013 CD', '1014 EF'];

export const orderSchema = z.object({
    deliveryMethod: z.enum(['delivery', 'pickup'], {
        message: 'Please select a delivery method.',
    }),
    deliveryDate: z.date({
        message: 'Please select a date.',
    }),
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    phone: z.string().min(10, 'Please enter a valid phone number.').optional(),

    // Delivery fields
    address: z.string().optional(),
    zipcode: z.string().optional(),

    // Pickup fields
    pickupLocation: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.deliveryMethod === 'delivery') {
        if (!data.address || data.address.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['address'],
                message: 'Address is required for delivery.',
            });
        }

        // Zipcode validation
        if (!data.zipcode || data.zipcode.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['zipcode'],
                message: 'Zipcode is required for delivery.',
            });
        } else {
            const normalizedZip = data.zipcode.replace(/\s+/g, '').toUpperCase();
            const validZips = deliveryZipcodes.map(z => z.replace(/\s+/g, '').toUpperCase());

            if (!validZips.includes(normalizedZip)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['zipcode'],
                    message: '해당 지역은 현재 배송이 불가합니다 (Delivery not available for this zipcode).',
                });
            }
        }
    }

    if (data.deliveryMethod === 'pickup') {
        if (!data.pickupLocation || data.pickupLocation.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['pickupLocation'],
                message: 'Please select a pickup location.',
            });
        }
    }
});

export type OrderFormValues = z.infer<typeof orderSchema>;
