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

// Personagens que aparecem em cada peça + contagem de falas por peça
const charactersByPlay = {};
const linesCountByPlay = {}; // { playId: { charKey: count } }
PLAYS.forEach(play => {
  const counts = {};
  play.parts.forEach(part => part.scenes.forEach(scene => scene.beats.forEach(beat => {
    if (beat.type === 'line') counts[beat.character] = (counts[beat.character] || 0) + 1;
  })));
  linesCountByPlay[play.id] = counts;
  charactersByPlay[play.id] = Object.keys(counts);
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

    <details class="cast-block" open>
      <summary class="cast-summary">
        <h2>Personagens desta peça</h2>
        <span class="scene-meta">${charactersByPlay[play.id].length}</span>
        <span class="scene-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="characters-in-play">${charList}</div>
    </details>

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
    <details class="char-play-block" open>
      <summary class="char-play-summary">
        <h3>${esc(group.playNumber)} — ${esc(group.playTitle)}</h3>
        <span class="scene-meta">${group.items.length} ${group.items.length === 1 ? 'fala' : 'falas'}</span>
        <a href="#/peca/${group.playSlug}" class="char-play-link" onclick="event.stopPropagation()" title="Abrir peça">↗</a>
        <span class="scene-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="char-play-body">
        ${group.items.map(it => `
          <div class="char-line" style="--char-color: ${c.color}">
            <span class="scene-tag">${esc(it.partTitle)} · ${esc(it.sceneTitle)}</span>
            ${esc(it.text)}
          </div>
        `).join('')}
      </div>
    </details>
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

// -------------------------------------------------------- Modo Ensaio
// Constrói a lista plana de cenas de uma peça (com índice global)
function flatScenes(play) {
  const list = [];
  play.parts.forEach((part, pi) => {
    part.scenes.forEach((scene, si) => {
      list.push({ scene, partTitle: part.title, sceneIdx: list.length, pi, si });
    });
  });
  return list;
}

function charsInScene(scene) {
  const set = new Set();
  scene.beats.forEach(b => { if (b.type === 'line') set.add(b.character); });
  return Array.from(set);
}

// Estado do modo ensaio
const ensaioState = {
  mode: 'roteiro',       // 'roteiro' | 'dialogo'
  playSlug: PLAYS[0].slug,
  sceneIdx: 0,
  charKey: null,
  revealed: new Set(),   // índices de beats revelados (roteiro)
  currentBeatIdx: 0,     // beat atual (dialogo)
  ttsVoice: '',          // nome da voz TTS escolhida
  ttsRate: 1.0,
  ttsAutoplay: true,
  running: false,
};

// Carrega prefs de TTS do localStorage
try {
  const saved = JSON.parse(localStorage.getItem('ensaioTTS') || '{}');
  Object.assign(ensaioState, saved);
} catch(e) {}

function saveTtsPrefs() {
  localStorage.setItem('ensaioTTS', JSON.stringify({
    ttsVoice: ensaioState.ttsVoice,
    ttsRate: ensaioState.ttsRate,
    ttsAutoplay: ensaioState.ttsAutoplay,
  }));
}

// --- TTS (Web Speech API) ---
let ttsVoices = [];
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const all = speechSynthesis.getVoices();
  ttsVoices = all.filter(v => v.lang && v.lang.toLowerCase().startsWith('pt'));
  if (ttsVoices.length === 0) ttsVoices = all; // fallback: qualquer voz
}
if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.addEventListener('voiceschanged', loadVoices);
}

function ttsSpeak(text, opts = {}) {
  if (!('speechSynthesis' in window)) return;
  // Se as vozes ainda não carregaram, tenta uma vez
  if (ttsVoices.length === 0) loadVoices();

  const doSpeak = () => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = ttsVoices.find(v => v.name === ensaioState.ttsVoice) || ttsVoices[0];
    if (voice) u.voice = voice;
    u.lang = voice?.lang || 'pt-BR';
    u.rate = ensaioState.ttsRate;
    u.pitch = opts.pitch || 1;
    speechSynthesis.speak(u);
  };

  // Chrome/Safari mobile às vezes precisam de um pequeno delay pra pegar a nova utterance
  if (ttsVoices.length === 0) {
    setTimeout(() => { loadVoices(); doSpeak(); }, 150);
  } else {
    doSpeak();
  }
}
function ttsStop() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

// ---- Home: grade de personagens
function renderEnsaiarHome() {
  setActive('ensaiar');
  document.title = 'Ensaiar — Teatro EAC';

  const keys = Object.keys(CHARACTERS)
    .filter(k => (linesByCharacter[k]?.length || 0) > 0)
    .sort((a, b) => CHARACTERS[a].name.localeCompare(CHARACTERS[b].name));

  const chips = keys.map(k => {
    const c = CHARACTERS[k];
    const count = linesByCharacter[k]?.length || 0;
    const actor = actorFor(k);
    return `
      <a href="#/ensaiar/${k}" class="character-chip" style="--char-color: ${c.color}">
        <div class="avatar">${svgAvatar(c, 44)}</div>
        <div class="info">
          <div class="name">${esc(c.name)}${actor ? ` <span class="actor-tag">${esc(actor)}</span>` : ''}</div>
          <div class="sub">${count} ${count === 1 ? 'fala' : 'falas'}</div>
        </div>
      </a>
    `;
  }).join('');

  app.innerHTML = `
    <div class="crumbs"><a href="#/">Início</a> <span>›</span> <span>Ensaiar</span></div>

    <section class="hero ensaio-hero">
      <h1>🎯 Bora ensaiar!</h1>
      <p>Escolha seu personagem e treine as falas — sozinho no celular. Tem <strong>Modo Roteiro</strong> (cena inteira, suas falas escondidas) e <strong>Modo Diálogo</strong> (uma fala por vez, com o celular "falando" os outros).</p>
    </section>

    <div class="section-title"><h2>Escolha seu personagem</h2><small>${keys.length} personagens</small></div>
    <div class="characters-grid">${chips}</div>
  `;
}

// ---- Página do personagem: cenas dele agrupadas por peça
function renderEnsaiarChar(charKey) {
  const c = CHARACTERS[charKey];
  if (!c) return render404();
  setActive('ensaiar');
  document.title = `Ensaiar ${c.name} — Teatro EAC`;
  const actor = actorFor(charKey);

  // Coleta cenas onde o personagem aparece (agrupadas por peça)
  const byPlay = new Map();
  PLAYS.forEach(play => {
    const scenes = flatScenes(play);
    scenes.forEach(item => {
      const lines = item.scene.beats.filter(b => b.type === 'line' && b.character === charKey);
      if (lines.length === 0) return;
      if (!byPlay.has(play.id)) byPlay.set(play.id, { play, items: [] });
      byPlay.get(play.id).items.push({ ...item, myLines: lines.length });
    });
  });

  const blocksHtml = [...byPlay.values()].map(({ play, items }) => `
    <details class="char-play-block" open>
      <summary class="char-play-summary">
        <h3>${esc(play.number)} — ${esc(play.title)}</h3>
        <span class="scene-meta">${items.length} ${items.length === 1 ? 'cena' : 'cenas'}</span>
        <span class="scene-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="char-play-body">
        <div class="ensaiar-scenes">
          ${items.map(item => `
            <a href="#/ensaiar/${charKey}/${play.slug}/${item.sceneIdx}" class="ensaiar-scene-card" style="--char-color: ${c.color}">
              <div class="ensaiar-scene-info">
                <div class="ensaiar-scene-title">${esc(item.scene.title)}</div>
                <div class="ensaiar-scene-meta">${esc(item.partTitle)} · <strong>${item.myLines}</strong> ${item.myLines === 1 ? 'fala sua' : 'falas suas'}</div>
              </div>
              <div class="ensaiar-scene-cta">▶ Ensaiar</div>
            </a>
          `).join('')}
        </div>
      </div>
    </details>
  `).join('');

  app.innerHTML = `
    <div class="crumbs">
      <a href="#/">Início</a> <span>›</span>
      <a href="#/ensaiar">Ensaiar</a> <span>›</span>
      <span>${esc(c.name)}</span>
    </div>

    <header class="character-header" style="--char-color: ${c.color}">
      <div class="big-avatar">${svgAvatar(c, 110)}</div>
      <div>
        <h1>Ensaiar como ${esc(c.name)}</h1>
        ${actor ? `<div class="actor-line">🎭 interpretado por <strong>${esc(actor)}</strong></div>` : ''}
        <p class="ensaiar-char-hint">Escolha uma cena abaixo pra começar a decorar.</p>
      </div>
    </header>

    ${blocksHtml}
  `;
}

// ---- Setup + rodar: escolhe modo e inicia
function renderEnsaiarScene(charKey, playSlug, sceneIdx) {
  const c = CHARACTERS[charKey];
  const play = PLAYS.find(p => p.slug === playSlug);
  if (!c || !play) return render404();
  const scenes = flatScenes(play);
  const item = scenes[sceneIdx];
  if (!item) return render404();

  setActive('ensaiar');
  document.title = `${item.scene.title} — Ensaiar — Teatro EAC`;

  // Sincroniza estado
  const s = ensaioState;
  s.charKey = charKey;
  s.playSlug = playSlug;
  s.sceneIdx = sceneIdx;
  s.revealed = new Set();
  s.currentBeatIdx = 0;
  s.running = false;

  const actor = actorFor(charKey);
  const myLines = item.scene.beats.filter(b => b.type === 'line' && b.character === charKey).length;

  const voiceOpts = ttsVoices.map(v =>
    `<option value="${esc(v.name)}" ${v.name === s.ttsVoice ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`
  ).join('') || '<option value="">Nenhuma voz disponível</option>';

  app.innerHTML = `
    <div class="crumbs">
      <a href="#/">Início</a> <span>›</span>
      <a href="#/ensaiar">Ensaiar</a> <span>›</span>
      <a href="#/ensaiar/${charKey}">${esc(c.name)}</a> <span>›</span>
      <span>${esc(item.scene.title)}</span>
    </div>

    <section class="ensaiar-scene-header" style="--char-color: ${c.color}">
      <div class="ensaiar-scene-header-info">
        <div class="mini-play-badge">${esc(play.number)} — ${esc(play.title)}</div>
        <h1>${esc(item.scene.title)}</h1>
        <div class="ensaiar-scene-header-meta">${esc(item.partTitle)} · <strong>${myLines}</strong> ${myLines === 1 ? 'fala sua' : 'falas suas'} · Você é <strong>${esc(c.name)}</strong>${actor ? ` <span class="actor-tag">${esc(actor)}</span>` : ''}</div>
      </div>
    </section>

    <div class="section-title"><h2>Como quer ensaiar?</h2></div>

    <div class="mode-tabs">
      <button type="button" class="mode-tab ${s.mode === 'roteiro' ? 'active' : ''}" data-mode="roteiro">📜 Modo Roteiro</button>
      <button type="button" class="mode-tab ${s.mode === 'dialogo' ? 'active' : ''}" data-mode="dialogo">💬 Modo Diálogo (com voz)</button>
    </div>

    <form class="ensaio-form" id="ensaioForm">
      ${s.mode === 'dialogo' ? `
        <div class="tts-settings">
          <label>
            <span>🔊 Voz</span>
            <select id="fldVoice">${voiceOpts}</select>
          </label>
          <label>
            <span>⚡ Velocidade (${s.ttsRate.toFixed(1)}x)</span>
            <input type="range" id="fldRate" min="0.6" max="1.6" step="0.1" value="${s.ttsRate}" />
          </label>
          <label class="toggle">
            <input type="checkbox" id="fldAutoplay" ${s.ttsAutoplay ? 'checked' : ''} />
            <span>Falar automaticamente as falas dos outros</span>
          </label>
        </div>
      ` : `
        <div class="mode-desc">📜 Você vai ver a cena inteira. Suas falas ficam borradas — toque em "Lembrei" pra revelar cada uma. Bom pra revisar o texto.</div>
      `}
      <button type="submit" class="btn primary">▶ Iniciar ensaio</button>
    </form>

    <div id="ensaioRun"></div>
  `;

  document.querySelectorAll('.mode-tab').forEach(t => {
    t.addEventListener('click', () => {
      s.mode = t.dataset.mode;
      renderEnsaiarScene(charKey, playSlug, sceneIdx);
    });
  });

  if (s.mode === 'dialogo') {
    const vSel = document.getElementById('fldVoice');
    const rSel = document.getElementById('fldRate');
    const aChk = document.getElementById('fldAutoplay');
    vSel?.addEventListener('change', () => { s.ttsVoice = vSel.value; saveTtsPrefs(); });
    rSel?.addEventListener('input', () => { s.ttsRate = parseFloat(rSel.value); saveTtsPrefs(); renderEnsaiarScene(charKey, playSlug, sceneIdx); });
    aChk?.addEventListener('change', () => { s.ttsAutoplay = aChk.checked; saveTtsPrefs(); });
  }

  document.getElementById('ensaioForm').addEventListener('submit', (e) => {
    e.preventDefault();
    s.running = true;
    // Esconde a UI de setup (formulário, tabs, header "Como quer ensaiar?")
    document.getElementById('ensaioForm').remove();
    document.querySelector('.mode-tabs')?.remove();
    document.querySelectorAll('.section-title').forEach(el => el.remove());
    if (s.mode === 'dialogo') renderDialogo();
    else renderTeleprompter();
    document.getElementById('ensaioRun')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
}

function renderTeleprompter() {
  const s = ensaioState;
  const play = PLAYS.find(p => p.slug === s.playSlug);
  const scenes = flatScenes(play);
  const item = scenes[s.sceneIdx];
  if (!item) return;
  const scene = item.scene;
  const charKey = s.charKey;
  const c = CHARACTERS[charKey];
  const actor = actorFor(charKey);

  const myLineIdxs = [];
  scene.beats.forEach((b, i) => { if (b.type === 'line' && b.character === charKey) myLineIdxs.push(i); });
  const totalMine = myLineIdxs.length;

  const beatsHtml = scene.beats.map((beat, i) => {
    if (beat.type === 'stage') {
      return `<div class="beat stage"><div class="text">${esc(beat.text)}</div></div>`;
    }
    const isMine = beat.character === charKey;
    const bc = CHARACTERS[beat.character];
    const name = bc ? bc.name : beat.character;
    const color = bc ? bc.color : 'var(--accent)';
    const avatarSvg = bc ? svgAvatar(bc, 40) : '';
    const bActor = actorFor(beat.character);
    if (isMine) {
      const revealed = s.revealed.has(i);
      return `
        <div class="beat mine ${revealed ? 'revealed' : 'hidden'}" style="--char-color: ${color}" data-beat="${i}">
          <div class="who-avatar">${avatarSvg}</div>
          <div class="beat-body">
            <div class="who-name">${esc(name)}${bActor ? `<span class="actor-tag">${esc(bActor)}</span>` : ''}</div>
            <div class="text hidden-text">${esc(beat.text)}</div>
            ${revealed ? '' : `<button type="button" class="btn-reveal" data-reveal="${i}">🔓 Lembrei — mostrar fala</button>`}
          </div>
        </div>
      `;
    }
    return `
      <div class="beat" style="--char-color: ${color}">
        <div class="who-avatar">${avatarSvg}</div>
        <div class="beat-body">
          <div class="who-name">${esc(name)}${bActor ? `<span class="actor-tag">${esc(bActor)}</span>` : ''}</div>
          <div class="text">${esc(beat.text)}</div>
        </div>
      </div>
    `;
  }).join('');

  const revealedCount = s.revealed.size;
  const pct = totalMine > 0 ? Math.round((revealedCount / totalMine) * 100) : 0;

  document.getElementById('ensaioRun').innerHTML = `
    <div class="ensaio-run" style="--char-color: ${c?.color || 'var(--accent)'}">
      <header class="ensaio-run-header">
        <div class="ensaio-run-who">
          <div class="ensaio-run-avatar">${c ? svgAvatar(c, 56) : ''}</div>
          <div>
            <div class="ensaio-run-name">Você é <strong>${esc(c?.name || charKey)}</strong>${actor ? ` <span class="actor-tag">${esc(actor)}</span>` : ''}</div>
            <div class="ensaio-run-scene">${esc(item.partTitle)} · ${esc(scene.title)}</div>
          </div>
        </div>
        <div class="ensaio-run-actions">
          <button type="button" class="btn ghost" id="btnRevealAll">👁 Revelar tudo</button>
          <button type="button" class="btn ghost" id="btnResetEnsaio">🔄 Reiniciar</button>
        </div>
      </header>

      <div class="ensaio-progress">
        <div class="ensaio-progress-bar"><div class="ensaio-progress-fill" style="width: ${pct}%"></div></div>
        <div class="ensaio-progress-label"><strong>${revealedCount}</strong> de <strong>${totalMine}</strong> falas reveladas</div>
      </div>

      ${scene.setting ? `<div class="setting">${esc(scene.setting)}</div>` : ''}
      <div class="beats">${beatsHtml}</div>
    </div>
  `;

  document.querySelectorAll('[data-reveal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.reveal, 10);
      s.revealed.add(idx);
      renderTeleprompter();
    });
  });
  document.getElementById('btnRevealAll').addEventListener('click', () => {
    myLineIdxs.forEach(i => s.revealed.add(i));
    renderTeleprompter();
  });
  document.getElementById('btnResetEnsaio').addEventListener('click', () => {
    s.revealed = new Set();
    renderTeleprompter();
  });
}

function renderDialogo() {
  const s = ensaioState;
  const play = PLAYS.find(p => p.slug === s.playSlug);
  const scenes = flatScenes(play);
  const item = scenes[s.sceneIdx];
  if (!item) return;
  const scene = item.scene;
  const charKey = s.charKey;
  const c = CHARACTERS[charKey];
  const actor = actorFor(charKey);

  // Sequência de "passos": setting (se houver) + cada beat
  const steps = [];
  if (scene.setting) steps.push({ kind: 'setting', text: scene.setting });
  scene.beats.forEach(b => steps.push({ kind: 'beat', beat: b }));

  const idx = Math.max(0, Math.min(s.currentBeatIdx, steps.length));
  const step = steps[idx];
  const isEnd = idx >= steps.length;
  const total = steps.length;

  let bubbleHtml = '';
  let controlsHtml = '';

  if (isEnd) {
    bubbleHtml = `
      <div class="dialog-end">
        <div class="dialog-end-emoji">🎉</div>
        <h2>Cena concluída!</h2>
        <p>Boa, ${esc(c?.name || 'ator')}! Você chegou até o fim da cena.</p>
      </div>
    `;
    controlsHtml = `
      <button type="button" class="btn ghost" id="btnDlgReset">🔄 Ensaiar de novo</button>
      <button type="button" class="btn primary" id="btnDlgBack">← Voltar às opções</button>
    `;
    ttsStop();
  } else if (step.kind === 'setting') {
    bubbleHtml = `<div class="dialog-setting"><span class="dialog-setting-badge">🎬 Rubrica</span>${esc(step.text)}</div>`;
    controlsHtml = `
      <button type="button" class="btn ghost" id="btnDlgPrev" ${idx === 0 ? 'disabled' : ''}>← Anterior</button>
      <button type="button" class="btn primary" id="btnDlgNext">Próxima →</button>
    `;
    if (s.ttsAutoplay) ttsSpeak(step.text, { pitch: 0.9 });
  } else {
    const beat = step.beat;
    if (beat.type === 'stage') {
      bubbleHtml = `<div class="dialog-setting"><span class="dialog-setting-badge">🎬 Rubrica</span>${esc(beat.text)}</div>`;
      controlsHtml = `
        <button type="button" class="btn ghost" id="btnDlgPrev">← Anterior</button>
        <button type="button" class="btn primary" id="btnDlgNext">Próxima →</button>
      `;
      if (s.ttsAutoplay) ttsSpeak(beat.text, { pitch: 0.9 });
    } else {
      const isMine = beat.character === charKey;
      const bc = CHARACTERS[beat.character];
      const name = bc ? bc.name : beat.character;
      const color = bc ? bc.color : 'var(--accent)';
      const avatarSvg = bc ? svgAvatar(bc, 64) : '';
      const bActor = actorFor(beat.character);

      if (isMine) {
        const revealed = s.revealed.has(idx);
        bubbleHtml = `
          <div class="dialog-my-turn" style="--char-color: ${color}">
            <div class="dialog-my-avatar">${avatarSvg}</div>
            <div class="dialog-my-body">
              <div class="dialog-my-label">🎤 Sua vez, <strong>${esc(name)}</strong></div>
              ${revealed
                ? `<div class="dialog-bubble mine"><div class="text">${esc(beat.text)}</div></div>`
                : `<div class="dialog-my-hint">Fale sua fala em voz alta. Quando terminar, toque em "Falei" pra ver o texto.</div>`
              }
            </div>
          </div>
        `;
        controlsHtml = `
          <button type="button" class="btn ghost" id="btnDlgPrev">← Anterior</button>
          ${revealed
            ? `<button type="button" class="btn primary" id="btnDlgNext">Próxima →</button>`
            : `<button type="button" class="btn primary" id="btnDlgReveal">✓ Falei — ver o texto</button>`
          }
        `;
      } else {
        bubbleHtml = `
          <div class="dialog-them" style="--char-color: ${color}">
            <div class="dialog-them-avatar">${avatarSvg}</div>
            <div class="dialog-them-body">
              <div class="dialog-them-name">${esc(name)}${bActor ? `<span class="actor-tag">${esc(bActor)}</span>` : ''}</div>
              <div class="dialog-bubble them"><div class="text">${esc(beat.text)}</div></div>
              <button type="button" class="btn-speak" id="btnDlgSpeak">🔊 Ouvir de novo</button>
            </div>
          </div>
        `;
        controlsHtml = `
          <button type="button" class="btn ghost" id="btnDlgPrev">← Anterior</button>
          <button type="button" class="btn primary" id="btnDlgNext">Próxima →</button>
        `;
        if (s.ttsAutoplay) ttsSpeak(beat.text);
      }
    }
  }

  const pct = Math.round((idx / total) * 100);

  document.getElementById('ensaioRun').innerHTML = `
    <div class="dialog-run" style="--char-color: ${c?.color || 'var(--accent)'}">
      <header class="dialog-header">
        <div class="dialog-you">Você é <strong>${esc(c?.name || charKey)}</strong>${actor ? ` <span class="actor-tag">${esc(actor)}</span>` : ''}</div>
        <div class="dialog-scene-title">${esc(item.partTitle)} · ${esc(scene.title)}</div>
      </header>

      <div class="ensaio-progress">
        <div class="ensaio-progress-bar"><div class="ensaio-progress-fill" style="width: ${pct}%"></div></div>
        <div class="ensaio-progress-label"><strong>${Math.min(idx + 1, total)}</strong> / <strong>${total}</strong></div>
      </div>

      <div class="dialog-stage">${bubbleHtml}</div>

      <div class="dialog-controls">${controlsHtml}</div>
    </div>
  `;

  document.getElementById('btnDlgPrev')?.addEventListener('click', () => {
    ttsStop();
    s.currentBeatIdx = Math.max(0, s.currentBeatIdx - 1);
    renderDialogo();
  });
  document.getElementById('btnDlgNext')?.addEventListener('click', () => {
    ttsStop();
    s.currentBeatIdx = s.currentBeatIdx + 1;
    renderDialogo();
  });
  document.getElementById('btnDlgReveal')?.addEventListener('click', () => {
    s.revealed.add(idx);
    renderDialogo();
  });
  document.getElementById('btnDlgSpeak')?.addEventListener('click', () => {
    if (step.kind === 'beat' && step.beat.type === 'line') ttsSpeak(step.beat.text);
  });
  document.getElementById('btnDlgReset')?.addEventListener('click', () => {
    s.currentBeatIdx = 0;
    s.revealed = new Set();
    renderDialogo();
  });
  document.getElementById('btnDlgBack')?.addEventListener('click', () => {
    ttsStop();
    s.running = false;
    s.currentBeatIdx = 0;
    s.revealed = new Set();
    renderEnsaiarScene(s.charKey, s.playSlug, s.sceneIdx);
  });
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
  if (parts[0] === 'ensaiar') {
    if (!parts[1]) return renderEnsaiarHome();
    if (parts[1] && !parts[2]) return renderEnsaiarChar(parts[1]);
    if (parts[1] && parts[2] && parts[3] !== undefined) return renderEnsaiarScene(parts[1], parts[2], parseInt(parts[3], 10));
  }
  // legado
  if (parts[0] === 'ensaio') { location.hash = '#/ensaiar'; return; }
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
