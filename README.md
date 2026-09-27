# ProjectG — MoonBrew Leaderboard

เว็บเกมปรุงยาที่มีตารางคะแนนออนไลน์แยกตามระดับความยาก **ง่าย / ปกติ / ยาก**

## ฟีเจอร์หลัก

- เกมปรุงยาตามสูตรและเลือกระดับความยาก
- กระดานคะแนน Top 10 รวม แยกตามระดับ
- หน้า Ranking เข้าถึงได้จากเมนู และปิดกลับหน้าแรกได้
- บันทึกชื่อและคะแนนลงฐานข้อมูลร่วมเมื่อกำหนด `DATABASE_URL`
- รองรับ React Router deep links บน Vercel

## เทคโนโลยี

React, TypeScript, Vite, Express, tRPC, Drizzle ORM และ MySQL/TiDB

## คำสั่งพัฒนา

```bash
pnpm install --frozen-lockfile
pnpm dev
```

ตรวจสอบก่อนส่งงาน:

```bash
pnpm check
pnpm test
pnpm build
```

- `pnpm build` ตรวจทั้ง frontend และ local Express server bundle
- `pnpm build:vercel` สร้าง frontend ไปที่ root `public/` สำหรับ Vercel

## นำขึ้น GitHub

1. แตก ZIP แล้วอัปโหลด **ไฟล์และโฟลเดอร์ภายใน** ไปยัง root ของ repository
2. หน้าแรกของ repository ต้องเห็น `package.json`, `vercel.json`, `server.ts` และโฟลเดอร์ `client/` พร้อมกัน
3. ห้ามอัปโหลด `.env`, credentials, `node_modules/`, `dist/`, `public/` ที่เป็น build output หรือ log files

## Deploy บน Vercel

ไฟล์ `vercel.json` ตั้งค่าให้แล้ว โดยใช้ `pnpm build:vercel`, กำหนด output directory เป็น `public/`, เสิร์ฟ frontend จาก `public/` และส่ง `/api/*` เข้า Express Function ใน `server.ts` ส่วนเส้นทาง React Router จะ fallback ไป `index.html` โดยไม่กระทบ API

ตั้งค่า environment variables จาก `.env.example` ใน Vercel Project Settings โดยเฉพาะ `DATABASE_URL` หากต้องการให้ leaderboard บันทึกคะแนนได้ และค่า Manus OAuth/API หากเปิดใช้งานฟีเจอร์เหล่านั้น

อ่านขั้นตอนเต็มได้ที่ [GITHUB_VERCEL_UPLOAD.md](./GITHUB_VERCEL_UPLOAD.md)
