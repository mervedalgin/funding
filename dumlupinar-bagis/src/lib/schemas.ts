import { z } from 'zod'

export const DonationItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  price: z.number(),
  custom_amount_min: z.number(),
  bank_name: z.string().nullable(),
  iban: z.string().nullable(),
  payment_ref: z.string().nullable(),
  payment_url: z.string().nullable(),
  internet_banking_url: z.string().nullable(),
  impact_text: z.string().nullable(),
  donor_count: z.number(),
  target_amount: z.number(),
  collected_amount: z.number(),
  status: z.enum(['active', 'draft', 'completed']),
  sort_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const PaymentChannelSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon_name: z.string().nullable(),
  bank_name: z.string().nullable(),
  iban: z.string().nullable(),
  description: z.string().nullable(),
  url: z.string().nullable(),
  is_active: z.boolean(),
  sort_order: z.number(),
})

export const DonationSchema = z.object({
  id: z.string(),
  item_id: z.string().nullable(),
  donor_name: z.string().nullable(),
  donor_email: z.string().nullable(),
  donor_phone: z.string().nullable(),
  amount: z.number(),
  payment_method: z.string(),
  payment_ref: z.string().nullable(),
  status: z.enum(['pending', 'confirmed', 'rejected']),
  notes: z.string().nullable(),
  receipt_url: z.string().nullable(),
  confirmed_by: z.string().nullable(),
  confirmed_at: z.string().nullable(),
  created_at: z.string(),
})

export const StudentNeedSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  price: z.number(),
  student_count: z.number(),
  custom_amount_min: z.number(),
  bank_name: z.string().nullable(),
  iban: z.string().nullable(),
  payment_ref: z.string().nullable(),
  payment_url: z.string().nullable(),
  internet_banking_url: z.string().nullable(),
  impact_text: z.string().nullable(),
  donor_count: z.number(),
  target_amount: z.number(),
  collected_amount: z.number(),
  status: z.enum(['active', 'draft', 'completed']),
  sort_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const StudentDonationSchema = z.object({
  id: z.string(),
  student_need_id: z.string().nullable(),
  donor_name: z.string().nullable(),
  donor_email: z.string().nullable(),
  donor_phone: z.string().nullable(),
  amount: z.number(),
  payment_method: z.string(),
  payment_ref: z.string().nullable(),
  status: z.enum(['pending', 'confirmed', 'rejected']),
  notes: z.string().nullable(),
  receipt_url: z.string().nullable(),
  confirmed_by: z.string().nullable(),
  confirmed_at: z.string().nullable(),
  created_at: z.string(),
})

export const FaqItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  category: z.string(),
  sort_order: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const LegalBasisItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  icon_name: z.string(),
  url: z.string().nullable(),
  sort_order: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const DonationStorySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  summary: z.string().nullable(),
  content: z.string(),
  cover_image_url: z.string().nullable(),
  gallery_images: z.array(z.string()).default([]),
  donation_item_id: z.string().nullable(),
  donation_amount: z.number().nullable(),
  impact_text: z.string().nullable(),
  completed_at: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  is_published: z.boolean(),
  view_count: z.number(),
  sort_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

export function parseArray<T>(schema: z.ZodType<T>, data: unknown): T[] {
  const result = z.array(schema).safeParse(data)
  if (!result.success) {
    console.error('API response validation failed:', result.error.issues)
    throw new Error('Beklenmeyen veri formatı')
  }
  return result.data
}
