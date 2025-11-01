from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import connection, models
from core.security import get_current_user
from core.config import settings
import pandas as pd
from openai import OpenAI
import json
import re

# --------------------------------------------------------------------------
# OpenAI İstemcisini (Client) API Anahtarı ile Başlat
# API anahtarı .env dosyasından -> config.py -> settings objesi aracılığıyla okunur
# --------------------------------------------------------------------------
try:
    client = OpenAI(api_key=settings.openai_api_key)
except Exception as e:
    print(f"OpenAI istemcisi başlatılamadı: {e}")
    client = None

router = APIRouter()

# Chat history için basit bir storage (production'da Redis veya DB kullanılmalı)
user_chat_history: dict[int, list[dict]] = {}


def get_file_dataframe(file_id: int, db: Session, current_user: models.UserDB) -> pd.DataFrame:
    """
    (Tekrarı önlemek için) Veritabanından dosyayı bulan
    ve pandas DataFrame'ine yükleyen yardımcı fonksiyon.
    """

    # 1. Dosyayı veritabanında bul
    db_file = db.query(models.FileDB).filter(models.FileDB.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dosya bulunamadı.")

    # 2. Güvenlik: Dosya bu kullanıcıya mı ait?
    if db_file.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu dosyaya erişim yetkiniz yok.")

    # 3. Dosyayı diskten oku (Pandas kullanarak)
    try:
        file_path = db_file.file_path
        if db_file.filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif db_file.filename.endswith(".xlsx"):
            df = pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail="Desteklenmeyen dosya formatı.")

        # NaN (boş hücre) sorununu burada da çözelim
        df_cleaned = df.astype(object).where(pd.notnull(df), None)
        return df_cleaned

    except Exception as e:
        # Hata fırlatmak yerine, hatayı tetikleyene döndür
        raise HTTPException(status_code=500, detail=f"Dosya okunurken hata oluştu: {e}")


@router.get("/recommend_chart/{file_id}")
async def recommend_chart(
        file_id: int,
        db: Session = Depends(connection.get_db),
        current_user: models.UserDB = Depends(get_current_user)
):
    """
    Bir dosyanın içeriğini analiz eder ve en uygun grafik türünü
    önermek için yapay zekaya (ChatBot) sorar.
    """

    if client is None:
        raise HTTPException(status_code=500, detail="OpenAI API anahtarı yapılandırılmamış veya istemci başlatılamadı.")

    # 1. Dosya verisini Pandas DataFrame olarak al
    try:
        df = get_file_dataframe(file_id, db, current_user)
    except HTTPException as e:
        return e  # Hata oluştuysa (örn: 404, 403) o hatayı döndür

    # 2. Yapay Zekaya sormak için "Prompt" (İstem) hazırla
    # Tüm veriyi göndermeyiz, sadece veri hakkında özet bilgi (metadata) göndeririz.

    column_names = list(df.columns)
    data_types = df.dtypes.to_string()  # Sütunların veri tipleri (örn: int64, object, float64)
    first_5_rows = df.head().to_string()  # Verinin ilk 5 satırı (ki AI formatı anlasın)

    prompt = f"""
    Sen bir veri analisti asistanısın. Sana bir veri setinin özetini vereceğim. 
    Görevin, bu veriyi görselleştirmek için EN UYGUN 2-3 grafik türünü önermek.
    Önerdiğin her grafik türü için (örn: "Çubuk Grafik", "Çizgi Grafik", "Dağılım Grafiği (Scatter Plot)")
    hangi sütunların kullanılması gerektiğini (örn: X ekseni için 'Tarih', Y ekseni için 'Satış Miktarı') 
    ve nedenini 1 cümleyle açıkla.
    Cevabın kısa ve net olsun.

    İşte veri özeti:
    Sütun İsimleri: {column_names}
    Sütun Veri Tipleri:
    {data_types}

    Verinin İlk 5 Satırı:
    {first_5_rows}

    Bu verilere dayanarak en uygun grafik önerilerin (sütun bilgileriyle birlikte) nelerdir?
    """

    # 3. OpenAI ChatBot'una isteği gönder
    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Hızlı ve ucuz model
            messages=[
                {"role": "system",
                 "content": "You are a helpful data analyst assisting a user with chart recommendations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2  # Yaratıcılığı düşük tut, net cevap versin
        )

        # API'den gelen cevabı al
        recommendation = completion.choices[0].message.content.strip()

        return {"recommendation": recommendation}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yapay zeka ile konuşurken hata oluştu: {e}")


@router.get("/analyze_file/{file_id}")
async def analyze_file_for_chart(
        file_id: int,
        db: Session = Depends(connection.get_db),
        current_user: models.UserDB = Depends(get_current_user)
):
    """
    Dosyayı analiz eder ve en uygun grafik tipi ile X,Y eksenlerini önerir.
    Yapılandırılmış JSON response döner.
    """
    if client is None:
        raise HTTPException(status_code=500, detail="OpenAI API anahtarı yapılandırılmamış veya istemci başlatılamadı.")

    # 1. Dosya verisini Pandas DataFrame olarak al
    try:
        df = get_file_dataframe(file_id, db, current_user)
    except HTTPException as e:
        raise e

    # 2. Veri hakkında bilgi topla
    column_names = list(df.columns)
    
    # Sütun tiplerini analiz et
    numeric_columns = []
    date_columns = []
    categorical_columns = []
    
    for col in column_names:
        col_data = df[col].dropna()
        if len(col_data) == 0:
            continue
            
        dtype = str(df[col].dtype)
        
        # Numeric kontrol
        if dtype in ['int64', 'float64', 'int32', 'float32']:
            numeric_columns.append(col)
        # Date kontrol (basit bir yaklaşım)
        elif dtype == 'object':
            sample_val = str(col_data.iloc[0]) if len(col_data) > 0 else ""
            # Basit date kontrolü
            if any(keyword in col.lower() for keyword in ['date', 'tarih', 'time', 'zaman', 'year', 'yıl']):
                date_columns.append(col)
            else:
                categorical_columns.append(col)
        else:
            categorical_columns.append(col)
    
    # İlk birkaç satırı örnek olarak al
    sample_data = df.head(10).to_dict(orient='records')
    
    # 3. OpenAI'ye özel prompt hazırla - JSON formatında cevap iste
    prompt = f"""Sen bir veri analisti uzmanısın. Bir veri setini analiz edip en uygun grafik tipini ve eksen seçimlerini önermelisin.

VERİ SETİ BİLGİLERİ:
- Sütun İsimleri: {column_names}
- Numeric Sütunlar: {numeric_columns}
- Kategorik Sütunlar: {categorical_columns}
- Tarih/Zaman Sütunları: {date_columns}

Örnek Veri (İlk 10 satır):
{json.dumps(sample_data, default=str, ensure_ascii=False)}

GÖREVİN:
Bu veri seti için EN UYGUN grafik tipini ve X, Y eksenlerini belirle.

GRAFİK TİPLERİ (sadece bunlardan birini seç):
- "bar": Kategorik X, Numeric Y (karşılaştırma için)
- "line": Zaman/tarih X, Numeric Y (trend gösterimi için)
- "pie": Kategorik veriler (oran/yüzde gösterimi için)
- "scatter": Numeric X, Numeric Y (ilişki analizi için)
- "area": Zaman/tarih X, Numeric Y (alan doldurulmuş trend)
- "table": Sadece veri tablosu (özel durumlar için)

CEVAP FORMATI (JSON):
{{
    "chartType": "bar|line|pie|scatter|area|table",
    "xColumn": "sütun_adi",
    "yColumn": "sütun_adi",
    "reason": "kısa açıklama (Türkçe)"
}}

KURALLAR:
1. X sütunu genellikle kategorik, tarih veya bağımsız değişken olmalı
2. Y sütunu genellikle numeric (sayısal) olmalı
3. Eğer tarih sütunu varsa, genellikle X ekseninde kullanılmalı ve "line" veya "area" tercih edilmeli
4. Eğer 2 numeric sütun varsa, "scatter" grafik uygun olabilir
5. Eğer kategorik sütunlar ve numeric sütunlar varsa, "bar" grafik uygun olabilir
6. Sütun isimlerini TAM OLARAK kullan (değiştirme)
7. Mutlaka geçerli bir JSON döndür

SADECE JSON CEVAP VER, başka bir şey yazma."""

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",  # Daha iyi JSON parsing için gpt-4o-mini kullan
            messages=[
                {
                    "role": "system",
                    "content": "You are a data visualization expert. Always respond with valid JSON only, no other text."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Çok düşük tut, tutarlı cevaplar için
            response_format={"type": "json_object"}  # JSON format zorunlu
        )

        # API'den gelen cevabı al ve parse et
        response_text = completion.choices[0].message.content.strip()
        
        # JSON parse et
        try:
            result = json.loads(response_text)
        except json.JSONDecodeError:
            # JSON parse edilemezse, içinden JSON çıkarmaya çalış
            json_match = re.search(r'\{[^{}]*"chartType"[^{}]*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                raise ValueError("JSON parse edilemedi")

        # Doğrulama ve normalizasyon
        chart_type = result.get("chartType", "").lower()
        x_column = result.get("xColumn", "")
        y_column = result.get("yColumn", "")
        
        # Geçerli chart type kontrolü
        valid_chart_types = ["bar", "line", "pie", "scatter", "area", "table"]
        if chart_type not in valid_chart_types:
            chart_type = "bar"  # Varsayılan
        
        # Sütun isimlerini doğrula
        if x_column not in column_names:
            x_column = column_names[0] if column_names else ""
        if y_column not in column_names:
            y_column = column_names[1] if len(column_names) > 1 else (column_names[0] if column_names else "")
        
        return {
            "chartType": chart_type,
            "xColumn": x_column,
            "yColumn": y_column,
            "reason": result.get("reason", "AI analizi sonucu önerildi")
        }

    except Exception as e:
        # OpenAI API hatalarını özel olarak yakala
        error_str = str(e)
        error_code = None
        
        # Hata kodunu mesajdan çıkarmaya çalış
        if '429' in error_str or 'insufficient_quota' in error_str.lower() or 'quota' in error_str.lower():
            error_code = 429
        elif '401' in error_str or 'unauthorized' in error_str.lower() or 'invalid' in error_str.lower():
            error_code = 401
        elif '500' in error_str or '503' in error_str:
            error_code = 500
        
        # Status code attribute varsa onu kullan
        if hasattr(e, 'status_code'):
            error_code = getattr(e, 'status_code', error_code)
        
        error_message = error_str
        
        # Hata mesajını daha anlaşılır hale getir
        if error_code == 429:
            reason = "OpenAI API kotası aşıldı. Lütfen OpenAI hesabınızda yeterli kredi olduğundan emin olun veya daha sonra tekrar deneyin. Varsayılan grafik ayarları kullanıldı."
        elif error_code == 401:
            reason = "OpenAI API anahtarı geçersiz. Lütfen API anahtarınızı kontrol edin. Varsayılan grafik ayarları kullanıldı."
        elif error_code == 500 or error_code == 503:
            reason = "OpenAI servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin. Varsayılan grafik ayarları kullanıldı."
        else:
            reason = f"AI analizi sırasında bir hata oluştu (Kod: {error_code}). Varsayılan grafik ayarları kullanıldı."
        
        # Varsayılan değerler döndür
        x_col = column_names[0] if column_names else ""
        y_col = column_names[1] if len(column_names) > 1 else (column_names[0] if column_names else "")
        
        return {
            "chartType": "bar",
            "xColumn": x_col,
            "yColumn": y_col,
            "reason": reason,
            "error": True,
            "errorCode": error_code
        }


@router.post("/chat")
async def chat_with_ai(
        message: dict,
        db: Session = Depends(connection.get_db),
        current_user: models.UserDB = Depends(get_current_user)
):
    """
    Chatbot endpoint - kullanıcı mesajını alır, dosyaları kontrol eder ve AI ile konuşur.
    AI cevapları İngilizce olacak.
    """
    if client is None:
        raise HTTPException(status_code=500, detail="OpenAI API key is not configured.")
    
    user_message = message.get("message", "").strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    # Kullanıcının dosyalarını al
    user_files = db.query(models.FileDB).filter(models.FileDB.owner_id == current_user.id).all()
    files_info = [{"id": f.id, "filename": f.filename} for f in user_files]
    
    # Chat history'yi al (yoksa oluştur)
    if current_user.id not in user_chat_history:
        user_chat_history[current_user.id] = []
    
    history = user_chat_history[current_user.id]
    
    # Kullanıcı mesajını history'ye ekle
    history.append({"role": "user", "content": user_message})
    
    # System prompt hazırla
    system_prompt = """You are a helpful AI assistant for a data visualization platform. Your role is to help users understand their data files and recommend the best chart types and axis selections.

IMPORTANT RULES:
1. Always respond in ENGLISH
2. You have access to the user's uploaded files (CSV and Excel files)
3. When the user asks about a file, analyze it and provide recommendations
4. When recommending charts, mention: chart type, X-axis column, Y-axis column, and a brief explanation
5. Be concise and helpful
6. If the user wants to analyze a specific file, ask for the filename or list available files

Available files will be provided in the context. Analyze files using the provided data when requested."""

    # Dosya bilgilerini context'e ekle
    files_context = ""
    if files_info:
        files_context = f"\n\nUser's available files:\n"
        for f in files_info:
            files_context += f"- ID: {f['id']}, Filename: {f['filename']}\n"
    else:
        files_context = "\n\nThe user has no uploaded files yet. Encourage them to upload a CSV or Excel file."
    
    # Eğer kullanıcı bir dosya hakkında soruyorsa veya analiz istiyorsa
    file_mentioned = None
    for f in files_info:
        if f['filename'].lower() in user_message.lower() or f'file {f["id"]}' in user_message.lower():
            file_mentioned = f
            break
    
    analysis_result = None
    if file_mentioned:
        try:
            # Dosyayı analiz et - analyze_file_for_chart async olduğu için await kullanıyoruz
            analysis = await analyze_file_for_chart(file_mentioned["id"], db, current_user)
            analysis_result = analysis
        except Exception as e:
            analysis_result = {"error": str(e)}
    
    # OpenAI'ye gönderilecek mesajları hazırla
    messages = [
        {"role": "system", "content": system_prompt + files_context}
    ]
    
    # History'yi ekle (son 10 mesajı al)
    for msg in history[-10:]:
        messages.append(msg)
    
    # Eğer analiz sonucu varsa, bunu context'e ekle
    if analysis_result and not analysis_result.get("error"):
        analysis_context = f"\n\nAnalysis result for file '{file_mentioned['filename']}':\n"
        analysis_context += f"- Recommended Chart Type: {analysis_result.get('chartType', 'N/A')}\n"
        analysis_context += f"- Recommended X-axis: {analysis_result.get('xColumn', 'N/A')}\n"
        analysis_context += f"- Recommended Y-axis: {analysis_result.get('yColumn', 'N/A')}\n"
        analysis_context += f"- Explanation: {analysis_result.get('reason', 'N/A')}\n"
        analysis_context += "\nUse this information to provide a helpful response to the user."
        messages[-1]["content"] += analysis_context
    
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        ai_response = completion.choices[0].message.content.strip()
        
        # AI cevabını history'ye ekle
        history.append({"role": "assistant", "content": ai_response})
        
        # History'yi sınırla (max 20 mesaj)
        if len(history) > 20:
            user_chat_history[current_user.id] = history[-20:]
        
        return {
            "response": ai_response,
            "analysis": analysis_result if analysis_result else None
        }
    
    except Exception as e:
        error_str = str(e)
        # Basit bir fallback response
        fallback_response = "I apologize, but I'm having trouble processing your request right now. "
        if files_info:
            fallback_response += f"However, I can see you have {len(files_info)} file(s) uploaded. Would you like me to analyze one of them?"
        else:
            fallback_response += "Please try again later or upload a file to get started."
        
        return {
            "response": fallback_response,
            "error": error_str
        }