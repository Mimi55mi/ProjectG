# อัปโหลด MoonBrew ไป GitHub และ Vercel

## สิ่งที่ต้องรู้

เวอร์ชันนี้ใช้ LocalStorage สำหรับตารางคะแนน จึงไม่ต้องสร้าง Google Sheet, database หรือ API เพิ่ม

คะแนนจะเก็บเฉพาะ browser/เครื่องนั้น ผู้เล่นหลายเครื่องจะไม่ใช้ตารางเดียวกัน

## GitHub

1. ดาวน์โหลดและแตก `ProjectG-vercel-ready.zip`
2. เข้า repository ที่ต้องการใช้
3. อัปโหลดไฟล์และโฟลเดอร์ **ด้านใน ZIP** ไปที่ root repository
4. ตรวจว่าไฟล์เหล่านี้อยู่ที่ root:

   ```text
   package.json
   pnpm-lock.yaml
   vercel.json
   server.ts
   client/
   server/
   shared/
   ```

5. กด **Commit changes**

ห้ามอัปโหลด `node_modules/`, `.env`, credentials, `dist/` หรือ build output

## Vercel

1. เข้า Vercel แล้วกด **Add New → Project**
2. Import GitHub repository
3. ตรวจค่าให้เป็น:

   ```text
   Framework Preset: Vite
   Build Command: pnpm build:vercel
   Output Directory: public
   Install Command: pnpm install --frozen-lockfile
   ```

4. กด **Deploy**

ไม่ต้องเพิ่ม Environment Variables เพื่อใช้ระบบคะแนนของหน้าเกม

## ทดสอบ

1. เปิดเว็บที่ Vercel สร้างให้
2. เล่นเกมจนจบ
3. ใส่ชื่อผู้เล่นแล้วกด **บันทึกคะแนนไว้ในเครื่อง**
4. เข้าเมนู Ranking
5. ควรเห็นคะแนนที่บันทึกไว้

ถ้าใช้เครื่องหรือ browser อื่น ตารางจะเริ่มว่าง เพราะข้อมูลไม่ได้เก็บเป็นคะแนนออนไลน์ร่วมกัน

## การล้างคะแนน

เปิด Developer Tools ของ browser แล้วใช้คำสั่งนี้ใน Console:

```js
localStorage.removeItem("moonbrew-leaderboard-fallback");
```
