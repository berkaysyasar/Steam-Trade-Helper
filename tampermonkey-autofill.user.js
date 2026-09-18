// ==UserScript==
// @name         Trade Ad Helper - Steam Yorum Otomatik Doldur
// @namespace    trade-ad-helper
// @version      1.1
// @description  Trade Ilan Yardimcisi uygulamasindan acilan Steam grup Yorumlar sayfasinda, ilan metnini yorum kutusuna otomatik yazar. Gonderme (yorum yap) islemini yine sen yaparsin.
// @match        https://steamcommunity.com/groups/*/comments*
// @match        https://steamcommunity.com/gid/*/comments*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // --- kucuk durum rozeti (ne oldugunu gormek icin) ---
  function badge(text, color) {
    let b = document.getElementById('tah-badge');
    if (!b) {
      b = document.createElement('div');
      b.id = 'tah-badge';
      b.style.cssText =
        'position:fixed;top:10px;right:10px;z-index:999999;padding:8px 12px;border-radius:8px;' +
        'font:600 12px/1.3 Arial,sans-serif;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.4);max-width:280px;';
      document.body.appendChild(b);
    }
    b.style.background = color;
    b.textContent = 'Trade Ad Helper: ' + text;
    b.style.display = 'block';
  }

  // 1) Ilan metnini URL'nin # kismindan al
  function getAd() {
    const m = (location.hash || '').match(/tradead=([^&]*)/);
    if (!m) return null;
    try { return decodeURIComponent(m[1].replace(/\+/g, '%20')); }
    catch (e) { return null; }
  }

  const ad = getAd();
  if (!ad) { badge('metin yok — uygulamadan "Copy & Open" ile ac', '#8a6d1f'); return; }

  // 2) Yorum kutusunu bul (Steam kutuyu JS ile olusturdugu icin gecikebilir)
  function findBox() {
    const sels = [
      'textarea.commentthread_textarea',
      '.commentthread_entry textarea',
      '.commentthread_entry_quotebox textarea',
      '.commentthread_area textarea',
      'textarea[id*="commentthread"]',
      'textarea[placeholder*="comment" i]',
      'textarea[placeholder*="yorum" i]'
    ];
    for (const s of sels) {
      const el = document.querySelector(s);
      if (el) return el;
    }
    // son care: sayfadaki gorunur ilk textarea
    const all = [...document.querySelectorAll('textarea')].filter(t => t.offsetParent !== null);
    return all[0] || null;
  }

  // Steam icin degeri "gercek" gibi ayarla + olaylari tetikle
  function setValue(ta, val) {
    try {
      const proto = Object.getPrototypeOf(ta);
      const desc = Object.getOwnPropertyDescriptor(proto, 'value');
      if (desc && desc.set) desc.set.call(ta, val); else ta.value = val;
    } catch (e) { ta.value = val; }
    ['input', 'keydown', 'keyup', 'change', 'blur', 'focus'].forEach(function (ev) {
      ta.dispatchEvent(new Event(ev, { bubbles: true }));
    });
  }

  function fill(ta) {
    ta.focus();
    ta.click();
    setValue(ta, ad);
    ta.focus();
    // bazen ilk odakta kutu genisliyor; degeri bir kez daha uygula
    setTimeout(function () { if (ta.value !== ad) setValue(ta, ad); ta.focus(); }, 400);
    badge('metin kutuya yazildi ✓  (sadece Enter / Yorum yap kaldi)', '#1f8f3a');
  }

  let tries = 0;
  const timer = setInterval(function () {
    const ta = findBox();
    if (ta) {
      fill(ta);
      clearInterval(timer);
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    } else if (++tries > 60) {
      clearInterval(timer);
      badge('yorum kutusu bulunamadi (giris yapili mi? sayfayi yenile)', '#b5372b');
    } else if (tries === 4) {
      badge('yorum kutusu araniyor...', '#2f5d8a');
    }
  }, 250);
})();
