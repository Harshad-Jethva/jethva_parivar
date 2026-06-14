const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class CustomQueryBuilder {
  private table: string;
  private filters: Array<{ field: string; op: string; value: any }> = [];
  private orderField?: string;
  private orderAscending?: boolean;
  private limitVal?: number;

  constructor(table: string) {
    this.table = table;
  }

  select(_fields: string = '*') {
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, op: 'eq', value });
    return this;
  }

  gte(field: string, value: any) {
    this.filters.push({ field, op: 'gte', value });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(limitVal: number) {
    this.limitVal = limitVal;
    return this;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async insert(data: any) {
    try {
      const response = await fetch(`${apiUrl}/api/${this.table}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to insert into ${this.table}: ${response.statusText}`);
      }
      const resData = await response.json();
      return { data: resData, error: null };
    } catch (error: any) {
      console.error(`Insert error on table ${this.table}:`, error);
      return { data: null, error };
    }
  }

  async update(data: any, id: string) {
    try {
      const response = await fetch(`${apiUrl}/api/${this.table}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update ${this.table}: ${response.statusText}`);
      }
      const resData = await response.json();
      return { data: resData, error: null };
    } catch (error: any) {
      console.error(`Update error on table ${this.table}:`, error);
      return { data: null, error };
    }
  }

  async delete(id: string) {
    try {
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiUrl}/api/${this.table}/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        throw new Error(`Failed to delete from ${this.table}: ${response.statusText}`);
      }
      const resData = await response.json();
      return { data: resData, error: null };
    } catch (error: any) {
      console.error(`Delete error on table ${this.table}:`, error);
      return { data: null, error };
    }
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const queryParams = new URLSearchParams();
      if (this.filters.length > 0) {
        queryParams.append('filters', JSON.stringify(this.filters));
      }
      if (this.orderField) {
        queryParams.append('orderField', this.orderField);
        queryParams.append('orderAscending', String(this.orderAscending));
      }
      if (this.limitVal) {
        queryParams.append('limit', String(this.limitVal));
      }

      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/${this.table}?${queryParams.toString()}`, {
        headers
      });
      if (!response.ok) {
        throw new Error(`Query failed for ${this.table}: ${response.statusText}`);
      }
      const data = await response.json();
      const result = { data, error: null };
      if (onfulfilled) return onfulfilled(result);
      return result;
    } catch (error: any) {
      console.error(`Query error on table ${this.table}:`, error);
      const result = { data: null, error };
      if (onfulfilled) return onfulfilled(result);
      if (onrejected) return onrejected(error);
      return result;
    }
  }
}

export const supabase = {
  from: (table: string) => new CustomQueryBuilder(table),
};

export type Event = {
  id: string;
  title_en: string;
  title_gu: string;
  title_hi: string;
  description_en?: string;
  description_gu?: string;
  description_hi?: string;
  category: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  image_url?: string;
  registration_required: boolean;
  max_attendees?: number;
  current_registrations: number;
  donation_target?: number;
  donation_collected: number;
  is_featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Donation = {
  id: string;
  user_id?: string;
  amount: number;
  category: string;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  donor_address?: string;
  pan_number?: string;
  is_anonymous: boolean;
  payment_method?: string;
  payment_id?: string;
  receipt_number: string;
  receipt_sent: boolean;
  donation_date: string;
  status: string;
};

export type Gallery = {
  id: string;
  title_en?: string;
  title_gu?: string;
  title_hi?: string;
  type: string;
  url: string;
  thumbnail_url?: string;
  category: string;
  event_id?: string;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
};

export type AartiTiming = {
  id: string;
  name_en: string;
  name_gu: string;
  name_hi: string;
  time: string;
  description_en?: string;
  description_gu?: string;
  description_hi?: string;
  sort_order: number;
  is_active: boolean;
};

export type Service = {
  id: string;
  name_en: string;
  name_gu: string;
  name_hi: string;
  description_en?: string;
  description_gu?: string;
  description_hi?: string;
  category: string;
  price: number;
  duration_minutes: number;
  is_available: boolean;
  booking_advance_days: number;
};

export type Blog = {
  id: string;
  title_en: string;
  title_gu: string;
  title_hi: string;
  slug: string;
  content_en?: string;
  content_gu?: string;
  content_hi?: string;
  excerpt_en?: string;
  excerpt_gu?: string;
  excerpt_hi?: string;
  author_id?: string;
  category: string;
  image_url?: string;
  tags?: string[];
  published: boolean;
  published_at?: string;
  views: number;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  location?: string;
  content_en: string;
  content_gu?: string;
  content_hi?: string;
  rating: number;
  video_url?: string;
  is_approved: boolean;
  created_at: string;
};

export type Volunteer = {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  department?: string;
  skills?: string[];
  availability?: string;
  joined_date: string;
  status: string;
  hours_contributed: number;
  created_at: string;
};

export type Trustee = {
  id: string;
  name: string;
  position_en?: string;
  position_gu?: string;
  position_hi?: string;
  bio_en?: string;
  bio_gu?: string;
  bio_hi?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
};

export type SiteSetting = {
  id: string;
  key: string;
  value: string;
};

export type Page = {
  id: string;
  slug: string;
  title_en: string;
  title_gu: string;
  title_hi: string;
  is_active: boolean;
  seo_title_en?: string;
  seo_title_gu?: string;
  seo_title_hi?: string;
  seo_description_en?: string;
  seo_description_gu?: string;
  seo_description_hi?: string;
  seo_keywords?: string[];
  published_status: 'published' | 'draft' | 'scheduled';
  start_date?: string;
  end_date?: string;
  role_visibility: string[];
  device_visibility: string[];
  language_visibility: string[];
  created_at: string;
  updated_at: string;
};

export type PageSection = {
  id: string;
  page_id: string;
  section_key: string;
  title_en?: string;
  title_gu?: string;
  title_hi?: string;
  content: any;
  sort_order: number;
  is_active: boolean;
  device_visibility: string[];
  role_visibility: string[];
  language_visibility: string[];
  start_date?: string;
  end_date?: string;
  festival_mode: boolean;
  created_at: string;
  updated_at: string;
};

export type Menu = {
  id: string;
  menu_key: string;
  items: any;
  created_at: string;
  updated_at: string;
};

export type FormTemplate = {
  id: string;
  form_key: string;
  title_en: string;
  title_gu: string;
  title_hi: string;
  fields: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FormSubmission = {
  id: string;
  form_id: string;
  data: any;
  created_at: string;
};

export type RedirectRule = {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  created_at: string;
};

export type FAQ = {
  id: string;
  question_en: string;
  question_gu: string;
  question_hi: string;
  answer_en: string;
  answer_gu: string;
  answer_hi: string;
  category: string;
  sort_order: number;
  created_at: string;
};

export type MediaFile = {
  id: string;
  name: string;
  url: string;
  thumbnail_url?: string;
  size_bytes: number;
  type: string;
  category: string;
  created_at: string;
};

export type AuditLogEntry = {
  id: string;
  user_email?: string;
  action: string;
  target_table: string;
  target_id?: string;
  old_value: any;
  new_value: any;
  created_at: string;
};
