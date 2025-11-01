# 🚀 GitHub'a Yükleme - Hızlı Başlangıç

## Adım Adım Git Komutları

Aşağıdaki komutları **PowerShell** veya **Command Prompt**'ta **proje ana klasöründe** çalıştırın:

### 1️⃣ Git Repository Başlat
```powershell
git init
```

### 2️⃣ Tüm Dosyaları Ekle
```powershell
git add .
```

### 3️⃣ İlk Commit
```powershell
git commit -m "Initial commit: VisData - AI-Powered Data Visualization Platform"
```

### 4️⃣ GitHub'da Repository Oluştur
1. https://github.com/new adresine gidin
2. Repository adı: `VisData` (veya istediğiniz isim)
3. **Public** veya **Private** seçin
4. **"Initialize with README" işaretini KALDIRIN**
5. "Create repository" tıklayın

### 5️⃣ Remote Ekle ve Push
```powershell
# KULLANICIADI ve REPO-ADI kısımlarını kendi bilgilerinizle değiştirin!
git remote add origin https://github.com/KULLANICIADI/REPO-ADI.git
git branch -M main
git push -u origin main
```

## ✅ Kontrol Listesi

Commit etmeden önce kontrol edin:
- [ ] `.env` dosyası **YOK** (gitignore'da)
- [ ] `node_modules/` klasörü **YOK** (gitignore'da)  
- [ ] `backend/venv/` klasörü **YOK** (gitignore'da)
- [ ] `backend/uploaded_files/*` dosyaları **YOK** (gitignore'da)
- [ ] `README.md` var ✅
- [ ] `requirements.txt` var ✅
- [ ] `ENV_EXAMPLE.txt` var ✅

## 🔐 Authentication

Push sırasında GitHub kullanıcı adı ve şifre istenirse:
- **Şifre yerine Personal Access Token kullanın**
- Token oluşturmak için: GitHub > Settings > Developer settings > Personal access tokens

## 📖 Detaylı Talimatlar

Daha detaylı bilgi için `COMMIT_INSTRUCTIONS.md` dosyasına bakın.

