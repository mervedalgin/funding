-- Unified public donors view (replaces dual-query pattern)
CREATE OR REPLACE VIEW public.public_donors_unified AS
  SELECT
    d.donor_name,
    d.amount,
    d.created_at,
    di.title AS item_title,
    'school' AS donation_type
  FROM public.donations d
  LEFT JOIN public.donation_items di ON di.id = d.item_id
  WHERE d.status = 'confirmed' AND d.donor_name IS NOT NULL
  UNION ALL
  SELECT
    sd.donor_name,
    sd.amount,
    sd.created_at,
    sn.title AS item_title,
    'student' AS donation_type
  FROM public.student_donations sd
  LEFT JOIN public.student_needs sn ON sn.id = sd.student_need_id
  WHERE sd.status = 'confirmed' AND sd.donor_name IS NOT NULL;

-- Grant public read access
GRANT SELECT ON public.public_donors_unified TO anon, authenticated;
