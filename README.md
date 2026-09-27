# ProjectG — MoonBrew

เว็บเกมปรุงยาที่มีตารางคะแนน Top 10 แยกตามระดับความยาก **ง่าย / ปกติ / ยาก**

## รูปแบบคะแนน

โปรเจกต์นี้ใช้ **LocalStorage ใน browser** เป็นที่เก็บคะแนน

- ไม่ต้องสร้างฐานข้อมูล
- ไม่ต้องตั้งค่า API หรือ environment variable เพิ่ม
- อัปโหลดขึ้น GitHub และ Deploy บน Vercel แล้วใช้ได้ทันที
- คะแนนจะอยู่เฉพาะ browser และเครื่องที่เล่น
- ผู้เล่นคนอื่นหรือเครื่องอื่นจะไม่เห็นคะแนนชุดเดียวกัน
- ถ้าล้างข้อมูลเว็บไซต์ เปลี่ยน browser หรือใช้โหมดไม่เก็บข้อมูล คะแนนจะหาย

## ฟีเจอร์หลัก

- เกมปรุงยาตามสูตรและเลือกระดับความยาก
- กระดานคะแนน Top 10 แยกตามระดับ
- บันทึกชื่อผู้เล่นและคะแนนไว้ในเครื่อง
- หน้า **จัดอันดับ** เข้าถึงได้จากเมนู
- ปุ่มด้านบนเป็น **สารานุกรมวัตถุดิบ** แทนปุ่มเพลง
- รองรับ React Router deep links บน Vercel

## เทคโนโลยี

React, TypeScript, Vite, Express, tRPC, Drizzle ORM และ MySQL/TiDB สำหรับ server code เดิม โดยหน้าเกมใช้ LocalStorage สำหรับคะแนน

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

## นำขึ้น GitHub และ Vercel

1. แตก ZIP แล้วอัปโหลด **ไฟล์และโฟลเดอร์ภายใน** ไปยัง root ของ repository
2. หน้าแรกของ repository ต้องเห็น `package.json`, `vercel.json`, `server.ts` และโฟลเดอร์ `client/` พร้อมกัน
3. ห้ามอัปโหลด `.env`, credentials, `node_modules/`, `dist/`, `public/` ที่เป็น build output หรือ log files
4. Import repository เข้า Vercel แล้วใช้ค่าที่กำหนดใน `vercel.json`
5. ไม่ต้องตั้ง `DATABASE_URL` เพื่อใช้ตารางคะแนนของหน้าเกม

ไฟล์ `vercel.json` ตั้งค่า `pnpm build:vercel`, output directory เป็น `public/`, API routing และ SPA fallback ไว้แล้ว

อ่านขั้นตอนเต็มได้ที่ [GITHUB_VERCEL_UPLOAD.md](./GITHUB_VERCEL_UPLOAD.md)
