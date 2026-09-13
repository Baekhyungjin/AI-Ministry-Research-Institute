export type ContentKind = 'column' | 'notice';
export type PublishStatus = 'draft' | 'published';
export type ScheduleStatus = 'open' | 'closed';
export type ApplicationStatus = 'new' | 'contacted' | 'confirmed' | 'closed';
export type ApplicationKind = 'inquiry' | 'lecture' | 'schedule';
export type ResourceStatus = 'draft' | 'published';
export type GptPlan = 'free' | 'paid';
export type ReplayPaymentStatus = 'pending' | 'confirmed' | 'cancelled';

export type ContentBlock =
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'heading'; text: string; level: 2 | 3 }
  | { id: string; type: 'quote'; text: string; caption?: string }
  | { id: string; type: 'list'; items: string[]; ordered?: boolean }
  | { id: string; type: 'image'; imageUrl?: string | null; alt: string; caption?: string }
  | { id: string; type: 'link'; label: string; url: string; description?: string }
  | { id: string; type: 'divider' };

export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  excerpt: string;
  body: string;
  contentBlocks?: ContentBlock[];
  category: string;
  status: PublishStatus;
  featured: boolean;
  imageUrl?: string | null;
  publishedAt: string;
  createdAt: string;
  noticePlacement?: 'strip' | 'banner' | 'popup';
  startsAt?: string;
  endsAt?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  priority?: number;
}

export interface ScheduleItem {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  capacityReached?: boolean;
  status: ScheduleStatus;
  description: string;
  createdAt: string;
}

export interface GptItem {
  id: string;
  title: string;
  platform: 'GPT' | 'Gem';
  category: string;
  maker: string;
  description: string;
  plan: GptPlan;
  accessUrl: string;
  priceLabel?: string;
  imageUrl?: string | null;
  featured: boolean;
  status: ResourceStatus;
  createdAt: string;
}

export interface AppItem {
  id: string;
  title: string;
  category: string;
  maker: string;
  description: string;
  accessUrl: string;
  imageUrl?: string | null;
  featured: boolean;
  status: ResourceStatus;
  createdAt: string;
}

export interface ReplayItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  status: ResourceStatus;
  publishedAt: string;
  createdAt: string;
}

export interface PartnerApplicationItem {
  id: string;
  partnerType: 'church' | 'individual';
  name: string;
  church: string;
  role: string;
  phone: string;
  email: string;
  message: string;
  status: ApplicationStatus;
  consent: boolean;
  createdAt: string;
}

export interface ReplayAccessItem {
  id: string;
  replayId: string;
  replayTitle: string;
  name: string;
  church: string;
  phone: string;
  email: string;
  depositorName: string;
  supportAmount: number;
  paymentStatus: ReplayPaymentStatus;
  consent: boolean;
  createdAt: string;
}

export interface ApplicationItem {
  id: string;
  kind: ApplicationKind;
  name: string;
  church: string;
  role: string;
  phone: string;
  email: string;
  message: string;
  scheduleId?: string;
  scheduleTitle?: string;
  requestedDate?: string;
  status: ApplicationStatus;
  consent: boolean;
  createdAt: string;
}
