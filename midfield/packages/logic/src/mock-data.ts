/**
 * Sample mock data for Midfield MVP
 * 
 * This data follows the database philosophy:
 * - Topics = canonical entities (player, club, competition, match, transfer)
 * - Posts = takes tied to exactly one topic
 * - TopicRelationships = graph layer for unified feeds
 * - Follows = user topic subscriptions
 */

import type { TopicInsert, PostInsert, TopicRelationshipInsert, FollowInsert, UserInsert } from '@midfield/types';

// ============================================================================
// USERS (Using real authenticated user)
// ============================================================================

export const mockUsers: UserInsert[] = [
  {
    id: '61b548b6-f053-40af-b56c-c457bd18eb95', // Real user from auth.users
    username: 'roycim',
    display_name: 'Roy',
    bio: 'Building Midfield 🚀',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=roycim',
  },
];

// ============================================================================
// TOPICS
// ============================================================================

export const mockTopics: TopicInsert[] = [
  // CLUBS
  {
    id: '10000000-0000-0000-0000-000000000001',
    slug: 'liverpool-fc',
    type: 'club',
    title: 'Liverpool FC',
    description: 'English Premier League club, 6x European Champions',
    metadata: {
      founded: 1892,
      stadium: 'Anfield',
      capacity: 53394,
      league: 'Premier League',
      badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/xtwwvd1448813372.png',
      colors: ['#C8102E', '#00B2A9'],
    },
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    slug: 'manchester-city',
    type: 'club',
    title: 'Manchester City',
    description: 'English Premier League club, defending champions',
    metadata: {
      founded: 1894,
      stadium: 'Etihad Stadium',
      capacity: 53400,
      league: 'Premier League',
      badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png',
      colors: ['#6CABDD', '#1C2C5B'],
    },
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    slug: 'real-madrid',
    type: 'club',
    title: 'Real Madrid',
    description: 'Spanish La Liga club, 14x European Champions',
    metadata: {
      founded: 1902,
      stadium: 'Santiago Bernabéu',
      capacity: 81044,
      league: 'La Liga',
      badge_url: 'https://r2.thesportsdb.com/images/media/team/badge/xqwpup1448813450.png',
      colors: ['#FEBE10', '#FFFFFF'],
    },
  },

  // PLAYERS
  {
    id: '20000000-0000-0000-0000-000000000001',
    slug: 'mohamed-salah',
    type: 'player',
    title: 'Mohamed Salah',
    description: 'Egyptian winger, Liverpool FC',
    metadata: {
      position: 'Right Wing',
      nationality: 'Egypt',
      birth_date: '1992-06-15',
      height: '175 cm',
      weight: '71 kg',
      jersey_number: 11,
      photo_url: 'https://r2.thesportsdb.com/images/media/player/thumb/yvqvut1448814265.jpg',
      stats: {
        appearances: 342,
        goals: 211,
        assists: 89,
        fifa_rating: 89,
      },
    },
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    slug: 'erling-haaland',
    type: 'player',
    title: 'Erling Haaland',
    description: 'Norwegian striker, Manchester City',
    metadata: {
      position: 'Striker',
      nationality: 'Norway',
      birth_date: '2000-07-21',
      height: '194 cm',
      weight: '88 kg',
      jersey_number: 9,
      photo_url: 'https://r2.thesportsdb.com/images/media/player/thumb/c8bgws1593611770.jpg',
      stats: {
        appearances: 98,
        goals: 90,
        assists: 15,
        fifa_rating: 91,
      },
    },
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    slug: 'jude-bellingham',
    type: 'player',
    title: 'Jude Bellingham',
    description: 'English midfielder, Real Madrid',
    metadata: {
      position: 'Midfielder',
      nationality: 'England',
      birth_date: '2003-06-29',
      height: '186 cm',
      weight: '75 kg',
      jersey_number: 5,
      photo_url: 'https://r2.thesportsdb.com/images/media/player/thumb/6wz9h71622559237.jpg',
      stats: {
        appearances: 42,
        goals: 23,
        assists: 13,
        fifa_rating: 90,
      },
    },
  },

  // COMPETITIONS
  {
    id: '30000000-0000-0000-0000-000000000001',
    slug: 'premier-league',
    type: 'competition',
    title: 'Premier League',
    description: 'English top-tier football league',
    metadata: {
      country: 'England',
      founded: 1992,
      current_season: '2024-25',
      teams: 20,
      logo_url: 'https://r2.thesportsdb.com/images/media/league/badge/i6o0kh1549879062.png',
    },
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    slug: 'champions-league',
    type: 'competition',
    title: 'UEFA Champions League',
    description: "Europe's premier club competition",
    metadata: {
      country: 'Europe',
      founded: 1955,
      current_season: '2024-25',
      teams: 32,
      logo_url: 'https://r2.thesportsdb.com/images/media/league/badge/ud1e321730466302.png',
    },
  },

  // MATCHES
  {
    id: '40000000-0000-0000-0000-000000000001',
    slug: 'liverpool-vs-man-city-2024-12-01',
    type: 'match',
    title: 'Liverpool vs Manchester City',
    description: 'Premier League - Week 13',
    metadata: {
      home_team_id: '10000000-0000-0000-0000-000000000001',
      away_team_id: '10000000-0000-0000-0000-000000000002',
      competition_id: '30000000-0000-0000-0000-000000000001',
      date: '2024-12-01T15:00:00Z',
      venue: 'Anfield',
      score: { home: 2, away: 1 },
      status: 'finished',
    },
  },

  // TRANSFERS
  {
    id: '50000000-0000-0000-0000-000000000001',
    slug: 'bellingham-to-real-madrid-2023',
    type: 'transfer',
    title: 'Jude Bellingham → Real Madrid',
    description: 'Transfer from Borussia Dortmund to Real Madrid',
    metadata: {
      player_id: '20000000-0000-0000-0000-000000000003',
      from_club_id: null, // Could add Dortmund
      to_club_id: '10000000-0000-0000-0000-000000000003',
      fee: '€103M',
      date: '2023-06-14',
      contract_until: '2029-06-30',
    },
  },
];

// ============================================================================
// TOPIC RELATIONSHIPS (Graph Layer)
// ============================================================================

export const mockTopicRelationships: TopicRelationshipInsert[] = [
  // Players → Clubs
  {
    parent_topic_id: '10000000-0000-0000-0000-000000000001', // Liverpool FC
    child_topic_id: '20000000-0000-0000-0000-000000000001', // Salah
    relationship_type: 'plays_for',
    valid_from: '2017-07-01T00:00:00Z',
    metadata: { jersey_number: 11 },
  },
  {
    parent_topic_id: '10000000-0000-0000-0000-000000000002', // Man City
    child_topic_id: '20000000-0000-0000-0000-000000000002', // Haaland
    relationship_type: 'plays_for',
    valid_from: '2022-07-01T00:00:00Z',
    metadata: { jersey_number: 9 },
  },
  {
    parent_topic_id: '10000000-0000-0000-0000-000000000003', // Real Madrid
    child_topic_id: '20000000-0000-0000-0000-000000000003', // Bellingham
    relationship_type: 'plays_for',
    valid_from: '2023-06-14T00:00:00Z',
    metadata: { jersey_number: 5 },
  },

  // Clubs → Competitions
  {
    parent_topic_id: '30000000-0000-0000-0000-000000000001', // Premier League
    child_topic_id: '10000000-0000-0000-0000-000000000001', // Liverpool
    relationship_type: 'competes_in',
    valid_from: '1992-01-01T00:00:00Z',
    metadata: {},
  },
  {
    parent_topic_id: '30000000-0000-0000-0000-000000000001', // Premier League
    child_topic_id: '10000000-0000-0000-0000-000000000002', // Man City
    relationship_type: 'competes_in',
    valid_from: '2002-01-01T00:00:00Z',
    metadata: {},
  },
  {
    parent_topic_id: '30000000-0000-0000-0000-000000000002', // Champions League
    child_topic_id: '10000000-0000-0000-0000-000000000001', // Liverpool
    relationship_type: 'competes_in',
    valid_from: '2024-01-01T00:00:00Z',
    metadata: {},
  },

  // Matches → Clubs
  {
    parent_topic_id: '40000000-0000-0000-0000-000000000001', // Match
    child_topic_id: '10000000-0000-0000-0000-000000000001', // Liverpool
    relationship_type: 'participates_in',
    metadata: { team_type: 'home' },
  },
  {
    parent_topic_id: '40000000-0000-0000-0000-000000000001', // Match
    child_topic_id: '10000000-0000-0000-0000-000000000002', // Man City
    relationship_type: 'participates_in',
    metadata: { team_type: 'away' },
  },

  // Transfer → Player
  {
    parent_topic_id: '50000000-0000-0000-0000-000000000001', // Transfer
    child_topic_id: '20000000-0000-0000-0000-000000000003', // Bellingham
    relationship_type: 'transferred_from',
    metadata: {},
  },
  {
    parent_topic_id: '50000000-0000-0000-0000-000000000001', // Transfer
    child_topic_id: '10000000-0000-0000-0000-000000000003', // Real Madrid
    relationship_type: 'transferred_to',
    metadata: {},
  },
];

// ============================================================================
// POSTS (Takes on Topics)
// ============================================================================

export const mockPosts: PostInsert[] = [
  // Root posts (all from the same user - you!)
  {
    id: '60000000-0000-0000-0000-000000000001',
    topic_id: '20000000-0000-0000-0000-000000000001', // Salah
    author_id: '61b548b6-f053-40af-b56c-c457bd18eb95',
    content: 'Salah is absolutely on fire this season! 🔥 Another brace today. Easily one of the best wingers in the world right now.',
  },
  {
    id: '60000000-0000-0000-0000-000000000002',
    topic_id: '40000000-0000-0000-0000-000000000001', // Liverpool vs Man City match
    author_id: '61b548b6-f053-40af-b56c-c457bd18eb95',
    content: 'What a match! Liverpool\'s high press was suffocating City in the first half. Tactical masterclass from Klopp.',
  },
  {
    id: '60000000-0000-0000-0000-000000000003',
    topic_id: '20000000-0000-0000-0000-000000000002', // Haaland
    author_id: '61b548b6-f053-40af-b56c-c457bd18eb95',
    content: 'Haaland\'s positioning is unreal. He always knows where to be in the box. Clinical finisher.',
  },
  {
    id: '60000000-0000-0000-0000-000000000004',
    topic_id: '50000000-0000-0000-0000-000000000001', // Bellingham transfer
    author_id: '61b548b6-f053-40af-b56c-c457bd18eb95',
    content: '€103M for Bellingham looks like a bargain now. He\'s been phenomenal for Real Madrid.',
  },

  // Thread replies
  {
    id: '60000000-0000-0000-0000-000000000005',
    topic_id: '20000000-0000-0000-0000-000000000001', // Salah
    author_id: '61b548b6-f053-40af-b56c-c457bd18eb95',
    parent_post_id: '60000000-0000-0000-0000-000000000001',
    root_post_id: '60000000-0000-0000-0000-000000000001',
    content: 'Totally agree! His consistency is what sets him apart. Every season, guaranteed 20+ goals.',
  },
  {
    id: '60000000-0000-0000-0000-000000000006',
    topic_id: '40000000-0000-0000-0000-000000000001', // Liverpool vs Man City match
    author_id: '61b548b6-f053-40af-b56c-c457bd18eb95',
    parent_post_id: '60000000-0000-0000-0000-000000000002',
    root_post_id: '60000000-0000-0000-0000-000000000002',
    content: 'That second half comeback though! City\'s resilience is incredible.',
  },
];

// ============================================================================
// FOLLOWS
// ============================================================================

export const mockFollows: FollowInsert[] = [
  // You follow these topics
  { user_id: '61b548b6-f053-40af-b56c-c457bd18eb95', topic_id: '10000000-0000-0000-0000-000000000001' }, // Liverpool
  { user_id: '61b548b6-f053-40af-b56c-c457bd18eb95', topic_id: '20000000-0000-0000-0000-000000000001' }, // Salah
  { user_id: '61b548b6-f053-40af-b56c-c457bd18eb95', topic_id: '30000000-0000-0000-0000-000000000001' }, // Premier League
  { user_id: '61b548b6-f053-40af-b56c-c457bd18eb95', topic_id: '10000000-0000-0000-0000-000000000002' }, // Man City
  { user_id: '61b548b6-f053-40af-b56c-c457bd18eb95', topic_id: '20000000-0000-0000-0000-000000000002' }, // Haaland
];

// ============================================================================
// EXPORT ALL
// ============================================================================

export const mockData = {
  users: mockUsers,
  topics: mockTopics,
  topicRelationships: mockTopicRelationships,
  posts: mockPosts,
  follows: mockFollows,
};

