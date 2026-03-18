CREATE TYPE user_role AS ENUM ('supporter', 'organizer', 'moderator', 'admin');
CREATE TYPE profile_type AS ENUM ('supporter', 'organizer');
CREATE TYPE fundraiser_status AS ENUM ('draft', 'active', 'closed');
CREATE TYPE community_visibility AS ENUM ('public', 'members_only', 'private');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE comment_status AS ENUM ('published', 'edited', 'archived');
CREATE TYPE moderation_status AS ENUM ('visible', 'flagged', 'removed');
CREATE TYPE follow_target_type AS ENUM ('profile', 'fundraiser', 'community');
CREATE TYPE donation_status AS ENUM ('completed');
CREATE TYPE report_target_type AS ENUM ('post', 'comment');
CREATE TYPE report_status AS ENUM ('submitted', 'reviewing', 'actioned', 'dismissed');

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT NOT NULL,
  avatar_url TEXT,
  profile_type profile_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE communities (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  visibility community_visibility NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fundraisers (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  community_id TEXT REFERENCES communities(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  status fundraiser_status NOT NULL,
  goal_amount BIGINT NOT NULL CHECK (goal_amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status post_status NOT NULL,
  moderation_status moderation_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  body TEXT NOT NULL,
  status comment_status NOT NULL,
  moderation_status moderation_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE follows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type follow_target_type NOT NULL,
  target_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE TABLE donations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  fundraiser_id TEXT NOT NULL REFERENCES fundraisers(id) ON DELETE RESTRICT,
  amount BIGINT NOT NULL CHECK (amount > 0),
  status donation_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  reporter_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  target_type report_target_type NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status report_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_fundraisers_owner_user_id ON fundraisers(owner_user_id);
CREATE INDEX idx_fundraisers_community_id ON fundraisers(community_id);
CREATE INDEX idx_communities_owner_user_id ON communities(owner_user_id);
CREATE INDEX idx_posts_community_id_created_at ON posts(community_id, created_at DESC);
CREATE INDEX idx_comments_post_id_created_at ON comments(post_id, created_at DESC);
CREATE INDEX idx_follows_user_id ON follows(user_id);
CREATE INDEX idx_follows_target_lookup ON follows(target_type, target_id);
CREATE INDEX idx_donations_fundraiser_id ON donations(fundraiser_id);
CREATE INDEX idx_donations_user_id_created_at ON donations(user_id, created_at DESC);
CREATE INDEX idx_reports_status_created_at ON reports(status, created_at DESC);
