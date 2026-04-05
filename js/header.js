// 1_dev/js/header.js — Shared header across all dev pages
(function() {
  const current = location.pathname.split('/').pop() || 'index.html';

  const nav = [
    { href: 'index.html', label: 'Cover' },
    { href: 'reflect.html', label: 'Reflect' },
    { href: 'googlemaps.html', label: 'Map' }
  ];

  const links = nav.map(n =>
    '<a href="' + n.href + '" class="qh-link' + (current === n.href ? ' active' : '') + '">' + n.label + '</a>'
  ).join('');

  const BUILD = '2025-07-14 v3.1';

  const html = '<div class="qh-bar">'
    + '<a href="index.html" class="qh-logo">✦ My Reflection Space</a>'
    + '<nav class="qh-nav">' + links
    + '<button class="qh-logout" id="qhLogout" style="display:none">sign out</button>'
    + '<span class="qh-build">' + BUILD + '</span></nav>'
    + '</div>';

  const footerHtml = '<div class="qh-footer">'
    + '<span>AI Awareness Society</span>'
    + '<span class="qh-footer-sep">·</span>'
    + '<span>Founded by Ankon Das · Claudia Abei · Kristina Akopyan · Laura Zavialova · Lilian Nunes Almeida</span>'
    + '</div>';

  const css = document.createElement('style');
  css.textContent = ''
    + '.qh-bar{position:fixed;top:0;left:0;right:0;z-index:9999;display:flex;align-items:center;justify-content:space-between;padding:0.5rem 1.2rem;background:rgba(253,242,248,0.85);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid rgba(249,168,212,0.15);font-family:"Nunito Sans",sans-serif;}'
    + '.qh-logo{font-family:"Patrick Hand",cursive;font-size:1.1rem;color:#8B1E47;font-weight:700;text-decoration:none;}'
    + '.qh-nav{display:flex;align-items:center;gap:0.2rem;}'
    + '.qh-link{font-size:0.6rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#a0607e;text-decoration:none;padding:0.3rem 0.6rem;border-radius:0.4rem;transition:all 0.15s;}'
    + '.qh-link:hover{color:#8B1E47;background:rgba(249,168,212,0.15);}'
    + '.qh-link.active{color:#8B1E47;background:rgba(249,168,212,0.2);}'
    + '.qh-logout{font-family:"Patrick Hand",cursive;font-size:0.7rem;color:#ef4444;background:none;border:1.5px solid rgba(239,68,68,0.3);padding:0.2rem 0.6rem;border-radius:0.4rem;cursor:pointer;transition:all 0.15s;margin-left:0.3rem;}'
    + '.qh-logout:hover{background:rgba(239,68,68,0.08);border-color:#ef4444;}'
    + '.qh-build{font-size:0.45rem;color:#dba8c4;padding:0.3rem 0.4rem;font-weight:600;}'
    + '.qh-spacer{height:2.5rem;}'
    + '.qh-footer{position:fixed;bottom:0;left:0;right:0;z-index:9999;text-align:center;padding:0.4rem 1rem;background:rgba(253,242,248,0.85);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid rgba(249,168,212,0.15);font-family:"Nunito Sans",sans-serif;font-size:0.5rem;color:#a0607e;letter-spacing:0.03em;}'
    + '.qh-footer-sep{margin:0 0.2rem;color:#dba8c4;}';

  document.head.appendChild(css);

  const bar = document.createElement('div');
  bar.innerHTML = html;
  document.body.prepend(bar.firstChild);

  // Add spacer so content isn't hidden behind fixed header
  const spacer = document.createElement('div');
  spacer.className = 'qh-spacer';
  document.body.children[1] ? document.body.insertBefore(spacer, document.body.children[1]) : document.body.appendChild(spacer);

  // Add footer
  const foot = document.createElement('div');
  foot.innerHTML = footerHtml;
  document.body.appendChild(foot.firstChild);

  // Logout button — show if session exists, handle click
  const logoutBtn = document.getElementById('qhLogout');
  if (logoutBtn && typeof API !== 'undefined') {
    API.getSession().then(jwt => {
      if (jwt) logoutBtn.style.display = 'inline-block';
    }).catch(() => {});

    logoutBtn.addEventListener('click', async () => {
      try { await API.signOut(); } catch(e) {}
      sessionStorage.clear();
      localStorage.setItem('signedOut', '1');
      logoutBtn.style.display = 'none';
      window.location.reload();
    });
  }
})();