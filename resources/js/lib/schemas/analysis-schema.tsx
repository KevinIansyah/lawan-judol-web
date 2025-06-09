import { z } from 'zod';

export const analysisSchema = z.object({
    id: z.number(),
    title: z.string(),
    status: z.enum(['queue', 'in_process', 'failed', 'done']),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Analysis = z.infer<typeof analysisSchema>;
