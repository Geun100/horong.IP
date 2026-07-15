    const files = [
      'IMG_0521.png', 'IMG_0522.png', 'IMG_0523.png', 'IMG_0524.png',
      'IMG_0525.png', 'IMG_0526.png', 'IMG_0527.png', 'IMG_0528.png',
      'IMG_0529.png'
    ];
    const dlIcon = `<svg viewBox="0 0 24 24"><path d="M12 3v13m0 0l-5-5m5 5l5-5M5 21h14"/></svg>`;
    const grid = document.getElementById('wallpaper-grid');
    document.getElementById('wallpaper-count').textContent = files.length;

    const label = (i) => `호롱이 배경화면 ${String(i + 1).padStart(2, '0')}`;
    const dlName = (i) => `호롱이-배경화면-${String(i + 1).padStart(2, '0')}.png`;
    const isTouch = window.matchMedia('(hover: none)').matches;

    grid.innerHTML = files.map((name, i) => `
      <div class="tile">
        <div class="tile__frame">
          <img src="wallpapers/${name}" alt="${label(i)}" loading="lazy" data-index="${i}" />
        </div>
        ${isTouch ? '' : `<a class="tile__dl" href="wallpapers/${name}" download="${dlName(i)}">${dlIcon}다운로드</a>`}
      </div>
    `).join('');

    // 스크롤 인 애니메이션
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    grid.querySelectorAll('.tile').forEach(t => io.observe(t));

    // 라이트박스
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbDl = document.getElementById('lightbox-dl');
    const lbCount = document.getElementById('lightbox-count');
    let current = 0;

    function openLightbox(i) {
      current = i;
      renderLightbox();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function renderLightbox() {
      lbImg.src = `wallpapers/${files[current]}`;
      lbImg.alt = label(current);
      lbDl.href = `wallpapers/${files[current]}`;
      lbDl.download = dlName(current);
      lbCount.textContent = `${current + 1} / ${files.length}`;
    }

    function step(delta) {
      current = (current + delta + files.length) % files.length;
      renderLightbox();
    }

    function downloadFile(i) {
      const a = document.createElement('a');
      a.href = `wallpapers/${files[i]}`;
      a.download = dlName(i);
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    grid.addEventListener('click', (e) => {
      const img = e.target.closest('img[data-index]');
      if (!img) return;
      const i = Number(img.dataset.index);
      if (isTouch) downloadFile(i);
      else openLightbox(i);
    });

    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox-prev').addEventListener('click', () => step(-1));
    document.getElementById('lightbox-next').addEventListener('click', () => step(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
