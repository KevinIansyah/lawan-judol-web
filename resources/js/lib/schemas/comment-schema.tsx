import { z } from 'zod';

export const CommentSchema = z.object({
    comment_id: z.string(),
    text: z.string(),
    label: z.union([z.literal(0), z.literal(1)]),
    source: z.string(),
    timestamp: z.string(),
    is_reply: z.boolean(),
    user_metadata: z.object({
        username: z.string(),
        user_id: z.string(),
        profile_url: z.string(),
    }),
    status: z.enum(['heldForReview', 'reject', 'draft', 'database']),
    parent_id: z.string().optional(),
});

export type Comment = z.infer<typeof CommentSchema>;
