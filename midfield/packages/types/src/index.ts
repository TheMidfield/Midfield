// Export Supabase-generated types
export type { Database, Tables, TablesInsert, TablesUpdate } from './supabase';
import type { Tables, TablesInsert } from './supabase';

// Convenience type exports (mapped from Supabase types)
export type User = Tables<'users'>;
export type Topic = Tables<'topics'>;
export type Post = Tables<'posts'>;
export type TopicRelationship = Tables<'topic_relationships'>;
export type Follow = Tables<'follows'>;

// Insert types for mutations
export type UserInsert = TablesInsert<'users'>;
export type TopicInsert = TablesInsert<'topics'>;
export type PostInsert = TablesInsert<'posts'>;
export type TopicRelationshipInsert = TablesInsert<'topic_relationships'>;
export type FollowInsert = TablesInsert<'follows'>;

// Type constants
export const TOPIC_TYPES = ['club', 'player', 'competition', 'match', 'transfer'] as const;
export const RELATIONSHIP_TYPES = ['plays_for', 'competes_in', 'participates_in', 'transferred_from', 'transferred_to'] as const;

export type TopicType = typeof TOPIC_TYPES[number];
export type RelationshipType = typeof RELATIONSHIP_TYPES[number];
