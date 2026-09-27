import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Home,
  Search,
  Sparkles,
  Timer,
  Trophy,
  Wand2,
  X,
  Heart,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  confirmedGameRoute,
  normalizeLeaderboardName,
  topTenLeaderboardEntries,
} from "../../shared/leaderboard";
import "./App.css";
import "./Leaderboard.css";

type Rarity = "ธรรมดา" | "ดี" | "หายาก" | "ตำนาน";
type DifficultyKey = "easy" | "normal" | "hard";
type BrewStatus =
  | "idle"
  | "preparing"
  | "ready"
  | "brewing"
  | "success"
  | "failure";
type Popup = { correct: boolean; points: number; message: string } | null;

type Ingredient = {
  id: string;
  name: string;
  element: string;
  icon: string;
  color: string;
  rarity: Rarity;
};
type Recipe = {
  id: string;
  name: string;
  effect: string;
  method: string;
  rarity: Rarity;
  xp: number;
  icon: string;
  color: string;
  ingredients: string[];
};

const ingredientSeed: Array<[string, string, string, string, string, Rarity]> =
  [
    ["moon-petal", "กลีบดวงจันทร์", "จันทร์", "🌙", "#9ddcff", "ธรรมดา"],
    ["ember-root", "รากเปลวไฟ", "เพลิง", "🔥", "#ffae76", "ดี"],
    ["starlight-fern", "เฟิร์นแสงดาว", "นภา", "✨", "#c9b8ff", "หายาก"],
    ["dream-pearl", "ไข่มุกความฝัน", "ฝัน", "🫧", "#bcebdc", "ดี"],
    ["shadow-vine", "เถาเงามืด", "ราตรี", "🌑", "#9b9fff", "หายาก"],
    ["sunstone", "หินอาทิตย์", "อาทิตย์", "☀️", "#f6d889", "ดี"],
    ["glowmoss", "ไลท์มอส", "พฤกษา", "🌿", "#9ee5a9", "ธรรมดา"],
    ["moon-ash", "เถ้าจันทร์", "วอยด์", "🌌", "#d8d0ff", "ตำนาน"],
    ["luna-bloom", "ดอกลูน่า", "บุปผา", "🌸", "#ffc9e5", "ดี"],
    ["mist-rose", "กุหลาบหมอก", "สายลม", "🌹", "#f5bfd4", "ดี"],
    ["violet-fern", "ใบไวโอเล็ต", "เมฆา", "🪻", "#c8a9ff", "หายาก"],
    ["crystal-silk", "ใยคริสตัล", "ธารา", "💎", "#a5e1ff", "หายาก"],
    ["petal-rain", "เมล็ดฝนพร่าง", "พิรุณ", "💧", "#9eeaf0", "ธรรมดา"],
    ["silver-thorn", "หนามเงิน", "แรงกด", "🌟", "#e5e4ff", "ตำนาน"],
    ["honeycomb", "รวงผึ้งทอง", "หวาน", "🍯", "#ffd875", "ธรรมดา"],
    ["fairy-mushroom", "เห็ดภูตจิ๋ว", "ภูต", "🍄", "#ff9eb7", "ดี"],
    ["cloudberry", "เบอร์รี่เมฆา", "เมฆา", "🫐", "#a9b7ff", "ธรรมดา"],
    ["sea-glass", "แก้วทะเล", "สมุทร", "🪸", "#88e3d8", "หายาก"],
    ["cinnamon-bark", "เปลือกอบเชย", "อุ่น", "🪵", "#d58d69", "ธรรมดา"],
    ["rainbow-seed", "เมล็ดสายรุ้ง", "รุ้ง", "🌈", "#f3a7d7", "ตำนาน"],
  ];
const ingredients: Ingredient[] = ingredientSeed.map(
  ([id, name, element, icon, color, rarity]) => ({
    id,
    name,
    element,
    icon,
    color,
    rarity,
  })
);

const recipeSeed: Array<
  [string, string, string, string, Rarity, number, string, string, string[]]
> = [
  [
    "luna-repair",
    "ยาฟื้นฟูดวงจันทร์",
    "ฟื้นฟูสมาธิและทำให้ใจสงบ",
    "คั้นกลีบจันทร์กับไข่มุกความฝัน แล้วกวนใต้แสงจันทร์",
    "ดี",
    35,
    "🧴",
    "#9ddcff",
    ["moon-petal", "dream-pearl", "glowmoss"],
  ],
  [
    "violet-surge",
    "สายชาร์จวิโอเล็ต",
    "เพิ่มความกระจ่างทางเวทมนตร์",
    "โรยเฟิร์นแสงดาวลงบนหินอาทิตย์จนเกิดประกายม่วง",
    "หายาก",
    65,
    "🧪",
    "#c1a7ff",
    ["dream-pearl", "starlight-fern", "sunstone"],
  ],
  [
    "midnight-sleep",
    "ยานอนกลางดึก",
    "ปลอบประสาทและทำให้ฝันดี",
    "ต้มกลีบจันทร์กับใบไวโอเล็ตแล้วปิดฝาให้สนิท",
    "หายาก",
    70,
    "🌙",
    "#a4b1ff",
    ["moon-petal", "violet-fern", "glowmoss"],
  ],
  [
    "dawn-ward",
    "คุ้มกันรุ่งอรุณ",
    "สร้างเกราะแสงอุ่นรอบตัว",
    "บดรากไฟกับเถ้าจันทร์ แล้วเติมหินอาทิตย์ทีละน้อย",
    "ตำนาน",
    95,
    "✨",
    "#f4d886",
    ["shadow-vine", "ember-root", "moon-ash"],
  ],
  [
    "rose-spark",
    "ประกายกุหลาบ",
    "ปล่อยพลังพรายและความอบอุ่น",
    "อบดอกลูน่ากับกุหลาบหมอกด้วยไฟอ่อน",
    "ดี",
    42,
    "🌹",
    "#ffc0d8",
    ["luna-bloom", "mist-rose", "moon-petal"],
  ],
  [
    "mist-mirror",
    "กระจกหมอก",
    "สะท้อนความคิดและปกป้องลมหายใจ",
    "กวนใยคริสตัลกับเมล็ดฝนให้ใสเหมือนกระจก",
    "หายาก",
    72,
    "🔮",
    "#aee8ff",
    ["crystal-silk", "petal-rain", "violet-fern"],
  ],
  [
    "moon-bloom",
    "ช่อดอกวิญญาณ",
    "คลี่คลายความเครียดและเพิ่มความรัก",
    "ทาบหนามเงินบนดอกลูน่าแล้วเป่าลมหายใจเบา ๆ",
    "ตำนาน",
    80,
    "🌷",
    "#ffcfef",
    ["silver-thorn", "moon-ash", "luna-bloom"],
  ],
  [
    "golden-honey",
    "น้ำผึ้งดาวตก",
    "เติมกำลังใจและพลังงาน",
    "ละลายรวงผึ้งทองกับหินอาทิตย์ในหม้ออุ่น",
    "ดี",
    48,
    "🍯",
    "#ffd878",
    ["honeycomb", "sunstone", "starlight-fern"],
  ],
  [
    "fairy-tea",
    "ชาภูตจิ๋ว",
    "ทำให้ร่างกายเบาและเคลื่อนไหวไว",
    "บดเห็ดภูตกับไลท์มอส แล้วเติมกุหลาบหมอก",
    "ธรรมดา",
    28,
    "🍄",
    "#ffadc4",
    ["fairy-mushroom", "glowmoss", "mist-rose"],
  ],
  [
    "cloud-kiss",
    "จุมพิตก้อนเมฆ",
    "ลอยตัวได้ชั่วครู่",
    "บดเบอร์รี่เมฆากับไข่มุกฝันให้เป็นเนื้อครีม",
    "ดี",
    44,
    "🫐",
    "#b0baff",
    ["cloudberry", "dream-pearl", "petal-rain"],
  ],
  [
    "sea-lullaby",
    "เพลงกล่อมทะเล",
    "สร้างเสียงคลื่นช่วยให้หลับลึก",
    "แช่แก้วทะเลกับดอกลูน่าในน้ำเย็น",
    "หายาก",
    68,
    "🪸",
    "#8de5d6",
    ["sea-glass", "luna-bloom", "moon-petal"],
  ],
  [
    "warm-heart",
    "หัวใจอบอุ่น",
    "ต้านทานความหนาวและความกลัว",
    "ต้มอบเชยกับรากไฟ แล้วคนตามเข็มนาฬิกา",
    "ธรรมดา",
    30,
    "❤️",
    "#ff9d9d",
    ["cinnamon-bark", "ember-root", "honeycomb"],
  ],
  [
    "rainbow-prism",
    "ปริซึมสายรุ้ง",
    "เปลี่ยนเวทมนตร์ให้เป็นสีรุ้ง",
    "ใส่เมล็ดสายรุ้งลงท้ายสุดและห้ามคนแรงเกินไป",
    "ตำนาน",
    110,
    "🌈",
    "#f2a9d7",
    ["rainbow-seed", "crystal-silk", "sunstone"],
  ],
  [
    "night-vision",
    "ตาแมวราตรี",
    "มองเห็นในความมืดได้ชัดเจน",
    "หมักเถาเงากับแก้วทะเลและเถ้าจันทร์",
    "หายาก",
    78,
    "🐈‍⬛",
    "#9d9cf4",
    ["shadow-vine", "sea-glass", "moon-ash"],
  ],
  [
    "star-cookie",
    "คุกกี้ดาวหวาน",
    "เพิ่มพลังใจให้เต็มเปี่ยม",
    "บดรวงผึ้งกับเบอร์รี่ แล้วโปรยเมล็ดสายรุ้ง",
    "ธรรมดา",
    32,
    "🍪",
    "#ffd993",
    ["honeycomb", "cloudberry"],
  ],
  [
    "petal-shield",
    "โล่กลีบแก้ว",
    "สร้างเกราะกลีบดอกไม้รอบตัว",
    "กวนกลีบจันทร์กับใยคริสตัลให้เป็นวงแหวน",
    "หายาก",
    75,
    "🛡️",
    "#c3d7ff",
    ["moon-petal", "crystal-silk", "luna-bloom", "silver-thorn"],
  ],
  [
    "ember-elixir",
    "น้ำยาเปลวอุ่น",
    "เพิ่มพลังไฟและความกล้า",
    "ต้มรากไฟกับอบเชยแล้วเติมน้ำผึ้ง",
    "ดี",
    52,
    "🔥",
    "#ffb377",
    ["ember-root", "cinnamon-bark", "honeycomb"],
  ],
  [
    "cloud-crown",
    "มงกุฎเมฆา",
    "ลอยเหนือพื้นและมองเห็นไกล",
    "ผสมเบอร์รี่เมฆา ไข่มุกฝัน และใบไวโอเล็ตทีละชั้น",
    "หายาก",
    86,
    "👑",
    "#b9c4ff",
    ["cloudberry", "dream-pearl", "violet-fern"],
  ],
  [
    "void-orbit",
    "วงโคจรวอยด์",
    "บิดเบือนเงาให้หายตัวได้",
    "หมักเถ้าจันทร์กับเถาเงา แล้วปิดผนึกด้วยหนามเงิน",
    "ตำนาน",
    125,
    "🪐",
    "#b5a9ff",
    ["moon-ash", "shadow-vine", "silver-thorn", "rainbow-seed"],
  ],
  [
    "aurora-brew",
    "แสงเหนือในขวด",
    "ปล่อยแสงสีสวยยามค่ำคืน",
    "ผสมแก้วทะเล เมล็ดสายรุ้ง และเฟิร์นแสงดาวอย่างช้า ๆ",
    "ตำนาน",
    140,
    "🌌",
    "#9ee8de",
    [
      "sea-glass",
      "rainbow-seed",
      "starlight-fern",
      "dream-pearl",
      "luna-bloom",
    ],
  ],
  [
    "double-moon-tea",
    "ชาจันทร์คู่",
    "ทำให้ความคิดนิ่งและมองเห็นทางเลือกมากขึ้น",
    "ใส่กลีบดวงจันทร์ แล้วค่อยเติมไข่มุกความฝันกับไลท์มอส",
    "ดี",
    58,
    "🍵",
    "#b9ddff",
    ["moon-petal", "dream-pearl", "glowmoss"],
  ],
  [
    "ember-heart-cake",
    "เค้กหัวใจเพลิง",
    "เติมพลังใจด้วยความอุ่นจากเปลวไฟ",
    "ใส่รากเปลวไฟ ก่อนปิดท้ายด้วยรวงผึ้งทอง อบเชย และเบอร์รี่เมฆา",
    "ดี",
    64,
    "🧁",
    "#ffb18e",
    ["ember-root", "honeycomb", "cinnamon-bark", "cloudberry"],
  ],

  [
    "common-starlight-tea",
    "ชาดาวอุ่น",
    "ปลอบใจและเพิ่มสมาธิ",
    "ชงเบอร์รี่กับรวงผึ้งจนหอม",
    "ธรรมดา",
    24,
    "🍵",
    "#ffd9a8",
    ["cloudberry", "honeycomb"],
  ],
  [
    "common-rain-drop",
    "หยดฝนใส",
    "คืนความสดชื่น",
    "แช่เมล็ดฝนกับแก้วทะเล",
    "ธรรมดา",
    26,
    "💧",
    "#bcecf2",
    ["petal-rain", "sea-glass"],
  ],
  [
    "common-moss-cookie",
    "คุกกี้มอส",
    "ช่วยให้ใจสงบ",
    "อบไลท์มอสกับอบเชย",
    "ธรรมดา",
    28,
    "🍪",
    "#b9e5b4",
    ["glowmoss", "cinnamon-bark"],
  ],
  [
    "common-sun-honey",
    "น้ำผึ้งอาทิตย์",
    "เพิ่มความอบอุ่น",
    "ละลายรวงผึ้งกับหินอาทิตย์",
    "ธรรมดา",
    30,
    "🍯",
    "#ffe18c",
    ["honeycomb", "sunstone"],
  ],
  [
    "common-rose-milk",
    "นมกุหลาบหมอก",
    "ทำให้ร่างกายเบา",
    "คนกุหลาบกับไข่มุกความฝัน",
    "ธรรมดา",
    32,
    "🥛",
    "#ffcfe0",
    ["mist-rose", "dream-pearl"],
  ],
  [
    "common-moon-salt",
    "เกลือจันทร์",
    "เสริมพลังป้องกัน",
    "บดกลีบจันทร์กับหนามเงิน",
    "ธรรมดา",
    34,
    "🧂",
    "#d9ddff",
    ["moon-petal", "silver-thorn"],
  ],
  [
    "common-fairy-jam",
    "แยมภูต",
    "เพิ่มความคล่องตัว",
    "กวนเห็ดภูตกับดอกลูน่า",
    "ธรรมดา",
    36,
    "🍓",
    "#ffb5c9",
    ["fairy-mushroom", "luna-bloom"],
  ],
  [
    "common-cloud-ink",
    "หมึกเมฆา",
    "ทำให้ความคิดลื่นไหล",
    "คั้นเบอร์รี่กับใบไวโอเล็ต",
    "ธรรมดา",
    38,
    "🫐",
    "#c5caff",
    ["cloudberry", "violet-fern"],
  ],
  [
    "uncommon-fern-fizz",
    "โซดาเฟิร์น",
    "ปล่อยประกายรอบตัว",
    "ผสมเฟิร์นกับเมล็ดฝนและไข่มุก",
    "ดี",
    48,
    "🫧",
    "#b9f0dc",
    ["starlight-fern", "petal-rain", "dream-pearl"],
  ],
  [
    "uncommon-ember-tea",
    "ชาเปลวอ่อน",
    "เติมความกล้า",
    "ต้มรากไฟกับอบเชยและน้ำผึ้ง",
    "ดี",
    50,
    "🍵",
    "#ffbe91",
    ["ember-root", "cinnamon-bark", "honeycomb"],
  ],
  [
    "uncommon-sea-breeze",
    "ลมทะเลในขวด",
    "ทำให้ใจเย็น",
    "เขย่าแก้วทะเลกับดอกลูน่าและกุหลาบ",
    "ดี",
    52,
    "🧴",
    "#a9e9e0",
    ["sea-glass", "luna-bloom", "mist-rose"],
  ],
  [
    "uncommon-shadow-soup",
    "ซุปเงานุ่ม",
    "ช่วยให้หลับลึก",
    "เคี่ยวเถาเงากับไลท์มอสและเห็ดภูต",
    "ดี",
    54,
    "🍲",
    "#b9b8e8",
    ["shadow-vine", "glowmoss", "fairy-mushroom"],
  ],
  [
    "uncommon-rainbow-mist",
    "หมอกสายรุ้ง",
    "เพิ่มสีสันให้เวทมนตร์",
    "โปรยเมล็ดรุ้งบนไข่มุกและเฟิร์น",
    "หายาก",
    58,
    "🌈",
    "#f5c7e6",
    ["rainbow-seed", "dream-pearl", "starlight-fern"],
  ],
  [
    "uncommon-crystal-bloom",
    "ดอกแก้วคริสตัล",
    "สะท้อนแสงรอบตัว",
    "แช่ใยคริสตัลกับดอกไม้และน้ำฝน",
    "หายาก",
    60,
    "💠",
    "#bfeaff",
    ["crystal-silk", "luna-bloom", "petal-rain"],
  ],
  [
    "uncommon-silver-rose",
    "กุหลาบเงิน",
    "สร้างเกราะลมบาง ๆ",
    "พันหนามเงินกับกุหลาบและกลีบจันทร์",
    "หายาก",
    62,
    "🌹",
    "#e3d9ff",
    ["silver-thorn", "mist-rose", "moon-petal"],
  ],
  [
    "uncommon-void-lantern",
    "โคมวอยด์",
    "ส่องทางในความมืด",
    "จุดเถ้าจันทร์กับหินอาทิตย์และเถาเงา",
    "หายาก",
    64,
    "🏮",
    "#c5b8ff",
    ["moon-ash", "sunstone", "shadow-vine"],
  ],
  [
    "rare-sky-shield",
    "เกราะฟ้าคราม",
    "ป้องกันเวทแรง",
    "กวนใยคริสตัลกับเฟิร์นและหนามเงิน",
    "หายาก",
    80,
    "🛡️",
    "#a9d7ff",
    ["crystal-silk", "starlight-fern", "silver-thorn", "sunstone"],
  ],
  [
    "rare-moon-garden",
    "สวนจันทร์ลับ",
    "ทำให้ฝันเป็นจริง",
    "เรียงกลีบจันทร์ ดอกไม้ เถาวอยด์ และไข่มุก",
    "หายาก",
    84,
    "🌺",
    "#e4c8ff",
    ["moon-petal", "luna-bloom", "moon-ash", "dream-pearl"],
  ],
  [
    "rare-fire-tide",
    "คลื่นเพลิง",
    "ควบคุมไฟและน้ำพร้อมกัน",
    "ผสมรากไฟกับฝน แก้วทะเล และอบเชย",
    "หายาก",
    88,
    "🌊",
    "#ffbf9e",
    ["ember-root", "petal-rain", "sea-glass", "cinnamon-bark"],
  ],
  [
    "rare-cloud-armor",
    "เกราะเมฆา",
    "ลอยตัวได้นานขึ้น",
    "กวนเบอร์รี่ ใบไวโอเล็ต เฟิร์น และใยแก้ว",
    "หายาก",
    90,
    "☁️",
    "#c4d2ff",
    ["cloudberry", "violet-fern", "starlight-fern", "crystal-silk"],
  ],
  [
    "rare-rose-comet",
    "ดาวหางกุหลาบ",
    "เพิ่มความเร็วเวทมนตร์",
    "เร่งกุหลาบด้วยเมล็ดรุ้งและหินอาทิตย์",
    "หายาก",
    92,
    "☄️",
    "#ffc3db",
    ["mist-rose", "rainbow-seed", "sunstone", "luna-bloom"],
  ],
  [
    "rare-fairy-crown",
    "มงกุฎภูต",
    "เรียกผู้ช่วยตัวจิ๋ว",
    "บดเห็ดกับไลท์มอส น้ำผึ้ง และดอกไม้",
    "หายาก",
    94,
    "👑",
    "#ffd1df",
    ["fairy-mushroom", "glowmoss", "honeycomb", "luna-bloom"],
  ],
  [
    "rare-night-sea",
    "ทะเลราตรี",
    "มองเห็นเวทที่ซ่อนอยู่",
    "หมักเถาเงากับแก้วทะเล เถ้าจันทร์ และฝน",
    "ตำนาน",
    96,
    "🌌",
    "#aaa8e9",
    ["shadow-vine", "sea-glass", "moon-ash", "petal-rain"],
  ],
  [
    "rare-solar-prism",
    "ปริซึมสุริยะ",
    "แยกแสงเป็นเวทหลายสาย",
    "เรียงหินอาทิตย์ ใยแก้ว เฟิร์น และเมล็ดรุ้ง",
    "ตำนาน",
    98,
    "🔆",
    "#ffe69f",
    ["sunstone", "crystal-silk", "starlight-fern", "rainbow-seed"],
  ],
  [
    "legendary-moon-ocean",
    "มหาสมุทรจันทร์",
    "เปิดประตูสู่ความฝัน",
    "รวมแก้วทะเล กลีบจันทร์ ไข่มุก และเถ้าจันทร์",
    "ตำนาน",
    150,
    "🌙",
    "#b9b5ff",
    ["sea-glass", "moon-petal", "dream-pearl", "moon-ash", "luna-bloom"],
  ],
  [
    "legendary-star-forge",
    "เตาหลอมดวงดาว",
    "สร้างพลังงานไร้ขีดจำกัด",
    "หลอมรากไฟ หินอาทิตย์ เฟิร์น ใยแก้ว และหนามเงิน",
    "ตำนาน",
    160,
    "⭐",
    "#ffe08d",
    [
      "ember-root",
      "sunstone",
      "starlight-fern",
      "crystal-silk",
      "silver-thorn",
    ],
  ],
  [
    "legendary-void-rose",
    "กุหลาบแห่งวอยด์",
    "ปกป้องจากคำสาปทุกชนิด",
    "ผสานเถาเงา กุหลาบ เมล็ดรุ้ง เถ้าจันทร์ และไข่มุก",
    "ตำนาน",
    170,
    "🥀",
    "#bca8e9",
    ["shadow-vine", "mist-rose", "rainbow-seed", "moon-ash", "dream-pearl"],
  ],
  [
    "legendary-fairy-sky",
    "ฟ้าภูตนิรันดร์",
    "เรียกแสงเหนือมาคุ้มครอง",
    "ต้มเห็ด ไลท์มอส ดอกไม้ เบอร์รี่ และเฟิร์น",
    "ตำนาน",
    180,
    "🧚",
    "#c6f0cf",
    [
      "fairy-mushroom",
      "glowmoss",
      "luna-bloom",
      "cloudberry",
      "starlight-fern",
    ],
  ],
  [
    "legendary-rainbow-sea",
    "ทะเลสายรุ้ง",
    "เปลี่ยนโลกเป็นสีสัน",
    "ร้อยเมล็ดรุ้ง แก้วทะเล ฝน ดอกไม้ และหินอาทิตย์",
    "ตำนาน",
    190,
    "🌈",
    "#f4bde1",
    ["rainbow-seed", "sea-glass", "petal-rain", "luna-bloom", "sunstone"],
  ],
  [
    "legendary-crystal-night",
    "ราตรีคริสตัล",
    "หยุดเวลาในชั่วขณะ",
    "ผนึกใยแก้วกับเถามืด หนามเงิน เถ้าจันทร์ และอบเชย",
    "ตำนาน",
    200,
    "🔮",
    "#c8baff",
    [
      "crystal-silk",
      "shadow-vine",
      "silver-thorn",
      "moon-ash",
      "cinnamon-bark",
    ],
  ],
  [
    "legendary-sun-moon",
    "สุริยันจันทรา",
    "สมดุลพลังตรงข้าม",
    "ผสานหินอาทิตย์กับกลีบจันทร์ รากไฟ ไข่มุก และเมล็ดรุ้ง",
    "ตำนาน",
    210,
    "☯️",
    "#ffd49b",
    ["sunstone", "moon-petal", "ember-root", "dream-pearl", "rainbow-seed"],
  ],
  [
    "legendary-dream-kingdom",
    "อาณาจักรความฝัน",
    "สร้างโลกฝันชั่วนิรันดร์",
    "รวมวัตถุดิบแห่งฝันทั้งห้าชนิดด้วยแสงดาว",
    "ตำนาน",
    220,
    "🏰",
    "#ddbfff",
    ["dream-pearl", "violet-fern", "cloudberry", "moon-ash", "starlight-fern"],
  ],
];
const recipes: Recipe[] = recipeSeed.map(
  ([id, name, effect, method, rarity, xp, icon, color, ingredientIds]) => ({
    id,
    name,
    effect,
    method,
    rarity,
    xp,
    icon,
    color,
    ingredients: ingredientIds,
  })
);
const difficulty = {
  easy: {
    label: "ง่าย",
    lives: 3,
    maxStages: 6,
    baseTime: 24,
    desc: "ฝึกมือได้สบาย",
  },
  normal: {
    label: "ปกติ",
    lives: 2,
    maxStages: 5,
    baseTime: 20,
    desc: "ต้องแม่นยำ",
  },
  hard: {
    label: "ยาก",
    lives: 1,
    maxStages: 4,
    baseTime: 16,
    desc: "พลาดแล้วจบทันที",
  },
} as const;
const navItems = [
  { label: "หน้าแรก", to: "/", icon: Home },
  { label: "สูตรยา", to: "/recipes", icon: BookOpen },
  { label: "Ranking", to: "/ranking", icon: Trophy },
  { label: "วิธีการเล่น", to: "/how-to-play", icon: CircleHelp },
];
const ingredientById = (id: string) => ingredients.find(item => item.id === id);
const recipePool = (key: DifficultyKey) =>
  recipes.filter(recipe => {
    const rarity = tierName(recipe.ingredients.length);
    return key === "easy"
      ? rarity === "COMMON" || rarity === "UNCOMMON"
      : key === "normal"
        ? rarity === "UNCOMMON" || rarity === "RARE"
        : rarity === "RARE" || rarity === "LEGENDARY";
  });
const pickRecipe = (key: DifficultyKey, seed: number, excludeId?: string) => {
  const pool = recipePool(key).filter(recipe => recipe.id !== excludeId);
  return (
    pool[(Math.floor(Math.random() * pool.length) + seed) % pool.length] ??
    recipes[0]
  );
};
const tierName = (count: number) =>
  count <= 2
    ? "COMMON"
    : count === 3
      ? "UNCOMMON"
      : count === 4
        ? "RARE"
        : "LEGENDARY";

function AppShell() {
  const location = useLocation();
  return (
    <div className="moonbrew-shell">
      <div className="stars-layer" />
      <div className="mist-layer" />
      <header className="topbar">
        <Link to="/" className="brand">
          <div className="brand-mark">
            <span className="moon-icon">☾</span>
          </div>
          <div>
            <div className="brand-kicker">MOONBREW</div>
            <div className="brand-title">ห้องปรุงยาจันทรา</div>
          </div>
        </Link>
        <Link to="/recipes" className="guide-toggle">
          <BookOpen />
          สารานุกรมวัตถุดิบ
        </Link>
      </header>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-label">เมนูห้องปรุงยา</div>
          <nav>
            {navItems.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={
                  location.pathname === to ? "nav-link active" : "nav-link"
                }
              >
                <Icon />
                {label}
                <ArrowRight className="nav-arrow" />
              </Link>
            ))}
          </nav>
          <div className="side-note">
            <Sparkles />
            <b>เคล็ดลับวันนี้</b>
            <p>ใส่ส่วนผสมตามลำดับ สูตรยิ่งยากยิ่งได้คะแนนสูง!</p>
          </div>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/start" element={<DifficultySelectView />} />
            <Route path="/brew" element={<BrewView />} />
            <Route path="/recipes" element={<RecipesView />} />
            <Route path="/ranking" element={<RankingView />} />
            <Route path="/how-to-play" element={<HowToPlayView />} />
          </Routes>
        </main>
      </div>
      <div className="mobile-nav">
        {navItems.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={location.pathname === to ? "active" : ""}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function HomeView() {
  const [palette, setPalette] = useState(0);
  const palettes = [
    { name: "จันทร์ชมพู", bg: "cover-pink", icon: "🌙" },
    { name: "ป่ามหัศจรรย์", bg: "cover-green", icon: "🌿" },
    { name: "ท้องฟ้าฝัน", bg: "cover-blue", icon: "⭐" },
  ];
  const theme = palettes[palette];
  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles /> โรงงานเวทมนตร์แสงจันทร์
          </div>
          <h1>MoonBrew</h1>
          <p>ปรุงความฝันให้กลายเป็นยา ค้นพบสูตรใหม่และพิชิตด่านปรุงยาทั้งหมด</p>
          <div className="hero-actions">
            <Link to="/start" className="primary-btn">
              เริ่มเกม <ArrowRight />
            </Link>
            <Link to="/recipes" className="secondary-btn">
              เปิดสมุดสูตร
            </Link>
          </div>
          <div className="palette-picker">
            <span>เลือกบรรยากาศ</span>
            {palettes.map((item, index) => (
              <button
                key={item.name}
                aria-label={item.name}
                onClick={() => setPalette(index)}
                className={
                  palette === index ? "palette-dot selected" : "palette-dot"
                }
                style={{
                  background:
                    index === 0
                      ? "#e9a7ba"
                      : index === 1
                        ? "#91c9a1"
                        : "#9bb6eb",
                }}
              >
                {index === palette ? "✓" : ""}
              </button>
            ))}
            <b>{theme.name}</b>
          </div>
        </div>
        <div className={`hero-art ${theme.bg}`}>
          <div className="art-moon">{theme.icon}</div>
          <div className="art-spark s1">✦</div>
          <div className="art-spark s2">✧</div>
          <div className="art-shelf" />
          <div className="art-bottle bottle-a">🧪</div>
          <div className="art-bottle bottle-b">🧴</div>
          <div className="art-bottle bottle-c">🌸</div>
          <div className="art-cauldron">✦</div>
          <div className="art-steam">〰 〰</div>
        </div>
      </section>
      <section className="stat-grid">
        <StatCard icon="🧙‍♀️" label="นักปรุงยา" value="อัสเทอร์ เวล" />
        <StatCard
          icon="🏆"
          label="ด่านสูงสุด"
          value="ง่าย 6 · ปกติ 5 · ยาก 4"
        />
        <StatCard
          icon="📖"
          label="สูตรที่ค้นพบ"
          value={`${recipes.length} สูตร`}
        />
        <StatCard icon="🧪" label="ระดับยา" value="4 ระดับ" />
      </section>
    </div>
  );
}
function RankingView() {
  const navigate = useNavigate();
  const localBoards = useMemo(() => loadLocalLeaderboard(), []);
  return (
    <div className="page-stack ranking-page">
      <section className="ranking-page-header section-heading">
        <div>
          <div className="eyebrow">MOONBREW HALL OF FAME</div>
          <h1>Ranking</h1>
          <p>ตารางคะแนนสูงสุดแยกตามระดับความยาก</p>
        </div>
        <button
          type="button"
          className="secondary-btn ranking-close"
          aria-label="ปิดตารางสถิติ"
          onClick={() => navigate("/")}
        >
          <X aria-hidden="true" />
          ปิดตาราง
        </button>
      </section>
      <LeaderboardSection boards={localBoards} loading={false} error={false} />
    </div>
  );
}
function DifficultySelectView() {
  const localBoards = useMemo(() => loadLocalLeaderboard(), []);
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<DifficultyKey | null>(
    null
  );
  const [playerName, setPlayerName] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (window.localStorage.getItem("moonbrew-player-name") ?? "")
  );
  const confirmDifficulty = () => {
    if (selectedLevel === null) return;
    const normalizedName = normalizeLeaderboardName(playerName);
    const route = confirmedGameRoute(selectedLevel, playerName);
    if (!route || !normalizedName) return;
    window.localStorage.setItem("moonbrew-player-name", normalizedName);
    setSelectedLevel(null);
    navigate(route);
  };
  useEffect(() => {
    if (selectedLevel === null) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedLevel(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedLevel]);
  return (
    <div className="page-stack difficulty-select-page">
      <section className="difficulty-select-hero">
        <div className="eyebrow">
          <Sparkles /> BEGIN YOUR BREW
        </div>
        <h1>เลือกระดับความยาก</h1>
        <p>เลือกความท้าทายที่เหมาะกับคุณ แล้วเข้าสู่ห้องปรุงยา</p>
      </section>
      <section className="difficulty-select-grid">
        {(Object.keys(difficulty) as DifficultyKey[]).map(key => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedLevel(key)}
            className={`difficulty-select-card select-${key}`}
          >
            <span className="difficulty-icon">
              {key === "easy" ? "🌱" : key === "normal" ? "⚗️" : "🔥"}
            </span>
            <div>
              <b>{difficulty[key].label}</b>
              <small>
                <span className={`difficulty-hearts hearts-${key}`}>
                  {Array.from({ length: difficulty[key].lives }).map(
                    (_, index) => (
                      <Heart key={index} fill="currentColor" />
                    )
                  )}
                </span>
                · {difficulty[key].maxStages} ด่าน · {difficulty[key].desc}
              </small>
            </div>
            <ArrowRight />
          </button>
        ))}
      </section>
      <LeaderboardSection boards={localBoards} loading={false} error={false} />
      {selectedLevel !== null && (
        <div
          className="name-entry-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSelectedLevel(null);
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="name-entry-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="difficulty-name-title"
          >
            <button
              type="button"
              className="name-entry-close"
              aria-label="ปิดหน้าต่าง"
              onClick={() => setSelectedLevel(null)}
            >
              <X />
            </button>
            <div className="eyebrow">
              <Sparkles /> PLAYER RANKING
            </div>
            <h2 id="difficulty-name-title">กรอกชื่อก่อนเริ่มเล่น</h2>
            <p>
              ระดับ {difficulty[selectedLevel].label} ·
              ชื่อนี้จะแสดงในกระดานสถิติ
            </p>
            <form
              onSubmit={event => {
                event.preventDefault();
                confirmDifficulty();
              }}
            >
              <div className="name-entry-field">
                <label htmlFor="difficulty-player-name">ชื่อผู้เล่น</label>
                <input
                  id="difficulty-player-name"
                  value={playerName}
                  onChange={event => setPlayerName(event.target.value)}
                  maxLength={24}
                  autoComplete="nickname"
                  autoFocus
                  placeholder="พิมพ์ชื่อที่ต้องการแสดง"
                />
                <small>ใช้ชื่อเดียวกันตอนบันทึกคะแนนหลังจบเกม</small>
              </div>
              <div className="name-entry-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setSelectedLevel(null)}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={!normalizeLeaderboardName(playerName)}
                >
                  ยืนยัน
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="stat-card">
      <span className="stat-emoji">{icon}</span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
      </div>
    </div>
  );
}

type LeaderboardRow = {
  id: number;
  playerName: string;
  score: number;
  stages: number;
  correctCount: number;
  createdAt: Date | string;
};
type LeaderboardData = Record<DifficultyKey, LeaderboardRow[]>;

const LOCAL_LEADERBOARD_KEY = "moonbrew-leaderboard-fallback";
const leaderboardKeys: DifficultyKey[] = ["easy", "normal", "hard"];

function emptyLeaderboardData(): LeaderboardData {
  return { easy: [], normal: [], hard: [] };
}

function loadLocalLeaderboard(): LeaderboardData {
  if (typeof window === "undefined") return emptyLeaderboardData();

  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(LOCAL_LEADERBOARD_KEY) ?? "null"
    );
    if (!parsed || typeof parsed !== "object") return emptyLeaderboardData();

    return leaderboardKeys.reduce<LeaderboardData>((boards, key) => {
      const records = (parsed as Record<string, unknown>)[key];
      boards[key] = Array.isArray(records)
        ? records.filter((record): record is LeaderboardRow => {
            if (!record || typeof record !== "object") return false;
            const item = record as Record<string, unknown>;
            return (
              typeof item.id === "number" &&
              typeof item.playerName === "string" &&
              typeof item.score === "number" &&
              typeof item.stages === "number" &&
              typeof item.correctCount === "number" &&
              typeof item.createdAt === "string"
            );
          })
        : [];
      boards[key] = topTenLeaderboardEntries(boards[key]);
      return boards;
    }, emptyLeaderboardData());
  } catch {
    return emptyLeaderboardData();
  }
}

type LocalLeaderboardEntry = Omit<LeaderboardRow, "id" | "createdAt"> & {
  difficulty: DifficultyKey;
};

function saveLocalLeaderboardEntry(entry: LocalLeaderboardEntry) {
  if (typeof window === "undefined") return;

  const boards = loadLocalLeaderboard();
  const { difficulty, ...record } = entry;
  boards[difficulty] = topTenLeaderboardEntries([
    ...boards[difficulty],
    { ...record, id: -Date.now(), createdAt: new Date().toISOString() },
  ]);
  window.localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(boards));
}

function LeaderboardSection({
  boards,
  loading,
  error,
}: {
  boards: LeaderboardData | undefined;
  loading: boolean;
  error: boolean;
}) {
  const keys: DifficultyKey[] = ["easy", "normal", "hard"];
  return (
    <section className="leaderboard-card">
      <div className="section-heading">
        <div>
          <div className="eyebrow">MOONBREW HALL OF FAME</div>
          <h2>10 อันดับคะแนนสูงสุด</h2>
        </div>
        <span className="soft-badge">บันทึกในเครื่องนี้</span>
      </div>
      <div className="leaderboard-grid">
        {keys.map(key => {
          const records = boards?.[key] ?? [];
          return (
            <article
              key={key}
              className={`leaderboard-level-card leaderboard-${key}`}
            >
              <header className="leaderboard-level-heading">
                <span className="leaderboard-level-icon">
                  {key === "easy" ? "🌱" : key === "normal" ? "⚗️" : "🔥"}
                </span>
                <div>
                  <small>ระดับความยาก</small>
                  <h3>{difficulty[key].label}</h3>
                </div>
              </header>
              <div className="leaderboard-table-wrap">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th scope="col">อันดับ</th>
                      <th scope="col">นักปรุงยา</th>
                      <th scope="col">คะแนน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="leaderboard-empty">
                          กำลังโหลดคะแนน...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={3} className="leaderboard-empty">
                          โหลดตารางคะแนนไม่สำเร็จ
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="leaderboard-empty">
                          ยังไม่มีสถิติ เป็นคนแรกได้เลย!
                        </td>
                      </tr>
                    ) : (
                      records.slice(0, 10).map((record, index) => (
                        <tr key={record.id}>
                          <td>
                            <span
                              className={`leaderboard-rank rank-${index + 1}`}
                            >
                              {index < 3
                                ? ["🥇", "🥈", "🥉"][index]
                                : index + 1}
                            </span>
                          </td>
                          <td className="leaderboard-player">
                            <b>{record.playerName}</b>
                            <small>
                              ผ่าน {record.stages} ด่าน · ปรุงถูก{" "}
                              {record.correctCount}
                            </small>
                          </td>
                          <td className="leaderboard-score">
                            {record.score.toLocaleString("th-TH")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function BrewView() {
  const [searchParams] = useSearchParams();
  const requestedLevel = searchParams.get("level");
  const initialLevel: DifficultyKey =
    requestedLevel === "easy" || requestedLevel === "hard"
      ? requestedLevel
      : "normal";
  const [level] = useState<DifficultyKey>(initialLevel);
  const [status, setStatus] = useState<BrewStatus>("idle");
  const [lives, setLives] = useState<number>(difficulty.normal.lives);
  const [stage, setStage] = useState<number>(1);
  const [prepLeft, setPrepLeft] = useState<number>(5);
  const [timeLeft, setTimeLeft] = useState<number>(difficulty.normal.baseTime);
  const [, setProgress] = useState<number>(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [playerName, setPlayerName] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (window.localStorage.getItem("moonbrew-player-name") ?? "")
  );
  const [scoreSaved, setScoreSaved] = useState(false);
  const [scoreSaveError, setScoreSaveError] = useState(false);
  const [popup, setPopup] = useState<Popup>(null);
  const [showStats, setShowStats] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [mixing, setMixing] = useState(false);
  const [recipe, setRecipe] = useState<Recipe>(() => pickRecipe("normal", 1));
  const config = difficulty[level];
  const timeLimit = Math.max(7, config.baseTime - (stage - 1) * 2);
  const filtered = useMemo(
    () =>
      ingredients.filter(item =>
        `${item.name}${item.element}`.includes(search)
      ),
    [search]
  );
  const finishRound = useCallback(
    (correct: boolean, reason: string) => {
      const orderScore = Math.round(
        (selected.length
          ? selected.reduce(
              (sum, id, index) =>
                sum + (id === recipe.ingredients[index] ? 1 : 0),
              0
            ) / recipe.ingredients.length
          : 0) * 100
      );
      const speedScore = correct
        ? Math.max(0, Math.round((timeLeft / timeLimit) * 100))
        : Math.max(0, Math.round((timeLeft / timeLimit) * 30));
      const points = correct
        ? 100 + orderScore + speedScore
        : Math.max(0, orderScore);
      setStatus(correct ? "success" : "failure");
      setProgress(100);
      setMixing(false);
      setScore(old => old + points);
      if (correct) setCorrectCount(old => old + 1);
      setPopup({ correct, points, message: reason });
      window.setTimeout(() => {
        setPopup(null);
        const nextLives = correct ? lives : Math.max(0, lives - 1);
        if (!correct) setLives(nextLives);
        if (correct && stage >= config.maxStages) {
          setShowCongrats(true);
          setStatus("idle");
          window.setTimeout(() => {
            setShowCongrats(false);
            setShowStats(true);
          }, 5000);
          return;
        }
        if (stage >= config.maxStages || nextLives <= 0) {
          setShowStats(true);
          setStatus("idle");
          return;
        }
        setStage(old => old + 1);
        setRecipe(pickRecipe(level, stage + 1, recipe.id));
        setSelected([]);
        setPrepLeft(5);
        setTimeLeft(Math.max(7, config.baseTime - stage * 2));
        setProgress(0);
        setStatus("preparing");
      }, 3000);
    },
    [
      config.baseTime,
      config.maxStages,
      level,
      lives,
      recipe.id,
      recipe.ingredients,
      selected,
      stage,
      timeLeft,
      timeLimit,
    ]
  );
  useEffect(() => {
    if (status === "preparing") {
      const timer = window.setInterval(
        () =>
          setPrepLeft(current => {
            if (current <= 1) {
              window.clearInterval(timer);
              setStatus("ready");
              setTimeLeft(timeLimit);
              return 0;
            }
            return current - 1;
          }),
        1000
      );
      return () => window.clearInterval(timer);
    }
    if (status !== "ready" && status !== "brewing") return;
    const timer = window.setInterval(() => {
      if (mixing) return;
      setTimeLeft(current => {
        if (current <= 1) {
          window.clearInterval(timer);
          finishRound(false, "หมดเวลา! สูตรถัดไปกำลังมา");
          return 0;
        }
        return current - 1;
      });
      setProgress(current => Math.min(96, current + 100 / (timeLimit || 1)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finishRound, mixing, status, timeLimit]);
  const saveLeaderboardScore = () => {
    const normalizedName = normalizeLeaderboardName(playerName);
    if (!normalizedName || scoreSaved) return;
    window.localStorage.setItem("moonbrew-player-name", normalizedName);
    try {
      saveLocalLeaderboardEntry({
        difficulty: level,
        playerName: normalizedName,
        score,
        stages:
          stage >= config.maxStages ? config.maxStages : Math.max(0, stage - 1),
        correctCount,
      });
      setScoreSaved(true);
      setScoreSaveError(false);
    } catch {
      setScoreSaveError(true);
    }
  };
  const startGame = () => {
    const normalizedName = normalizeLeaderboardName(playerName);
    if (!normalizedName) return;
    setPlayerName(normalizedName);
    window.localStorage.setItem("moonbrew-player-name", normalizedName);
    setScoreSaved(false);
    setScoreSaveError(false);
    setStage(1);
    setLives(config.lives);
    setScore(0);
    setCorrectCount(0);
    setRecipe(pickRecipe(level, 1));
    setSelected([]);
    setPrepLeft(5);
    setTimeLeft(config.baseTime);
    setProgress(0);
    setShowStats(false);
    setShowCongrats(false);
    setPopup(null);
    setStatus("preparing");
  };
  const addIngredient = (id: string) => {
    if (status !== "ready") return;
    setSelected(old =>
      old.includes(id) ? old.filter(item => item !== id) : [...old, id]
    );
    setMixing(true);
    window.setTimeout(() => setMixing(false), 500);
  };
  const startBrew = () => {
    if (status === "ready") {
      setStatus("brewing");
      setMixing(true);
      setTimeLeft(timeLimit);
      setProgress(0);
      window.setTimeout(() => {
        const exactOrder =
          selected.length === recipe.ingredients.length &&
          selected.every((id, index) => id === recipe.ingredients[index]);
        const ingredientSetIsCorrect =
          selected.length === recipe.ingredients.length &&
          [...selected].sort().join("|") ===
            [...recipe.ingredients].sort().join("|");
        const accepted = exactOrder || ingredientSetIsCorrect;
        finishRound(
          accepted,
          exactOrder
            ? "ลำดับถูกต้อง! ยาส่องประกายสวยมาก"
            : ingredientSetIsCorrect
              ? "วัตถุดิบถูกต้อง แต่ลำดับยังไม่ตรง ได้คะแนนลดลง"
              : "วัตถุดิบหรือลำดับไม่ตรง สูตรจึงเสียพลัง"
        );
      }, 2000);
    }
  };
  return (
    <div className="page-stack">
      <section
        className={`brew-start-only${status === "idle" && !showStats ? " has-player-summary" : ""}`}
      >
        {status === "idle" && !showStats && (
          <div className="start-player-summary">
            <small>ผู้เล่นสำหรับกระดานสถิติ</small>
            <b>{playerName || "ยังไม่ได้ยืนยันชื่อ"}</b>
            {!normalizeLeaderboardName(playerName) && (
              <Link to="/start" className="text-link">
                กลับไปเลือกความยากและยืนยันชื่อ
              </Link>
            )}
          </div>
        )}
        <button
          className="prepare-btn"
          onClick={startGame}
          disabled={status === "idle" && !normalizeLeaderboardName(playerName)}
        >
          <Sparkles />{" "}
          {status === "preparing"
            ? `เตรียมตัว ${prepLeft} วินาที`
            : status === "idle"
              ? normalizeLeaderboardName(playerName)
                ? "เริ่มเตรียมตัว"
                : "กรอกชื่อก่อนเริ่ม"
              : `เริ่มด่าน ${stage}`}
        </button>
      </section>
      <div className="brew-grid">
        <section className="ingredient-panel panel-card">
          <div className="section-heading compact">
            <div>
              <div className="eyebrow">ส่วนผสมตามลำดับ</div>
              <h2>
                เลือกวัตถุดิบ{" "}
                <small>
                  {selected.length}/{recipe.ingredients.length}
                </small>
              </h2>
            </div>
            <div className="search-box">
              <Search />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหาวัตถุดิบ..."
              />
            </div>
          </div>
          <div className="sequence-strip">
            {recipe.ingredients.map((id, index) => (
              <span
                key={id}
                className={
                  selected[index] === id
                    ? "correct-slot"
                    : selected[index]
                      ? "wrong-slot"
                      : ""
                }
              >
                {index + 1}. {ingredientById(id)?.icon}
              </span>
            ))}
          </div>
          <div className="ingredient-list">
            {filtered.map(item => (
              <button
                key={item.id}
                className={
                  selected.includes(item.id)
                    ? "ingredient-item chosen"
                    : "ingredient-item"
                }
                onClick={() => addIngredient(item.id)}
                disabled={status !== "ready"}
              >
                <span
                  className="ingredient-art"
                  style={{ background: `${item.color}55` }}
                >
                  {item.icon}
                </span>
                <span className="ingredient-copy">
                  <b>{item.name}</b>
                  <small>
                    {item.element} · {item.rarity}
                  </small>
                </span>
                {selected.includes(item.id) && (
                  <Check className="chosen-check" />
                )}
              </button>
            ))}
          </div>
        </section>
        <section className="cauldron-panel panel-card">
          <div className={`recipe-request level-${recipe.ingredients.length}`}>
            <div>
              <div className="eyebrow">สูตรลับ · ด่าน {stage}</div>
              <h2>
                {recipe.icon} {recipe.name}
              </h2>
              <p>
                {recipe.effect} · {tierName(recipe.ingredients.length)}
              </p>
            </div>
            <div className="timer-chip">
              <Timer /> {timeLeft}s
            </div>
          </div>
          <div className="brew-lives">
            <span>พลังชีวิต</span>
            <div>
              {Array.from({ length: lives }).map((_, index) => (
                <Heart key={index} fill="currentColor" />
              ))}
              {lives === 0 && <b>ไม่มีหัวใจ</b>}
            </div>
          </div>
          <div className="requested-chips">
            {recipe.ingredients.map((id, index) => (
              <span key={id}>
                {index + 1}. {ingredientById(id)?.icon}{" "}
                {ingredientById(id)?.name}
              </span>
            ))}
          </div>
          <div
            className={`cauldron-stage ${status === "brewing" ? "is-brewing" : ""} ${mixing ? "is-mixing" : ""} ${status === "success" ? "is-finished" : ""} ${status === "failure" ? "is-failure" : ""}`}
          >
            <div className="cauldron-shadow" />
            <div className="cauldron-3d">
              <div className="cauldron-handle left" />
              <div className="cauldron-handle right" />
              <div className="cauldron-rim" />
              <div className="cauldron-liquid" />
              <div className="cauldron-highlight" />
              <div className="cauldron-leg one" />
              <div className="cauldron-leg two" />
              <div className="cauldron-leg three" />
              <span className="cauldron-symbol">
                {status === "success" ? "✓" : status === "failure" ? "×" : "✦"}
              </span>
              <i className="steam steam-1" />
              <i className="steam steam-2" />
              <i className="steam steam-3" />
              <div className="ingredient-pop">
                {mixing && selected.length
                  ? ingredientById(selected[selected.length - 1])?.icon
                  : ""}
              </div>
            </div>
            <div className="fire-glow">♨</div>
            <div className="magic-orbit" />
          </div>
          <div className="brew-status">
            {status === "idle"
              ? "กดเริ่มเตรียมตัวเพื่อเข้าสู่ด่าน"
              : status === "preparing"
                ? `กำลังเตรียมตัว... ${prepLeft} วินาที`
                : status === "ready"
                  ? `เลือกวัตถุดิบได้แล้ว · สูตรนี้ใช้ ${recipe.ingredients.length} ชนิด`
                  : status === "brewing"
                    ? "กดปุ่มปรุงยาเพื่อผสม 2 วินาที"
                    : status === "success"
                      ? "ปรุงเสร็จแล้ว!"
                      : "สูตรผิด ลองใหม่ในด่านถัดไป"}
          </div>
          <button
            className="brew-submit"
            onClick={startBrew}
            disabled={status !== "ready"}
          >
            {status === "preparing"
              ? `เตรียมตัว ${prepLeft} วินาที`
              : status === "ready"
                ? "ปรุงยา"
                : "รอเริ่มรอบ"}{" "}
            <Wand2 />
          </button>
          {status === "brewing" && (
            <div className="mix-hint">
              <Sparkles /> หม้อกำลังเขย่าส่วนผสม 2 วินาที...
            </div>
          )}
          {status === "success" && (
            <div className="success-banner">
              <Check /> สำเร็จ · ได้คะแนนเพิ่ม
            </div>
          )}
        </section>
      </div>
      {popup && (
        <div className="result-popup-backdrop">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className={
              popup.correct ? "result-popup correct" : "result-popup wrong"
            }
          >
            <div className="result-icon">{popup.correct ? "✨" : "💥"}</div>
            <h2>{popup.correct ? "ปรุงถูกต้อง!" : "ปรุงยังไม่ถูก"}</h2>
            <p>{popup.message}</p>
            <strong>+{popup.points} คะแนน</strong>
            <small>กำลังเตรียมด่านถัดไป...</small>
          </motion.div>
        </div>
      )}
      {showCongrats && (
        <div className="congrats-backdrop">
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="congrats-card"
          >
            <span>✨</span>
            <strong>CONGRATULATIONS!</strong>
            <small>ผ่านด่านสุดท้ายแล้ว</small>
          </motion.div>
        </div>
      )}
      {showStats && (
        <div className="stats-modal-backdrop">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="stats-modal"
          >
            <button className="modal-close" onClick={() => setShowStats(false)}>
              <X />
            </button>
            <div className="stats-trophy">🏆</div>
            <div className="eyebrow">MOONBREW RESULTS</div>
            <h2>{lives <= 0 ? "พลังชีวิตหมดแล้ว" : "จบเกมปรุงยาแล้ว!"}</h2>
            <p>
              ผลการเล่นระดับ <b>{config.label}</b>
            </p>
            <div className="final-score">
              {score}
              <small>คะแนนรวม</small>
            </div>
            <div className="final-grid">
              <div>
                <b>
                  {stage >= config.maxStages ? config.maxStages : stage - 1}/
                  {config.maxStages}
                </b>
                <small>ด่านที่ผ่าน</small>
              </div>
              <div>
                <b>{correctCount}</b>
                <small>ปรุงถูก</small>
              </div>
              <div>
                <b>{lives}</b>
                <small>หัวใจคงเหลือ</small>
              </div>
            </div>
            <div className="score-name-summary">
              <small>ชื่อผู้เล่นที่จะบันทึก</small>
              <b>{playerName}</b>
              <span>คะแนนจะอยู่ในกระดานระดับ {config.label}</span>
            </div>
            <div className="stats-actions">
              <button
                className="primary-btn score-save-button"
                onClick={saveLeaderboardScore}
                disabled={!playerName.trim() || scoreSaved}
              >
                {scoreSaved ? "บันทึกคะแนนแล้ว" : "บันทึกคะแนนไว้ในเครื่อง"}
              </button>
              {scoreSaved && (
                <p className="score-save-message" role="status">
                  บันทึกแล้ว คะแนนนี้จะแสดงในตารางของระดับ {config.label}{" "}
                  บนเครื่องนี้
                </p>
              )}
              {scoreSaveError && (
                <p className="score-save-error" role="alert">
                  บันทึกไม่สำเร็จ กรุณาเปิดใช้งานพื้นที่จัดเก็บของ browser
                  แล้วลองใหม่
                </p>
              )}
              <button className="prepare-btn" onClick={startGame}>
                เล่นใหม่อีกครั้ง
              </button>
              <Link to="/" className="secondary-btn stats-home">
                กลับหน้าแรก
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function HowToPlayView() {
  return (
    <div className="page-stack howto-page">
      <section className="recipe-header howto-hero">
        <div>
          <div className="eyebrow">
            <CircleHelp /> MOONBREW GUIDE
          </div>
          <h1>วิธีการเล่น</h1>
          <p className="howto-description">
            เรียนรู้ขั้นตอนปรุงยาและทำคะแนนให้สูงที่สุด
          </p>
        </div>
        <Link to="/start" className="prepare-btn">
          เริ่มปรุงยา <ArrowRight />
        </Link>
      </section>
      <section className="howto-grid">
        <article className="howto-card">
          <span className="howto-icon">🎚️</span>
          <h2>1. เลือกระดับ</h2>
          <p>
            ง่ายมี 6 ด่าน ปกติมี 5 ด่าน และยากมี 4 ด่าน
            แต่ละระดับมีพลังชีวิตต่างกัน
          </p>
        </article>
        <article className="howto-card">
          <span className="howto-icon">⏳</span>
          <h2>2. เตรียมตัว 5 วินาที</h2>
          <p>
            เมื่อกดเริ่ม จะมีเวลานับถอยหลัง 5 วินาที
            จากนั้นจึงเริ่มเลือกวัตถุดิบได้
          </p>
        </article>
        <article className="howto-card">
          <span className="howto-icon">🧪</span>
          <h2>3. เลือกวัตถุดิบ</h2>
          <p>
            เลือกวัตถุดิบตามสูตร กดซ้ำที่วัตถุดิบเดิมเพื่อยกเลิกได้
            และเลือกชนิดเดิมได้เพียงครั้งเดียว
          </p>
        </article>
        <article className="howto-card">
          <span className="howto-icon">🫧</span>
          <h2>4. กดปรุงยา</h2>
          <p>
            กดปุ่มปรุงยาใต้หม้อเพื่อเริ่มแอนิเมชันผสมยา
            ใช้วัตถุดิบเท่าที่เลือกได้โดยไม่จำเป็นต้องครบจึงจะกดปรุง
          </p>
        </article>
        <article className="howto-card">
          <span className="howto-icon">⭐</span>
          <h2>5. ทำคะแนน</h2>
          <p>
            วัตถุดิบถูกและลำดับถูกได้คะแนนสูงสุด
            หากวัตถุดิบถูกแต่ลำดับผิดยังเล่นต่อได้และไม่เสียหัวใจ แต่คะแนนจะลดลง
          </p>
        </article>
        <article className="howto-card">
          <span className="howto-icon">💗</span>
          <h2>6. ผ่านด่าน</h2>
          <p>
            สูตรของแต่ละระดับจะสุ่มจาก Common–Uncommon, Uncommon–Rare หรือ
            Rare–Legendary และพยายามไม่ซ้ำด่านก่อนหน้า
          </p>
        </article>
      </section>
    </div>
  );
}

function RecipesView() {
  const [search, setSearch] = useState("");
  const recipeFilters = [
    "ALL",
    "COMMON",
    "UNCOMMON",
    "RARE",
    "LEGENDARY",
  ] as const;
  const [rarityFilter, setRarityFilter] =
    useState<(typeof recipeFilters)[number]>("ALL");
  const filtered = recipes
    .filter(recipe =>
      `${recipe.name}${recipe.effect}${recipe.ingredients.map(id => ingredientById(id)?.name).join("")}`.includes(
        search
      )
    )
    .filter(
      recipe =>
        rarityFilter === "ALL" ||
        tierName(recipe.ingredients.length) === rarityFilter
    )
    .sort((a, b) => a.ingredients.length - b.ingredients.length);
  return (
    <div className="page-stack">
      <section className="recipe-header">
        <div>
          <div className="eyebrow">
            <BookOpen /> RECIPE BOOK
          </div>
          <h1>สมุดสูตรยา</h1>
          <p className="recipe-description">
            สูตรลับทั้งหมด {recipes.length} สูตร · ความหายากขึ้นกับจำนวนส่วนผสม
          </p>
        </div>
        <div className="recipe-search">
          <Search />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อยา หรือวัตถุดิบ..."
          />
        </div>
      </section>
      <div className="recipe-filters" aria-label="กรองตามความหายาก">
        {recipeFilters.map(filter => (
          <button
            key={filter}
            className={rarityFilter === filter ? "active" : ""}
            onClick={() => setRarityFilter(filter)}
          >
            {filter === "ALL" ? "ทั้งหมด" : filter}
          </button>
        ))}
      </div>
      <div className="recipe-count">
        พบ {filtered.length} สูตร <span>·</span>{" "}
        {rarityFilter === "ALL" ? "Common–Legendary" : rarityFilter}
      </div>
      <section className="recipe-grid">
        {filtered.map((recipe, index) => (
          <motion.article
            layout
            key={recipe.id}
            className={`recipe-card level-${recipe.ingredients.length}`}
          >
            <div className="recipe-card-top">
              <div
                className="potion-art"
                style={{ background: `${recipe.color}66` }}
              >
                {recipe.icon}
              </div>
              <div>
                <span className="recipe-number">
                  สูตรที่ {String(index + 1).padStart(2, "0")}
                </span>
                <h2>{recipe.name}</h2>
                <span className="rarity-badge">
                  {tierName(recipe.ingredients.length)} · {recipe.rarity}
                </span>
              </div>
            </div>
            <p className="recipe-effect">{recipe.effect}</p>
            <div className="recipe-ingredients">
              <small>วัตถุดิบตามลำดับ · {recipe.ingredients.length} ชนิด</small>
              <div>
                {recipe.ingredients.map((id, order) => {
                  const item = ingredientById(id);
                  return (
                    <span key={id}>
                      <b style={{ background: `${item?.color}66` }}>
                        {order + 1}
                      </b>
                      {item?.icon} {item?.name}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="recipe-method">
              <small>วิธีปรุง</small>
              <p>{recipe.method}</p>
            </div>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
export default App;
