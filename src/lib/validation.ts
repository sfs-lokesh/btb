import { z } from 'zod';

// Participant Registration Schema
export const participantSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    collegeId: z.string().min(1, 'Please select a college'),

    // Team Details
    teamType: z.enum(['Solo', 'Team of 2', 'Team of 3', 'Team of 4']),
    teamName: z.string().optional(),
    teamMembers: z.array(z.string()).optional(),

    // Project Details
    category: z.enum(['Web Development', 'App Development', 'Software', 'VFX', '3D', 'Animation', 'Film', 'Product', 'Startup', 'Other']),
    projectTitle: z.string().min(3, 'Project title is required'),
    projectDescription: z.string().min(10, 'Project description must be at least 10 characters'),
    projectLinks: z.string().url('Invalid URL').optional().or(z.literal('')),

    skillVerification: z.boolean().refine(val => val === true, 'You must verify your skills'),

    // Coupon
    couponCode: z.string().optional()
}).superRefine((data, ctx) => {
    if (data.teamType !== 'Solo') {
        if (!data.teamName || data.teamName.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Team name is required for teams",
                path: ["teamName"]
            });
        }

        let requiredMembers = 0;
        if (data.teamType === 'Team of 2') requiredMembers = 1;
        if (data.teamType === 'Team of 3') requiredMembers = 2;
        if (data.teamType === 'Team of 4') requiredMembers = 3;

        if (!data.teamMembers || data.teamMembers.length !== requiredMembers) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Please add exactly ${requiredMembers} team members`,
                path: ["teamMembers"]
            });
        }
    }
});

// College Creation Schema
export const collegeSchema = z.object({
    name: z.string().min(3, 'College name is required'),
    couponCode: z.string().min(3, 'Coupon code is required').regex(/^[A-Z0-9]+$/, 'Coupon code must be uppercase alphanumeric'),
    discountAmount: z.number().min(0, 'Discount amount cannot be negative')
});

// Influencer Coupon Schema
export const couponSchema = z.object({
    code: z.string().min(3, 'Coupon code is required').regex(/^[A-Z0-9]+$/, 'Coupon code must be uppercase alphanumeric'),
    discountAmount: z.number().min(0, 'Discount amount cannot be negative'),
    usageLimit: z.number().min(1, 'Usage limit must be at least 1').optional().nullable(),
    expiryDate: z.string().optional().nullable()
});

// Stall Booking Schema
export const stallBookingSchema = z.object({
    stallId: z.string().min(1, 'Stall ID is required'),
    sponsorName: z.string().min(2, 'Sponsor name is required'),
    sponsorEmail: z.string().email('Invalid email address'),
    sponsorPhone: z.string().min(10, 'Phone number is required')
});

// Login Schema
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});
