import { z } from 'zod';

export const keywordSchema = z.object({
    id: z.number(),
    keyword: z.string(),
    label: z.union([z.literal(0), z.literal(1)]),
});

export type Keyword = z.infer<typeof keywordSchema>;
