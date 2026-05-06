export interface Provider {
  id: number;
  business_name: string;
  clinician_name: string | null;
  provider_type: string;
  license_number: string | null;
  license_state: string | null;
  npi: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  booking_url: string | null;
  telehealth_available: number;
  states_served: string | null;
  services_offered: string | null;
  lab_requirement_summary: string | null;
  pharmacy_model: string | null;
  verification_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verification_date: string | null;
  next_review_date: string | null;
  admin_notes: string | null;
  public_profile_description: string | null;
  report_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProviderApplication {
  id: number;
  business_name: string;
  clinician_name: string | null;
  provider_type: string;
  license_number: string;
  license_state: string;
  npi: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  booking_url: string | null;
  telehealth_available: number;
  states_served: string | null;
  services_offered: string | null;
  lab_requirement_summary: string | null;
  pharmacy_model: string | null;
  public_profile_description: string | null;
  verification_docs: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'needs_info';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  provider_id: number | null;
  reporter_email: string | null;
  reason: string;
  details: string | null;
  status: 'open' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number | null;
  action: string;
  performed_by: string | null;
  details: string | null;
  created_at: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: number;
}

export interface AdminUser {
  id: number;
  email: string;
  role: 'owner' | 'editor' | 'reviewer';
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface QuizAnswers {
  goal: string;
  medications: string;
  conditions: string;
  willing_labs: string;
  location: string;
  care_type: string;
}

export interface GuidanceResult {
  category: string;
  headline: string;
  summary: string;
  discussTopics: string[];
  warnings: string[];
}
