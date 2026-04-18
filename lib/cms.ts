const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:3001/api';

export interface CMSProduct {
  id: string;
  handle: string;
  title: string;
  description?: string;
  price: string;
  compare_at_price?: string;
  featured_image?: {
    src: string;
    alt?: string;
  };
  images: Array<{
    src: string;
    alt?: string;
  }>;
}

export interface CMSSection {
  id: string;
  section_key: string;
  section_type: string;
  title?: string;
  content: CMSSectionContent;
  position: number;
  status: string;
  styling?: Record<string, any>;
  version: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CMSSectionContent {
  headline?: string;
  subheadline?: string;
  cta_text?: string;
  cta_link?: string;
  background_image?: string;
  background_video?: string;
  overlay_opacity?: number;
  title?: string;
  subtitle?: string;
  description?: string;
  max_products?: number;
  product_handles?: string[];
  collection_handle?: string;
  products?: CMSProduct[];
  banners?: Array<{
    image: string;
    alt_text?: string;
    headline?: string;
    subtext?: string;
    cta_text?: string;
    cta_link?: string;
    alignment?: 'left' | 'center' | 'right';
  }>;
  testimonials?: Array<{
    quote: string;
    author: string;
    role?: string;
    avatar?: string;
    rating?: number;
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  html?: string;
  height?: string;
  background_color?: string;
  text_color?: string;
  button_text?: string;
  button_link?: string;
  list_items?: string[];
  image?: string;
  image_position?: 'left' | 'right';
  columns_count?: number;
  video_url?: string;
  video_autoplay?: boolean;
  newsletter_heading?: string;
  newsletter_subtext?: string;
  placeholder_text?: string;
  button_color?: string;
  background_type?: 'image' | 'video' | 'color' | 'gradient';
  gradient_colors?: string[];
  padding_top?: string;
  padding_bottom?: string;
  full_width?: boolean;
  [key: string]: any;
}

export interface CMSResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CMSSectionsResponse {
  sections: CMSSection[];
  count: number;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${CMS_API_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`CMS API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const cmsApi = {
  sections: {
    getAll: () => fetchAPI<CMSResponse<CMSSectionsResponse>>('/storefront/sections'),

    getByKey: (sectionKey: string) =>
      fetchAPI<CMSResponse<{ section: CMSSection }>>(`/storefront/sections/${sectionKey}`),

    getByType: (sectionType: string, activeOnly = true) =>
      fetchAPI<CMSResponse<CMSSectionsResponse>>(
        `/storefront/sections/type/${sectionType}?active=${activeOnly}`
      ),
  },

  navigation: {
    get: (location: string) =>
      fetchAPI<CMSResponse<{ navigation: any }>>(`/storefront/sections/navigation/${location}`),
  },
};

export function isCMSEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get('cms') === 'true') return true;
  if (params.get('cms') === 'false') return false;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'cms_enabled') {
      return value === 'true';
    }
  }

  return false;
}

export function setCMSEnabled(enabled: boolean): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
  document.cookie = `cms_enabled=${enabled};expires=${expires.toUTCString()};path=/`;
}
