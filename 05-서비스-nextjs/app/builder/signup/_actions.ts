'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const signupSchema = z.object({
  name: z.string().trim().min(2).max(30),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(10).max(200),
  passwordConfirm: z.string(),
}).refine(data => data.password === data.passwordConfirm, { path: ['passwordConfirm'] })

async function requestOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export async function signUpBuilder(formData: FormData): Promise<void> {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm'),
  })
  if (!parsed.success) redirect('/builder/signup?error=invalid')

  const { name, email, password } = parsed.data
  const admin = createSupabaseAdminClient()
  const { data: existing } = await admin.from('builders').select('id').eq('email', email).maybeSingle()
  if (existing) redirect('/builder/signup?error=exists')

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${await requestOrigin()}/auth/callback?next=/admin/profile&loginPath=/builder/login`,
    },
  })
  if (error || !data.user) redirect('/builder/signup?error=signup')

  const userId = data.user.id
  const slug = `applicant-${userId.slice(0, 8)}`
  const profile = { name, roleLabel: '', oneLiner: '', avatarUrl: '' }

  const { error: metaError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { builder_approval: 'draft', builder_profile: profile },
  })
  const { error: profileError } = await admin.from('builders').insert({
    auth_user_id: userId,
    slug,
    name,
    email,
    role: 'builder',
    role_label: '',
    one_liner: '',
    is_active: false,
  })

  if (metaError || profileError) {
    await admin.auth.admin.deleteUser(userId)
    redirect('/builder/signup?error=signup')
  }

  redirect(data.session ? '/admin/profile?welcome=1' : '/builder/signup?success=check-email')
}
