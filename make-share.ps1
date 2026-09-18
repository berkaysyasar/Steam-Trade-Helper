# Paylasilabilir tek .zip uretir: app.asar'a gomulu (kaynak gizli) + tasinabilir exe
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$appName = "Trade Ilan Yardimcisi"
$src = "node_modules\electron\dist"
if (-not (Test-Path "$src\electron.exe")) { Write-Error "Electron yok. Once 'npm install' calistir."; exit 1 }

$shareRoot = "dist\share"
$outDir = Join-Path $shareRoot $appName
$tmpApp = "dist\_app_tmp"

# temizlik
if (Test-Path $outDir) { Remove-Item $outDir -Recurse -Force }
if (Test-Path $tmpApp) { Remove-Item $tmpApp -Recurse -Force }
New-Item -ItemType Directory -Force $outDir | Out-Null
New-Item -ItemType Directory -Force $tmpApp | Out-Null

# 1) Electron calisma dosyalarini kopyala
Copy-Item "$src\*" $outDir -Recurse -Force

# 2) Uygulama dosyalarini gecici klasore topla ve app.asar yap
Copy-Item "main.js", "preload.js", "index.html", "package.json" $tmpApp -Force
$asarOut = Join-Path $outDir "resources\app.asar"
node pack-asar.js "$tmpApp" "$asarOut"
if (-not (Test-Path $asarOut)) { Write-Error "app.asar olusturulamadi"; exit 1 }
Remove-Item $tmpApp -Recurse -Force

# 3) exe'yi yeniden adlandir
Rename-Item (Join-Path $outDir "electron.exe") "$appName.exe"

# 4) Yardimci dosyalari ekle
Copy-Item "KULLANIM.txt" $outDir -Force
Copy-Item "tampermonkey-autofill.user.js" $outDir -Force

# 5) Tek zip yap
$zip = "dist\$appName.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path $outDir -DestinationPath $zip -CompressionLevel Optimal

$size = [math]::Round((Get-Item $zip).Length / 1MB, 1)
Write-Output "TAMAM"
Write-Output ("ZIP  -> " + (Resolve-Path $zip).Path + "  (" + $size + " MB)")
Write-Output ("EXE  -> " + (Resolve-Path (Join-Path $outDir "$appName.exe")).Path)
