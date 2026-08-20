-- AI 빌더 그룹 — Supabase 초기 스키마
--
-- 실행: Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 Run.
--       여러 번 실행해도 안전하게 짰다 (if not exists / drop ... if exists).
--
-- 근거: PRD §7.2 테이블 스펙 · §7.3 상태 머신 · §2.2 권한 매트릭스 · DR-01~08 · NFR-11~13
--       백로그 §2-2 "데이터 스키마 확정"
--
-- ⚠ 실제 Supabase 프로젝트에서 실행해 검증하지 못했다 (프로젝트가 아직 없다 —
--   06-이관/이관-체크리스트.md §1 참조). 처음 실행할 때 오류가 나면 그 지점부터 고쳐 나간다.
--
-- 🔴 리드(문의) 테이블은 만들지 않는다 (DR-01). 문의 데이터는 pluug 가 받는다.
--    leads · inquiries · contacts 를 여기에 추가하지 마라 — 계약상 범위 밖이다.


-- ═══════════════════════════════════════════════════════════════════════
-- 0. 공통
-- ═══════════════════════════════════════════════════════════════════════

-- 콘텐츠 상태 (PRD §7.3). works · insights 가 같은 값을 쓴다.
do $$ begin
  create type public.content_status as enum ('draft', 'pending', 'published', 'rejected', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.content_kind as enum ('work', 'insight');
exception when duplicate_object then null;
end $$;

-- updated_at 을 앱에서 채우면 한 경로만 빠뜨려도 값이 굳는다. DB 가 채운다.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;


-- ═══════════════════════════════════════════════════════════════════════
-- 1. 빌더 = 계정 + 공개 프로필
-- ═══════════════════════════════════════════════════════════════════════
-- auth.users 를 직접 건드리지 않는다. 역할·소개 같은 서비스 정보는 이쪽에 둔다.
-- 계정을 지우지 않고 is_active = false 로 회수하는 이유: 지우면 그 사람이 쓴 글의
-- 작성자가 사라지고 Work 상세의 참여 빌더 연결이 끊긴다 (FR-A06-03 — 콘텐츠는 유지).

create table if not exists public.builders (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete set null,
  slug          text unique not null,                  -- 공개 프로필 주소가 된다. 바꾸지 않는다
  name          text not null,
  email         text unique not null,
  role          text not null default 'builder',       -- builder | admin
  one_liner     text,                                  -- 한 줄 소개 (공개 카드)
  role_label    text,                                  -- 전문 분야 표시용 ("기획 · UI/UX")
  avatar_url    text,
  is_active     boolean not null default true,         -- false = 회수. 로그인 즉시 차단
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint builders_role_chk check (role in ('builder', 'admin')),
  -- 한 줄 소개는 공개 카드에 그대로 나간다. 길이를 막지 않으면 카드가 줄바꿈으로 깨진다.
  -- 값은 어드민 화면에 붙어 있는 실측 상한과 같다.
  constraint builders_one_liner_len_chk check (one_liner is null or char_length(one_liner) <= 52)
);

drop trigger if exists builders_touch on public.builders;
create trigger builders_touch before update on public.builders
  for each row execute function public.touch_updated_at();

-- 관리자 판정. 정책마다 서브쿼리를 반복하면 한 곳만 다르게 써도 구멍이 난다.
-- security definer 라 RLS 재귀에 걸리지 않는다 (builders 정책 안에서 builders 를 읽는다).
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.builders
    where auth_user_id = auth.uid() and role = 'admin' and is_active
  )
$$;

create or replace function public.my_builder_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.builders where auth_user_id = auth.uid()
$$;


-- ═══════════════════════════════════════════════════════════════════════
-- 2. 카테고리
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.categories (
  id     uuid primary key default gen_random_uuid(),
  slug   text not null,
  name   text not null,
  type   public.content_kind not null,
  sort   integer not null default 0,
  -- Work 와 Insight 가 같은 슬러그를 쓸 수 있어야 한다 (예: 'ai-ax')
  unique (type, slug)
);


-- ═══════════════════════════════════════════════════════════════════════
-- 3. Work
-- ═══════════════════════════════════════════════════════════════════════
-- 본문을 문제/해결/결과 세 컬럼으로 쪼갠 것은 의도다. 하나의 리치텍스트로 두면 렌더 구조가
-- 글마다 달라지고, "우리는 이렇게 일한다"를 보여주는 화면이 곧 제각각이 된다.

create table if not exists public.works (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,                -- 주소가 된다. 규칙은 06-이관/라우트-슬러그-규칙표.md
  title           text not null,
  summary         text,
  category_id     uuid references public.categories(id) on delete set null,
  hero_url        text,
  thumb_url       text,
  body_problem    text,
  body_solution   text,
  body_result     text,
  tech_tags       text[] not null default '{}',
  period_label    text,
  scope_label     text,
  result_url      text,
  status          public.content_status not null default 'draft',
  published_at    timestamptz,
  published_by    uuid references public.builders(id) on delete set null,
  created_by      uuid references public.builders(id) on delete set null,
  reject_reason   text,
  seo_title       text,
  seo_description text,
  og_image_url    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists works_status_idx on public.works (status, published_at desc);

drop trigger if exists works_touch on public.works;
create trigger works_touch before update on public.works
  for each row execute function public.touch_updated_at();


-- ═══════════════════════════════════════════════════════════════════════
-- 4. Insight
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.insights (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  excerpt         text,
  -- 🔴 반드시 서버에서 sanitize 한 뒤 저장한다 (NFR-13). Tiptap 출력을 그대로 넣지 마라.
  --    본문 h1 은 서버에서 h2 로 강등한다 — 페이지 제목이 h1 이다 (FR-A03-02).
  body_html       text,
  thumb_url       text,
  category_id     uuid references public.categories(id) on delete set null,
  author_id       uuid references public.builders(id) on delete set null,
  status          public.content_status not null default 'draft',
  published_at    timestamptz,
  published_by    uuid references public.builders(id) on delete set null,
  reject_reason   text,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists insights_status_idx on public.insights (status, published_at desc);

drop trigger if exists insights_touch on public.insights;
create trigger insights_touch before update on public.insights
  for each row execute function public.touch_updated_at();


-- ═══════════════════════════════════════════════════════════════════════
-- 5. Work ↔ 빌더 (다대다)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.work_builders (
  work_id     uuid not null references public.works(id) on delete cascade,
  builder_id  uuid not null references public.builders(id) on delete cascade,
  role_label  text,                                    -- '리드' · '참여'
  sort        integer not null default 0,
  primary key (work_id, builder_id)
);


-- ═══════════════════════════════════════════════════════════════════════
-- 6. 리다이렉트 (SR-06 · DR-08)
-- ═══════════════════════════════════════════════════════════════════════
-- 발행 후 슬러그를 바꾸거나 글을 archived 로 내릴 때 여기에 한 줄이 생긴다.
-- 미들웨어가 요청 경로를 조회해 301 을 낸다. 404 로 버리면 색인과 공유 링크가 함께 죽는다.
create table if not exists public.redirects (
  from_path   text primary key,
  to_path     text not null,
  created_at  timestamptz not null default now(),
  constraint redirects_no_self_loop_chk check (from_path <> to_path)
);


-- ═══════════════════════════════════════════════════════════════════════
-- 7. 상태 전이 강제 (DR-06 · DR-07)
-- ═══════════════════════════════════════════════════════════════════════
-- 🔴 앱 코드에만 두면 한 경로만 빠뜨려도 빌더가 published 로 직행할 수 있다.
--    DB 정책에는 우회로가 없고, 새 화면을 만들어도 자동으로 지켜진다.
--
--   draft ──제출──▶ pending ──승인──▶ published ──내림──▶ archived
--     ▲                │                                    │
--     └──반려 + 사유───┘◀─────────────복구────────────────────┘

create or replace function public.guard_content_transition()
returns trigger language plpgsql as $$
declare
  admin boolean := public.is_admin();
begin
  if new.status = old.status then
    -- 상태가 그대로여도 pending 은 작성자가 편집할 수 없다 (DR-07 — 제출 후 잠금).
    -- 검수 중에 원본이 바뀌면 승인한 것과 공개된 것이 달라진다.
    if old.status = 'pending' and not admin then
      raise exception '검수 중(pending)에는 수정할 수 없습니다. 반려를 요청하세요.';
    end if;
    return new;
  end if;

  -- 표에 없는 전이는 거부한다.
  if not (
       (old.status = 'draft'     and new.status = 'pending')
    or (old.status = 'pending'   and new.status in ('published', 'rejected') and admin)
    or (old.status = 'rejected'  and new.status = 'draft')
    or (old.status = 'published' and new.status = 'archived' and admin)
    or (old.status = 'archived'  and new.status = 'published' and admin)
  ) then
    raise exception '허용되지 않은 상태 전이입니다: % → % (관리자=%)', old.status, new.status, admin;
  end if;

  -- 반려에는 사유가 필수다 (FR-A07-04). 사유 없는 반려는 "안 됨"만 전달한다.
  if new.status = 'rejected' and coalesce(btrim(new.reject_reason), '') = '' then
    raise exception '반려 사유는 필수입니다.';
  end if;

  -- 다시 제출하거나 공개되면 지난 반려 사유를 지운다.
  if new.status in ('pending', 'published') then
    new.reject_reason := null;
  end if;

  -- 발행 기록 (PRD §9.4 — "결정과 변경이 기록으로 남는가"가 이 사이트의 메시지다)
  if new.status = 'published' and old.status <> 'published' then
    new.published_at := coalesce(new.published_at, now());
    new.published_by := public.my_builder_id();
  end if;

  return new;
end $$;

drop trigger if exists works_transition on public.works;
create trigger works_transition before update on public.works
  for each row execute function public.guard_content_transition();

drop trigger if exists insights_transition on public.insights;
create trigger insights_transition before update on public.insights
  for each row execute function public.guard_content_transition();


-- ═══════════════════════════════════════════════════════════════════════
-- 8. RLS (DR-04 · NFR-12 · PRD §2.2 권한 매트릭스)
-- ═══════════════════════════════════════════════════════════════════════
-- 🔴 권한 판정을 앱 코드에 두지 않는다. 목록은 막고 상세는 안 막는 식으로 한 곳만
--    빠뜨려도 새어나간다.
-- ⚠ service_role 키는 RLS 를 통째로 우회한다. 서버 전용 환경변수로만 두고,
--   절대 NEXT_PUBLIC_ 접두사를 붙이지 마라.

alter table public.builders      enable row level security;
alter table public.categories    enable row level security;
alter table public.works         enable row level security;
alter table public.insights      enable row level security;
alter table public.work_builders enable row level security;
alter table public.redirects     enable row level security;

-- ── 빌더 ───────────────────────────────────────────────────────────────
drop policy if exists builders_read on public.builders;
create policy builders_read on public.builders for select
  using (is_active or auth_user_id = auth.uid() or public.is_admin());

drop policy if exists builders_update on public.builders;
create policy builders_update on public.builders for update
  using (auth_user_id = auth.uid() or public.is_admin())          -- FR-A06-05: 본인 프로필만
  with check (auth_user_id = auth.uid() or public.is_admin());

drop policy if exists builders_insert on public.builders;
create policy builders_insert on public.builders for insert
  with check (public.is_admin());                                  -- FR-A01-02: 자체 가입 없음

-- ── 카테고리 ───────────────────────────────────────────────────────────
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select using (true);

drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- ── Work · Insight (같은 모양) ─────────────────────────────────────────
drop policy if exists works_read on public.works;
create policy works_read on public.works for select
  using (status = 'published' or created_by = public.my_builder_id() or public.is_admin());

drop policy if exists works_insert on public.works;
create policy works_insert on public.works for insert
  with check (created_by = public.my_builder_id() or public.is_admin());

drop policy if exists works_update on public.works;
create policy works_update on public.works for update
  using (created_by = public.my_builder_id() or public.is_admin())
  with check (created_by = public.my_builder_id() or public.is_admin());

drop policy if exists works_delete on public.works;
create policy works_delete on public.works for delete
  using (public.is_admin());                                       -- FR-A02-02: 삭제는 관리자만

drop policy if exists insights_read on public.insights;
create policy insights_read on public.insights for select
  using (status = 'published' or author_id = public.my_builder_id() or public.is_admin());

drop policy if exists insights_insert on public.insights;
create policy insights_insert on public.insights for insert
  with check (author_id = public.my_builder_id() or public.is_admin());

drop policy if exists insights_update on public.insights;
create policy insights_update on public.insights for update
  using (author_id = public.my_builder_id() or public.is_admin())
  with check (author_id = public.my_builder_id() or public.is_admin());

drop policy if exists insights_delete on public.insights;
create policy insights_delete on public.insights for delete
  using (public.is_admin());

-- ── 연결 · 리다이렉트 ──────────────────────────────────────────────────
drop policy if exists work_builders_read on public.work_builders;
create policy work_builders_read on public.work_builders for select using (true);

drop policy if exists work_builders_write on public.work_builders;
create policy work_builders_write on public.work_builders for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists redirects_read on public.redirects;
create policy redirects_read on public.redirects for select using (true);

drop policy if exists redirects_write on public.redirects;
create policy redirects_write on public.redirects for all
  using (public.is_admin()) with check (public.is_admin());


-- ═══════════════════════════════════════════════════════════════════════
-- 9. 첫 관리자 만들기
-- ═══════════════════════════════════════════════════════════════════════
-- 자체 회원가입이 없으므로(FR-A01-02) 첫 관리자는 손으로 넣는다.
-- 1) Supabase > Authentication > Users > Add user 로 계정을 만든다
-- 2) 그 UUID 를 아래에 넣고 실행한다
-- 3) 🔴 관리자는 최소 2명 — 운영 연속성 문제다. 한 명이면 그 사람이 폰을 잃는 날 운영이 멈춘다.
--    별도 "복구 계정"은 만들지 않는다. 그게 가장 약한 문이 된다.
--
-- insert into public.builders (auth_user_id, slug, name, email, role)
-- values ('00000000-0000-0000-0000-000000000000', 'admin', '관리자', 'admin@example.com', 'admin');
