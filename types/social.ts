export type PackStatus = 'pending' | 'approved' | 'published' | 'rejected' | 'failed';
export type IGVariant = 'lifestyle' | 'spec' | 'story';

export interface IGStory {
  text: string;
  photo_url: string;
}

export interface ReelShot {
  timestamp: string;
  shot: string;
  caption: string;
}

export interface IGReel {
  script: ReelShot[];
  audio_guidance?: string;
  requires_video?: boolean;
}

export interface TikTokShot {
  timestamp: string;
  shot: string;
  caption: string;
}

export interface SocialPack {
  id: string;
  vehicle_id: string;
  status: PackStatus;
  generation_error: string | null;
  vehicle_summary: string | null;
  ig_caption_lifestyle: string | null;
  ig_caption_spec: string | null;
  ig_caption_story: string | null;
  ig_caption_selected: IGVariant | null;
  ig_hashtags: string[] | null;
  ig_photo_order: string[] | null;
  ig_stories: IGStory[] | null;
  ig_reel: IGReel | null;
  fb_body: string | null;
  fb_hashtags: string[] | null;
  marketplace_title: string | null;
  marketplace_body: string | null;
  tiktok_script: TikTokShot[] | null;
  tiktok_hashtags: string[] | null;
  linkedin_body: string | null;
  linkedin_hashtags: string[] | null;
  threads_body: string | null;
  threads_hashtags: string[] | null;
  quality_warnings: string[] | null;
  regeneration_notes: string | null;
  generated_at: string | null;
  approved_at: string | null;
  published_at: string | null;
  approved_by: string | null;
}
