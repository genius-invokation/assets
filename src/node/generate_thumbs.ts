import path from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import Sharp from "sharp";
import { imageDir, thumbImageDir } from "./config";
import { existsSync } from "node:fs";

if (!existsSync(thumbImageDir)) {
  await mkdir(thumbImageDir, { recursive: true });
}

const filenames = await readdir(imageDir);
for (const filename of filenames) {
  if (!filename.endsWith(".webp")) {
    continue;
  }
  const image = Sharp(path.join(imageDir, filename));
  const { width, height } = await image.metadata();
  if (filename.startsWith("Skill") || filename.startsWith("MonsterSkill") || filename.startsWith("Btn")) {
    // realsize 100*100, 128*128
    if (width! > height!) {
      image.resize(80, null);
    } else {
      image.resize(null, 80);
    }
  } else if (filename.startsWith("UI_Gcg_CardFace")) {
    // realsize 420*720
    image.resize(160, null);
  } else if (filename.startsWith("UI_Gcg_Char")) {
    // realsize 256*256
    image.resize(80, null);
  } else if (filename.startsWith("UI_Gcg_Buff_Vehicle")) {
    // realsize 100*100
    image.resize(50, null);
  } else {
    image.resize(null, 40);
  }
  await image.toFile(path.join(thumbImageDir, filename));
  console.log(`Generated thumb for ${filename}`);
}
