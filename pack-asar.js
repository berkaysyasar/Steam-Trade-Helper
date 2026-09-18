// Uygulama dosyalarini tek bir app.asar arsivine paketler (kaynak duz metin gorunmesin)
const asar = require('@electron/asar');
const src = process.argv[2];
const dest = process.argv[3];
asar.createPackage(src, dest)
  .then(() => console.log('asar olusturuldu -> ' + dest))
  .catch((e) => { console.error(e); process.exit(1); });
