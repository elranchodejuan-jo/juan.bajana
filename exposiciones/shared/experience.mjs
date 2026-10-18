const body = document.body;
document.documentElement.classList.add('expo-js');
const deckElement = document.querySelector('#expo-deck');
const scenes = deckElement ? [...deckElement.querySelectorAll('.slides > section.expo-scene')] : [];
const requestedMode = new URL(location.href).searchParams.get('modo') === 'presentar' ? 'presentar' : 'estudiar';
const isReceiver = new URL(location.href).searchParams.has('receiver');
body.dataset.receiver = String(isReceiver);
let mode = 'estudiar';
let deck;
let currentScene = scenes[0];
let qrcodePromise;
const dialogOpeners = new WeakMap();
let stopStudy = () => {};
let changingMode = false;

// One motion preference governs every visual, including reduced-motion systems.
const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
function setMotion(paused) {
  paused = Boolean(paused || motionPreference?.matches);
  body.dataset.motion = paused ? 'paused' : 'running';
  document.querySelectorAll('[data-motion-toggle]').forEach((button) => {
    setLabel(button, motionPreference?.matches ? 'Movimiento reducido del sistema' : paused ? 'Activar movimiento' : 'Pausar movimiento', motionPreference?.matches ? 'Movimiento reducido' : paused ? 'Activar movimiento' : 'Pausar movimiento');
    button.setAttribute('aria-pressed', String(paused));
    button.disabled = Boolean(motionPreference?.matches);
  });
  document.dispatchEvent(new window.CustomEvent('expo:motion', { detail: { paused } }));
}
setMotion(Boolean(motionPreference?.matches));
motionPreference?.addEventListener('change', (event) => setMotion(event.matches));
document.querySelectorAll('[data-motion-toggle]').forEach((button) => {
  button.addEventListener('click', () => setMotion(body.dataset.motion !== 'paused'));
});

const toolbar = document.querySelector('#expo-toolbar');
if (toolbar && !isReceiver) {
  const measureToolbar = () => {
    const height = Math.ceil(toolbar.getBoundingClientRect().height);
    if (!height) return;
    const value = `${height}px`;
    if (body.style.getPropertyValue('--expo-toolbar-height') !== value) {
      body.style.setProperty('--expo-toolbar-height', value);
      deck?.layout();
    }
  };
  if (typeof window.ResizeObserver === 'function') new window.ResizeObserver(measureToolbar).observe(toolbar);
  else addEventListener('resize', measureToolbar, { passive: true });
  measureToolbar();
}

function setLabel(button, label, visibleLabel = label) {
  if (!button) return;
  button.setAttribute('aria-label', label);
  button.title = label;
  const text = button.querySelector('[data-control-label]');
  if (text) text.textContent = visibleLabel;
  else if (!button.querySelector('svg')) button.textContent = visibleLabel;
}

function setTheme(theme) {
  body.dataset.theme = theme;
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    setLabel(button, theme === 'dark' ? 'Usar tema claro para proyección' : 'Usar tema oscuro', theme === 'dark' ? 'Tema claro' : 'Tema oscuro');
    button.setAttribute('aria-pressed', String(theme === 'light'));
  });
}
let storedTheme;
try { storedTheme = localStorage.getItem('vetjb-expo-theme'); } catch { /* Storage can be disabled. */ }
setTheme(storedTheme === 'light' ? 'light' : 'dark');
document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    const theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    try { localStorage.setItem('vetjb-expo-theme', theme); } catch { /* Theme still works for this visit. */ }
  });
});

function openDialog(dialog, opener) {
  if (!dialog || dialog.open) return;
  dialogOpeners.set(dialog, opener ?? document.activeElement);
  dialog.showModal();
}

document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('close', () => {
    const opener = dialogOpeners.get(dialog);
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});
document.querySelectorAll('[data-dialog-close]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog')?.close());
});
document.querySelector('[data-index-open]')?.addEventListener('click', (event) => {
  openDialog(document.querySelector('#expo-index'), event.currentTarget);
});

function loadQrcode() {
  if (typeof window.qrcode === 'function') return Promise.resolve(window.qrcode);
  if (!qrcodePromise) {
    qrcodePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/exposiciones/vendor/qrcode/qrcode.js';
      script.onload = () => typeof window.qrcode === 'function' ? resolve(window.qrcode) : reject(new Error('QR no disponible'));
      script.onerror = () => reject(new Error('QR no disponible'));
      document.head.append(script);
    }).catch((error) => { qrcodePromise = undefined; throw error; });
  }
  return qrcodePromise;
}

async function renderQR(url) {
  const container = document.querySelector('#expo-qr');
  if (!container) return;
  container.replaceChildren();
  try {
    const qrcode = await loadQrcode();
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const count = qr.getModuleCount();
    const namespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(namespace, 'svg');
    svg.setAttribute('viewBox', `0 0 ${count + 8} ${count + 8}`);
    svg.setAttribute('width', '220');
    svg.setAttribute('height', '220');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Código QR del enlace mostrado');
    svg.setAttribute('shape-rendering', 'crispEdges');
    const background = document.createElementNS(namespace, 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', '#fff');
    const path = document.createElementNS(namespace, 'path');
    let drawing = '';
    for (let row = 0; row < count; row++) {
      for (let column = 0; column < count; column++) {
        if (qr.isDark(row, column)) drawing += `M${column + 4},${row + 4}h1v1h-1z`;
      }
    }
    path.setAttribute('d', drawing);
    path.setAttribute('fill', '#000');
    svg.append(background, path);
    container.replaceChildren(svg);
  } catch {
    container.textContent = 'No se pudo crear el QR. Puedes copiar el enlace de arriba.';
  }
}

document.querySelectorAll('[data-share-open]').forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = document.querySelector('#expo-share');
    const input = dialog?.querySelector('#expo-share-url');
    if (!input) return;
    const url = new URL(button.dataset.shareUrl || location.href, location.href);
    input.value = url.href;
    const status = dialog.querySelector('[data-copy-status]');
    if (status) status.textContent = '';
    openDialog(dialog, button);
    void renderQR(url.href);
  });
});
document.querySelector('[data-copy-link]')?.addEventListener('click', async () => {
  const input = document.querySelector('#expo-share-url');
  const status = document.querySelector('[data-copy-status]');
  if (!input || !status) return;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(input.value);
    status.textContent = 'Enlace copiado.';
  } catch {
    input.focus();
    input.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { /* Manual copying remains available. */ }
    status.textContent = copied ? 'Enlace copiado.' : 'Enlace seleccionado. Usa Ctrl+C o la opción Copiar de tu dispositivo.';
  }
});

document.querySelectorAll('[data-enlarge]').forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = document.querySelector('#expo-figure');
    const image = dialog?.querySelector('img');
    if (!image || !button.dataset.src) return;
    const source = new URL(button.dataset.src, location.href);
    if (source.origin !== location.origin) return;
    image.src = source.href;
    image.alt = button.dataset.alt || button.querySelector('img')?.alt || 'Esquema ampliado';
    openDialog(dialog, button);
  });
});

function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
}
const catalog = document.querySelector('[data-catalog-search]');
if (catalog) {
  const search = catalog.querySelector('input[type="search"]');
  const subject = catalog.querySelector('select[name="materia"]');
  const cards = [...document.querySelectorAll('[data-expo-card]')];
  const empty = document.querySelector('[data-catalog-empty]');
  const counter = document.querySelector('[data-catalog-count]');
  const params = new URL(location.href).searchParams;
  if (search && params.has('q')) search.value = params.get('q');
  if (subject && [...subject.options].some((option) => option.value === params.get('materia'))) subject.value = params.get('materia');
  function filterCatalog() {
    const query = normalize(search?.value.trim() || '');
    const selectedSubject = subject?.value || '';
    let visible = 0;
    cards.forEach((card) => {
      const matches = normalize(card.dataset.title || '').includes(query) && (!selectedSubject || selectedSubject === 'todas' || card.dataset.subject === selectedSubject);
      card.hidden = !matches;
      if (matches) visible++;
    });
    if (empty) empty.hidden = visible !== 0;
    if (counter) counter.textContent = `${visible} ${visible === 1 ? 'exposición disponible' : 'exposiciones disponibles'}`;
    const url = new URL(location.href);
    if (search?.value.trim()) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
    if (selectedSubject && selectedSubject !== 'todas') url.searchParams.set('materia', selectedSubject); else url.searchParams.delete('materia');
    history.replaceState(null, '', url);
  }
  catalog.addEventListener('submit', (event) => event.preventDefault());
  search?.addEventListener('input', filterCatalog);
  subject?.addEventListener('change', filterCatalog);
  catalog.addEventListener('reset', () => queueMicrotask(filterCatalog));
  filterCatalog();
}

function updateNavigation(scene, updateHash = true) {
  if (!scene) return;
  currentScene = scene;
  const index = scenes.indexOf(scene);
  document.querySelectorAll('[data-progress]').forEach((output) => {
    output.textContent = `${index + 1} / ${scenes.length}`;
    output.setAttribute('aria-label', `Escena ${index + 1} de ${scenes.length}`);
  });
  document.querySelectorAll('#expo-index a[href^="#"]').forEach((link) => {
    if (link.hash === `#${scene.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  const previous = document.querySelector('[data-prev]');
  const next = document.querySelector('[data-next]');
  if (previous) previous.disabled = index <= 0;
  if (next) next.disabled = index >= scenes.length - 1;
  if (updateHash) {
    const url = new URL(location.href);
    url.hash = scene.id;
    history.replaceState(null, '', url);
  }
  document.querySelectorAll('[data-view-mode]').forEach((toggle) => {
    const url = new URL(location.href);
    url.searchParams.set('modo', toggle.dataset.viewMode);
    url.hash = scene.id;
    toggle.href = url.href;
    if (toggle.dataset.viewMode === mode) toggle.setAttribute('aria-current', 'true');
    else toggle.removeAttribute('aria-current');
  });
  document.dispatchEvent(new window.CustomEvent('expo:scenechange', { detail: { id: scene.id } }));
}

function sceneFromHash() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1).replace(/^\//, '')); } catch { return undefined; }
  if (isReceiver && /^\d+(?:\/\d+)?$/.test(id)) return scenes[Number(id.split('/')[0])];
  return scenes.find((scene) => scene.id === id);
}

function navigateTo(scene, focus = false) {
  if (!scene) return;
  if (mode === 'presentar' && deck) deck.slide(scenes.indexOf(scene));
  else scene.scrollIntoView({ behavior: 'auto', block: 'start' });
  updateNavigation(scene);
  if (focus) {
    const heading = scene.querySelector('h1, h2') || scene;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

export function canNavigateByKeyboard(event) {
  if (document.querySelector('dialog[open]') || window.getSelection()?.toString()) return false;
  const blocked = 'input, textarea, select, button, a, form, [contenteditable]:not([contenteditable="false"]), [role="slider"]';
  return !event.target?.closest?.(blocked) && !document.activeElement?.closest?.(blocked);
}

function loadRevealStyles() {
  if (document.querySelector('[data-reveal-style]')) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/exposiciones/vendor/reveal/reveal.css';
    link.dataset.revealStyle = '';
    link.onload = resolve;
    link.onerror = () => reject(new Error('No se pudo cargar reveal.css'));
    // Put engine styles before custom styles so the site retains its design.
    const custom = document.querySelector('link[rel="stylesheet"]');
    if (custom) document.head.insertBefore(link, custom); else document.head.append(link);
  });
}

async function initializePresentation(initialScene = sceneFromHash() || currentScene || scenes[0]) {
  // Capture the scene before CSS/module loading can change page geometry.
  stopStudy();
  const [revealModule, notesModule] = await Promise.all([
    import('../vendor/reveal/reveal.esm.js'),
    import('../vendor/reveal/notes.esm.js'),
    loadRevealStyles(),
  ]);
  mode = 'presentar';
  body.dataset.mode = mode;
  deck = new revealModule.default(deckElement, {
    width: 1280, height: 720, margin: 0.035,
    embedded: true, controls: false, progress: true, center: false,
    transition: 'none', backgroundTransition: 'none', autoSlide: 0,
    hash: false, history: false, respondToHashChanges: false, overview: false, touch: false,
    scrollActivationWidth: false,
    keyboard: true, keyboardCondition: canNavigateByKeyboard,
    disableLayout: false, minScale: 0.2, maxScale: 1.5,
    plugins: [notesModule.default],
  });
  await deck.initialize();
  deck.addKeyBinding({ keyCode: 83, key: 'S', description: 'Abrir notas del expositor' }, openSpeaker);
  deck.on('slidechanged', (event) => updateNavigation(event.currentSlide));
  deck.slide(Math.max(0, scenes.indexOf(initialScene)));
  updateNavigation(initialScene);
  deckElement.dataset.ready = 'true';
  const speaker = document.querySelector('[data-speaker]');
  if (speaker) speaker.disabled = false;
}

function openSpeaker() {
  if (mode !== 'presentar' || !deck?.getPlugin('notes') || isReceiver) return;
  try {
    deck.getPlugin('notes').open();
    const status = document.querySelector('[data-speaker-status]');
    if (status) status.textContent = '';
  }
  catch {
    let status = document.querySelector('[data-speaker-status]');
    if (!status) {
      status = document.createElement('p');
      status.dataset.speakerStatus = '';
      status.className = 'expo-status';
      status.setAttribute('role', 'status');
      document.querySelector('#expo-toolbar')?.after(status);
    }
    status.textContent = 'Permite ventanas emergentes para este sitio y vuelve a pulsar Notas. La vista del expositor necesita una ventana separada.';
  }
}

function initializeStudy() {
  stopStudy();
  mode = 'estudiar';
  body.dataset.mode = mode;
  const initialScene = sceneFromHash() || scenes[0];
  updateNavigation(initialScene, false);
  const speaker = document.querySelector('[data-speaker]');
  if (speaker) speaker.disabled = true;
  let studyActive = true;
  let scrollFrame = null;
  let initialFrame = null;
  function onScroll() {
    if (!studyActive || scrollFrame !== null || mode !== 'estudiar') return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = null;
      // Cancellation alone does not cover a callback already taken for a frame.
      // A previous study lifecycle must stay inactive even after switching back.
      if (!studyActive || mode !== 'estudiar') return;
      let active = scenes[0];
      for (const scene of scenes) {
        if (scene.getBoundingClientRect().top <= 180) active = scene;
        else break;
      }
      if (active !== currentScene) updateNavigation(active);
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  stopStudy = () => {
    studyActive = false;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);
    if (initialFrame !== null) cancelAnimationFrame(initialFrame);
    scrollFrame = initialFrame = null;
  };
  initialFrame = requestAnimationFrame(() => {
    initialFrame = null;
    if (!studyActive || mode !== 'estudiar') return;
    if (location.hash && initialScene) initialScene.scrollIntoView({ behavior: 'auto', block: 'start' });
    if (deckElement) deckElement.dataset.ready = 'true';
  });
}

export async function switchMode(nextMode) {
  if (!scenes.length || changingMode || nextMode === mode || !['presentar', 'estudiar'].includes(nextMode)) return;
  changingMode = true;
  const scene = currentScene;
  stopStudy();
  document.querySelectorAll('[data-view-mode]').forEach((control) => control.setAttribute('aria-disabled', 'true'));
  const url = new URL(location.href);
  url.searchParams.set('modo', nextMode);
  url.hash = scene.id;
  history.replaceState(null, '', url);
  try {
    if (nextMode === 'presentar') await initializePresentation(scene);
    else {
      deck?.destroy();
      deck = undefined;
      document.querySelector('[data-reveal-style]')?.remove();
      initializeStudy();
    }
  } catch {
    deck?.destroy();
    deck = undefined;
    document.querySelector('[data-reveal-style]')?.remove();
    initializeStudy();
    const fallbackURL = new URL(location.href);
    fallbackURL.searchParams.set('modo', 'estudiar');
    history.replaceState(null, '', fallbackURL);
    let status = document.querySelector('[data-mode-status]');
    if (!status) {
      status = document.createElement('p');
      status.dataset.modeStatus = '';
      status.className = 'expo-status';
      status.setAttribute('role', 'status');
      toolbar?.after(status);
    }
    status.textContent = 'No se pudo iniciar Diapositivas. Puedes continuar en Página.';
  } finally {
    changingMode = false;
    document.querySelectorAll('[data-view-mode]').forEach((control) => control.removeAttribute('aria-disabled'));
    updateNavigation(scene);
    document.dispatchEvent(new window.CustomEvent('expo:modechange', { detail: { mode } }));
    if (mode === 'estudiar') scene.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
}

document.querySelectorAll('[data-view-mode]').forEach((control) => {
  control.addEventListener('click', (event) => {
    // Preserve native open-in-new-tab behavior for modified clicks.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
    event.preventDefault();
    void switchMode(control.dataset.viewMode);
  });
});

if (scenes.length) {
  document.querySelector('[data-prev]')?.addEventListener('click', () => navigateTo(scenes[scenes.indexOf(currentScene) - 1]));
  document.querySelector('[data-next]')?.addEventListener('click', () => navigateTo(scenes[scenes.indexOf(currentScene) + 1]));
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.hash.slice(1);
      const target = document.getElementById(id);
      const scene = scenes.includes(target) ? target : target?.closest('.expo-scene');
      if (!scene) return;
      event.preventDefault();
      const dialog = link.closest('dialog');
      dialog?.close();
      navigateTo(scene, !dialog);
      if (mode === 'estudiar' && target !== scene) target.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  });
  addEventListener('hashchange', () => navigateTo(sceneFromHash()));
  document.querySelector('[data-speaker]')?.addEventListener('click', openSpeaker);
  const fullscreen = document.querySelector('[data-fullscreen]');
  if (fullscreen) {
    fullscreen.disabled = !document.documentElement.requestFullscreen;
    fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch {
        let status = document.querySelector('[data-fullscreen-status]');
        if (!status) {
          status = document.createElement('p');
          status.dataset.fullscreenStatus = '';
          status.className = 'expo-status';
          status.setAttribute('role', 'status');
          document.querySelector('#expo-toolbar')?.after(status);
        }
        status.textContent = 'El navegador no permite pantalla completa. Puedes utilizar F11 en escritorio.';
      }
    });
    document.addEventListener('fullscreenchange', () => {
      setLabel(fullscreen, document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa');
      fullscreen.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
      deck?.layout();
    });
  }
  if (requestedMode === 'presentar') {
    try { await initializePresentation(); }
    catch {
      deck?.destroy();
      document.querySelector('[data-reveal-style]')?.remove();
      initializeStudy();
      const status = document.createElement('p');
      status.className = 'expo-status';
      status.setAttribute('role', 'status');
      status.textContent = 'No se pudo iniciar Diapositivas. El contenido sigue disponible en Página; vuelve a intentar cuando todos los archivos locales estén disponibles.';
      document.querySelector('#expo-toolbar')?.after(status);
    }
  } else initializeStudy();
}

if (document.querySelector('[data-hero]')) {
  const { initializeHero } = await import('./hero-field.mjs');
  initializeHero(document);
}
if (scenes.length) {
  const { initializeVisualLabs } = await import('./visual-labs.mjs');
  initializeVisualLabs(document);
}
// The atmosphere is decorative: a renderer failure must not affect the lesson.
if (scenes.length && !isReceiver) {
  try {
    const { initializeAmbient } = await import('./ambient-field.mjs');
    initializeAmbient(document);
  } catch { /* All content and controls remain usable without the background. */ }
}
const simulators = document.querySelectorAll('[data-simulator]');
if (simulators.length) {
  const { initializeSimulator } = await import('./simulator.mjs');
  simulators.forEach(initializeSimulator);
}

function caseStatus(form) {
  let status = form.querySelector('[data-case-status]');
  if (!status) {
    status = document.createElement('p');
    status.dataset.caseStatus = '';
    status.className = 'expo-feedback';
    status.setAttribute('role', 'status');
    form.querySelector('[data-case-check]')?.after(status);
  }
  return status;
}

document.querySelectorAll('form[data-case]').forEach((form) => {
  const feedback = [...form.querySelectorAll('[data-option-feedback]')];
  const steps = [...form.querySelectorAll('[data-step]')];
  const next = form.querySelector('[data-case-next]');
  const previous = form.querySelector('[data-case-prev]');
  const fieldset = form.querySelector('fieldset');
  const checkButton = form.querySelector('[data-case-check]');
  let changeButton = form.querySelector('[data-case-change]');
  if (!changeButton) {
    changeButton = document.createElement('button');
    changeButton.type = 'button';
    changeButton.dataset.caseChange = '';
    changeButton.className = 'expo-button';
    changeButton.textContent = 'Cambiar respuesta';
    checkButton?.after(changeButton);
  }
  const status = caseStatus(form);
  let revealed = 0;
  let checked = false;
  function renderCase() {
    const chosen = form.querySelector('input[type="radio"]:checked');
    feedback.forEach((item) => {
      const selected = item.dataset.optionFeedback === chosen?.value;
      item.hidden = !checked || (mode === 'presentar' && (!selected || revealed > 0));
      item.dataset.selected = String(selected);
    });
    steps.forEach((step, index) => { step.hidden = mode === 'presentar' ? index !== revealed - 1 : index >= revealed; });
    fieldset?.querySelectorAll('label').forEach((label) => {
      const selected = label.querySelector('input[type="radio"]')?.checked;
      label.hidden = mode === 'presentar' && checked && !selected;
    });
    if (fieldset) fieldset.hidden = mode === 'presentar' && revealed > 0;
    if (checkButton) checkButton.hidden = mode === 'presentar' && checked;
    changeButton.hidden = mode !== 'presentar' || !checked || revealed > 0;
    if (previous) previous.disabled = revealed <= 0;
    if (next) {
      next.disabled = !checked || revealed >= steps.length;
      next.textContent = revealed >= steps.length ? 'Interpretación completa' : `Revelar paso ${revealed + 1}`;
    }
  }
  function resetReveals() {
    revealed = 0;
    checked = false;
    status.textContent = '';
    renderCase();
  }
  function check() {
    const chosen = form.querySelector('input[type="radio"]:checked');
    if (!chosen) {
      status.textContent = 'Selecciona una respuesta antes de comprobar.';
      form.querySelector('input[type="radio"]')?.focus();
      return;
    }
    checked = true;
    const correct = chosen.value === form.dataset.correctIndex;
    status.textContent = correct ? 'Respuesta correcta.' : 'Revisa la explicación de tu respuesta.';
    renderCase();
  }
  form.addEventListener('submit', (event) => { event.preventDefault(); check(); });
  form.querySelector('[data-case-check]')?.addEventListener('click', (event) => { event.preventDefault(); check(); });
  form.addEventListener('change', (event) => { if (event.target.matches('input[type="radio"]')) resetReveals(); });
  changeButton.addEventListener('click', resetReveals);
  next?.addEventListener('click', () => {
    if (revealed >= steps.length) return;
    revealed++;
    renderCase();
    status.textContent = `Paso ${revealed} de ${steps.length} revelado.`;
  });
  previous?.addEventListener('click', () => {
    revealed = Math.max(0, revealed - 1);
    renderCase();
    status.textContent = revealed ? `Paso ${revealed} de ${steps.length}.` : 'Pregunta y respuesta seleccionada.';
  });
  form.addEventListener('reset', () => queueMicrotask(resetReveals));
  document.addEventListener('expo:modechange', renderCase);
  resetReveals();
});

document.querySelectorAll('form[data-quiz]').forEach((form) => {
  const questions = [...form.querySelectorAll('[data-question]')];
  const previous = form.querySelector('[data-quiz-prev]');
  const next = form.querySelector('[data-quiz-next]');
  const position = form.querySelector('[data-quiz-position]');
  const score = form.querySelector('[data-quiz-score]');
  let questionIndex = 0;
  function paginate() {
    questions.forEach((question, index) => { question.hidden = mode === 'presentar' && index !== questionIndex; });
    if (previous) { previous.hidden = mode !== 'presentar'; previous.disabled = questionIndex === 0; }
    if (next) { next.hidden = mode !== 'presentar'; next.disabled = questionIndex === questions.length - 1; }
    if (position) { position.hidden = mode !== 'presentar'; position.textContent = `Pregunta ${questionIndex + 1} de ${questions.length}`; }
  }
  function check() {
    let correct = 0;
    let answered = 0;
    questions.forEach((question) => {
      const selected = question.querySelector('input[type="radio"]:checked');
      const feedback = question.querySelector('[data-feedback]');
      if (selected) answered++;
      const isCorrect = selected?.value === question.dataset.answer;
      if (isCorrect) correct++;
      if (feedback) {
        if (!feedback.dataset.explanation) feedback.dataset.explanation = feedback.textContent;
        feedback.textContent = `${!selected ? 'Sin responder. ' : isCorrect ? 'Correcta. ' : 'Revisa tu respuesta. '}${feedback.dataset.explanation}`;
        feedback.hidden = false;
      }
    });
    if (score) score.textContent = `${correct} de ${questions.length} respuestas correctas. ${answered} de ${questions.length} preguntas respondidas. Resultado individual en este navegador.`;
  }
  previous?.addEventListener('click', () => { questionIndex = Math.max(0, questionIndex - 1); paginate(); });
  next?.addEventListener('click', () => { questionIndex = Math.min(questions.length - 1, questionIndex + 1); paginate(); });
  form.querySelector('[data-quiz-check]')?.addEventListener('click', (event) => { event.preventDefault(); check(); });
  form.addEventListener('submit', (event) => { event.preventDefault(); check(); });
  form.addEventListener('reset', () => queueMicrotask(() => {
    questionIndex = 0;
    questions.forEach((question) => { const feedback = question.querySelector('[data-feedback]'); if (feedback) feedback.hidden = true; });
    if (score) score.textContent = '';
    paginate();
  }));
  paginate();
  document.addEventListener('expo:modechange', paginate);
});

let printHidden = [];
addEventListener('beforeprint', () => {
  printHidden = [...document.querySelectorAll('[data-step][hidden], [data-option-feedback][hidden], [data-question][hidden], [data-feedback][hidden], form[data-case] fieldset[hidden], form[data-case] label[hidden]')];
  printHidden.forEach((element) => { element.hidden = false; });
});
addEventListener('afterprint', () => {
  printHidden.forEach((element) => { element.hidden = true; });
  printHidden = [];
});
