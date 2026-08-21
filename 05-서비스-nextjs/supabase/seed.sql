-- ═══════════════════════════════════════════════════════════════════════
--  seed.sql — 데모 데이터
-- ═══════════════════════════════════════════════════════════════════════
--  schema.sql 을 먼저 실행한 뒤 이 파일을 Supabase > SQL Editor 에 붙여 넣고 Run.
--
--  🔴 여기 들어가는 이미지·고객사명은 전부 **서면 동의를 받지 않은 시연용 샘플**이다
--     (README §절대 규칙). 실서비스 데이터로 쓰지 말 것.
--  ⚠ 이메일은 example.com 자리표시자다. 실주소를 넣지 않는다 — 구글 로그인은 여기
--     적힌 이메일과 일치해야 이어지므로, 실제로 로그인시킬 사람의 주소로 바꿔야 한다.
--  ⚠ 몇 번을 실행해도 같은 결과다 (on conflict do nothing). 이미 있는 행은 건드리지 않는다.
--
--  생성: 목업 데이터에서 자동 변환 — 목업이 바뀌면 다시 만든다.
--  ⚠ 목업의 'ria' 는 넣지 않는다. 그 자리를 이미 만들어 둔 데모 계정
--     'sample-builder' (builder-demo@aibuildergroup.kr) 가 그대로 넘겨받는다 —
--     그래야 그 계정으로 로그인했을 때 자기 콘텐츠가 보인다. 리아까지 함께 넣으면
--     콘텐츠가 리아 쪽으로 가고 데모 계정은 또 빈 목록을 본다.


--     그래야 그 계정으로 로그인했을 때 자기 콘텐츠가 보인다.

-- ── 카테고리 ────────────────────────────────────────────────────────
-- Work 는 카드 라벨(tag)이 그대로 분야로 나간다. 목록의 '분야' 열이 이 name 이다.
insert into public.categories (slug, name, type, sort) values
  ('saas-admin', 'SaaS · Admin', 'work', 0),
  ('ai-ax', 'AI · AX', 'work', 10),
  ('commerce', 'Commerce', 'work', 20),
  ('finance', 'Finance', 'work', 30),
  ('media', 'Media', 'work', 40),
  ('o2o', 'O2O', 'work', 50),
  ('platform', 'Platform', 'work', 60),
  ('ai-ax', 'AI · AX', 'insight', 0),
  ('guide', '발주 가이드', 'insight', 10),
  ('how', '일하는 방식', 'insight', 20),
  ('project', '프로젝트', 'insight', 30)
on conflict do nothing;

-- ── 빌더 ────────────────────────────────────────────────────────────
-- auth_user_id 는 비워 둔다. 첫 구글 로그인에 schema.sql §10 트리거가 이메일로 잇는다.
-- 준호는 회수된 계정이다 (is_active=false) — A-06 의 비활성 표시를 확인하는 용도.
insert into public.builders (slug, name, email, role, one_liner, role_label, avatar_url, is_active) values
  ('josh', '빌더 조쉬', 'josh@example.com', 'admin', '프로덕트 전체 · MVP · 검증', '프로덕트 빌더 · 기획+개발', '/assets/img/av-josh.jpg', true),
  ('dohyun', '빌더 도현', 'dohyun@example.com', 'builder', '어드민 · 정산 · 권한 설계', '플랫폼 · 어드민', '/assets/img/av-dohyun.jpg', true),
  ('yuna', '빌더 유나', 'yuna@example.com', 'builder', 'LLM 연동 · 에이전트 · PoC', 'AI 서비스 · 에이전트', '/assets/img/av-yuna.jpg', true),
  ('hajun', '빌더 하준', 'hajun@example.com', 'builder', '모바일 앱 · 스토어 출시', '모바일 앱 · 크로스플랫폼', '/assets/img/av-hajun.jpg', true),
  ('sein', '빌더 세인', 'sein@example.com', 'builder', '데이터 파이프라인 · 자동화', '데이터 · 업무 자동화', '/assets/img/av-sein.jpg', true),
  ('minseo', '빌더 민서', 'minseo@example.com', 'builder', '디자인 시스템 · 모션', '브랜드 · 모션 디자인', '/assets/img/av-minseo.jpg', true),
  ('taeo', '빌더 태오', 'taeo@example.com', 'builder', '결제 연동 · 주문·정산', '커머스 · 결제', '/assets/img/av-taeo.jpg', true),
  ('eunchae', '빌더 은채', 'eunchae@example.com', 'builder', '검색 유입 · 콘텐츠 구조', '그로스 · SEO', '/assets/img/av-eunchae.jpg', true),
  ('junho', '빌더 준호', 'junho@example.com', 'builder', '배포 자동화 · 모니터링', '운영 · 인프라', '/assets/img/av-junho.jpg', false)
on conflict do nothing;

-- ── Work ────────────────────────────────────────────────────────────
-- created_by = 리드 빌더(builders[0]). 빌더로 로그인하면 이 값으로 자기 것만 걸러진다.
insert into public.works (slug, title, summary, category_id, thumb_url, hero_url, period_label, status, published_at, created_by, reject_reason) values
  ('샘플-작성중-프로젝트', '[샘플 ①] 작성 중인 프로젝트 — 자유롭게 수정할 수 있습니다', '아직 제출하지 않은 초안입니다. 제목 · 요약 · 분야 · 커버 · 참여 빌더를 모두 고칠 수 있고, 다 되면 검토를 요청합니다.', (select id from public.categories where type='work' and slug='saas-admin'), '/assets/img/work-aerok-admin.jpg', '/assets/img/work-aerok-admin.jpg', '2026', 'draft', null, (select id from public.builders where slug='sample-builder'), null),
  ('샘플-승인대기-프로젝트', '[샘플 ②] 문의 응대를 한곳에 모은 사내 AI 어시스턴트', '세 채널로 흩어져 들어오던 문의를 하나의 받은편지함으로 모으고, 담당자가 고쳐 쓸 응대 초안까지 붙여 주는 내부 도구.', (select id from public.categories where type='work' and slug='ai-ax'), '/assets/img/work-canape.png', '/assets/img/work-canape.png', '2026', 'pending', null, (select id from public.builders where slug='sample-builder'), null),
  ('샘플-반려된-프로젝트', '[샘플 ③] 반려된 프로젝트 — 사유를 보고 다시 고칩니다', '관리자가 사유와 함께 돌려보낸 상태입니다. 화면 맨 위에 사유가 붙고, 폼은 다시 열려 있습니다.', (select id from public.categories where type='work' and slug='commerce'), '/assets/img/work-markspon.png', '/assets/img/work-markspon.png', '2026', 'rejected', null, (select id from public.builders where slug='sample-builder'), '커버에 고객사 로고가 그대로 남아 있습니다. 공개 동의를 확인하기 전까지는 지우거나 다른 컷으로 교체해 주세요(기획서 §14 Q7). 요약 두 번째 문장의 성과 수치도 출처가 필요합니다.'),
  ('샘플-발행된-프로젝트', '[샘플 ④] 발행된 프로젝트 — 공개 중, 내릴 수 있습니다', '승인되어 공개된 상태입니다. 작성자는 더 이상 손대지 못하고, 관리자만 수정하거나 내릴 수 있습니다.', (select id from public.categories where type='work' and slug='finance'), '/assets/img/work-nice.png', '/assets/img/work-nice.png', '2025', 'published', '2026-08-18T00:00:00Z', (select id from public.builders where slug='sample-builder'), null),
  ('샘플-보관된-프로젝트', '[샘플 ⑤] 보관된 프로젝트 — 다시 공개할 수 있습니다', '공개에서 내려간 상태입니다. 지운 것이 아니라 보관입니다 — 관리자가 다시 공개할 수 있고, 주소는 목록으로 301 됩니다.', (select id from public.categories where type='work' and slug='media'), '/assets/img/work-btv.png', '/assets/img/work-btv.png', '2024', 'archived', null, (select id from public.builders where slug='sample-builder'), null),
  ('커머스-리빙-리뉴얼', 'iloom — 리빙 커머스 리뉴얼', '가구 브랜드 일룸의 커머스 경험 개편. 상품 탐색부터 상담 전환까지 여정 재설계.', (select id from public.categories where type='work' and slug='commerce'), '/assets/img/work-iloom.png', '/assets/img/work-iloom.png', '2026', 'published', '2026-12-01T00:00:00Z', (select id from public.builders where slug='josh'), null),
  ('ai-업무플랫폼-daisy', 'DAISY — 대홍기획', '광고 그룹의 AI 업무 플랫폼 구축.', (select id from public.categories where type='work' and slug='ai-ax'), '/assets/img/work-daisy.png', '/assets/img/work-daisy.png', '2026', 'published', '2026-12-01T00:00:00Z', (select id from public.builders where slug='yuna'), null),
  ('o2o-예약-사용자앱', 'Aerok User — 사용자 앱', '예약·이용 플로우 전면 구축.', (select id from public.categories where type='work' and slug='o2o'), '/assets/img/work-aerok-user.jpg', '/assets/img/work-aerok-user.jpg', '2025', 'published', '2025-12-01T00:00:00Z', (select id from public.builders where slug='sample-builder'), null),
  ('핀테크-결제-어드민', 'NICE 정보통신 — 결제 인프라 어드민', '결제 데이터 대시보드와 운영 콘솔. 금융 수준 권한·감사 로그 설계 포함.', (select id from public.categories where type='work' and slug='finance'), '/assets/img/work-nice.png', '/assets/img/work-nice.png', '2025', 'published', '2025-12-01T00:00:00Z', (select id from public.builders where slug='dohyun'), null),
  ('saas-지점정산-운영콘솔', 'Aerok Admin — 운영 콘솔', '지점·정산 통합 관리 시스템.', (select id from public.categories where type='work' and slug='saas-admin'), '/assets/img/work-aerok-admin.jpg', '/assets/img/work-aerok-admin.jpg', '2025', 'pending', null, (select id from public.builders where slug='dohyun'), null),
  ('미디어-광고-셀프집행', 'Btv 우리동네광고 — SK브로드밴드', '소상공인 TV 광고 셀프 집행 플랫폼.', (select id from public.categories where type='work' and slug='media'), '/assets/img/work-btv.png', '/assets/img/work-btv.png', '2024', 'published', '2024-12-01T00:00:00Z', (select id from public.builders where slug='josh'), null),
  ('커머스-복지몰-edk', '마크스폰 EDK', '기업 복지 커머스 운영 시스템.', (select id from public.categories where type='work' and slug='saas-admin'), '/assets/img/work-markspon.png', '/assets/img/work-markspon.png', '2025', 'draft', null, (select id from public.builders where slug='dohyun'), null),
  ('ai-심리분석-canape', 'CANAPE — 도다마인드', 'AI 심리 분석 서비스.', (select id from public.categories where type='work' and slug='ai-ax'), '/assets/img/work-canape.png', '/assets/img/work-canape.png', '2023', 'published', '2023-12-01T00:00:00Z', (select id from public.builders where slug='yuna'), null),
  ('플랫폼-돌봄-연결', '패밀리케어 — 키즈노트', '가족 돌봄 연결 서비스.', (select id from public.categories where type='work' and slug='platform'), '/assets/img/work-familycare.jpg', '/assets/img/work-familycare.jpg', '2022', 'rejected', null, (select id from public.builders where slug='sample-builder'), '히어로 이미지에 실제 이용자 얼굴이 그대로 보입니다. 마스킹하거나 다른 컷으로 교체 후 다시 제출해 주세요.')
on conflict do nothing;

-- ── Work ↔ 빌더 ─────────────────────────────────────────────────────
-- sort 0 이 리드다. 목록의 '참여 빌더' 열이 이 순서로 이름을 잇는다.
insert into public.work_builders (work_id, builder_id, role_label, sort) values
  ((select id from public.works where slug='샘플-작성중-프로젝트'), (select id from public.builders where slug='sample-builder'), '리드', 0),
  ((select id from public.works where slug='샘플-작성중-프로젝트'), (select id from public.builders where slug='hajun'), '참여', 1),
  ((select id from public.works where slug='샘플-승인대기-프로젝트'), (select id from public.builders where slug='sample-builder'), '리드', 0),
  ((select id from public.works where slug='샘플-승인대기-프로젝트'), (select id from public.builders where slug='dohyun'), '참여', 1),
  ((select id from public.works where slug='샘플-반려된-프로젝트'), (select id from public.builders where slug='sample-builder'), '리드', 0),
  ((select id from public.works where slug='샘플-반려된-프로젝트'), (select id from public.builders where slug='taeo'), '참여', 1),
  ((select id from public.works where slug='샘플-발행된-프로젝트'), (select id from public.builders where slug='sample-builder'), '리드', 0),
  ((select id from public.works where slug='샘플-발행된-프로젝트'), (select id from public.builders where slug='sein'), '참여', 1),
  ((select id from public.works where slug='샘플-보관된-프로젝트'), (select id from public.builders where slug='sample-builder'), '리드', 0),
  ((select id from public.works where slug='샘플-보관된-프로젝트'), (select id from public.builders where slug='eunchae'), '참여', 1),
  ((select id from public.works where slug='커머스-리빙-리뉴얼'), (select id from public.builders where slug='josh'), '리드', 0),
  ((select id from public.works where slug='커머스-리빙-리뉴얼'), (select id from public.builders where slug='minseo'), '참여', 1),
  ((select id from public.works where slug='커머스-리빙-리뉴얼'), (select id from public.builders where slug='taeo'), '참여', 2),
  ((select id from public.works where slug='ai-업무플랫폼-daisy'), (select id from public.builders where slug='yuna'), '리드', 0),
  ((select id from public.works where slug='ai-업무플랫폼-daisy'), (select id from public.builders where slug='sein'), '참여', 1),
  ((select id from public.works where slug='o2o-예약-사용자앱'), (select id from public.builders where slug='sample-builder'), '리드', 0),
  ((select id from public.works where slug='o2o-예약-사용자앱'), (select id from public.builders where slug='hajun'), '참여', 1),
  ((select id from public.works where slug='핀테크-결제-어드민'), (select id from public.builders where slug='dohyun'), '리드', 0),
  ((select id from public.works where slug='핀테크-결제-어드민'), (select id from public.builders where slug='sein'), '참여', 1),
  ((select id from public.works where slug='핀테크-결제-어드민'), (select id from public.builders where slug='junho'), '참여', 2),
  ((select id from public.works where slug='saas-지점정산-운영콘솔'), (select id from public.builders where slug='dohyun'), '리드', 0),
  ((select id from public.works where slug='saas-지점정산-운영콘솔'), (select id from public.builders where slug='junho'), '참여', 1),
  ((select id from public.works where slug='미디어-광고-셀프집행'), (select id from public.builders where slug='josh'), '리드', 0),
  ((select id from public.works where slug='미디어-광고-셀프집행'), (select id from public.builders where slug='eunchae'), '참여', 1),
  ((select id from public.works where slug='커머스-복지몰-edk'), (select id from public.builders where slug='dohyun'), '리드', 0),
  ((select id from public.works where slug='커머스-복지몰-edk'), (select id from public.builders where slug='taeo'), '참여', 1),
  ((select id from public.works where slug='ai-심리분석-canape'), (select id from public.builders where slug='yuna'), '리드', 0),
  ((select id from public.works where slug='ai-심리분석-canape'), (select id from public.builders where slug='minseo'), '참여', 1),
  ((select id from public.works where slug='플랫폼-돌봄-연결'), (select id from public.builders where slug='sample-builder'), '리드', 0),
  ((select id from public.works where slug='플랫폼-돌봄-연결'), (select id from public.builders where slug='hajun'), '참여', 1)
on conflict do nothing;

-- ── Insight ─────────────────────────────────────────────────────────
-- body_html 이 있는 글은 한 건뿐이다. 나머지는 어드민에서 채우는 것이 원래 계획이다.
insert into public.insights (slug, title, excerpt, body_html, thumb_url, category_id, author_id, status, published_at, reject_reason) values
  ('샘플-작성중-글', '[샘플 ①] 작성 중 — 자유롭게 수정할 수 있습니다', '아직 제출하지 않은 초안입니다. 제목·본문·썸네일·주소를 모두 고칠 수 있고, 다 되면 검토를 요청합니다.', '<h2 id="여기를-고쳐-보세요">여기를 고쳐 보세요</h2><p>툴바로 소제목·굵게·목록·링크를 넣어 볼 수 있습니다. H1 은 없습니다 — 페이지 제목이 h1 이라 본문은 H2 부터 시작합니다.</p><h2 id="다음-단계">다음 단계</h2><p>아래 <strong>검토 요청</strong> 을 누르면 ② 상태로 넘어가고, 그때부터 작성자는 수정할 수 없습니다.</p>', '/assets/img/ins/ins-turnkey.jpg', (select id from public.categories where type='insight' and slug='guide'), (select id from public.builders where slug='sample-builder'), 'draft', null, null),
  ('샘플-승인대기-글', '[샘플 ②] 분업을 없앤 3주, 실제로 달라진 세 가지', '기획·디자인·개발을 한 사람이 들고 가면 일정만 짧아지는 게 아닙니다. 3주짜리 프로젝트를 그렇게 굴려 보고 남은 기록입니다.', '<p>분업을 없애면 일정이 짧아진다고들 합니다. 실제로 짧아집니다. 다만 짧아지는 이유가 흔히 말하는 것과 다릅니다 &mdash; 각자가 빨라져서가 아니라 <strong>기다리는 시간이 사라져서</strong>입니다. 3주짜리 랜딩 페이지를 빌더 한 명과 검수자 한 명 구조로 끝내면서 남긴 기록입니다.</p>

<h2 id="t1">첫째, 문서가 줄어드는 게 아니라 종류가 바뀝니다</h2>
<p>기획자가 개발자에게 넘기는 문서는 &quot;내가 이해한 것을 남에게 옮기는&quot; 문서입니다. 넘길 사람이 없으면 그 문서도 필요가 없습니다. 대신 다른 문서가 생깁니다 &mdash; <em>나중의 나</em>와 <em>검수하는 사람</em>이 읽을 결정 기록입니다.</p>
<p>우리가 남기는 것은 셋뿐입니다. 화면 목록, 각 화면에서 사용자가 하려는 일 한 줄, 그리고 &quot;이건 왜 이렇게 했나&quot;에 대한 답. 스무 장짜리 기획서가 사라진 자리에 이 셋이 남습니다.</p>
<blockquote>없어진 것은 문서가 아니라 인수인계입니다.</blockquote>

<h2 id="t2">둘째, 첫 리뷰가 시안이 아니라 화면 위에서 열립니다</h2>
<p>분업 구조에서 첫 리뷰는 대개 디자인이 끝난 뒤에 열립니다. 그때 방향이 틀린 것이 발견되면 되돌릴 수 있는 것이 거의 없습니다. 한 사람이 화면을 통째로 들고 있으면 <strong>눌러지는 화면</strong>을 먼저 올릴 수 있고, 리뷰는 그 위에서 열립니다. 말로 설명해야 했던 것의 절반이 그냥 보입니다.</p>
<p>대신 규칙이 하나 필요합니다. 만든 사람이 자기 결과물을 승인하지 못하게 하는 것입니다. 속도를 한 사람에게 몰아준 만큼 판단은 반드시 다른 사람이 합니다 &mdash; 이 글이 지금 승인 대기 상태인 이유이기도 합니다.</p>

<h2 id="t3">셋째, 남는 시간을 어디에 쓰는지가 팀의 성격이 됩니다</h2>
<p>줄어든 일정을 그대로 견적에 반영하면 그냥 싼 팀이 됩니다. 우리는 그 시간을 두 곳에 씁니다. 접근성과 성능, 그리고 인수인계 문서입니다. 둘 다 요청받은 적은 없지만, 없으면 반년 뒤에 비용으로 돌아옵니다.</p>
<p>AI 도구는 여기서 처음 등장합니다. 도구가 사람을 대신해서 빨라진 것이 아니라, 한 사람이 기획 &middot; 디자인 &middot; 개발을 오갈 때 생기는 <em>전환 비용</em>을 줄여 줍니다. 순서를 바꿔 말하면 결과도 바뀝니다.</p>

<h2 id="t4">이 방식이 맞지 않는 경우</h2>
<p>이해관계자가 많고 승인 단계가 긴 조직이라면 분업이 오히려 안전합니다. 한 사람이 전부 들고 있는 구조는 그 사람이 빠지는 순간 멈추기 때문입니다. 우리가 이 구조를 쓰는 범위도 정해져 있습니다 &mdash; 화면 스무 개 안쪽, 결정권자가 둘 이하인 프로젝트입니다.</p>

<div class="tags"><span class="tag">일하는 방식</span><span class="tag">프로덕트 빌더</span><span class="tag">협업</span></div>', '/assets/img/ins/ins-native.jpg', (select id from public.categories where type='insight' and slug='how'), (select id from public.builders where slug='sample-builder'), 'pending', null, null),
  ('샘플-반려된-글', '[샘플 ③] 반려됨 — 사유를 보고 다시 고칩니다', '관리자가 사유와 함께 돌려보낸 상태입니다. 작성자는 사유를 보고 고친 뒤 다시 검토를 요청합니다.', '<h2 id="반려의-의미">반려의 의미</h2><p>거절이 아니라 되돌림입니다. 화면 맨 위에 사유가 붙어 있고, 폼은 다시 열려 있습니다.</p><h2 id="사유가-필수인-이유">사유가 필수인 이유</h2><p>사유 없는 반려는 “안 됨”만 전달합니다. 무엇을 고쳐야 하는지 없으면 다시 올라오는 것도 같은 상태입니다.</p>', '/assets/img/ins/ins-gov.jpg', (select id from public.categories where type='insight' and slug='how'), (select id from public.builders where slug='sample-builder'), 'rejected', null, '두 번째 소제목의 주장에 근거가 없습니다. 실제로 겪은 사례나 수치를 한 줄 넣어 다시 제출해 주세요. 그리고 썸네일이 본문 내용과 맞지 않습니다.'),
  ('샘플-발행된-글', '[샘플 ④] 발행됨 — 공개 중, 내릴 수 있습니다', '승인되어 공개된 상태입니다. 작성자는 더 이상 손대지 못하고, 관리자만 수정하거나 내릴 수 있습니다.', '<h2 id="여기서부터는-관리자-몫">여기서부터는 관리자 몫</h2><p>공개 중인 글이 검수 없이 바뀌면 안 되기 때문입니다(PRD §7.3 편집 주체 = 관리자).</p><h2 id="내리면">내리면</h2><p><strong>내리기</strong> 를 누르면 ⑤ 보관 상태가 되고, 그 주소는 404 가 아니라 목록으로 301 됩니다 — 색인과 공유 링크를 버리지 않습니다.</p>', '/assets/img/ins/ins-ax.jpg', (select id from public.categories where type='insight' and slug='project'), (select id from public.builders where slug='sample-builder'), 'published', '2026-08-18T00:00:00Z', null),
  ('샘플-보관된-글', '[샘플 ⑤] 보관됨 — 내려간 글, 다시 공개할 수 있습니다', '공개에서 내려간 상태입니다. 지운 것이 아니라 보관입니다 — 관리자가 다시 공개할 수 있습니다.', '<h2 id="지우지-않는-이유">지우지 않는 이유</h2><p>지우면 작성자 연결과 이력이 함께 사라집니다. 상태를 삭제 플래그로 겸하지 않는 것도 같은 이유입니다.</p><h2 id="주소는-살아-있다">주소는 살아 있다</h2><p>보관된 글의 주소는 목록으로 301 됩니다(DR-08).</p>', '/assets/img/ins/ins-toss.jpg', (select id from public.categories where type='insight' and slug='project'), (select id from public.builders where slug='sample-builder'), 'archived', null, null),
  ('바이브코딩-외주-고르는법', '바이브 코딩 외주, 잘하는 곳과 못하는 곳의 차이', '같은 도구를 써도 결과가 다릅니다. 발주 전에 가려내는 기준 세 가지.', '<p>&quot;바이브 코딩으로 외주해 드립니다&quot;라는 업체가 빠르게 늘고 있습니다. 같은 도구를 쓴다고 같은 결과가 나오지 않는데도, 밖에서 보면 구분이 어렵습니다. 이 글은 발주하는 입장에서 그 차이를 가려내는 기준을 정리한 것입니다.</p>

<h2 id="t1">첫째, 포트폴리오의 &apos;실체&apos;를 물어보세요</h2>
<p>포트폴리오 개수가 많다고 실적이 많은 것이 아닙니다. 실제로 존재하지 않는 프로젝트를 산업별 목업으로 만들어두는 업체가 있습니다. 확인 방법은 간단합니다 — &quot;이 프로젝트, 실제 서비스 URL을 알려주실 수 있나요?&quot;라고 물어보면 됩니다.</p>
<blockquote>실제로 수행한 프로젝트라면, 보여주지 못할 이유가 없습니다.</blockquote>

<h2 id="t2">둘째, 사이트의 만듦새를 보세요</h2>
<p>그 업체의 자체 사이트를 열어보세요. 모든 섹션이 똑같은 방식으로 움직인다면 — 모든 텍스트가 동일하게 아래에서 위로 떠오르기만 한다면 — 그것은 AI로 한 번에 생성하고 손보지 않았다는 신호입니다. 자기 사이트에 시간을 쓰지 않는 팀이 고객 사이트에 시간을 쓸 가능성은 낮습니다.</p>

<div class="yt" data-track="youtube_outbound" data-slug="quality-video"><div class="play"><i>▶</i></div></div>
<p class="yt-link"><a href="/content">유튜브에서 보기 →</a></p>

<h2 id="t3">셋째, 가격이 아니라 구조를 물어보세요</h2>
<p>&quot;반값&quot;을 앞세우는 곳은 조심해야 합니다. 물어야 할 것은 가격이 아니라 구조입니다 — 누가 만드는지, 어떻게 검증된 사람인지, 진행 중에 무엇을 확인시켜 주는지, 끝나면 무엇을 넘겨주는지. 이 네 가지에 명확히 답하는 팀이라면 도구가 무엇이든 결과물이 나옵니다.</p>

<div class="tags"><span class="tag">발주 가이드</span><span class="tag">외주</span><span class="tag">체크리스트</span></div>', '/assets/img/ins/ins-turnkey.jpg', (select id from public.categories where type='insight' and slug='guide'), (select id from public.builders where slug='josh'), 'published', '2026-08-11T00:00:00Z', null),
  ('3주-랜딩페이지-제작순서', '우리가 3주 만에 랜딩 페이지를 만드는 순서', '기획·디자인·개발을 한 사람이 맡으면 일정이 어떻게 접히는지.', null, '/assets/img/ins/ins-native.jpg', (select id from public.categories where type='insight' and slug='how'), (select id from public.builders where slug='sample-builder'), 'published', '2026-08-09T00:00:00Z', null),
  ('ai툴-실무도입-검증기준', '새 AI 툴을 실무에 붙일 때 우리가 확인하는 것들', '도구가 매주 바뀝니다. 붙일지 말지를 가르는 우리 기준을 공개합니다.', null, '/assets/img/ins/ins-poc.jpg', (select id from public.categories where type='insight' and slug='ai-ax'), (select id from public.builders where slug='sein'), 'draft', null, null),
  ('ai-poc-도입전-검증', 'AI PoC란? 기업 AI 도입 전 반드시 필요한 ''PoC'' 알아보기', '기업 AI 도입, 전면 구축 전에 PoC로 먼저 검증해야 하는 이유.', null, '/assets/img/ins/ins-poc.jpg', (select id from public.categories where type='insight' and slug='ai-ax'), (select id from public.builders where slug='josh'), 'published', '2026-08-03T00:00:00Z', null),
  ('ai에이전트-도입-체크리스트', '우리 회사에도 AI 에이전트가 필요할까? 5분 체크리스트', '도입이 필요한 조직의 신호 — 5분 만에 자가진단해 보세요.', null, '/assets/img/ins/ins-agent.jpg', (select id from public.categories where type='insight' and slug='ai-ax'), (select id from public.builders where slug='josh'), 'published', '2026-07-22T00:00:00Z', null),
  ('ai도입-ax-차이-업무설계', 'AI 도입과 AX는 다르다 — 성과를 만드는 업무 설계 3가지', '도입했는데 성과가 없다면, AX와의 결정적 차이를 봐야 합니다.', null, '/assets/img/ins/ins-ax.jpg', (select id from public.categories where type='insight' and slug='ai-ax'), (select id from public.builders where slug='josh'), 'published', '2026-07-16T00:00:00Z', null),
  ('기업ai-도입-거버넌스', '기업용 AI 도입, 왜 거버넌스가 먼저 필요할까?', '데이터 유출·통제 불능을 막는 AI 거버넌스 설계법.', null, '/assets/img/ins/ins-gov.jpg', (select id from public.categories where type='insight' and slug='ai-ax'), (select id from public.builders where slug='josh'), 'rejected', null, '3장 도입부의 통계 출처가 빠졌습니다. 원 자료 링크를 달아 다시 제출해 주세요.'),
  ('개발외주-견적-비교법', '500만 원 vs 2,000만 원, 개발 외주 견적 비교 제대로 하는 법', '같은 앱인데 견적이 4배 차이 나는 이유를 뜯어봅니다.', null, '/assets/img/ins/ins-quote.jpg', (select id from public.categories where type='insight' and slug='guide'), (select id from public.builders where slug='josh'), 'published', '2026-07-03T00:00:00Z', null),
  ('외주개발-턴키팀-이유', '외주개발, 왜 올인원 턴키 팀과 함께 해야 할까?', '기획·디자인·개발을 따로 맡기면 실패하는 구조적 이유.', null, '/assets/img/ins/ins-turnkey.jpg', (select id from public.categories where type='insight' and slug='guide'), (select id from public.builders where slug='josh'), 'published', '2026-07-03T00:00:00Z', null),
  ('토스-미니게임-프로젝트', '토스 안에서 미니게임을? 똑똑한개발자 × 앱인토스', '토스와 함께 미니게임을 만든 프로젝트 비하인드.', null, '/assets/img/ins/ins-toss.jpg', (select id from public.categories where type='insight' and slug='project'), (select id from public.builders where slug='josh'), 'archived', null, null),
  ('ai네이티브-에이전시-운영법', '기획·디자인·개발을 하나로 — AI 네이티브 에이전시 운영법', '''프로덕트 빌더''로 팀을 운영하는 방식, 빌더 조쉬와의 대화.', null, '/assets/img/ins/ins-native.jpg', (select id from public.categories where type='insight' and slug='how'), (select id from public.builders where slug='josh'), 'published', '2026-04-22T00:00:00Z', null)
on conflict do nothing;

-- ── 확인 ────────────────────────────────────────────────────────────
-- select status, count(*) from public.works group by status order by status;
-- select status, count(*) from public.insights group by status order by status;
