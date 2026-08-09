/* =============================================================================
 * Teatro EAC — App (roteamento por hash + views)
 * =========================================================================== */

const app = document.getElementById('app');
const nav = document.querySelectorAll('.top-nav a');

// ---------------------------------------------------------------- Utilities
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const initials = (name) => name.split(/\s+/).filter(w => w[0] !== '(').map(w => w[0]).join('').slice(0, 2).toUpperCase();

// ---------------------------------------------------------------- Avatars (SVG)
const SKIN = { light: '#f6d8bd', medium: '#d9a679', tan: '#b98450', dark: '#7a4f2b' };

function shade(hex, amt) {
  const c = String(hex).replace('#', '');
  const parse = (i) => parseInt(c.slice(i, i + 2), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const mix = (v) => clamp(Math.round(v + 255 * amt));
  const [r, g, b] = [mix(parse(0)), mix(parse(2)), mix(parse(4))];
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function renderHair(style, color) {
  switch (style) {
    case 'bald':
    case 'covered':
      return '';
    case 'short':
      return `<path d="M26 42 Q26 22 50 20 Q74 22 74 42 Q74 32 50 30 Q26 32 26 42" fill="${color}"/>`;
    case 'long':
      return `<path d="M20 60 Q18 22 50 18 Q82 22 80 60 Q78 36 74 40 Q74 30 50 28 Q26 30 26 40 Q22 36 20 60" fill="${color}"/>`;
    case 'bangs':
      return `<path d="M26 42 Q26 20 50 20 Q74 20 74 42 L 74 32 Q60 26 55 40 L 45 40 Q40 26 26 32 Z" fill="${color}"/>`;
    case 'bun':
      return `<path d="M26 42 Q26 22 50 20 Q74 22 74 42 Q74 32 50 30 Q26 32 26 42" fill="${color}"/>
              <circle cx="50" cy="15" r="8" fill="${color}"/>`;
    case 'ponytail':
      return `<ellipse cx="80" cy="38" rx="6" ry="14" fill="${color}" transform="rotate(25 80 38)"/>
              <path d="M26 42 Q26 22 50 20 Q74 22 74 42 Q74 32 50 30 Q26 32 26 42" fill="${color}"/>`;
    case 'gray-perm':
      return `<path d="M26 42 Q26 22 50 20 Q74 22 74 42 Q74 32 50 30 Q26 32 26 42" fill="${color}"/>
              <circle cx="30" cy="28" r="5" fill="${color}"/>
              <circle cx="42" cy="21" r="5" fill="${color}"/>
              <circle cx="58" cy="21" r="5" fill="${color}"/>
              <circle cx="70" cy="28" r="5" fill="${color}"/>`;
    case 'slick':
      return `<path d="M26 42 Q28 24 50 22 Q72 24 74 42 Q68 28 50 30 Q32 28 26 42" fill="${color}"/>`;
    case 'emo':
      return `<path d="M22 46 Q22 18 50 18 Q78 18 78 46 Q78 30 55 30 L 45 46 L 28 30 Q22 32 22 46" fill="${color}"/>`;
    case 'doll':
      return `<path d="M26 42 Q26 22 50 20 Q74 22 74 42" fill="${color}"/>
              <ellipse cx="20" cy="46" rx="8" ry="15" fill="${color}"/>
              <ellipse cx="80" cy="46" rx="8" ry="15" fill="${color}"/>`;
    default:
      return `<path d="M26 42 Q26 22 50 20 Q74 22 74 42 Q74 32 50 30 Q26 32 26 42" fill="${color}"/>`;
  }
}

function renderEyes(style) {
  switch (style) {
    case 'closed':
      return `<path d="M35 42 Q40 46 45 42" stroke="#222" fill="none" stroke-width="2" stroke-linecap="round"/>
              <path d="M55 42 Q60 46 65 42" stroke="#222" fill="none" stroke-width="2" stroke-linecap="round"/>`;
    case 'wink':
      return `<circle cx="40" cy="42" r="2.5" fill="#222"/>
              <path d="M55 42 Q60 46 65 42" stroke="#222" fill="none" stroke-width="2" stroke-linecap="round"/>`;
    case 'shy':
      return `<circle cx="40" cy="43" r="1.8" fill="#222"/>
              <circle cx="60" cy="43" r="1.8" fill="#222"/>`;
    default:
      return `<circle cx="40" cy="42" r="2.5" fill="#222"/>
              <circle cx="60" cy="42" r="2.5" fill="#222"/>
              <circle cx="40.8" cy="41.3" r="0.8" fill="#fff"/>
              <circle cx="60.8" cy="41.3" r="0.8" fill="#fff"/>`;
  }
}

function renderMouth(style) {
  switch (style) {
    case 'sad':
      return `<path d="M42 55 Q50 50 58 55" stroke="#8a3a4a" fill="none" stroke-width="2" stroke-linecap="round"/>`;
    case 'open':
      return `<ellipse cx="50" cy="53" rx="4" ry="3.5" fill="#8a2a3a"/>`;
    case 'line':
      return `<path d="M44 53 L 56 53" stroke="#7a3a3a" stroke-width="2" stroke-linecap="round"/>`;
    case 'smirk':
      return `<path d="M42 52 Q50 55 58 51" stroke="#8a3a4a" fill="none" stroke-width="2" stroke-linecap="round"/>`;
    case 'smile':
    default:
      return `<path d="M42 51 Q50 58 58 51" stroke="#8a3a4a" fill="none" stroke-width="2" stroke-linecap="round"/>`;
  }
}

const cheeks = `<circle cx="33" cy="50" r="3" fill="#f39aa9" opacity="0.55"/>
                <circle cx="67" cy="50" r="3" fill="#f39aa9" opacity="0.55"/>`;

function renderAccessory(acc, hairColor) {
  switch (acc) {
    case 'glasses':
      return `<circle cx="40" cy="42" r="6" fill="none" stroke="#222" stroke-width="1.5"/>
              <circle cx="60" cy="42" r="6" fill="none" stroke="#222" stroke-width="1.5"/>
              <line x1="46" y1="42" x2="54" y2="42" stroke="#222" stroke-width="1.5"/>`;
    case 'nerd-glasses':
      return `<rect x="32" y="36" width="14" height="11" fill="rgba(200,220,255,0.35)" stroke="#111" stroke-width="2" rx="1"/>
              <rect x="54" y="36" width="14" height="11" fill="rgba(200,220,255,0.35)" stroke="#111" stroke-width="2" rx="1"/>
              <line x1="46" y1="41" x2="54" y2="41" stroke="#111" stroke-width="2"/>`;
    case 'crown':
      return `<path d="M32 20 L 38 10 L 44 18 L 50 8 L 56 18 L 62 10 L 68 20 Z" fill="#f0c040" stroke="#a67c00" stroke-width="1"/>
              <circle cx="50" cy="15" r="1.6" fill="#e04a4a"/>`;
    case 'tiara':
      return `<path d="M36 22 L 42 15 L 46 20 L 50 12 L 54 20 L 58 15 L 64 22 Z" fill="#f5d84a" stroke="#b58900" stroke-width="1"/>
              <circle cx="50" cy="17" r="1.6" fill="#c04ab5"/>`;
    case 'bow':
      return `<path d="M42 21 Q46 15 50 21 Q54 15 58 21 Q54 25 50 21 Q46 25 42 21" fill="#e0245e"/>
              <circle cx="50" cy="21" r="2" fill="#c01a4a"/>`;
    case 'sport-band':
      return `<rect x="22" y="30" width="56" height="6" fill="#c33a2c" rx="1"/>
              <text x="50" y="35" text-anchor="middle" fill="#fff" font-size="4.2" font-weight="700">EAC</text>`;
    case 'headband':
      return `<rect x="26" y="30" width="48" height="4" fill="#d4a24a" rx="1"/>`;
    case 'beard':
      return `<path d="M30 55 Q34 70 50 72 Q66 70 70 55 Q60 62 50 62 Q40 62 30 55" fill="${shade(hairColor, -0.06)}"/>`;
    case 'mask':
      return `<path d="M22 36 Q22 46 32 48 L 44 48 Q50 42 56 48 L 68 48 Q78 46 78 36 Z" fill="#151515" opacity="0.9"/>
              <circle cx="40" cy="42" r="2" fill="#fff"/>
              <circle cx="60" cy="42" r="2" fill="#fff"/>`;
    case 'hood':
      return `<path d="M14 46 Q14 8 50 8 Q86 8 86 46 L 86 56 Q66 46 50 46 Q34 46 14 56 Z" fill="#3a7a4a"/>
              <path d="M22 42 Q22 18 50 18 Q78 18 78 42 Q74 32 50 32 Q26 32 22 42" fill="#28583a"/>`;
    case 'veil':
      return `<path d="M18 24 Q18 8 50 6 Q82 8 82 24 L 82 68 L 18 68 Z" fill="#e8e0f0" opacity="0.55"/>
              <path d="M18 24 Q18 8 50 6 Q82 8 82 24 Q74 26 50 24 Q26 26 18 24" fill="#c4b8d8"/>`;
    case 'kerchief':
      return `<path d="M22 24 Q22 12 50 10 Q78 12 78 24 L 78 40 Q60 32 50 32 Q40 32 22 40 Z" fill="#c85a3a"/>
              <circle cx="30" cy="20" r="1.5" fill="#fff" opacity="0.7"/>
              <circle cx="45" cy="16" r="1.5" fill="#fff" opacity="0.7"/>
              <circle cx="60" cy="18" r="1.5" fill="#fff" opacity="0.7"/>
              <circle cx="70" cy="22" r="1.5" fill="#fff" opacity="0.7"/>`;
    case 'pajama-cap':
      return `<path d="M26 26 Q22 10 50 8 Q78 10 74 26 Z" fill="#7a4dbd"/>
              <circle cx="50" cy="6" r="4" fill="#fff"/>
              <path d="M24 24 L 76 24 L 78 28 L 22 28 Z" fill="#fff"/>`;
    case 'judge-wig':
      return `<path d="M20 30 Q20 12 50 12 Q80 12 80 30 L 80 60 Q80 52 50 52 Q20 52 20 60 Z" fill="#f0ebe0"/>
              <circle cx="30" cy="34" r="6" fill="#f0ebe0"/>
              <circle cx="70" cy="34" r="6" fill="#f0ebe0"/>
              <circle cx="26" cy="48" r="5" fill="#f0ebe0"/>
              <circle cx="74" cy="48" r="5" fill="#f0ebe0"/>`;
    case 'suit-tie':
      return `<path d="M46 66 L 50 70 L 54 66 L 52 84 L 48 84 Z" fill="#1a1a1a"/>
              <path d="M46 66 L 54 66 L 50 70 Z" fill="#0a0a0a"/>`;
    case 'priest-hat':
      return `<path d="M32 24 L 68 24 L 66 8 L 34 8 Z" fill="#f0ebe0"/>
              <rect x="30" y="24" width="40" height="4" fill="#c9a237"/>
              <path d="M50 4 L 48 12 L 52 12 Z" fill="#c9a237"/>`;
    case 'apron-bow':
      return `<path d="M42 72 Q46 66 50 72 Q54 66 58 72 Q54 78 50 72 Q46 78 42 72" fill="#fff"/>`;
    case 'halo':
      return `<ellipse cx="50" cy="12" rx="18" ry="4" fill="none" stroke="#f0c040" stroke-width="2"/>`;
    default:
      return '';
  }
}

function svgAvatar(char, size = 80) {
  const av = char.av || {};
  const skin = SKIN[av.skin] || SKIN.light;
  const hairColor = (av.hair && av.hair.color) || '#333';
  const hairStyle = (av.hair && av.hair.style) || 'short';
  const acc = av.acc;
  const mouth = av.mouth || 'smile';
  const eyes = av.eyes || 'open';
  const outfit = char.color || '#888';
  const outfitLight = shade(outfit, 0.18);
  const outfitDark = shade(outfit, -0.15);

  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <clipPath id="clip-${size}-${outfit.replace('#','')}"><circle cx="50" cy="50" r="49"/></clipPath>
    </defs>
    <g clip-path="url(#clip-${size}-${outfit.replace('#','')})">
      <circle cx="50" cy="50" r="50" fill="${outfit}"/>
      <ellipse cx="50" cy="95" rx="42" ry="22" fill="${outfitDark}"/>
      <ellipse cx="50" cy="90" rx="34" ry="16" fill="${outfitLight}"/>
      <rect x="45" y="60" width="10" height="10" fill="${skin}"/>
      <ellipse cx="26" cy="43" rx="3" ry="5" fill="${skin}"/>
      <ellipse cx="74" cy="43" rx="3" ry="5" fill="${skin}"/>
      <circle cx="50" cy="42" r="24" fill="${skin}"/>
      ${renderHair(hairStyle, hairColor)}
      ${cheeks}
      ${renderEyes(eyes)}
      ${renderMouth(mouth)}
      ${renderAccessory(acc, hairColor)}
    </g>
    <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
  </svg>`;
}

// Índice: personagem -> [{playId, playSlug, playTitle, playNumber, partTitle, sceneTitle, text}]
const linesByCharacter = {};
PLAYS.forEach(play => {
  play.parts.forEach(part => {
    part.scenes.forEach(scene => {
      scene.beats.forEach(beat => {
        if (beat.type === 'line') {
          if (!linesByCharacter[beat.character]) linesByCharacter[beat.character] = [];
          linesByCharacter[beat.character].push({
            playId: play.id,
            playSlug: play.slug,
            playTitle: play.title,
            playNumber: play.number,
            partTitle: part.title,
            sceneTitle: scene.title,
            text: beat.text
          });
        }
      });
    });
  });
});

// Personagens que aparecem em cada peça
const charactersByPlay = {};
PLAYS.forEach(play => {
  const set = new Set();
  play.parts.forEach(part => part.scenes.forEach(scene => scene.beats.forEach(beat => {
    if (beat.type === 'line') set.add(beat.character);
  })));
  charactersByPlay[play.id] = Array.from(set);
});

// ---------------------------------------------------------------- Renderers

function renderHome() {
  setActive('home');
  document.title = 'Teatro EAC — Peças e Personagens';

  const playsHtml = PLAYS.map(p => `
    <a href="#/peca/${p.slug}" class="play-card">
      <span class="badge">${esc(p.number)}</span>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.synopsis)}</p>
      <div class="meta">
        <span>🎭 ${charactersByPlay[p.id].length} personagens</span>
        <span>📖 ${p.parts.length} ${p.parts.length === 1 ? 'parte' : 'partes'}</span>
      </div>
    </a>
  `).join('');

  const topChars = Object.keys(CHARACTERS)
    .filter(k => (linesByCharacter[k]?.length || 0) > 0)
    .sort((a, b) => (linesByCharacter[b]?.length || 0) - (linesByCharacter[a]?.length || 0))
    .slice(0, 12);

  const charsHtml = topChars.map(k => renderCharacterChip(k)).join('');

  app.innerHTML = `
    <section class="hero">
      <h1>🎭 Teatro EAC — Estou a caminho</h1>
      <p>Todas as peças do <strong>Encontro de Adolescentes com Cristo</strong> — falas, cenas e personagens organizados pra você navegar direto ao que interessa.</p>
      <div class="hero-actions">
        <a href="#/pecas" class="btn primary">Ver as peças</a>
        <a href="#/personagens" class="btn ghost">Ver personagens</a>
      </div>
    </section>

    <div class="section-title">
      <h2>Peças</h2>
      <small>${PLAYS.length} no total</small>
    </div>
    <div class="plays-grid">${playsHtml}</div>

    <div class="section-title">
      <h2>Personagens em destaque</h2>
      <small><a href="#/personagens">ver todos →</a></small>
    </div>
    <div class="characters-grid">${charsHtml}</div>
  `;
}

function renderCharacterChip(key) {
  const c = CHARACTERS[key];
  if (!c) return '';
  const count = linesByCharacter[key]?.length || 0;
  const actor = actorFor(key);
  return `
    <a href="#/personagem/${key}" class="character-chip" style="--char-color: ${c.color}">
      <div class="avatar">${svgAvatar(c, 44)}</div>
      <div class="info">
        <div class="name">${esc(c.name)}${actor ? `<span class="actor-tag">${esc(actor)}</span>` : ''}</div>
        <div class="sub">${count} ${count === 1 ? 'fala' : 'falas'}</div>
      </div>
    </a>
  `;
}

function renderPlaysList() {
  setActive('pecas');
  document.title = 'Peças — Teatro EAC';
  const playsHtml = PLAYS.map(p => `
    <a href="#/peca/${p.slug}" class="play-card">
      <span class="badge">${esc(p.number)}</span>
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.synopsis)}</p>
      <div class="meta">
        <span>🎭 ${charactersByPlay[p.id].length} personagens</span>
        <span>📖 ${p.parts.length} ${p.parts.length === 1 ? 'parte' : 'partes'}</span>
      </div>
    </a>
  `).join('');

  app.innerHTML = `
    <div class="crumbs"><a href="#/">Início</a> <span>›</span> <span>Peças</span></div>
    <div class="section-title">
      <h2>Todas as peças</h2>
      <small>${PLAYS.length} peças</small>
    </div>
    <div class="plays-grid">${playsHtml}</div>
  `;
}

function renderCharactersList() {
  setActive('personagens');
  document.title = 'Personagens — Teatro EAC';

  const keys = Object.keys(CHARACTERS)
    .filter(k => (linesByCharacter[k]?.length || 0) > 0)
    .sort((a, b) => CHARACTERS[a].name.localeCompare(CHARACTERS[b].name));

  const chipsHtml = keys.map(k => renderCharacterChip(k)).join('');

  app.innerHTML = `
    <div class="crumbs"><a href="#/">Início</a> <span>›</span> <span>Personagens</span></div>
    <div class="section-title">
      <h2>Todos os personagens</h2>
      <small>${keys.length} personagens</small>
    </div>
    <div class="filter-bar">
      <input type="search" id="charFilter" placeholder="🔍 Buscar personagem…" autofocus />
    </div>
    <div class="characters-grid" id="charsGrid">${chipsHtml}</div>
  `;

  const input = document.getElementById('charFilter');
  const grid = document.getElementById('charsGrid');
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const filtered = keys.filter(k => CHARACTERS[k].name.toLowerCase().includes(q));
    grid.innerHTML = filtered.length
      ? filtered.map(k => renderCharacterChip(k)).join('')
      : '<div class="empty">Nenhum personagem encontrado 🤷</div>';
  });
}

function renderPlay(slug) {
  const play = PLAYS.find(p => p.slug === slug);
  if (!play) return render404();
  setActive('pecas');
  document.title = `${play.title} — Teatro EAC`;

  const charList = charactersByPlay[play.id]
    .sort((a, b) => (CHARACTERS[a]?.name || a).localeCompare(CHARACTERS[b]?.name || b))
    .map(k => {
      const c = CHARACTERS[k];
      if (!c) return '';
      const actor = actorFor(k);
      return `<a href="#/personagem/${k}" class="mini-chip" style="--char-color: ${c.color}">
        <span class="dot"></span>${esc(c.name)}${actor ? `<span class="actor-tag">${esc(actor)}</span>` : ''}
      </a>`;
    }).join('');

  const partsHtml = play.parts.map((part, pi) => `
    <div class="part">
      <h2 class="part-title">${esc(part.title)}</h2>
      ${part.scenes.map((scene, si) => renderScene(scene, pi, si)).join('')}
    </div>
  `).join('');

  const tocHtml = play.parts.map(part =>
    `<li><strong>${esc(part.title)}</strong>${part.scenes.length > 1
      ? `<ol>${part.scenes.map(s => `<li>${esc(s.title)}</li>`).join('')}</ol>`
      : ''}</li>`
  ).join('');

  app.innerHTML = `
    <div class="crumbs">
      <a href="#/">Início</a> <span>›</span>
      <a href="#/pecas">Peças</a> <span>›</span>
      <span>${esc(play.title)}</span>
    </div>

    <header class="play-header">
      <span class="badge">${esc(play.number)}</span>
      <h1>${esc(play.title)}</h1>
      <p>${esc(play.synopsis)}</p>
    </header>

    <div class="play-toc">
      <h4>Passo a passo</h4>
      <ol>${tocHtml}</ol>
    </div>

    <div class="section-title"><h2>Personagens desta peça</h2><small>${charactersByPlay[play.id].length}</small></div>
    <div class="characters-in-play">${charList}</div>

    ${partsHtml}
  `;
}

function renderScene(scene, pi, si) {
  const beatsHtml = scene.beats.map(beat => renderBeat(beat)).join('');
  const lineCount = scene.beats.filter(b => b.type === 'line').length;
  return `
    <details class="scene" open>
      <summary class="scene-summary">
        <h3>${esc(scene.title)}</h3>
        <span class="scene-meta">${lineCount} ${lineCount === 1 ? 'fala' : 'falas'}</span>
        <span class="scene-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="scene-body">
        ${scene.setting ? `<div class="setting">${esc(scene.setting)}</div>` : ''}
        <div class="beats">${beatsHtml}</div>
      </div>
    </details>
  `;
}

function renderBeat(beat) {
  if (beat.type === 'stage') {
    return `<div class="beat stage"><div class="text">${esc(beat.text)}</div></div>`;
  }
  const c = CHARACTERS[beat.character];
  const name = c ? c.name : beat.character;
  const color = c ? c.color : 'var(--accent)';
  const avatarSvg = c ? svgAvatar(c, 40) : '';
  const actor = actorFor(beat.character);
  return `
    <div class="beat" style="--char-color: ${color}">
      <a href="#/personagem/${beat.character}" class="who-avatar" aria-label="${esc(name)}">
        ${avatarSvg}
      </a>
      <div class="beat-body">
        <a href="#/personagem/${beat.character}" class="who-name">${esc(name)}${actor ? `<span class="actor-tag">${esc(actor)}</span>` : ''}</a>
        <div class="text">${esc(beat.text)}</div>
      </div>
    </div>
  `;
}

function renderCharacter(key) {
  const c = CHARACTERS[key];
  if (!c) return render404();
  setActive('personagens');
  document.title = `${c.name} — Teatro EAC`;

  const lines = linesByCharacter[key] || [];
  const byPlay = {};
  lines.forEach(l => {
    if (!byPlay[l.playId]) byPlay[l.playId] = { playSlug: l.playSlug, playTitle: l.playTitle, playNumber: l.playNumber, items: [] };
    byPlay[l.playId].items.push(l);
  });
  const playsCount = Object.keys(byPlay).length;

  const blocksHtml = Object.values(byPlay).map(group => `
    <div class="char-play-block">
      <h3><a href="#/peca/${group.playSlug}">${esc(group.playNumber)} — ${esc(group.playTitle)}</a></h3>
      ${group.items.map(it => `
        <div class="char-line" style="--char-color: ${c.color}">
          <span class="scene-tag">${esc(it.partTitle)} · ${esc(it.sceneTitle)}</span>
          ${esc(it.text)}
        </div>
      `).join('')}
    </div>
  `).join('');

  const emptyHtml = lines.length === 0 ? '<div class="empty">Este personagem não tem falas registradas.</div>' : '';

  app.innerHTML = `
    <div class="crumbs">
      <a href="#/">Início</a> <span>›</span>
      <a href="#/personagens">Personagens</a> <span>›</span>
      <span>${esc(c.name)}</span>
    </div>

    <header class="character-header" style="--char-color: ${c.color}">
      <div class="big-avatar">${svgAvatar(c, 110)}</div>
      <div>
        <h1>${esc(c.name)}</h1>
        ${actorFor(key) ? `<div class="actor-line">🎭 interpretado por <strong>${esc(actorFor(key))}</strong></div>` : ''}
        <ul>${c.traits.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
    </header>

    <div class="character-stats">
      <div class="stat-card" style="--char-color: ${c.color}">
        <div class="num">${lines.length}</div>
        <div class="label">Falas</div>
      </div>
      <div class="stat-card" style="--char-color: ${c.color}">
        <div class="num">${playsCount}</div>
        <div class="label">${playsCount === 1 ? 'Peça' : 'Peças'}</div>
      </div>
    </div>

    ${blocksHtml}
    ${emptyHtml}
  `;
}

function render404() {
  app.innerHTML = `
    <div class="crumbs"><a href="#/">Início</a></div>
    <div class="empty">
      <h2>Página não encontrada</h2>
      <p>Não achamos essa peça ou personagem.</p>
      <a href="#/" class="btn primary" style="margin-top: 12px;">Voltar ao início</a>
    </div>
  `;
}

// ---------------------------------------------------------------- Router
function setActive(name) {
  nav.forEach(a => a.classList.toggle('active', a.dataset.nav === name));
}

function router() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);
  // Rotas: /, /pecas, /personagens, /peca/:slug, /personagem/:key
  if (parts.length === 0) return renderHome();
  if (parts[0] === 'pecas' && parts.length === 1) return renderPlaysList();
  if (parts[0] === 'personagens' && parts.length === 1) return renderCharactersList();
  if (parts[0] === 'peca' && parts[1]) return renderPlay(parts[1]);
  if (parts[0] === 'personagem' && parts[1]) return renderCharacter(parts[1]);
  return render404();
}

window.addEventListener('hashchange', () => { router(); window.scrollTo({ top: 0, behavior: 'instant' }); });

// ---------------------------------------------------------------- Tema
const themeBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
updateThemeIcon();

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
  updateThemeIcon();
});

function updateThemeIcon() {
  const current = document.documentElement.dataset.theme
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  themeBtn.textContent = current === 'dark' ? '☀️' : '🌙';
}

// Boot
router();
