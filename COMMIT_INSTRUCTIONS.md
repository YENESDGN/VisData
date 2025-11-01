# GitHub'a Commit Etme Talimatları

Bu dosya, projenizi GitHub'a yüklemek için gerekli adımları içerir.

## 📋 Hazırlık Kontrolü

Aşağıdaki dosyaların hazır olduğundan emin olun:
- ✅ `.gitignore` - Güncellenmiş ve tüm hassas dosyalar ignore edilmiş
- ✅ `README.md` - Proje açıklaması hazır
- ✅ `backend/requirements.txt` - Python bağımlılıkları listelenmiş
- ✅ `backend/.env.example` - Örnek environment değişkenleri
- ✅ `backend/uploaded_files/.gitkeep` - Klasör yapısı korunmuş

## 🚀 Git Komutları

Terminal/Command Prompt'ta proje klasöründe aşağıdaki komutları sırayla çalıştırın:

### 1. Git Repository'yi Başlat (Eğer daha önce yapılmadıysa)
```bash
git init
```

### 2. Tüm Dosyaları Stage'e Ekle
```bash
git add .
```

### 3. İlk Commit'i Yap
```bash
git commit -m "Initial commit: VisData - AI-Powered Data Visualization Platform

- Full-stack application with FastAPI backend and React frontend
- AI-powered file analysis with OpenAI
- Interactive data visualization
- User authentication system
- AI chatbot assistant
- Toast notifications
- Recent files sidebar"
```

### 4. GitHub'da Yeni Repository Oluştur

1. GitHub.com'a gidin ve giriş yapın
2. Sağ üst köşedeki "+" butonuna tıklayın
3. "New repository" seçin
4. Repository adını girin (ör: `VisData`)
5. Açıklama ekleyin (opsiyonel)
6. **Public** veya **Private** seçin
7. **"Initialize this repository with a README" işaretini KALDIRIN** (çünkü zaten README.md var)
8. "Create repository" butonuna tıklayın

### 5. Remote Repository'yi Ekle

GitHub'dan aldığınız repository URL'sini kullanın (örnek: `https://github.com/kullaniciadi/VisData.git`)

```bash
git remote add origin https://github.com/KULLANICIADI/REPO-ADI.git
```

⚠️ **ÖNEMLİ**: `KULLANICIADI` ve `REPO-ADI` kısımlarını kendi GitHub bilgilerinizle değiştirin!

### 6. Branch Adını Ayarla (Eğer gerekirse)
```bash
git branch -M main
```

### 7. Dosyaları GitHub'a Gönder
```bash
git push -u origin main
```

## 🔐 Authentication

GitHub'a push yaparken authentication isteyebilir. Seçenekler:

### Personal Access Token (Önerilen)
1. GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. "Generate new token" tıklayın
3. Gerekli izinleri seçin (repo)
4. Token'ı kopyalayın
5. Push yaparken şifre yerine bu token'ı kullanın

### SSH Key (Alternatif)
SSH key kullanıyorsanız, remote URL'i SSH formatında kullanın:
```bash
git remote add origin git@github.com:KULLANICIADI/REPO-ADI.git
```

## ✅ Kontrol

Push işlemi başarılı olduktan sonra:
1. GitHub repository sayfasına gidin
2. Tüm dosyaların yüklendiğini kontrol edin
3. README.md'nin düzgün göründüğünü kontrol edin

## 📝 Sonraki Adımlar

- Repository'ye description ekleyin
- Topics ekleyin (ör: `data-visualization`, `fastapi`, `react`, `openai`)
- GitHub Pages veya diğer deployment seçeneklerini yapılandırın (opsiyonel)

## ⚠️ Önemli Notlar

1. **`.env` dosyası asla commit edilmemeli** - `.gitignore`'da olmalı
2. **`node_modules/` ve `venv/` commit edilmemeli** - `.gitignore`'da olmalı
3. **`uploaded_files/` içindeki dosyalar commit edilmemeli** - `.gitignore`'da olmalı
4. **Hassas bilgiler** (API keyler, şifreler) kod içinde hardcode edilmemeli

## 🐛 Sorun Giderme

### "remote origin already exists" hatası
```bash
git remote remove origin
git remote add origin https://github.com/KULLANICIADI/REPO-ADI.git
```

### Dosyalar push edilmedi
```bash
git status  # Hangi dosyaların stage'de olduğunu kontrol edin
git add .   # Tüm dosyaları tekrar ekleyin
git commit -m "Your commit message"
git push -u origin main
```

### Authentication hatası
- Personal Access Token kullandığınızdan emin olun
- Token'ın doğru izinlere sahip olduğunu kontrol edin

---

İyi çalışmalar! 🚀

