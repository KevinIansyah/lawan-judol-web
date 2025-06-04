import { z } from 'zod';

export const analysisSchema = z.object({
    // id: z.number(),
    // header: z.string(),
    // type: z.string(),
    // status: z.string(),
    // target: z.string(),
    // limit: z.string(),
    // reviewer: z.string(),
    id: z.number(),
    title: z.string(),
    status: z.enum(['queued', 'in_process', 'failed', 'done']),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Analysis = z.infer<typeof analysisSchema>;
