/* ==========================================================
       1. Мобильное меню: открытие, ссылки, клик вне, Escape
       ========================================================== */
    (function () {
      const burger = document.getElementById('burger');
      const panel = document.getElementById('main-nav');

      function setMenu(open) {
        panel.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      }

      burger.addEventListener('click', function () {
        setMenu(burger.getAttribute('aria-expanded') !== 'true');
      });

      panel.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
      });

      document.addEventListener('click', function (e) {
        if (!e.target.closest('.site-header')) setMenu(false);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
          setMenu(false);
          burger.focus();
        }
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) setMenu(false);
      });
    })();

    /* ==========================================================
       2. Плавное появление секций (IntersectionObserver)
       ========================================================== */
    (function () {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!('IntersectionObserver' in window) || reduce) return;
      document.documentElement.classList.add('js');
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
    })();

    /* ==========================================================
       3. Фильтр маршрутов по сложности
       ========================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = Array.from(document.querySelectorAll('.route-card'));

    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        let visible = 0;
        cards.forEach(function (card) {
          const show = btn.dataset.filter === 'all' || card.dataset.level === btn.dataset.filter;
          card.hidden = !show;
          if (show) { visible++; card.classList.add('in-view'); }
        });
        document.getElementById('routes-count').textContent =
          'Показано ' + visible + ' ' + plural(visible, 'маршрут', 'маршрута', 'маршрутов');
      });
    });

    function plural(n, one, few, many) {
      const mod10 = n % 10, mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return one;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
      return many;
    }

    /* ==========================================================
       4. Данные маршрутов и модальное окно
       ========================================================== */
    /* Реальные фотографии маршрутов (файлы из проекта, рядом с index.html) */
    const ROUTE_PHOTOS = {
      forest: '1%20лесное%20кольцо.jpg',
      river: '2%20берег%20тихой%20реки.jpg',
      hills: '3%20холмы%20над%20долиной.jpg',
      lake: '4%20озерная%20тропа.jpg',
      falls: '5%20к%20водопаду%20каменному.jpg',
      meadow: '6%20семейная%20поляна.jpg'
    };

    const routeData = {
      forest: {
        tag: '👨‍👩‍ Подходит детям от 4 лет', surface: 'Утрамбованная земля',
        desc: 'Круговой маршрут начинается у лесной парковки и идёт сквозь смешанный лес. Перепада высот почти нет, на середине пути — беседка со столом. Осенью здесь много опят, а весной слышно, как просыпается долина.',
        landmarks: ['Старая еловая аллея — 0,6 км', 'Беседка «Тихая» с местом для привала — 1,4 км', 'Сосновый бор с смотровой поляной — 2,3 км', 'Родник у тропы — 2,9 км']
      },
      river: {
        tag: '🦆 Наблюдение за птицами', surface: 'Тропа + деревянные мостки',
        desc: 'Спокойная тропа вдоль речной террасы. На маршруте три видовые лавочки и подвесной мостик, который мы специально проверили на устойчивость. Удобно идти с биноклем и детьми.',
        landmarks: ['Деревянный мост через ручей — 0,8 км', 'Утиная заводь — 1,6 км', 'Лавочка «Закат» — 3,1 км', 'Пикниковая зона у воды — 4,2 км']
      },
      hills: {
        tag: '⛰ Перепад высот 140 м', surface: 'Тропа, местами камни',
        desc: 'Маршрут набирает высоту плавно, через два лесных склона. На вершине — открытая смотровая площадка с видом на долину и далёкие холмы. Ветренно: возьмите слой потеплее.',
        landmarks: ['Лесная лестница — 1,2 км', 'Кедровая роща — 2,8 км', 'Смотровая «Большой вид» — 4,1 км', 'Каменный останец — 5,6 км']
      },
      lake: {
        tag: '🛶 Купание только в отмеченных местах', surface: 'Песок, корни, настилы',
        desc: 'Полное кольцо вокруг лесного озера. Два пологих песчаных захода в воду, много теневых стоянок. После дождей возможны лужи на северном берегу — закладывайте запас времени.',
        landmarks: ['Песчаный пляж «Тихий» — 1,5 км', 'Валуны с наскальным лишайником — 3,4 км', 'Северный мыс — 5,2 км', 'Большая поляна для привала — 7,6 км']
      },
      falls: {
        tag: '🎒 Опыт ходьбы от 10 лет, обувь с протектором', surface: 'Каменные ступени, корни',
        desc: 'Самый длинный маршрут в подборке: подъём по каменной гряде к водопаду. Проходим только в сухую погоду — после ливня камни становятся скользкими. Не для детей младше 10 лет.',
        landmarks: ['Брод у ручья (только в малую воду) — 1,8 км', 'Каменная гряда — 4,5 км', 'Верхняя смотровая — 7,2 км', 'Водопад Каменный — 9,8 км']
      },
      meadow: {
        tag: '👶 Проходимо с коляской', surface: 'Гравийная дорожка, настил',
        desc: 'Короткая петля для первого похода всей семьёй. Ширина тропы позволяет проехать коляске, на поляне есть столы, туалет и детская эко-площадка. Идеально на 45 минут без спешки.',
        landmarks: ['Эко-таблички «Узнай дерево» — 0,3 км', 'Пруд с уточками — 0,9 км', 'Семейная поляна для пикника — 1,4 км', 'Детская тропа ощущений — 1,9 км']
      }
    };

    const dialog = document.getElementById('route-dialog');
    let currentRoute = null;

    function openRoute(card) {
      const id = card.dataset.id;
      const data = routeData[id];
      currentRoute = {
        id: id,
        name: card.dataset.name,
        distance: card.dataset.distance,
        time: card.dataset.time,
        level: card.dataset.levelName,
        coords: card.dataset.coords
      };

      document.getElementById('modal-title').textContent = data ? currentRoute.name : card.dataset.name;
      document.getElementById('modal-badge').textContent = currentRoute.level;
      document.getElementById('modal-badge').className = 'badge badge-' + card.dataset.level;
      document.getElementById('modal-tag').textContent = data ? data.tag : '';
      document.getElementById('modal-desc').textContent = data ? data.desc : '';
      document.getElementById('modal-distance').textContent = currentRoute.distance;
      document.getElementById('modal-time').textContent = currentRoute.time;
      document.getElementById('modal-coords').textContent = currentRoute.coords;
      document.getElementById('modal-surface').textContent = data ? data.surface : '';

      const list = document.getElementById('modal-landmarks');
      list.innerHTML = '';
      (data ? data.landmarks : []).forEach(function (text) {
        const li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li);
      });

      const cover = document.getElementById('modal-cover');
      cover.className = 'modal-cover';
      const coverImg = document.getElementById('modal-cover-img');
      coverImg.src = ROUTE_PHOTOS[currentRoute.id] || ROUTE_PHOTOS.forest;

      dialog.showModal();
      document.body.classList.add('modal-open');
    }

    cards.forEach(function (card) {
      card.querySelector('.route-more').addEventListener('click', function () { openRoute(card); });
      card.querySelector('[data-download]').addEventListener('click', function () {
        currentRoute = {
          id: card.dataset.id, name: card.dataset.name, distance: card.dataset.distance,
          time: card.dataset.time, level: card.dataset.levelName, coords: card.dataset.coords
        };
        downloadMap(currentRoute);
      });
    });

    function closeDialog() { dialog.close(); }
    document.getElementById('modal-close').addEventListener('click', closeDialog);
    document.getElementById('modal-cancel').addEventListener('click', closeDialog);
    dialog.addEventListener('click', function (e) { if (e.target === dialog) closeDialog(); });
    dialog.addEventListener('close', function () { document.body.classList.remove('modal-open'); });
    document.getElementById('modal-download').addEventListener('click', function () {
      if (currentRoute) downloadMap(currentRoute);
    });

    /* ==========================================================
       5. PDF-памятка маршрута (.pdf)
          Только русский текст (без транслита) через jsPDF
          и встроенный шрифт DejaVu Sans: название маршрута,
          координаты старта, схема местности (горизонтали, лес,
          реки, озёра, сетка, легенда, масштаб, стрелка севера)
          и краткая инструкция. Если jsPDF/шрифт недоступны
          (нет интернета) — резервная текстовая памятка (.txt).
       ========================================================== */

    /* Пары «обычный + жирный» TTF-шрифтов с кириллицей (Fira Code, Iosevka,
       Roboto, DejaVu Sans). Перебираются по очереди, пока пара не загрузится. */
    const MEMO_FONT_PAIRS = [
      {
        regular: 'https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/ttf/FiraCode-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/firacode/6.2.0/ttf/FiraCode-Bold.ttf'
      },
      {
        regular: 'https://cdnjs.cloudflare.com/ajax/libs/Iosevka/11.1.1/iosevka/ttf/iosevka-regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/Iosevka/11.1.1/iosevka/ttf/iosevka-bold.ttf'
      },
      {
        regular: 'https://unpkg.com/roboto-fontface@0.10.0/fonts/roboto/Roboto-Regular.ttf',
        bold: 'https://unpkg.com/roboto-fontface@0.10.0/fonts/roboto/Roboto-Bold.ttf'
      },
      {
        regular: 'https://cdn.jsdelivr.net/gh/dejavu-fonts/dejavu-fonts@master/ttf/DejaVuSans.ttf',
        bold: 'https://cdn.jsdelivr.net/gh/dejavu-fonts/dejavu-fonts@master/ttf/DejaVuSans-Bold.ttf'
      },
      {
        regular: 'https://raw.githubusercontent.com/dejavu-fonts/dejavu-fonts/master/ttf/DejaVuSans.ttf',
        bold: 'https://raw.githubusercontent.com/dejavu-fonts/dejavu-fonts/master/ttf/DejaVuSans-Bold.ttf'
      }
    ];

    let memoFontCache = null;

    function memoHash(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
      return Math.abs(h);
    }

    function memoSeed(seed) {
      let s = seed | 0;
      return function () {
        s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    function catmullRom(points, samples) {
      const out = [];
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        for (let s = 1; s <= samples; s++) {
          const t = s / samples, t2 = t * t, t3 = t2 * t;
          out.push({
            x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t +
              (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
              (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
            y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t +
              (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
              (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
          });
        }
      }
      out.push(points[points.length - 1]);
      return out;
    }

    function memoPolygon(doc, pts, style) {
      if (pts.length < 3) return;
      const rel = [];
      for (let i = 1; i < pts.length; i++) rel.push([pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y]);
      if (rel.length) doc.lines(rel, pts[0].x, pts[0].y, [1, 1], style, true);
    }

    async function loadMemoFonts() {
      if (memoFontCache) return memoFontCache;
      const toBase64 = async function (url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('font');
        const buf = await res.arrayBuffer();
        return new Promise(function (resolve, reject) {
          const fr = new FileReader();
          fr.onload = function () { resolve(String(fr.result).split(',')[1]); };
          fr.onerror = function () { reject(new Error('font')); };
          fr.readAsDataURL(new Blob([buf]));
        });
      };
      const failedSources = [];
      for (let i = 0; i < MEMO_FONT_PAIRS.length; i++) {
        const pair = MEMO_FONT_PAIRS[i];
        try {
          const fonts = {
            regular: await toBase64(pair.regular),
            bold: await toBase64(pair.bold)
          };
          memoFontCache = fonts;
          return fonts;
        } catch (err) {
          failedSources.push(pair.regular);
        }
      }
      console.error('Не удалось загрузить шрифт ни из одного источника:', failedSources.join(', '));
      throw new Error('font');
    }

    function memoRouteShape(id) {
      if (id === 'forest' || id === 'lake' || id === 'meadow') return 'loop';
      return 'line';
    }

    function buildRoutePath(id, r) {
      const rand = memoSeed(memoHash(id));
      const isLoop = memoRouteShape(id) === 'loop';
      const m = 36;
      const x0 = r.x + m, x1 = r.x + r.w - m;
      const y0 = r.y + m, y1 = r.y + r.h - m - 4;
      const pts = [];
      if (isLoop) {
        let x = x0 + (x1 - x0) * 0.16, y = y0 + (y1 - y0) * 0.5;
        for (let i = 0; i < 8; i++) {
          pts.push({ x: x, y: y });
          x = x0 + (x1 - x0) * (0.12 + rand() * 0.76);
          y = y0 + (y1 - y0) * (0.16 + rand() * 0.68);
        }
        pts.push(pts[0]);
      } else {
        for (let i = 0; i < 7; i++) {
          const t = i / 6;
          pts.push({
            x: x0 + (x1 - x0) * Math.min(1, Math.max(0, t + (rand() - 0.5) * 0.22)),
            y: y0 + (y1 - y0) * (0.16 + rand() * 0.68)
          });
        }
      }
      return catmullRom(pts, 10);
    }

    function drawMemoContours(doc, r, id) {
      doc.setDrawColor(214, 192, 158);
      doc.setLineWidth(0.45);
      const clusters = [
        { cx: r.x + r.w * 0.30, cy: r.y + r.h * 0.38, radii: [16, 26, 38, 50] },
        { cx: r.x + r.w * 0.74, cy: r.y + r.h * 0.66, radii: [16, 26, 38, 50] }
      ];
      if (id === 'hills') clusters.push({ cx: r.x + r.w * 0.52, cy: r.y + r.h * 0.46, radii: [22, 36, 50, 64] });
      clusters.forEach(function (c, ci) {
        c.radii.forEach(function (rad) {
          const pts = [];
          for (let i = 0; i < 34; i++) {
            const a = (i / 34) * Math.PI * 2;
            const rr = rad * (1 + 0.10 * Math.sin(a * 3 + ci * 7) + 0.07 * Math.sin(a * 5 + ci * 3));
            pts.push({ x: c.cx + Math.cos(a) * rr, y: c.cy + Math.sin(a) * rr * 0.78 });
          }
          memoPolygon(doc, pts, 'S');
        });
      });
    }

    function drawMemoForest(doc, r, rand) {
      const blobs = [
        { x: r.x + r.w * 0.52, y: r.y + r.h * 0.30, rx: 46, ry: 30 },
        { x: r.x + r.w * 0.16, y: r.y + r.h * 0.72, rx: 52, ry: 34 },
        { x: r.x + r.w * 0.88, y: r.y + r.h * 0.30, rx: 40, ry: 26 }
      ];
      blobs.forEach(function (b, bi) {
        const pts = [];
        for (let i = 0; i < 26; i++) {
          const a = (i / 26) * Math.PI * 2;
          const rr = Math.abs(Math.sin(a * 2 + bi * 5)) * 0.35 + 0.65;
          pts.push({ x: b.x + Math.cos(a) * b.rx * rr, y: b.y + Math.sin(a) * b.ry * rr });
        }
        doc.setFillColor(199, 215, 178);
        doc.setDrawColor(150, 172, 128);
        doc.setLineWidth(0.5);
        memoPolygon(doc, pts, 'FD');
        doc.setFillColor(126, 156, 106);
        for (let i = 0; i < 9; i++) {
          const dx = b.x + (rand() - 0.5) * b.rx * 1.4;
          const dy = b.y + (rand() - 0.5) * b.ry * 1.4;
          if (dx > r.x + 6 && dx < r.x + r.w - 6 && dy > r.y + 6 && dy < r.y + r.h - 6) {
            doc.circle(dx, dy, 1.1, 'F');
          }
        }
      });
      doc.setFont('DejaVu', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(88, 120, 72);
      doc.text('лес', r.x + r.w * 0.50, r.y + 12);
    }

    function drawMemoWater(doc, r, id) {
      if (id === 'lake' || id === 'meadow') {
        const w = id === 'lake'
          ? { cx: r.x + r.w * 0.52, cy: r.y + r.h * 0.54, rx: 72, ry: 32 }
          : { cx: r.x + r.w * 0.62, cy: r.y + r.h * 0.60, rx: 32, ry: 19 };
        const pts = [];
        for (let i = 0; i < 30; i++) {
          const a = (i / 30) * Math.PI * 2;
          const rr = Math.abs(Math.sin(a * 3 + 1)) * 0.2 + 0.8;
          pts.push({ x: w.cx + Math.cos(a) * w.rx * rr, y: w.cy + Math.sin(a) * w.ry * rr });
        }
        doc.setFillColor(176, 209, 213);
        doc.setDrawColor(120, 165, 180);
        doc.setLineWidth(0.6);
        memoPolygon(doc, pts, 'FD');
        doc.setFont('DejaVu', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(62, 116, 138);
        doc.text(id === 'lake' ? 'озеро' : 'пруд', w.cx, w.cy + w.ry + 11, { align: 'center' });
      }
      if (id === 'river' || id === 'falls' || id === 'lake' || id === 'meadow') {
        const x = id === 'falls' ? r.x + r.w * 0.40 : r.x + r.w * 0.56;
        const segs = [];
        for (let i = 0; i <= 14; i++) {
          const t = i / 14;
          segs.push({ x: x + Math.sin(t * Math.PI * 2 + id.length) * 22, y: r.y + 8 + t * (r.h - 16) });
        }
        doc.setLineWidth(3.4);
        doc.setDrawColor(120, 168, 182);
        for (let i = 1; i < segs.length; i++) {
          doc.line(segs[i - 1].x, segs[i - 1].y, segs[i].x, segs[i].y);
        }
        doc.setLineWidth(1.2);
        doc.setDrawColor(200, 228, 232);
        for (let i = 1; i < segs.length; i++) {
          doc.line(segs[i - 1].x, segs[i - 1].y, segs[i].x, segs[i].y);
        }
        doc.setFont('DejaVu', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(62, 116, 138);
        doc.text('река', r.x + r.w * 0.56 + 30, r.y + 14);
      }
    }

    function drawMemoMap(doc, route, data) {
      const r = { x: 40, y: 160, w: 515, h: 252 };
      const rand = memoSeed(memoHash(route.id));
      const isLoop = memoRouteShape(route.id) === 'loop';

      doc.setFillColor(247, 243, 232);
      doc.roundedRect(r.x, r.y, r.w, r.h, 8, 8, 'F');
      doc.setDrawColor(176, 166, 146);
      doc.setLineWidth(1);
      doc.roundedRect(r.x, r.y, r.w, r.h, 8, 8, 'S');

      doc.setDrawColor(231, 226, 212);
      doc.setLineWidth(0.3);
      for (let gx = r.x + 50; gx < r.x + r.w; gx += 50) doc.line(gx, r.y + 4, gx, r.y + r.h - 4);
      for (let gy = r.y + 50; gy < r.y + r.h; gy += 50) doc.line(r.x + 4, gy, r.x + r.w - 4, gy);

      drawMemoContours(doc, r, route.id);
      drawMemoForest(doc, r, rand);
      drawMemoWater(doc, r, route.id);

      const path = buildRoutePath(route.id, r);
      doc.setLineDashPattern([5, 4], 0);
      doc.setDrawColor(46, 125, 50);
      doc.setLineWidth(2.2);
      for (let i = 1; i < path.length; i++) {
        doc.line(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
      }
      doc.setLineDashPattern([], 0);

      const start = path[0];
      const end = path[path.length - 1];
      doc.setFillColor(46, 125, 50);
      doc.circle(start.x, start.y, 7, 'F');
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1.2);
      doc.circle(start.x, start.y, 7, 'S');
      doc.setFont('DejaVu', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('С', start.x, start.y + 3, { align: 'center' });
      doc.setFont('DejaVu', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(46, 125, 50);
      doc.text('Старт', start.x, start.y + 15, { align: 'center' });

      if (!isLoop) {
        doc.setLineWidth(0.8);
        doc.setDrawColor(90, 80, 70);
        doc.line(end.x, end.y, end.x, end.y - 14);
        doc.setFillColor(140, 30, 30);
        doc.triangle(end.x, end.y - 14, end.x + 11, end.y - 11, end.x, end.y - 7, 'F');
        doc.setFont('DejaVu', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(140, 30, 30);
        doc.text('Финиш', end.x + 2, end.y + 14, { align: 'center' });
      }

      const count = Math.min((data.landmarks || []).length, 4);
      doc.setFont('DejaVu', 'bold');
      doc.setFontSize(8);
      for (let i = 0; i < count; i++) {
        const frac = (i + 1) / (count + 1);
        const idx = Math.max(1, Math.min(path.length - 2, Math.round(frac * (path.length - 1))));
        const p = path[idx];
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(46, 125, 50);
        doc.setLineWidth(0.9);
        doc.circle(p.x, p.y, 4.6, 'FD');
        doc.setTextColor(27, 94, 32);
        doc.text(String(i + 1), p.x, p.y + 1.8, { align: 'center' });
      }

      const nx = r.x + r.w - 26, ny = r.y + 26;
      doc.setFillColor(90, 85, 75);
      doc.triangle(nx, ny - 11, nx - 5, ny + 1, nx + 5, ny + 1, 'F');
      doc.setLineWidth(0.7);
      doc.setDrawColor(120, 110, 90);
      doc.line(nx, ny + 1, nx, ny + 9);
      doc.setFont('DejaVu', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(90, 85, 75);
      doc.text('С', nx, ny + 18, { align: 'center' });

      const km = parseFloat(String(route.distance).replace(',', '.')) || 5;
      const pxPerKm = 64;
      const segs = Math.max(1, Math.min(3, Math.ceil(km / 2)));
      const sbX = r.x + 18, sbY = r.y + r.h - 16;
      doc.setLineWidth(0.8);
      doc.setDrawColor(90, 85, 75);
      for (let i = 0; i <= segs; i++) {
        const sx = sbX + i * pxPerKm;
        doc.line(sx, sbY - 3, sx, sbY + 3);
        doc.setFontSize(6.5);
        doc.setTextColor(110, 100, 85);
        doc.text(i === 0 ? '0' : (i * 2) + ' км', sx, sbY + 9, { align: 'center' });
      }
      doc.line(sbX, sbY, sbX + segs * pxPerKm, sbY);

      const lx = r.x + r.w - 164, ly = r.y + r.h - 16;
      const legendItems = [
        { kind: 'dash', label: 'тропа маршрута' },
        { kind: 'contour', label: 'горизонтали' },
        { kind: 'water', label: 'река' },
        { kind: 'forest', label: 'лес' },
        { kind: 'dot', label: 'точка интереса' }
      ];
      let lyy = ly;
      doc.setFont('DejaVu', 'normal');
      doc.setFontSize(6.8);
      legendItems.forEach(function (it) {
        if (it.kind === 'dash') {
          doc.setLineDashPattern([3, 2], 0);
          doc.setDrawColor(46, 125, 50);
          doc.setLineWidth(1.2);
          doc.line(lx, lyy, lx + 13, lyy);
          doc.setLineDashPattern([], 0);
        } else if (it.kind === 'contour') {
          doc.setLineWidth(0.6);
          doc.setDrawColor(214, 192, 158);
          doc.circle(lx + 6, lyy, 5, 'S');
        } else if (it.kind === 'water') {
          doc.setLineWidth(2);
          doc.setDrawColor(96, 150, 165);
          doc.line(lx, lyy, lx + 13, lyy);
        } else if (it.kind === 'forest') {
          doc.setFillColor(150, 172, 128);
          doc.circle(lx + 3.5, lyy, 3.4, 'F');
          doc.circle(lx + 10.5, lyy, 3.4, 'F');
        } else if (it.kind === 'dot') {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(46, 125, 50);
          doc.setLineWidth(0.7);
          doc.circle(lx + 6.5, lyy, 3.6, 'FD');
        }
        doc.setTextColor(100, 92, 78);
        doc.text(it.label, lx + 18, lyy + 2);
        lyy -= 10.5;
      });
    }

    async function downloadMap(route) {
      const data = routeData[route.id] || {};
      const pdfAvailable = typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF === 'function';
      if (!pdfAvailable) {
        fallbackMapTxt(route, data);
        return;
      }
      try {
        showToast('Готовим PDF-памятку…');
        const fonts = await loadMemoFonts();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });

        doc.addFileToVFS('DejaVuSans.ttf', fonts.regular);
        doc.addFont('DejaVuSans.ttf', 'DejaVu', 'normal');
        doc.addFileToVFS('DejaVuSans-Bold.ttf', fonts.bold);
        doc.addFont('DejaVuSans-Bold.ttf', 'DejaVu', 'bold');

        const today = new Date().toLocaleDateString('ru-RU', {
          day: 'numeric', month: 'long', year: 'numeric'
        });

        /* ---------- Стр. 1: шапка ---------- */
        doc.setFillColor(27, 94, 32);
        doc.rect(0, 0, 595.28, 46, 'F');
        doc.setFont('DejaVu', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(255, 255, 255);
        doc.text('ТРОПЫ — памятка маршрута', 40, 29);
        doc.setFont('DejaVu', 'normal');
        doc.setFontSize(9);
        doc.text('Тропы родного края · ' + today, 555, 29, { align: 'right' });

        /* ---------- Название маршрута ---------- */
        doc.setFont('DejaVu', 'bold');
        doc.setFontSize(23);
        doc.setTextColor(27, 94, 32);
        doc.text(route.name, 40, 84);

        /* ---------- Карточки фактов ---------- */
        const facts = [
          { label: 'Сложность', value: route.level },
          { label: 'Длина', value: route.distance },
          { label: 'Время в пути', value: route.time },
          { label: 'Старт (широта, долгота)', value: route.coords }
        ];
        const fw = 121, fh = 40, gap = 10;
        facts.forEach(function (f, i) {
          const fx = 40 + i * (fw + gap);
          doc.setFillColor(240, 245, 236);
          doc.roundedRect(fx, 96, fw, fh, 6, 6, 'F');
          doc.setFont('DejaVu', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(120, 130, 115);
          doc.text(String(f.label).toUpperCase(), fx + 10, 110);
          doc.setFont('DejaVu', 'bold');
          doc.setFontSize(i === 3 ? 8.5 : 12);
          doc.setTextColor(33, 33, 33);
          doc.text(doc.splitTextToSize(f.value, fw - 20), fx + 10, 124);
        });

        /* ---------- Схема местности ---------- */
        doc.setFont('DejaVu', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(27, 94, 32);
        doc.text('Схема местности', 40, 152);
        drawMemoMap(doc, route, data);

        /* ---------- Что увидите по пути ---------- */
        doc.setFont('DejaVu', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(27, 94, 32);
        doc.text('Что увидите по пути', 40, 434);
        const landmarks = (data.landmarks || []).slice(0, 4);
        landmarks.forEach(function (item, i) {
          const by = 454 + i * 17;
          doc.setFont('DejaVu', 'bold');
          doc.setFontSize(9);
          doc.setDrawColor(46, 125, 50);
          doc.setLineWidth(0.8);
          doc.circle(48, by - 4, 5, 'S');
          doc.setTextColor(27, 94, 32);
          doc.text(String(i + 1), 48, by, { align: 'center' });
          doc.setFont('DejaVu', 'normal');
          doc.setFontSize(10.5);
          doc.setTextColor(33, 33, 33);
          doc.text(item, 60, by);
        });
        if (data.surface) {
          doc.setFont('DejaVu', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(110, 100, 85);
          doc.text('Покрытие: ' + data.surface, 40, 454 + landmarks.length * 17 + 8);
        }

        /* ---------- Стр. 2 ---------- */
        doc.addPage();
        doc.setFillColor(27, 94, 32);
        doc.rect(0, 0, 595.28, 46, 'F');
        doc.setFont('DejaVu', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(255, 255, 255);
        doc.text('ТРОПЫ — памятка маршрута', 40, 29);
        doc.setFont('DejaVu', 'normal');
        doc.setFontSize(9);
        doc.text(route.name + ' · стр. 2', 555, 29, { align: 'right' });

        /* ---------- Координаты старта + ссылка на карту ---------- */
        doc.setFont('DejaVu', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(27, 94, 32);
        doc.text('Координаты старта', 40, 82);
        doc.setFont('DejaVu', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(33, 33, 33);
        doc.text(route.coords, 40, 97);
        const parts = String(route.coords).split(',').map(function (s) { return parseFloat(s.trim()); });
        if (parts.length === 2 && isFinite(parts[0]) && isFinite(parts[1])) {
          const mapUrl = 'https://yandex.ru/maps/?ll=' + parts[1] + ',' + parts[0] +
            '&z=16&l=map&pt=' + parts[1] + ',' + parts[0] + ',pm2rdm';
          doc.setTextColor(30, 100, 180);
          doc.setFontSize(10);
          doc.textWithLink('Открыть в Яндекс.Картах ↗', 40, 113, { url: mapUrl });
          doc.setDrawColor(30, 100, 180);
          doc.setLineWidth(0.5);
          doc.line(40, 115, 40 + doc.getTextWidth('Открыть в Яндекс.Картах ↗'), 115);
        }

        /* ---------- Краткая инструкция ---------- */
        doc.setFont('DejaVu', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(27, 94, 32);
        doc.text('Краткая инструкция', 40, 152);

        const instructions = [
          'Доберитесь до точки «Старт» по координатам ' + route.coords + '. Сверьте их в навигаторе или приложении карт перед выходом.',
          'Идите по тропе, показанной на схеме зелёным пунктиром. На развилках сверяйтесь с картой и маркировкой на деревьях.',
          'Точки интереса 1–4 отмечены на схеме цифрами и табличками на местности. Ориентируйтесь на них при движении.',
          'Длина маршрута — ' + route.distance + ', расчётное время — ' + route.time + '. После дождя закладывайте +20–30 процентов времени.',
          'Если сошли с тропы, вернитесь к последней точке интереса и оцените направление по карте и компасу в телефоне.',
          'При чрезвычайной ситуации звоните 112: назовите номер маршрута и ближайшую точку интереса.'
        ];
        let iy = 172;
        instructions.forEach(function (text, i) {
          doc.setFillColor(46, 125, 50);
          doc.circle(44, iy - 4, 9, 'F');
          doc.setFont('DejaVu', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(255, 255, 255);
          doc.text(String(i + 1), 44, iy, { align: 'center' });
          doc.setFont('DejaVu', 'normal');
          doc.setFontSize(10.5);
          doc.setTextColor(33, 33, 33);
          const wrapped = doc.splitTextToSize(text, 500);
          wrapped.forEach(function (line, li) {
            doc.text(line, 62, iy + li * 14);
          });
          iy += wrapped.length * 14 + 12;
        });

        /* ---------- Правила безопасности ---------- */
        iy += 8;
        doc.setFont('DejaVu', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(27, 94, 32);
        doc.text('Правила безопасности', 40, iy);
        iy += 16;
        const rules = [
          'Перед выходом проверьте прогноз погоды и одежду по сезону.',
          'Сообщите близким маршрут и примерное время возвращения.',
          'Возьмите воду (не менее 1 л на человека), перекус и заряженный телефон с запасным аккумулятором.',
          'Не сходите с размеченной тропы, мусор уносите с собой.',
          'Покрытие маршрута: ' + (data.surface || 'смешанное') + '. Для сложных участков нужна обувь с протектором.'
        ];
        rules.forEach(function (text) {
          const wrapped = doc.splitTextToSize(text, 500);
          doc.setFont('DejaVu', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(46, 125, 50);
          doc.text('•', 44, iy - 2);
          doc.setTextColor(33, 33, 33);
          doc.setFontSize(10.5);
          wrapped.forEach(function (line, li) {
            doc.text(line, 56, iy + li * 14);
          });
          iy += wrapped.length * 14 + 9;
        });

        /* ---------- Подвал ---------- */
        doc.setDrawColor(210, 204, 188);
        doc.setLineWidth(0.6);
        doc.line(40, 790, 555, 790);
        doc.setFont('DejaVu', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(120, 112, 98);
        doc.text('ТРОПЫ — региональный проект экотроп · «Тропы родного края» · 2026. Памятка сформирована ' + today + '.', 40, 806);
        doc.setFontSize(8);
        doc.text('стр. 2', 555, 806, { align: 'right' });

        doc.save('tropy-' + route.id + '-pamyatka.pdf');
        showToast('PDF-памятка «' + route.name + '» скачана 🌿');
      } catch (err) {
        console.error('Ошибка PDF-памятки:', err);
        fallbackMapTxt(route, data);
      }
    }

    /* Резервная текстовая памятка (.txt) — если jsPDF или шрифт недоступны */
    function fallbackMapTxt(route, data) {
      const lines = [
        'ТРОПЫ — памятка маршрута',
        '===============================',
        '',
        'Маршрут: ' + route.name,
        'Сложность: ' + route.level,
        'Длина: ' + route.distance,
        'Время в пути: ' + route.time,
        'Старт (широта, долгота): ' + route.coords
      ];
      if (data.surface) lines.push('Покрытие: ' + data.surface);
      lines.push('', 'О маршруте:');
      lines.push(data.desc || 'Описание маршрута будет дополнено в ближайшее время.');
      if (data.landmarks && data.landmarks.length) {
        lines.push('', 'Что увидите по пути:');
        data.landmarks.forEach(function (item) { lines.push('• ' + item); });
      }
      lines.push(
        '',
        'Перед выходом:',
        '• Проверьте прогноз погоды',
        '• Сообщите близким о маршруте',
        '• Возьмите воду и заряженный телефон',
        '• Не сходите с размеченной тропы',
        '• При ЧС звоните 112',
        '',
        'ТРОПЫ — региональный проект экотроп. 2026.'
      );
      const text = lines.join('\n');
      const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tropy-' + route.id + '-pamyatka.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
      showToast('Памятка «' + route.name + '» скачана в .txt (нет доступа к шрифту PDF)');
    }

    /* ==========================================================
       6. Уведомление
       ========================================================== */
    let toastTimer;
    function showToast(text) {
      const toast = document.getElementById('toast');
      toast.textContent = text;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 4200);
    }