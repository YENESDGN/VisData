# GitIgnore Kontrol Scripti
Write-Host "=== GitIgnore Kontrol Raporu ===" -ForegroundColor Cyan
Write-Host ""

# Kontrol edilecek dosya/klasörler
$checks = @(
    @{Name="node_modules"; Path="node_modules"; ShouldIgnore=$true},
    @{Name="frontend/node_modules"; Path="frontend/node_modules"; ShouldIgnore=$true},
    @{Name="backend/venv"; Path="backend/venv"; ShouldIgnore=$true},
    @{Name="backend/.env"; Path="backend/.env"; ShouldIgnore=$true},
    @{Name=".gitignore"; Path=".gitignore"; ShouldIgnore=$false}
)

Write-Host "1. Dosya/Klasör Varlık Kontrolü:" -ForegroundColor Yellow
foreach ($check in $checks) {
    $exists = Test-Path $check.Path -ErrorAction SilentlyContinue
    $status = if ($exists) { "VAR" } else { "YOK" }
    $color = if ($exists -and $check.ShouldIgnore) { "Green" } elseif ($exists -and -not $check.ShouldIgnore) { "Yellow" } else { "Gray" }
    Write-Host "  $($check.Name): $status" -ForegroundColor $color
}

Write-Host ""
Write-Host "2. Ignore Kontrolü:" -ForegroundColor Yellow
foreach ($check in $checks) {
    $ignored = git check-ignore $check.Path 2>$null
    if ($check.ShouldIgnore) {
        if ($ignored) {
            Write-Host "  ✓ $($check.Name) - IGNORE EDILIYOR (DOĞRU)" -ForegroundColor Green
        } elseif (Test-Path $check.Path) {
            Write-Host "  ✗ $($check.Name) - IGNORE EDILMIYOR (SORUN!)" -ForegroundColor Red
        } else {
            Write-Host "  ○ $($check.Name) - Dosya yok (OK)" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "3. Stage'deki Dosyalar Kontrolü:" -ForegroundColor Yellow
$staged = git ls-files 2>$null
$problematic = $staged | Where-Object { $_ -match "node_modules|venv|\.env$|uploaded_files.*\.(xlsx|csv)" }
if ($problematic) {
    Write-Host "  ✗ SORUN: Stage'de olmaması gereken dosyalar var:" -ForegroundColor Red
    $problematic | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
} else {
    Write-Host "  ✓ Stage'de sorunlu dosya yok" -ForegroundColor Green
}

Write-Host ""
Write-Host "4. Uploaded Files Kontrolü:" -ForegroundColor Yellow
$uploadedFiles = Get-ChildItem -Path "backend/uploaded_files" -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne ".gitkeep" }
if ($uploadedFiles) {
    Write-Host "  ⚠ $($uploadedFiles.Count) dosya var (ignore edilmeli):" -ForegroundColor Yellow
    foreach ($file in $uploadedFiles) {
        $ignored = git check-ignore $file.FullName 2>$null
        if ($ignored) {
            Write-Host "    ✓ $($file.Name) - IGNORE EDILIYOR" -ForegroundColor Green
        } else {
            Write-Host "    ✗ $($file.Name) - IGNORE EDILMIYOR!" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ✓ Uploaded files klasörü boş veya sadece .gitkeep var" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== SONUÇ ===" -ForegroundColor Cyan
Write-Host "Eğer tüm kontroller ✓ işaretliyse, güvenle commit edebilirsiniz!" -ForegroundColor Green

