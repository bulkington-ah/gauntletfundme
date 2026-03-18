import { existsSync } from "node:fs";

import type { DonationStatus, FollowTargetType, ReportStatus, UserRole } from "@/domain";
import {
  type DonationRecord,
  type FollowRecord,
  type ReportRecord,
  type UserRecord,
  coreSchemaFilePath,
  loadCoreSchemaSql,
} from "@/infrastructure";

describe("core persistence schema", () => {
  it("defines schema creation for every MVP entity", () => {
    const sql = loadCoreSchemaSql();

    expect(existsSync(coreSchemaFilePath)).toBe(true);
    expect(sql).toContain("CREATE TABLE users (");
    expect(sql).toContain("CREATE TABLE user_profiles (");
    expect(sql).toContain("CREATE TABLE fundraisers (");
    expect(sql).toContain("CREATE TABLE communities (");
    expect(sql).toContain("CREATE TABLE posts (");
    expect(sql).toContain("CREATE TABLE comments (");
    expect(sql).toContain("CREATE TABLE follows (");
    expect(sql).toContain("CREATE TABLE supporter_digest_state (");
    expect(sql).toContain("CREATE TABLE donations (");
    expect(sql).toContain("CREATE TABLE reports (");
    expect(sql).toContain("CREATE TABLE analytics_events (");
  });

  it("captures enum-backed ownership, moderation, and polymorphic relationships", () => {
    const sql = loadCoreSchemaSql();

    expect(sql).toContain(
      "CREATE TYPE follow_target_type AS ENUM ('profile', 'fundraiser', 'community');",
    );
    expect(sql).toContain(
      "CREATE TYPE report_target_type AS ENUM ('post', 'comment');",
    );
    expect(sql).toContain("owner_user_id TEXT NOT NULL REFERENCES users(id)");
    expect(sql).toContain(
      "community_id TEXT REFERENCES communities(id) ON DELETE SET NULL",
    );
    expect(sql).toContain("moderation_status moderation_status NOT NULL");
    expect(sql).toContain("UNIQUE (user_id, target_type, target_id)");
    expect(sql).toContain("CREATE INDEX idx_follows_target_lookup");
    expect(sql).toContain(
      "CREATE INDEX idx_supporter_digest_state_last_viewed_at",
    );
    expect(sql).toContain("CREATE INDEX idx_fundraisers_community_id");
    expect(sql).toContain("CREATE INDEX idx_posts_community_id_created_at");
    expect(sql).toContain("CREATE INDEX idx_comments_post_id_created_at");
    expect(sql).toContain("CREATE INDEX idx_analytics_events_occurred_at");
  });

  it("keeps persistence records aligned with domain enums", () => {
    expectTypeOf<UserRecord["role"]>().toEqualTypeOf<UserRole>();
    expectTypeOf<FollowRecord["target_type"]>().toEqualTypeOf<FollowTargetType>();
    expectTypeOf<DonationRecord["status"]>().toEqualTypeOf<DonationStatus>();
    expectTypeOf<ReportRecord["status"]>().toEqualTypeOf<ReportStatus>();
  });
});
