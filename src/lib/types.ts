export type Role = 'member' | 'manager';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  slack_user_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StandupView {
  id: string;
  standup_id: string;
  viewer_id: string;
  viewed_at: string;
}

export interface StandupViewWithProfile extends StandupView {
  profiles: Pick<Profile, 'id' | 'full_name'>;
}

export interface Standup {
  id: string;
  user_id: string;
  date: string;
  yesterday: string;
  today_items: string[];
  blockers: string | null;
  slack_posted: boolean;
  created_at: string;
  updated_at: string;
}

export interface StandupWithProfile extends Standup {
  profiles: Profile;
}

export interface StandupConfirmation {
  id: string;
  standup_id: string;
  item_index: number;
  completed: boolean;
  note: string | null;
  confirmed_at: string;
}

export interface StandupComment {
  id: string;
  standup_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
}

export interface CommentWithProfile extends StandupComment {
  profiles: Pick<Profile, 'id' | 'full_name'>;
}
