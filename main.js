const { app, BrowserWindow, ipcMain, shell, clipboard } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0f1720',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Uygulama içinden açılan linkleri (grup sayfaları) varsayılan tarayıcıda aç
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- Profil girisinden Steam grup sayfasi URL'sini cikar ---
function resolveBase(input) {
  const v = (input || '').trim();
  if (!v) return null;
  const m = v.match(/steamcommunity\.com\/(id|profiles)\/([^\/\?#]+)/i);
  if (m) return `https://steamcommunity.com/${m[1]}/${m[2]}`;
  if (/^\d{17}$/.test(v)) return `https://steamcommunity.com/profiles/${v}`;
  return `https://steamcommunity.com/id/${encodeURIComponent(v)}`;
}

// --- Steam grup sayfasini cek, HTML'i renderer'a dondur (CORS yok) ---
ipcMain.handle('fetch-groups', async (_e, input) => {
  const base = resolveBase(input);
  if (!base) return { ok: false, error: 'Profil bilgisi boş.' };
  try {
    const res = await fetch(base + '/groups', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!res.ok) return { ok: false, error: `Steam yanıtı: HTTP ${res.status}` };
    const html = await res.text();
    let steamid64 = null;
    const sm = html.match(/"steamid":"(\d{17})"/) || html.match(/g_steamID\s*=\s*"?(\d{17})"?/);
    if (sm) steamid64 = sm[1];
    else { const bm = base.match(/\/profiles\/(\d{17})/); if (bm) steamid64 = bm[1]; }
    return { ok: true, html, base, steamid64 };
  } catch (err) {
    return { ok: false, error: String((err && err.message) || err) };
  }
});

ipcMain.handle('open-external', (_e, url) => {
  if (/^https?:\/\//i.test(url)) shell.openExternal(url);
});

ipcMain.handle('copy', (_e, text) => {
  clipboard.writeText(text || '');
});

// Genel sayfa cekme (grup yorumlarini okuyup son paylasimi bulmak icin)
ipcMain.handle('fetch-page', async (_e, url) => {
  if (!/^https?:\/\//i.test(url)) return { ok: false };
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: ctrl.signal
    });
    clearTimeout(to);
    if (!res.ok) return { ok: false, error: 'HTTP ' + res.status };
    return { ok: true, html: await res.text() };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
});

// Grup sayfasindaki yorum bolumunun capasini (commentthread_Clan_<id>_area) bul
ipcMain.handle('group-anchor', async (_e, url) => {
  if (!/^https?:\/\//i.test(url)) return null;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: ctrl.signal
    });
    clearTimeout(to);
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/id="(commentthread_Clan_\d+_area)"/i);
    return m ? m[1] : null;
  } catch (e) {
    return null;
  }
});
