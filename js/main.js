    // ── 히어로 영상: 첫 재생만 소리, 이후 반복은 무음 ──────────────
    (function () {
      const heroVideo = document.querySelector('.hero__video');
      if (!heroVideo) return;
      heroVideo.loop = false;
      let soundUsed = false;
      const tryUnmute = () => {
        if (soundUsed) return;
        soundUsed = true;
        heroVideo.muted = false;
      };
      document.addEventListener('click', tryUnmute, { once: true });
      document.addEventListener('touchstart', tryUnmute, { once: true });
      heroVideo.addEventListener('ended', () => {
        heroVideo.muted = true;
        heroVideo.currentTime = 0;
        heroVideo.play();
      });
    })();

    // ── SNS 영상: 화면에 스크롤로 들어올 때만 재생 (무음, 계속 반복) ──
    (function () {
      const snsVideo = document.querySelector('.sns__video');
      if (!snsVideo) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) snsVideo.play().catch(() => { });
          else snsVideo.pause();
        });
      }, { threshold: 0.35 });
      observer.observe(snsVideo);
    })();

    // ── 스토리 모달 ──────────────────────────────────────────────
    const storyModal = document.getElementById('story-modal');
    const storyStage = document.getElementById('story-stage');
    const storyProgress = document.getElementById('story-progress');
    const storyHint = document.getElementById('story-hint');
    const storyOpenBtn = document.getElementById('story-open-btn');
    const storyCloseBtn = document.getElementById('story-modal-close');

    const scenes = storyStage.querySelectorAll('.story-scene');
    const totalScenes = scenes.length;
    let currentScene = 0;
    let isAnimating = false;

    function updateProgress() {
      const pct = ((currentScene + 1) / totalScenes) * 100;
      storyProgress.style.width = pct + '%';
      storyHint.classList.toggle('is-last', currentScene === totalScenes - 1);
      if (currentScene === totalScenes - 1) {
        storyHint.style.display = 'none';
      } else {
        storyHint.style.display = '';
      }
    }

    function goToScene(index) {
      if (isAnimating) return;
      if (index < 0 || index >= totalScenes) return;
      isAnimating = true;

      const current = scenes[currentScene];
      current.classList.add('is-exit');

      setTimeout(() => {
        current.classList.remove('is-active', 'is-exit');
        currentScene = index;
        const next = scenes[currentScene];
        next.classList.add('is-active');
        updateProgress();
        isAnimating = false;
      }, 380);
    }

    function nextScene() {
      if (currentScene < totalScenes - 1) {
        goToScene(currentScene + 1);
      }
      // 마지링 씬(엔딩)은 버튼이 닫기 담당
    }

    function openStory() {
      currentScene = 0;
      scenes.forEach((s, i) => {
        s.classList.remove('is-active', 'is-exit');
        if (i === 0) s.classList.add('is-active');
      });
      updateProgress();
      storyModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeStory() {
      storyModal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    storyOpenBtn.addEventListener('click', openStory);

    // 네비게이션 "스토리" 링크도 모달로 연결
    document.querySelectorAll('a[href="#story"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('story').scrollIntoView({ behavior: 'auto', block: 'start' });
        setTimeout(openStory, 300);
      });
    });

    storyCloseBtn.addEventListener('click', closeStory);

    // 엔딩 "Begin the Journey" 버튼
    document.getElementById('story-journey-btn').addEventListener('click', e => {
      e.stopPropagation();
      closeStory();
      document.getElementById('goods').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // 스테이지 클릭 → 다음 씬
    storyStage.addEventListener('click', nextScene);

    // ESC 닫기
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && storyModal.classList.contains('is-open')) closeStory();
      if (e.key === 'ArrowRight' && storyModal.classList.contains('is-open')) nextScene();
    });

    // 허브 "호롱이 만나기" 버튼도 모달로
    document.querySelectorAll('.btn--ghost[href="#story"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openStory();
      });
    });

    const SUPABASE_URL = 'https://vuglofumvelzbodjswyx.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_VWRku3Z9d9OakfT72imlZQ_jNMEDdyA';

    const modal = document.getElementById('interest-modal');
    const stepForm = document.getElementById('modal-step-form');
    const stepDone = document.getElementById('modal-step-done');
    const modalDescEl = document.getElementById('modal-desc');
    const form = document.getElementById('interest-form');
    const emailInput = document.getElementById('interest-email');
    let currentItem = null;
    let currentBtn = null;

    function markInterest(item, email) {
      const log = JSON.parse(localStorage.getItem('horong_interest') || '[]');
      log.push({ item, email: email || null, ts: new Date().toISOString() });
      localStorage.setItem('horong_interest', JSON.stringify(log));

      fetch(`${SUPABASE_URL}/rest/v1/interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({ item, email: email || null })
      }).catch(() => { });
    }

    function markButtonDone(btn) {
      btn.classList.add('is-done');
      btn.textContent = '관심 등록 완료 ✓';
      btn.disabled = true;
    }

    // ── 등록된 이메일 한 번만 물어보고 재사용 ──────────────────────
    const toast = document.getElementById('interest-toast');
    let toastTimer = null;

    function showToast(message) {
      toast.textContent = message;
      toast.hidden = false;
      requestAnimationFrame(() => toast.classList.add('is-visible'));
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
        setTimeout(() => { toast.hidden = true; }, 250);
      }, 2200);
    }

    function getSavedEmail() {
      return localStorage.getItem('horong_email') || '';
    }

    function hasSavedEmail() {
      return !!getSavedEmail();
    }

    function openEmailModal(item) {
      currentItem = item;
      currentBtn = item
        ? [...document.querySelectorAll('.card__cta')].find(b => b.dataset.item === item)
        : null;
      modalDescEl.innerHTML = item
        ? `<strong>${item}</strong> 구매 의사를 등록하려면 이메일이 필요해요.<br />출시 때 가장 먼저 알려드릴게요.`
        : '이메일을 남기면 출시 때 바로 알려드릴게요.';
      stepForm.hidden = false;
      stepDone.hidden = true;
      emailInput.value = getSavedEmail();
      modal.hidden = false;
      emailInput.focus();
    }

    document.querySelectorAll('.card__cta').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.dataset.item;
        if (hasSavedEmail()) {
          // 이미 이메일을 등록했으면 모달 없이 바로 등록
          const email = getSavedEmail();
          markInterest(item, email);
          markButtonDone(btn);
          showToast(`등록완료 · ${email}로 알려드릴게요`);
          return;
        }
        openEmailModal(item);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) return;
      localStorage.setItem('horong_email', email);
      if (currentItem) {
        markInterest(currentItem, email);
        markButtonDone(currentBtn);
      }
      stepForm.hidden = true;
      stepDone.hidden = false;
      setTimeout(() => { modal.hidden = true; }, 1400);
    });

    modal.addEventListener('click', e => {
      if (e.target.hasAttribute('data-close')) {
        modal.hidden = true;
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !modal.hidden) modal.hidden = true;
    });

    // ── FAQ 아코디언 + 스크롤 등장 ──────────────────────────────
    document.querySelectorAll('.faq__item').forEach((item, i) => {
      const btn = item.querySelector('.faq__q');
      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        item.classList.toggle('is-open', willOpen);
        btn.setAttribute('aria-expanded', String(willOpen));
      });

      item.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
    });

    const faqObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          faqObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.faq__item').forEach(item => faqObserver.observe(item));

    // 히어로 벗어나면 nav 배경 전환 (클래스 토글 1회성이라 스크롤 리스너로 충분)
    const nav = document.querySelector('.nav');
    const hero = document.querySelector('.hero');
    function updateNav() {
      nav.classList.toggle('is-solid', window.scrollY > hero.offsetHeight - 68);
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    // 앵커 클릭 시 명시적으로 스크롤 (video 재생 중 브라우저가 smooth-scroll을 끊는 경우 대비)
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    });

    // ── 모바일 햄버거 메뉴 ──────────────────────────────────────
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');
    function closeMobileNav() {
      navToggle.classList.remove('is-open');
      navMobile.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    navToggle.addEventListener('click', () => {
      const willOpen = !navMobile.classList.contains('is-open');
      navToggle.classList.toggle('is-open', willOpen);
      navMobile.classList.toggle('is-open', willOpen);
      navToggle.setAttribute('aria-expanded', String(willOpen));
    });
    navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));

    // 재방문 시 등록한 아이템 done 상태 복원
    const saved = JSON.parse(localStorage.getItem('horong_interest') || '[]');
    const savedItems = new Set(saved.map(r => r.item));
    document.querySelectorAll('.card__cta').forEach(btn => {
      if (savedItems.has(btn.dataset.item)) markButtonDone(btn);
    });

    // 좋아요 토글 + 실시간 카운트 (Supabase likes 테이블)
    const likes = new Set(JSON.parse(localStorage.getItem('horong_likes') || '[]'));
    const likeButtons = [...document.querySelectorAll('.card__like')].map(btn => {
      const item = btn.closest('.card').querySelector('.card__cta').dataset.item;
      const countEl = btn.querySelector('[data-like-count]');
      if (likes.has(item)) btn.classList.add('is-liked');
      return { btn, item, countEl };
    });

    fetch(SUPABASE_URL + '/rest/v1/likes?select=item,count', {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY }
    })
      .then(res => res.ok ? res.json() : [])
      .then(rows => {
        const counts = new Map(rows.map(r => [r.item, r.count]));
        likeButtons.forEach(({ item, countEl }) => {
          if (counts.has(item)) countEl.textContent = counts.get(item);
        });
      })
      .catch(() => { });

    likeButtons.forEach(({ btn, item, countEl }) => {
      btn.addEventListener('click', () => {
        const liking = !likes.has(item);
        const delta = liking ? 1 : -1;

        if (liking) { likes.add(item); btn.classList.add('is-liked'); }
        else { likes.delete(item); btn.classList.remove('is-liked'); }
        localStorage.setItem('horong_likes', JSON.stringify([...likes]));
        countEl.textContent = Math.max(0, (parseInt(countEl.textContent, 10) || 0) + delta);

        fetch(SUPABASE_URL + '/rest/v1/rpc/increment_like', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: 'Bearer ' + SUPABASE_KEY
          },
          body: JSON.stringify({ p_item: item, p_delta: delta })
        })
          .then(res => res.ok ? res.json() : null)
          .then(newCount => { if (typeof newCount === 'number') countEl.textContent = newCount; })
          .catch(() => { });
      });
    });
