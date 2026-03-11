# 🧩 MathQuest — חדרי הבריחה

משחק חשבון ולוגיקה לכיתה ז׳ ומעלה עם מנגנוני גיימיפיקציה מלאים.

---

## סביבות הרצה

| פקודה | Supabase | מתי להשתמש |
|-------|----------|------------|
| `npm run dev` | ❌ localStorage בלבד | בדיקה מהירה ללא DB |
| `npm run dev:local` | ✅ Supabase מקומי (פורט 54321) | פיתוח מלא מול DB מקומי |
| `npm run dev:remote` | ✅ Supabase בענן | בדיקה מול production DB |

---

## 🖥️ אפשרות א׳ — ללא Supabase (הכי מהיר)

```bash
npm install
npm run dev
```
→ פתח **http://localhost:5173** · התקדמות נשמרת ב-localStorage בלבד.

---

## 🐳 אפשרות ב׳ — Supabase מקומי (Docker)

מריץ Supabase שלם על המחשב שלך — אין צורך בחשבון.

**דרישות:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# 1. התקן Supabase CLI
npm install -g supabase

# 2. הפעל Docker Desktop, ואז:
npm run supabase:start
# → מדפיס את כתובת ה-Studio המקומי (http://localhost:54323)

# 3. הרץ את המיגרציה
npm run supabase:reset
# (מריץ אוטומטית את supabase/migrations/001_init.sql)

# 4. הרץ את האפליקציה מול ה-DB המקומי
npm run dev:local
```

→ פתח **http://localhost:5173**
→ Studio (ממשק DB) ב-**http://localhost:54323**

> ⚡ `.env.localdb` כבר מכיל את הקרדנציאלים הדיפולטיביים של Supabase מקומי — אין צורך לערוך כלום.

עצירה:
```bash
npm run supabase:stop
```

---

## 🚀 אפשרות ג׳ — Supabase בענן + Vercel (production)

### שלב 1 — צור פרויקט Supabase בענן

1. [app.supabase.com](https://app.supabase.com) → New Project
2. **SQL Editor** → הרץ את תוכן `supabase/migrations/001_init.sql`
3. **Project Settings → API** → שמור:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`

### שלב 2 — הרצה מקומית מול ה-DB בענן

```bash
# ערוך .env.remote עם הערכים מסעיף 3 למעלה
nano .env.remote

# הרץ
npm run dev:remote
```

→ פתח **http://localhost:5173** · הנתונים עולים ל-Supabase בענן בזמן אמת.

### שלב 3 — פריסה ל-Vercel

```bash
npm i -g vercel
vercel
```

**או** חבר GitHub repo ב-[vercel.com/new](https://vercel.com/new).

### שלב 4 — משתני סביבה ב-Vercel

Vercel Dashboard → Project → **Settings → Environment Variables**:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` |

לחץ **Redeploy**.

---

## 📁 קבצי סביבה

| קובץ | מה הוא עושה | מחויב ל-git? |
|------|-------------|--------------|
| `.env.localdb` | קרדנציאלים לSupabase מקומי (ברירת מחדל קבועה) | ✅ כן |
| `.env.remote` | קרדנציאלים לSupabase בענן | ❌ לא |
| `.env.example` | תבנית ריקה | ✅ כן |

---

## 🗄️ סכמת DB

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