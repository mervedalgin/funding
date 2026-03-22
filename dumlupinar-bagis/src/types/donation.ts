export type DonationStatus = 'active' | 'draft' | 'completed'

export type AmountOption = 'full' | 'half' | 'custom'

export interface DonationItem {
  id: string
  title: string
  description: string | null
  image_url: string | null
  price: number
  custom_amount_min: number
  bank_name: string | null
  iban: string | null
  payment_ref: string | null
  payment_url: string | null
  internet_banking_url: string | null
  impact_text: string | null
  donor_count: number
  target_amount: number
  collected_amount: number
  status: DonationStatus
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PaymentChannel {
  id: string
  label: string
  icon_name: string | null
  bank_name: string | null
  iban: string | null
  description: string | null
  url: string | null
  is_active: boolean
  sort_order: number
}

export type NewDonationItem = Omit<DonationItem, 'id' | 'created_at' | 'updated_at'>

export type DonationPaymentStatus = 'pending' | 'confirmed' | 'rejected'

export interface Donation {
  id: string
  item_id: string | null
  donor_name: string | null
  donor_email: string | null
  donor_phone: string | null
  amount: number
  payment_method: string
  payment_ref: string | null
  status: DonationPaymentStatus
  notes: string | null
  receipt_url: string | null
  confirmed_by: string | null
  confirmed_at: string | null
  created_at: string
}

export type OnlinePaymentProvider = 'iyzico' | 'paytr'

export interface OnlinePaymentRequest {
  item_id: string
  amount: number
  donor_name?: string
  donor_email?: string
  donor_phone?: string
  provider: OnlinePaymentProvider
}

export interface OnlinePaymentResponse {
  checkout_url: string
  payment_token: string
  donation_id: string
}

export interface PublicDonor {
  donor_name: string
  amount: number
  created_at: string
}

export interface PublicDonorWithItem {
  donor_name: string
  amount: number
  created_at: string
  item_id: string | null
  donation_items: { title: string } | { title: string }[] | null
}

export interface PublicDonorUnified {
  donor_name: string
  amount: number
  created_at: string
  item_title: string
  type: 'school' | 'student'
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  table_name: string
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}

// ── Student Needs ──

export interface StudentNeed {
  id: string
  title: string
  description: string | null
  image_url: string | null
  price: number
  student_count: number
  custom_amount_min: number
  bank_name: string | null
  iban: string | null
  payment_ref: string | null
  payment_url: string | null
  internet_banking_url: string | null
  impact_text: string | null
  donor_count: number
  target_amount: number
  collected_amount: number
  status: DonationStatus
  sort_order: number
  created_at: string
  updated_at: string
}

export type NewStudentNeed = Omit<StudentNeed, 'id' | 'created_at' | 'updated_at'>

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DonationStory {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string
  cover_image_url: string | null
  gallery_images: string[]
  donation_item_id: string | null
  donation_amount: number | null
  impact_text: string | null
  completed_at: string | null
  tags: string[]
  is_published: boolean
  view_count: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface LegalBasisItem {
  id: string
  title: string
  content: string
  icon_name: string
  url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StudentDonation {
  id: string
  student_need_id: string | null
  donor_name: string | null
  donor_email: string | null
  donor_phone: string | null
  amount: number
  payment_method: string
  payment_ref: string | null
  status: DonationPaymentStatus
  notes: string | null
  receipt_url: string | null
  confirmed_by: string | null
  confirmed_at: string | null
  created_at: string
}
