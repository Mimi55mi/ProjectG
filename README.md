# ProjectG — MoonBrew Leaderboard

เว็บเกมปรุงยาที่มีตารางคะแนนออนไลน์แยกตามระดับความยาก **ง่าย / ปกติ / ยาก**

## ฟีเจอร์หลัก

- เกมปรุงยาตามสูตรและเลือกระดับความยาก
- กระดานคะแนน Top 10 รวม แยกตามระดับ
- หน้า Ranking เข้าถึงได้จากเมนู และปิดกลับหน้าแรกได้
- บันทึกชื่อและคะแนนลงฐานข้อมูลร่วม

## เทคโนโลยี

React, TypeScript, Vite, Express, tRPC, Drizzle ORM และ MySQL/TiDB

## คำสั่งพัฒนา

```bash
pnpm install
pnpm dev
```

ตรวจสอบก่อนส่งงาน:

```bash
pnpm check
pnpm test
pnpm build
```

## นำขึ้น GitHub

1. แตกไฟล์ ZIP แล้วอัปโหลดไฟล์และโฟลเดอร์ภายใน `ProjectG/` ไปยัง repository
2. หากใช้งาน Git ในเครื่อง ให้สร้าง repository แล้ว commit source และ lockfile
3. ตั้งค่าตัวแปร environment ที่จำเป็นในระบบ deploy (เช่น GitHub Actions/hosting provider) แทนการเก็บ secret ใน repository

ไฟล์ `.env`, credentials, dependencies, logs และ build output ไม่รวมอยู่ใน ZIP นี้ **ห้ามอัปโหลด secret หรือ API key ขึ้น GitHub**

> โปรเจกต์ใช้การเชื่อมต่อ authentication, database และ runtime ของ Manus WebDev อยู่ การรันบนแพลตฟอร์มอื่นอาจต้องกำหนด environment variables และบริการที่เกี่ยวข้องให้ครบก่อน
