# 🧩 MathQuest — חדרי הבריחה

משחק חשבון ולוגיקה לכיתה ז׳ ומעלה עם מנגנוני גיימיפיקציה מלאים.

---

## הרצה מקומית (ללא Supabase)

```bash
npm install
npm run dev
```

פתח בדפדפן: **http://localhost:5173**
> ⚡ ללא Supabase המשחק שומר התקדמות ב-localStorage בלבד. הכל עובד.

---

## 🚀 פריסה ל-Vercel + Supabase

### שלב 1 — צור פרויקט Supabase

1. היכנס ל-[app.supabase.com](https://app.supabase.com) וצור פרויקט חדש
2. עבור ל-**SQL Editor** והרץ את המיגרציה:
   ```sql
   -- העתק והדבק את התוכן של:
   supabase/migrations/001_init.sql
   ```
3. עבור ל-**Project Settings → API** ושמור:
   - `Project URL`  → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`

### שלב 2 — פרוס ל-Vercel

```bash
# אם אין לך Vercel CLI:
npm i -g vercel

vercel
# → ענה על השאלות, Vercel מזהה Vite אוטומטית
```

**או** חבר את ה-GitHub repo ישירות ב-[vercel.com](https://vercel.com) (Import Project).

### שלב 3 — הוסף משתני סביבה ב-Vercel

ב-Vercel Dashboard → Project → **Settings → Environment Variables**:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` |

לחץ **Redeploy** לאחר הוספה.

### שלב 4 — הרצה מקומית עם Supabase

```bash
cp .env.example .env
# ערוך את .env עם הערכים שלך
npm run dev
```

---

## 🗄️ סכמת Supabase

| טבלה | תיאור |
|------|--------|
| `game_states` | מצב משחק לכל session (UUID אנונימי) |
| `leaderboard` | View — Top 50 שחקנים לפי מטבעות |

**אין צורך ב-Auth** — כל שחקן מזוהה ע"י UUID הנשמר ב-localStorage.

---

## טכנולוגיות
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion (אנימציות)
- Supabase (database + leaderboard)
- Web Speech API (זיהוי קול)
- WebRTC (מצלמה)
- localStorage (offline cache)