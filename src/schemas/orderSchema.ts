import * as z from 'zod';

export const createOrderSchema = (deliveryZipcodes: string[], validPickupLocations: string[]) => z.object({
    deliveryMethod: z.enum(['delivery', 'pickup'], {
        message: 'Please select a delivery method.',
    }),
    deliveryDate: z.date({
        message: 'Please select a date.',
    }),
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    confirmEmail: z.string().email('Please enter a valid email address.'),
    phone: z.string().min(10, 'Please enter a valid phone number (최소 10자).'),

    // Delivery fields
    address: z.string().optional(),
    zipcode: z.string().optional(),

    // Pickup fields
    pickupLocation: z.string().optional(),

    // Extra fields
    specialRequest: z.string().max(500, 'Special request is too long.').optional(),
}).superRefine((data, ctx) => {
    if (data.email !== data.confirmEmail) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['confirmEmail'],
            message: 'E-mailadressen komen niet overeen (Emails do not match).',
        });
    }

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
        } else if (deliveryZipcodes && deliveryZipcodes.length > 0) {
            // Extract only the first 4 numeric digits from customer's input (e.g. "1012 AB" -> "1012")
            const customerNumericZip = data.zipcode.replace(/\D/g, '').substring(0, 4);

            // Normalize admin zipcodes to only keep digits as well
            const validNumericZips = deliveryZipcodes.map(z => z.replace(/\D/g, '').substring(0, 4));

            if (customerNumericZip.length !== 4 || !validNumericZips.includes(customerNumericZip)) {
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
        } else if (validPickupLocations && validPickupLocations.length > 0) {
            // Optional: validate if the select pickup location actually exists in settings
            if (!validPickupLocations.includes(data.pickupLocation)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['pickupLocation'],
                    message: 'Ongeldige ophaallocatie (Invalid pickup location).',
                });
            }
        }
    }
});

// Update the type extraction since it's now a factory
export type OrderFormValues = z.infer<ReturnType<typeof createOrderSchema>>;
