# นำ MoonBrew ขึ้น GitHub และ Vercel

โปรเจกต์นี้เป็น **React + Vite SPA ที่มี Express/tRPC API** สำหรับกระดานคะแนน ไม่ใช่ static frontend อย่างเดียว

## 1. อัปโหลดขึ้น GitHub อย่างถูกโครงสร้าง

1. แตกไฟล์ ZIP ให้เห็นไฟล์เหล่านี้ที่ระดับ root ของ repository ทันที:

   ```text
   package.json
   pnpm-lock.yaml
   pnpm-workspace.yaml
   vercel.json
   server.ts
   client/
   server/
   shared/
   drizzle/
   ```

2. อัปโหลด **ไฟล์และโฟลเดอร์ทั้งหมดภายใน ZIP** เข้า repository ไม่ใช่อัปโหลด ZIP ไฟล์เดียว
3. ตรวจว่าไฟล์สำคัญอยู่ตำแหน่งนี้:

   ```text
   client/index.html
   client/src/main.tsx
   server.ts
   vercel.json
   ```

4. ห้ามอัปโหลด `.env`, API keys, credentials, `node_modules/`, `dist/` หรือ `public/` ที่เป็น build output

## 2. ตั้งค่า Vercel

เชื่อม GitHub repository แล้วตั้งค่า **Root Directory** เป็นโฟลเดอร์ที่มี `package.json` และ `client/` อยู่ระดับเดียวกัน (โดยปกติคือ root ของ repository)

ไฟล์ `vercel.json` ในโปรเจกต์ตั้งค่าไว้แล้วดังนี้:

- ติดตั้งด้วย `pnpm install --frozen-lockfile`
- build ด้วย `pnpm build:vercel`
- สร้าง frontend ไปที่ `public/` ซึ่ง Vercel ใช้เสิร์ฟเป็น static assets
- กำหนด `outputDirectory` เป็น `public` เพื่อไม่ให้ Vercel หา `dist/` ที่ไม่มีอยู่
- ใช้ root `server.ts` เป็น Express Function สำหรับ `/api/trpc`, OAuth callback และ storage proxy
- fallback เส้นทางของ React Router ไปที่ `index.html` โดยไม่ดัก `/api/*`
- ปิด cache สำหรับ API เพื่อไม่ให้คะแนนเก่าค้าง

ไม่ต้องตั้ง Root Directory เป็น `client/` และไม่ต้องเปลี่ยน Output Directory จาก `public`

## 3. Environment Variables บน Vercel

คัดลอกชื่อจาก `.env.example` ไปสร้างใน Vercel Project Settings โดยใส่ค่าจริงเฉพาะใน Vercel เท่านั้น

### ต้องมีหากต้องการบันทึกคะแนนออนไลน์

```text
DATABASE_URL
```

ฐานข้อมูลต้องมีตารางตาม migration ใน `drizzle/` โดยเฉพาะ `leaderboard_entries`

### ต้องมีหากเปิดใช้งาน Manus OAuth

```text
JWT_SECRET
VITE_APP_ID
OAUTH_SERVER_URL
VITE_OAUTH_PORTAL_URL
OWNER_OPEN_ID
```

### ต้องมีเฉพาะฟีเจอร์ที่ใช้ Manus API/storage

```text
BUILT_IN_FORGE_API_URL
BUILT_IN_FORGE_API_KEY
VITE_FRONTEND_FORGE_API_URL
VITE_FRONTEND_FORGE_API_KEY
```

ถ้าไม่ได้ตั้งค่า database หน้าเกมยังเปิดได้และจะแสดงตารางว่าง แต่การบันทึกคะแนนจะไม่สำเร็จ ดังนั้นควรตั้ง `DATABASE_URL` ก่อนใช้งานจริง

## 4. คำสั่งตรวจสอบก่อน push

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm build:vercel
```

คำสั่ง `pnpm build` ใช้ตรวจ local full-stack ส่วน `pnpm build:vercel` จำลอง frontend artifact ที่ Vercel จะใช้

## 5. หมายเหตุด้านความปลอดภัย

- ค่า secret ใช้เฉพาะฝั่ง server และห้ามเติม `VITE_` ให้ secret ที่ไม่ควรเปิดเผย เพราะตัวแปร `VITE_*` จะถูกฝังใน browser bundle
- `vercel.json` แยก API ออกจาก SPA fallback แล้ว ป้องกันไม่ให้ `/api/trpc` ถูกส่งไปเป็น `index.html`
- `server.ts` ไม่เรียก `app.listen()` จึงเหมาะกับ lifecycle แบบ serverless ของ Vercel
- ห้ามนำ `dist/`, `public/` ที่ build แล้ว หรือ `.manus-logs/` เข้า GitHub
