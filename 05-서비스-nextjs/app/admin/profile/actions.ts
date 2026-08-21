'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin, requireViewer } from '@/app/admin/_authz'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const profileSchema = z.object({
  name: z.string().trim().min(2).max(30),
  roleLabel: z.string().trim().min(2).max(50),
  oneLiner: z.string().trim().min(10).max(52),
  avatarUrl: z.string().trim().max(500).refine(v => v === '' || v.startsWith('/') || z.url().safeParse(v).success),
  bio: z.string().trim().max(140),
  focus: z.string().trim().max(100),
  stack: z.array(z.string().trim().min(1).max(40)).max(12),
  principles: z.array(z.tuple([z.string().trim().max(21), z.string().trim().max(62)])).length(3),
  intent: z.enum(['save', 'request']),
})

function parseJson(value: FormDataEntryValue | null): unknown {
  if (typeof value !== 'string') return null
  try { return JSON.parse(value) } catch { return null }
}

export async function saveMyBuilderProfile(formData: FormData): Promise<void> {
  const viewer = await requireViewer()
  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    roleLabel: formData.get('roleLabel'),
    oneLiner: formData.get('oneLiner'),
    avatarUrl: formData.get('avatarUrl'),
    bio: formData.get('bio'),
    focus: formData.get('focus'),
    stack: parseJson(formData.get('stack')),
    principles: parseJson(formData.get('principles')),
    intent: formData.get('intent'),
  })
  if (!parsed.success) redirect('/admin/profile?error=invalid')

  const { name, roleLabel, oneLiner, avatarUrl, bio, focus, stack, principles, intent } = parsed.data
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('builders').update({
    name,
    role_label: roleLabel,
    one_liner: oneLiner,
    avatar_url: avatarUrl || null,
  }).eq('id', viewer.builderId)
  if (error) redirect('/admin/profile?error=save')

  const admin = createSupabaseAdminClient()
  const { data: auth, error: authError } = await admin.auth.admin.getUserById(viewer.userId)
  if (authError || !auth.user) redirect('/admin/profile?error=save')

  const approval = intent === 'request' && viewer.role !== 'admin' ? 'pending' : viewer.approval
  const { error: metaError } = await admin.auth.admin.updateUserById(viewer.userId, {
    app_metadata: {
      ...auth.user.app_metadata,
      builder_approval: approval,
      builder_profile: { name, roleLabel, oneLiner, avatarUrl, bio, focus, stack, principles },
      ...(intent === 'request' ? { builder_requested_at: new Date().toISOString() } : {}),
    },
  })
  if (metaError) redirect('/admin/profile?error=save')

  revalidatePath('/admin/profile')
  revalidatePath('/admin/builders')
  redirect(`/admin/profile?${intent === 'request' ? 'requested=1' : 'saved=1'}`)
}

export async function approveBuilderApplication(formData: FormData): Promise<void> {
  await requireAdmin()
  const userId = z.uuid().safeParse(formData.get('userId'))
  const builderId = z.uuid().safeParse(formData.get('builderId'))
  if (!userId.success || !builderId.success) redirect('/admin/builders?error=invalid')

  const admin = createSupabaseAdminClient()
  const { data: auth, error: authError } = await admin.auth.admin.getUserById(userId.data)
  if (authError || !auth.user) redirect('/admin/builders?error=approve')

  const { error: metaError } = await admin.auth.admin.updateUserById(userId.data, {
    app_metadata: { ...auth.user.app_metadata, builder_approval: 'approved', builder_approved_at: new Date().toISOString() },
  })
  if (metaError) redirect('/admin/builders?error=approve')

  const { error: builderError } = await admin.from('builders').update({ is_active: true }).eq('id', builderId.data)
  if (builderError) {
    await admin.auth.admin.updateUserById(userId.data, {
      app_metadata: { ...auth.user.app_metadata, builder_approval: 'pending' },
    })
    redirect('/admin/builders?error=approve')
  }

  revalidatePath('/admin/builders')
  redirect('/admin/builders?approved=1')
}
