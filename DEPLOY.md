# Gevers Painting Account - Deploy en Vercel

## ✅ Estado: Listo para publicar

Tu app está configurada con Supabase. Solo falta subirla a Vercel.

### Pasos para desplegar:

1. **Push a GitHub**
   ```bash
   git add .
   git commit -m "Configurar Supabase y preparar para Vercel"
   git push
   ```

2. **En Vercel**
   - Ve a vercel.com
   - New Project → Importa tu repositorio
   - Framework: **Other**
   - Build Command: dejar vacío
   - Output Directory: **.** (punto)
   - Agrega variables de entorno:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://tmnpgbezdvghvvpqnpln.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtbnBnYmV6ZHZnaHZ2cHFucGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NzAwNTcsImV4cCI6MjA4NTU0NjA1N30.h4mWNOiRleiA0y1KTn6cwU-IO0D-NGfEYO2iswF-gDs
     ```
   - Click en "Deploy"

3. **En Supabase - Autorizar dominio de Vercel**
   - Supabase Dashboard → Settings → Auth
   - "Authorized redirect URLs" → Agrega tu URL de Vercel (ej: https://tuproyecto.vercel.app)

### 🎉 Resultado
Tu app estará disponible en una URL pública y sincronizará datos con Supabase desde cualquier dispositivo.

### 📱 Instalar en teléfono
- Abre la URL en Chrome (Android) o Safari (iPhone)
- Menú → "Agregar a pantalla de inicio"

### 💾 Datos
- Los datos se guardan localmente Y en Supabase
- Si no hay conexión, funciona offline con localStorage
