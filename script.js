// Utility: set current year and live clock
(function initFooterMeta() {
  const yearEl = document.getElementById('year');
  const clockEl = document.getElementById('clock');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  if (clockEl) {
    const update = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${hh}:${mm}:${ss}`;
    };
    update();
    setInterval(update, 1000);
  }
})();

// Animation helper
function fadeInElement(element) {
  if (!element) return;
  element.classList.add('fade-in');
}

// Fetch helpers
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

// Page routers by data-page attribute
document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.getAttribute('data-page');
  initMobileNav();
  try {
    if (page === 'home') {
      await renderHome();
    } else if (page === 'attractions') {
      await renderAttractions();
    } else if (page === 'events') {
      await renderEvents();
    } else if (page === 'culture') {
      await renderCulture();
    } else if (page === 'contact') {
      initContact();
    }
  } catch (err) {
    console.error(err);
  }
});

// Home: render videos from videos.json
async function renderHome() {
  const container = document.getElementById('video-grid');
  if (!container) return;
  const videos = await fetchJSON('videos.json');
  videos.forEach((video) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="card">
        <div class="video">
          <iframe src="${video.url}" title="${video.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        </div>
        <h3 style="margin-top:10px">${video.title}</h3>
      </div>
    `;
    container.appendChild(wrapper.firstElementChild);
  });
  fadeInElement(container);
}

// Attractions: render cards from attractions.json
async function renderAttractions() {
  const grid = document.getElementById('attractions-grid');
  if (!grid) return;
  const items = await fetchJSON('attractions.json');
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <h3 style="margin:10px 0 6px">${item.title}</h3>
      <p>${item.description}</p>
    `;
    grid.appendChild(card);
  });
  fadeInElement(grid);
}

// Events: render list from events.json and highlight nearest upcoming
async function renderEvents() {
  const list = document.getElementById('events-list');
  const highlight = document.getElementById('upcoming-highlight');
  if (!list) return;
  const events = await fetchJSON('events.json');
  const now = new Date();
  const withDates = events.map((e) => ({ ...e, when: new Date(e.date) }));
  withDates.sort((a, b) => a.when - b.when);

  // Find nearest upcoming
  const upcoming = withDates.find((e) => e.when >= now) || withDates[0];
  if (highlight && upcoming) {
    highlight.innerHTML = `
      <h3>Next Up: ${upcoming.title}</h3>
      <p class="date">${formatDate(upcoming.when)}</p>
      <p>${upcoming.description}</p>
    `;
    fadeInElement(highlight);
  }

  withDates.forEach((e) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <div class="date">${formatDate(e.when)}</div>
      <div style="font-weight:600; margin: 2px 0">${e.title}</div>
      <div>${e.description}</div>
    `;
    list.appendChild(item);
  });
  fadeInElement(list);
}

function formatDate(dateObj) {
  return dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// Culture: render cards and two cultural videos (if available)
async function renderCulture() {
  const grid = document.getElementById('culture-grid');
  const vids = document.getElementById('culture-videos');
  const items = await fetchJSON('culture.json');
  items.forEach((c) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${c.image}" alt="${c.name}">
      <h3 style="margin:10px 0 6px">${c.name}</h3>
      <p>${c.craft}</p>
    `;
    grid.appendChild(card);
  });
  fadeInElement(grid);

  if (vids) {
    const videos = await fetchJSON('videos.json');
    videos.slice(0, 2).forEach((video) => {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div class="card">
          <div class="video">
            <iframe src="${video.url}" title="${video.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
          </div>
          <h3 style="margin-top:10px">${video.title}</h3>
        </div>
      `;
      vids.appendChild(wrap.firstElementChild);
    });
    fadeInElement(vids);
  }
}

// Contact: build WhatsApp link with form contents
function initContact() {
  const link = document.getElementById('whatsapp-link');
  if (!link) return;
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const message = document.getElementById('message');

  const buildText = () => {
    const lines = [
      'Hello Discover Bela-Bela!',
      'I would like to know more.',
      name && name.value ? `Name: ${name.value}` : '',
      email && email.value ? `Email: ${email.value}` : '',
      message && message.value ? `Message: ${message.value}` : ''
    ].filter(Boolean).join('%0A');
    return encodeURI(lines);
  };

  const updateHref = () => {
    const base = 'https://wa.me/27761363153?text=';
    link.href = base + buildText();
  };

  ['input', 'change'].forEach((ev) => {
    name && name.addEventListener(ev, updateHref);
    email && email.addEventListener(ev, updateHref);
    message && message.addEventListener(ev, updateHref);
  });
  updateHref();
}

// Mobile nav toggle
function initMobileNav() {
  const button = document.querySelector('.hamburger');
  const nav = document.getElementById('primary-nav');
  if (!button || !nav) return;
  const setExpanded = (expanded) => {
    button.setAttribute('aria-expanded', String(expanded));
    if (expanded) nav.classList.add('show');
    else nav.classList.remove('show');
  };
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  });
  // Close on link click
  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setExpanded(false));
  });
}


