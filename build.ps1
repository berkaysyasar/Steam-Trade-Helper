# Trade Ilan Yardimcisi - portable .exe uretir (electron-builder/imza gerektirmez)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$src = "node_modules\electron\dist"
if (-not (Test-Path "$src\electron.exe")) {
    Write-Error "Electron bulunamadi. Once 'npm install' calistir."
    exit 1
}

$out = "dist\win-unpacked"
if (Test-Path $out) { Remove-Item $out -Recurse -Force }
New-Item -ItemType Directory -Force $out | Out-Null

Copy-Item "$src\*" $out -Recurse -Force

$appdir = "$out\resources\app"
New-Item -ItemType Directory -Force $appdir | Out-Null
Copy-Item "main.js", "preload.js", "index.html", "package.json" $appdir -Force

Rename-Item "$out\electron.exe" "Trade Ilan Yardimcisi.exe"

$exe = (Resolve-Path "$out\Trade Ilan Yardimcisi.exe").Path
Write-Output "Tamamlandi -> $exe"
