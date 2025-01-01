import Sharp from "sharp";
import { parseArgs } from "node:util";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { statSync } from "node:fs";
import { imageDir, outputDir } from "./config";
import { actionCards, characters, entities, keywords } from "./generate_data";

const {
  positionals: [input],
} = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
});

if (typeof input === "undefined") {
  console.error("Input path not specified");
  process.exit(1);
}

// 将原始提取素材的图片分组，找到每组中的最大文件（最高分辨率）路径

const allImagePaths: Record<string, string> = {};

const filenames = await readdir(input);
const grouped: Record<string, string[]> = {};
const regex = /^(.+?)(?: \(\d+\))?\.png$/;
for (const filename of filenames) {
  const match = filename.match(regex);
  if (match) {
    const name = match[1];
    const group = grouped[name];
    if (group) {
      group.push(filename);
    } else {
      grouped[name] = [filename];
    }
  }
}
for (const name in grouped) {
  const group = grouped[name];
  const maxFile = group.reduce(
    (max, file) => {
      const filePath = path.join(input, file);
      const fileSize = statSync(filePath).size;
      return fileSize > max.size ? { file, size: fileSize } : max;
    },
    { file: "", size: 0 },
  );

  const maxFilePath = path.join(input, maxFile.file);
  allImagePaths[name] = maxFilePath;
}

/** 最终的 id 到图片名的映射 */
const result: Record<number, string> = {
  "0": "UI_Gcg_Buff_Common_Element_Physics",
  "1": "UI_Gcg_Buff_Common_Element_Ice",
  "2": "UI_Gcg_Buff_Common_Element_Water",
  "3": "UI_Gcg_Buff_Common_Element_Fire",
  "4": "UI_Gcg_Buff_Common_Element_Electric",
  "5": "UI_Gcg_Buff_Common_Element_Wind",
  "6": "UI_Gcg_Buff_Common_Element_Rock",
  "7": "UI_Gcg_Buff_Common_Element_Grass",
  "9": "UI_Gcg_Buff_Common_Element_Heal",
};
/** 需要处理（保存并生成缩略图）的图片名集合 */
const imagesToProcess = new Set<string>(Object.values(result));

const replaceNameMap: Record<string, string> = {
  UI_Gcg_CardFace_Summon_AbyssEle: "UI_Gcg_CardFace_Summon_AbyssEle_Layer00",
  UI_Gcg_CardFace_Char_Monster_Effigyice:
    "UI_Gcg_CardFace_Char_Monster_EffigyIce",
};

const chSkills = characters.flatMap((ch) => ch.skills);
const etSkills = entities.flatMap((et) => et.skills);
const allData = [
  ...characters,
  ...actionCards,
  ...chSkills,
  ...etSkills,
  ...entities,
  ...keywords,
];

// 召唤物、角色牌、行动牌
for (const obj of allData) {
  let filename: string;
  if ("cardFace" in obj && obj.cardFace) {
    filename = obj.cardFace;
  } else if ("icon" in obj && obj.icon) {
    filename = obj.icon;
  } else if ("buffIcon" in obj && obj.buffIcon) {
    filename = obj.buffIcon;
  } else if ("buffIconHash" in obj && obj.buffIconHash) {
    filename = "UI_Gcg_Buff_Common_Special";
  } else {
    continue;
  }
  if (filename in replaceNameMap) {
    filename = replaceNameMap[filename];
  }
  if (!(filename in allImagePaths)) {
    console.warn(`Missing image: ${filename}`);
    continue;
  }
  if (!result[obj.id]) {
    result[obj.id] = filename;
  }
  imagesToProcess.add(filename);
}

const buffIconList: string[] = [];

// 将所有状态图标、角色图标加入处理集合
for (const statusImageName of Object.keys(allImagePaths)) {
  if (
    statusImageName.startsWith("UI_Gcg_Buff") ||
    statusImageName.startsWith("UI_Gcg_Debuff")
  ) {
    buffIconList.push(statusImageName);
    imagesToProcess.add(statusImageName);
  } else if (statusImageName.startsWith("UI_Gcg_Char")) {
    imagesToProcess.add(statusImageName);
  }
}

for (const name of imagesToProcess) {
  const filepath = allImagePaths[name];
  const image = Sharp(filepath);
  const outputPath = path.join(imageDir, `${name}.webp`);
  await image.toFile(outputPath);
  console.log(`Generated image for ${name}`);
}

await Bun.write(
  `${outputDir}/imageNames.json`,
  JSON.stringify(result, void 0, 2),
);
await Bun.write(
  `${outputDir}/buffIconList.json`,
  JSON.stringify(buffIconList, void 0, 2),
);
