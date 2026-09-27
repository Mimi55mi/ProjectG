# อัปโหลด MoonBrew ไป GitHub และตั้งค่า Vercel

## สำคัญ: แตก ZIP ก่อน

GitHub จะเก็บ ZIP เป็นไฟล์แนบใน repository ไม่ได้แตกไฟล์ให้เป็น source code อัตโนมัติ ให้แตก ZIP ลงเครื่องก่อน แล้วอัปโหลด **ไฟล์และโฟลเดอร์ทั้งหมดภายใน ZIP** เข้า repository (ไม่ใช่อัปโหลด ZIP ไฟล์เดียว)

ZIP เวอร์ชันนี้วางไฟล์โปรเจกต์ไว้ที่ระดับบนสุด หลังแตกไฟล์แล้วควรเห็นรายการเหล่านี้ทันที:

```text
package.json
pnpm-lock.yaml
vite.config.ts
client/
server/
shared/
drizzle/
```

## ตรวจโครงสร้างที่ GitHub

ในหน้าแรกของ repository ต้องเห็น `package.json`, `vite.config.ts` และโฟลเดอร์ `client/` อยู่ระดับเดียวกัน จากนั้นตรวจว่ามีไฟล์เหล่านี้:

```text
client/index.html
client/src/main.tsx
```

ข้อผิดพลาดจาก Vercel:

```text
Failed to resolve /src/main.tsx from /vercel/path0/client/index.html
```

หมายความว่า commit/branch ที่ Vercel checkout มาไม่มี `client/src/main.tsx` ในตำแหน่งที่ Vite คาดไว้ หรือ Vercel เลือก Root Directory ไปยังโฟลเดอร์ผิด ให้ตรวจ branch/commit ล่าสุด และให้ Root Directory ชี้ไปยังโฟลเดอร์ที่มี `package.json`, `vite.config.ts` และ `client/` พร้อมกัน อย่าตั้ง Root Directory เป็น `client/` สำหรับโครงสร้าง ZIP นี้

## ค่าพื้นฐานบน Vercel

- Build command: `pnpm build`
- Frontend output directory: `dist/public` (หากต้องกรอกเอง)
- เลือก Root Directory ที่มี `package.json` และ `client/` อยู่ด้วยกัน

คำเตือน `%VITE_ANALYTICS_ENDPOINT%` และ `%VITE_ANALYTICS_WEBSITE_ID%` เป็นคำเตือนเรื่อง analytics ที่ไม่มีค่า environment; ข้อผิดพลาดที่หยุด build ตาม log ที่ให้มาคือ Vite หา `client/src/main.tsx` ไม่พบ

> โปรเจกต์นี้เป็น full-stack และอาศัย Manus auth/database/API อยู่ การที่ frontend build ผ่านไม่ได้แปลว่า backend `/api/trpc` พร้อมใช้งานบน static hosting โดยอัตโนมัติ ต้องตั้งค่าบริการและ environment ที่เกี่ยวข้องใน runtime ที่รองรับด้วย

## การทดสอบในแพ็กเกจ

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

อย่าอัปโหลด `.env`, API keys หรือ credentials ไป GitHub
