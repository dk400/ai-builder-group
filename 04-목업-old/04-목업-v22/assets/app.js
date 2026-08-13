/* ============================================================
   AI 빌더 그룹 — 목업 v3 공통 스크립트
   GNB 스크롤 · 리빌/마스크 · GA4 스텁
   + 에셋 가이드 토글 · 커서 추종 (레퍼런스-가이드 체크리스트)
   ============================================================ */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* v22: 해시(#builders 등)로 진입 시 — smooth 스크롤이 lazy 이미지 로딩과 겹치면
     중간에 멈추는 문제가 있어, 도착 직후 즉시 이동으로 위치를 확정한다 */
  if (location.hash) {
    document.documentElement.style.scrollBehavior = 'auto';
    var jumpToHash = function () {
      var t;
      try { t = document.querySelector(location.hash); } catch (e) {}
      if (t) t.scrollIntoView();
    };
    window.addEventListener('load', function () {
      jumpToHash();
      setTimeout(function () { jumpToHash(); document.documentElement.style.scrollBehavior = ''; }, 250);
    });
  }

  /* GNB: 스크롤 시 배경 블러 (높이 고정 — 00-공통 스펙) */
  var gnb = document.querySelector('.gnb');
  function onScroll() { gnb && gnb.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 모바일 메뉴 */
  var burger = document.querySelector('.gnb__burger');
  if (burger) burger.addEventListener('click', function () {
    var open = gnb.classList.toggle('menu-open');
    burger.textContent = open ? '✕' : '☰';
    /* v22: 오버레이 열림 시 body 스크롤 잠금 (PRD FR-C-04) */
    document.body.classList.toggle('no-scroll', open);
  });

  /* 리빌 (IntersectionObserver) */
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
    /* 마스크 리빌 — clip 상태에선 자신의 교차 면적이 0이므로 부모를 관찰 */
    var mio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.mask').forEach(function (m) { m.classList.add('on'); });
          mio.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.mask').forEach(function (m) { if (m.parentElement) mio.observe(m.parentElement); });
  } else {
    document.querySelectorAll('.rv, .mask').forEach(function (el) { el.classList.add('on'); });
  }

  /* GA4 이벤트 스텁 */
  window.track = function (name, params) { console.log('[GA4]', name, params || {}); };
  document.querySelectorAll('[data-track]').forEach(function (el) {
    el.addEventListener('click', function () {
      var p = {};
      if (el.dataset.location) p.location = el.dataset.location;
      if (el.dataset.slug) p.slug = el.dataset.slug;
      if (el.dataset.topic) p.topic = el.dataset.topic;
      window.track(el.dataset.track, p);
    });
  });

  /* ── 에셋 가이드 토글: 이미지 슬롯 스펙 오버레이 표시 ── */
  var tg = document.createElement('button');
  tg.className = 'asset-toggle';
  tg.type = 'button';
  tg.textContent = 'ASSET GUIDE';
  tg.setAttribute('aria-pressed', 'false');
  tg.addEventListener('click', function () {
    var on = document.body.classList.toggle('assets');
    tg.setAttribute('aria-pressed', String(on));
    try { sessionStorage.setItem('assets', on ? '1' : ''); } catch (e) {}
  });
  document.body.appendChild(tg);
  try { if (sessionStorage.getItem('assets')) { document.body.classList.add('assets'); tg.setAttribute('aria-pressed', 'true'); } } catch (e) {}

  /* ── 커서 추종 "VIEW →" — [data-cursor] 요소 위에서만 (cuberto, 과용 금지) ── */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    var cur = document.createElement('div');
    cur.className = 'cur';
    cur.textContent = 'VIEW →';
    cur.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cur);
    var overTarget = false;
    document.addEventListener('mousemove', function (e) {
      if (overTarget) { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }
    }, { passive: true });
    document.querySelectorAll('[data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function (e) {
        overTarget = true;
        cur.textContent = el.dataset.cursor || 'VIEW →';
        cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px';
        cur.classList.add('on');
      });
      el.addEventListener('mouseleave', function () { overTarget = false; cur.classList.remove('on'); });
    });
  }
})();
