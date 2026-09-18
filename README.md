# Steam Trade Helper

Steam trade ilanlarını takip ettiğin gruplara **elle** yapıştırmayı hızlandıran
masaüstü yardımcısı. İlanını bir kez yazarsın; her grup için tek tıkla panoya
kopyalar ve grubun yorum sayfasını açar. Son adımı (Ctrl+V, Enter) hep sen yaparsın —
toplu/otomatik mesaj gönderme yoktur, hesabın Steam kurallarına uygun kalır.

*A small desktop helper that speeds up posting Steam trade ads to the groups you follow.
It copies your ad and opens the group's comment page; you paste and post yourself.
No automated posting.*

## İndir

[**Releases**](https://github.com/berkaysyasar/Steam-Trade-Helper/releases/latest)
sayfasından `Trade.Ilan.Yardimcisi.zip` dosyasını indir, bir klasöre çıkar ve
`Trade Ilan Yardimcisi.exe` dosyasına çift tıkla. Kurulum yok.

Windows SmartScreen ilk açılışta uyarı gösterebilir (program imzasız):
**Ek bilgi → Yine de çalıştır**.

## Kullanım

1. **New Profile** ile bir profil oluştur ve aç.
2. Sağ üstteki kutuya Steam profilini yaz (kullanıcı adın, SteamID64 ya da tam profil
   linkin) ve **Fetch Groups**'a bas. Takip ettiğin gruplar listelenir
   (profilin herkese açık olmalı).
3. Soldaki **Ad Template** alanına ilanını yaz, **Save** de.
4. Bir grubun **Copy & Open** düğmesine bas: ilan panoya kopyalanır, grubun yorum
   sayfası tarayıcıda açılır. Yorum kutusuna Ctrl+V, Enter.

- ☆ ile sık kullandığın grupları favorile; üstte görünürler.
- Paylaşım sonrası uygulamaya dönünce o gruba "Son paylaşım" tarihi işlenir;
  en son paylaştığın grup kırmızıyla işaretlenir.

### Otomatik yorum doldurma (isteğe bağlı)

Tarayıcına Tampermonkey kur ve `tampermonkey-autofill.user.js` dosyasını yeni script
olarak ekle; **Copy & Open** sonrası yorum kutusu kendiliğinden dolar. Kurmazsan metin
zaten panodadır, elle yapıştırırsın.

## Geliştirme

Electron uygulaması. Node.js 18+ gerekir.

```
npm install
npm start          # geliştirme
npm run share      # dağıtılabilir zip: dist\share\
```

| Dosya | Görev |
|---|---|
| `main.js` | Electron ana süreç: pencere, Steam grup çekme, pano |
| `preload.js` | Pencere ile ana süreç arasındaki köprü |
| `index.html` | Arayüz |
| `make-share.ps1` / `build.ps1` | Taşınabilir exe ve zip üretimi |
| `tampermonkey-autofill.user.js` | İsteğe bağlı yorum doldurma script'i |

## Lisans

MIT
