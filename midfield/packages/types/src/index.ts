import { z } from "zod";

export const UserSchema = z.object({
    id: z.string().uuid(),
    username: z.string().min(3),
    email: z.string().email().optional(),
    avatar_url: z.string().url().optional(),
    created_at: z.string().datetime(),
});

export const TopicSchema = z.object({
    id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
    image_url: z.string().url().optional(),
    type: z.enum(["player", "club", "team", "other"]),
});

export const PostSchema = z.object({
    id: z.string().uuid(),
    topic_id: z.string().uuid(),
    user_id: z.string().uuid(),
    content: z.string().min(1),
    created_at: z.string().datetime(),
});

export const CommentSchema = z.object({
    id: z.string().uuid(),
    post_id: z.string().uuid(),
    user_id: z.string().uuid(),
    content: z.string().min(1),
    created_at: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;
export type Topic = z.infer<typeof TopicSchema> & {
    metadata?: any;
};
export type Post = z.infer<typeof PostSchema>;
export type Comment = z.infer<typeof CommentSchema>;
