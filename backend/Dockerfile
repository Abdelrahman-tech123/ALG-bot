# صورة مجهزة بـ Playwright للـ Linux
FROM mcr.microsoft.com/playwright/python:v1.42.0-jammy

WORKDIR /app

# نسخ ملف المتطلبات أولاً لتسريع عملية الـ Build
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# نسخ باقي الملفات
COPY . .

# تشغيل السيرفر باستخدام run.py
# ملاحظة: في الـ Docker لا نحتاج للـ --reload
CMD ["python", "run.py", "--no-reload"]