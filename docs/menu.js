// ─── Menü ────────────────────────────────────────────────────────────────────
// Hamburger menü + mağaza (App Store / Play Store) için zorunlu sayfalar
// (Gizlilik, Koşullar, Destek) ve Liderlik Tablosu.

(function () {
  const APP_NAME = 'Color Split';
  const APP_VERSION = '1.0.0';

  const overlay = document.getElementById('menuOverlay');
  const body = document.getElementById('menuBody');
  const titleEl = document.getElementById('menuTitle');
  const backBtn = document.getElementById('menuBack');
  const closeBtn = document.getElementById('menuClose');
  const menuBtn = document.getElementById('menuBtn');

  function fmtScore(n) {
    return (Number(n) || 0) + ' bölüm';
  }
  function state() { return (typeof window.S === 'object' && window.S) ? window.S : null; }

  // ─── Aç / Kapat ─────────────────────────────────────────────────────────────
  function open() {
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    showRoot();
  }
  function close() {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }

  menuBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backBtn.addEventListener('click', showRoot);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // ─── Kök menü ───────────────────────────────────────────────────────────────
  const ROOT_ITEMS = [
    { key: 'profile', icon: 'user', label: 'Ben' },
    { key: 'leaderboard', icon: 'trophy', label: 'Liderlik Tablosu' },
    { key: 'settings', icon: 'settings', label: 'Ayarlar' },
    { key: 'howto', icon: 'help', label: 'Nasıl Oynanır' },
    { key: 'privacy', icon: 'lock', label: 'Gizlilik Politikası' },
    { key: 'terms', icon: 'file', label: 'Kullanım Koşulları' },
    { key: 'support', icon: 'mail', label: 'Destek & İletişim' },
    { key: 'about', icon: 'info', label: 'Hakkında' },
  ];

  const ICONS = {
    user: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 19c1.1-3.4 3.4-5 6.5-5s5.4 1.6 6.5 5"/>',
    trophy: '<path d="M8 5h8v4.5c0 2.3-1.5 4.3-4 4.3s-4-2-4-4.3V5Z"/><path d="M8 7H5.5c0 2.4 1.1 4 3 4.5"/><path d="M16 7h2.5c0 2.4-1.1 4-3 4.5"/><path d="M12 14v3"/><path d="M8.5 20h7"/>',
    settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.1"/><path d="M12 18.9V21"/><path d="m5.6 5.6 1.5 1.5"/><path d="m16.9 16.9 1.5 1.5"/><path d="M3 12h2.1"/><path d="M18.9 12H21"/><path d="m5.6 18.4 1.5-1.5"/><path d="m16.9 7.1 1.5-1.5"/>',
    help: '<circle cx="12" cy="12" r="8.2"/><path d="M9.8 9.3a2.4 2.4 0 0 1 4.6 1.1c0 1.8-2.4 2-2.4 3.7"/><path d="M12 17.2h.01"/>',
    lock: '<rect x="5.8" y="10" width="12.4" height="9" rx="2"/><path d="M8.5 10V7.6a3.5 3.5 0 0 1 7 0V10"/><path d="M12 13.6v2.1"/>',
    file: '<path d="M7 3.8h6.2L17 7.6v12.6H7V3.8Z"/><path d="M13 4v4h4"/><path d="M9.5 12h5"/><path d="M9.5 15.5h5"/>',
    mail: '<rect x="4.5" y="6.5" width="15" height="11" rx="2"/><path d="m5.5 8 6.5 5 6.5-5"/>',
    info: '<circle cx="12" cy="12" r="8.2"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
    flag: '<path d="M6.5 20V5"/><path d="M7 5h9.5l-1.7 3 1.7 3H7"/>',
    pin: '<path d="M12 21s5.2-5.5 5.2-10a5.2 5.2 0 0 0-10.4 0C6.8 15.5 12 21 12 21Z"/><circle cx="12" cy="11" r="1.8"/>',
    coin: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="4.6"/><path d="M12 8.8v6.4"/><path d="M9.4 12h5.2"/>',
    flask: '<path d="M9 3.8h6"/><path d="M10.4 3.8v5.4l-4 7.2A2.5 2.5 0 0 0 8.6 20h6.8a2.5 2.5 0 0 0 2.2-3.6l-4-7.2V3.8"/><path d="M8.7 15h6.6"/>',
    hint: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M8.5 12.2a4 4 0 1 1 7 0c-.9 1-1.5 1.8-1.7 3.1h-3.6c-.2-1.3-.8-2.1-1.7-3.1Z"/>',
    undo: '<path d="M8 8H4V4"/><path d="M4.7 8.8A7.4 7.4 0 1 1 5 16.5"/>',
    addBottle: '<path d="M7.8 3.8h5"/><path d="M8.8 3.8v4.8L6 13.8A4 4 0 0 0 9.5 20h2.8"/><path d="M16 13v6"/><path d="M13 16h6"/>',
  };

  function icon(name, cls) {
    return `<svg class="${cls || 'ui-icon'}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g>${ICONS[name] || ICONS.info}</g></svg>`;
  }

  function showRoot() {
    titleEl.textContent = 'Menü';
    backBtn.classList.add('hidden');
    body.scrollTop = 0;
    body.innerHTML = '';
    ROOT_ITEMS.forEach((it) => {
      const b = document.createElement('button');
      b.className = 'menu-item';
      b.innerHTML = `<span class="ico">${icon(it.icon)}</span><span>${it.label}</span><span class="chev">›</span>`;
      b.addEventListener('click', () => showPage(it.key, it.label));
      body.appendChild(b);
    });
  }

  function showPage(key, label) {
    titleEl.textContent = label;
    backBtn.classList.remove('hidden');
    body.scrollTop = 0;
    if (key === 'profile') return renderProfile();
    if (key === 'leaderboard') return renderLeaderboard();
    if (key === 'settings') return renderSettings();
    body.innerHTML = PAGES[key] || '<div class="page"><p>Bulunamadı.</p></div>';
  }

  // ─── Ben (istatistikler) ────────────────────────────────────────────────────
  function renderProfile() {
    const s = state() || {};
    const level = (s.levelIndex || 0) + 1;
    const solved = s.solvedCount || 0;
    const coins = s.coins || 0;

    const stats = [
      { icon: 'flag', label: 'Çözülen bölüm', value: fmtScore(solved), accent: true },
      { icon: 'pin', label: 'Güncel seviye', value: 'Seviye ' + level },
      { icon: 'coin', label: 'Altın', value: String(coins) },
    ];

    const cards = stats.map((st) => `
      <div class="stat-card${st.accent ? ' accent' : ''}">
        <span class="stat-ico">${icon(st.icon)}</span>
        <span class="stat-val">${st.value}</span>
        <span class="stat-lbl">${st.label}</span>
      </div>`).join('');

    body.innerHTML = `
      <div class="profile-hero">
        <div class="profile-avatar">${icon('flask')}</div>
        <div class="profile-name">Sen</div>
        <div class="profile-sub">Seviye ${level} • ${fmtScore(solved)} çözüldü</div>
      </div>
      <div class="stat-grid">${cards}</div>
      <div class="page"><p class="muted">İlerlemen bu cihazda yerel olarak tutulur.</p></div>`;
  }

  // ─── Liderlik Tablosu (yerel haftalık yarış) ────────────────────────────────
  let lbTimer = null;

  function fmtCountdown(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}g ${h}s`;
    if (h > 0) return `${h}s ${m}dk`;
    return `${m}dk`;
  }

  function renderLeaderboard() {
    const board = window.Leaderboard.getBoard();
    const you = board.you || { rank: board.total, score: 0 };
    const TOPN = 20;
    const top = board.rows.slice(0, TOPN);

    const rowHtml = (e) => {
      const cls = e.rank <= 3 ? ` top${e.rank}` : '';
      return `<li class="lb-row${e.you ? ' lb-you' : ''}">
        <span class="lb-rank${cls}">${e.rank}</span>
        <span class="lb-name">${escapeHtml(e.name)}</span>
        <span class="lb-score">${fmtScore(e.score)}</span>
      </li>`;
    };
    const rows = top.map(rowHtml).join('');
    const youExtra = you.rank > TOPN ? `<li class="lb-sep">···</li>` + rowHtml(you) : '';

    body.innerHTML = `
      <div class="lb-head">
        <div class="lb-title">${icon('trophy', 'title-icon')} Haftalık Yarış</div>
        <div class="lb-timer">Sıfırlanmasına <b id="lbCd">${fmtCountdown(board.msLeft)}</b></div>
        <div class="lb-you-line">Sıran: <b>${you.rank}</b> / ${board.total}
          &nbsp;•&nbsp; Bu hafta: <b>${fmtScore(you.score)}</b></div>
      </div>
      <ul class="lb-list">${rows}${youExtra}</ul>
      <div class="page"><p class="muted">Sıralama bu hafta çözdüğün bölüm sayısına
      göredir ve her Pazar gece yarısı sıfırlanır.</p></div>`;

    if (lbTimer) clearInterval(lbTimer);
    lbTimer = setInterval(() => {
      const cd = document.getElementById('lbCd');
      if (!cd) { clearInterval(lbTimer); lbTimer = null; return; }
      cd.textContent = fmtCountdown(window.Leaderboard.getBoard().msLeft);
    }, 30000);
  }

  // ─── Ayarlar ────────────────────────────────────────────────────────────────
  function renderSettings() {
    const soundOn = localStorage.getItem('cs_sound') !== 'off';
    body.innerHTML = `
      <div class="setting-row">
        <span>Ses efektleri</span>
        <button class="toggle ${soundOn ? 'on' : ''}" id="soundToggle" aria-label="Ses"><span class="knob"></span></button>
      </div>
      <div class="setting-row">
        <span>İlerlemeyi sıfırla</span>
        <button class="btn red" id="resetBtn">Sıfırla</button>
      </div>
      <div class="page"><p class="muted">Sıfırlama seviyeni, altınını ve çözülen bölüm
      sayını siler; geri alınamaz.</p></div>`;

    const t = document.getElementById('soundToggle');
    t.addEventListener('click', () => {
      const on = t.classList.toggle('on');
      localStorage.setItem('cs_sound', on ? 'on' : 'off');
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
      if (confirm('Tüm ilerlemen silinsin mi? Bu işlem geri alınamaz.')) {
        localStorage.removeItem('colorsort_v1');
        localStorage.removeItem('cs_lb_v1');
        localStorage.removeItem('cs_sound');
        location.reload();
      }
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  // ─── Statik sayfalar ────────────────────────────────────────────────────────
  const PAGES = {
    howto: `<div class="page">
      <h3>Nasıl Oynanır</h3>
      <p>Amaç: her şişeyi tek renk olacak şekilde sırala.</p>
      <p>Bir şişeye dokun (seçilir), sonra başka bir şişeye dokun; üstteki renk
      oraya dökülür.</p>
      <h3>Döküm kuralı</h3>
      <p>Rengi yalnızca <b>boş</b> bir şişeye ya da <b>üstü aynı renk</b> olan bir
      şişeye dökebilirsin. Aynı renkten üst üste kaç katman varsa, hedefte yer
      olduğu kadarı birlikte akar.</p>
      <h3>Güç-artırıcılar</h3>
      <p><span class="inline-icon">${icon('hint')}</span> <b>İpucu</b> geçerli bir hamle gösterir,
      <span class="inline-icon">${icon('undo')}</span> <b>Geri Al</b> son hamleyi
      geri alır, <span class="inline-icon">${icon('addBottle')}</span> <b>Şişe Ekle</b> boş bir şişe ekler. Hepsi altınla kullanılır;
      her bölümü tamamladıkça altın kazanırsın.</p>
    </div>`,

    privacy: `<div class="page">
      <p class="muted">Son güncelleme: 2026</p>
      <h3>Gizlilik Politikası</h3>
      <p>${APP_NAME}, oyun ilerlemeni (seviye, altın ve çözülen bölüm sayısı)
      yalnızca cihazının yerel depolamasında (localStorage) tutar ve hiçbir
      sunucuya göndermez.</p>
      <h3>Reklamlar</h3>
      <p>Mobil uygulamada reklamlar Google AdMob üzerinden gösterilebilir.
      Google ve iş ortakları reklam sunumu, ölçüm ve kötüye kullanım önleme
      amacıyla cihaz/reklam tanımlayıcıları, yaklaşık konum, reklam
      etkileşimleri, kullanım verileri ve tanılama verileri gibi bilgileri
      işleyebilir.</p>
      <h3>Çocukların Gizliliği</h3>
      <p>Uygulama, 13 yaş altı çocuklardan bilerek veri toplamaz.</p>
      <h3>İletişim</h3>
      <p>Sorularınız için mağazadaki uygulama sayfası üzerinden bize
      ulaşabilirsiniz.</p>
    </div>`,

    terms: `<div class="page">
      <p class="muted">Son güncelleme: 2026</p>
      <h3>Kullanım Koşulları</h3>
      <p>Bu uygulamayı kullanarak aşağıdaki koşulları kabul etmiş olursunuz.</p>
      <h3>Eğlence Amaçlıdır</h3>
      <p>${APP_NAME} yalnızca renk sıralama bulmacasına dayalı bir eğlence
      oyunudur. Uygulama içindeki altın oyuna özgüdür; nakde çevrilebilir ödül
      veya finansal değerli varlık bulunmaz.</p>
      <h3>Sorumluluk</h3>
      <p>Uygulama “olduğu gibi” sunulur. Kullanımdan doğabilecek dolaylı
      zararlardan geliştirici sorumlu tutulamaz.</p>
      <h3>Değişiklikler</h3>
      <p>Bu koşullar zaman zaman güncellenebilir. Güncel sürüm uygulama içinde
      yayımlanır.</p>
    </div>`,

    support: `<div class="page">
      <h3>Destek & İletişim</h3>
      <p>Bir sorun mu yaşıyorsun ya da öneri mi vermek istiyorsun? Geri
      bildirimini mağazadaki uygulama sayfası üzerinden iletebilirsin.</p>
      <h3>Sürüm</h3>
      <p class="muted">${APP_NAME} v${APP_VERSION}</p>
    </div>`,

    about: `<div class="page">
      <h3>${APP_NAME}</h3>
      <p>Renk sıralama bulmacası: sıvıları doğru şişelere dökerek her şişeyi tek
      renk yap. Rahatlatıcı, hızlı ve bol bölümlü bir zeka oyunu.</p>
      <p class="muted">Sürüm ${APP_VERSION}</p>
    </div>`,
  };
})();
