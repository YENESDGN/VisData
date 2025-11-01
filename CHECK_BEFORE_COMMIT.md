# ✅ Commit Öncesi Kontrol Listesi

Bu dosya commit etmeden önce kontrol edilmesi gerekenleri listeler.

## ⚠️ Commit EDİLMEMELİ Dosyalar/Klasörler

Aşağıdaki dosya/klasörlerin dizinde **OLMAMASI** gerekir veya `.gitignore` tarafından ignore edilmiş olmalı:

### ❌ Mutlaka Ignore Edilmeli:

- [ ] `node_modules/` (root ve frontend klasörlerinde)
- [ ] `backend/venv/` (virtual environment)
- [ ] `backend/__pycache__/` ve tüm alt klasörlerdeki `__pycache__/`
- [ ] `backend/.env` (hassas bilgiler içerir)
- [ ] `.env` (root'ta varsa)
- [ ] `backend/uploaded_files/*.xlsx` (kullanıcı dosyaları)
- [ ] `backend/uploaded_files/*.csv` (kullanıcı dosyaları)
- [ ] `*.db`, `*.sqlite`, `*.sqlite3` (veritabanı dosyaları)
- [ ] `.idea/`, `.vscode/` (IDE ayarları)
- [ ] `frontend/dist/`, `frontend/.vite/` (build çıktıları)

### ✅ Olması Gereken Dosyalar:

- [ ] `.gitignore` (root dizinde)
- [ ] `README.md`
- [ ] `backend/requirements.txt`
- [ ] `backend/ENV_EXAMPLE.txt`
- [ ] `backend/uploaded_files/.gitkeep` (klasör yapısını korumak için)

## 🔍 Kontrol Komutları

PowerShell'de şu komutları çalıştırarak kontrol edebilirsiniz:

```powershell
# .gitignore var mı?
Test-Path .gitignore

# node_modules var mı?
Test-Path node_modules
Test-Path frontend/node_modules

# venv var mı?
Test-Path backend/venv

# .env dosyası var mı?
Test-Path backend/.env

# uploaded_files içinde dosya var mı?
Get-ChildItem backend/uploaded_files -File | Where-Object { $_.Name -ne '.gitkeep' }

# .db dosyası var mı?
Get-ChildItem -Recurse -Filter "*.db" -ErrorAction SilentlyContinue
```

## 🚨 Uyarı

Eğer yukarıdaki dosyalardan herhangi biri dizinde varsa ve `.gitignore` tarafından ignore edilmemişse:
1. `.gitignore` dosyasını kontrol edin
2. Gerekirse `.gitignore`'a ekleyin
3. Git cache'i temizleyin: `git rm -r --cached .`
4. Tekrar `git add .` yapın

