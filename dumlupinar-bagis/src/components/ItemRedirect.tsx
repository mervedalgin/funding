import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

/** Redirects old /item/:id and /ihtiyac-id/:id URLs to new /ihtiyac/:slug */
export function ItemIdRedirect() {
  const { id } = useParams<{ id: string }>()
  const [slug, setSlug] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('donation_items').select('slug').eq('id', id).single()
      .then(({ data }) => {
        if (data?.slug) setSlug(data.slug)
        else setNotFound(true)
      })
  }, [id])

  if (notFound) return <Navigate to="/404" replace />
  if (slug) return <Navigate to={`/ihtiyac/${slug}`} replace />
  return null
}

/** Redirects old /student-need/:id and /ogrenci-ihtiyaci-id/:id URLs to new /ogrenci-ihtiyaci/:slug */
export function StudentNeedIdRedirect() {
  const { id } = useParams<{ id: string }>()
  const [slug, setSlug] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.from('student_needs').select('slug').eq('id', id).single()
      .then(({ data }) => {
        if (data?.slug) setSlug(data.slug)
        else setNotFound(true)
      })
  }, [id])

  if (notFound) return <Navigate to="/404" replace />
  if (slug) return <Navigate to={`/ogrenci-ihtiyaci/${slug}`} replace />
  return null
}
