import type {
  ActionCardRawData,
  CharacterRawData,
  EntityRawData,
  KeywordRawData,
} from "@gi-tcg/static-data";
import { outputDir } from "./config";

// 从 github 获取最新的数据

const ASSETS_API_ENDPOINT =
  import.meta.env.ASSETS_API_ENDPOINT ||
  `https://gi-tcg-assets-api-hf.guyutongxue.site/api/v4/data/latest/CHS`;

const FILENAMES = ["action_cards", "characters", "entities", "keywords"];

const downloaded: Record<string, any[]> = {};

for (const filename of FILENAMES) {
  const { success, data, ...rest } = await fetch(
    `${ASSETS_API_ENDPOINT}/${filename}`,
  ).then((r) => r.json());
  if (!success) {
    throw new Error(`Failed to fetch ${filename}: ${JSON.stringify(rest)}`);
  }
  downloaded[filename] = data;
  await Bun.write(
    `${outputDir}/${filename}.json`,
    JSON.stringify(downloaded[filename]),
  );
  console.log(`Fetched and saved ${filename}.json`);
}

export const actionCards: ActionCardRawData[] = downloaded["action_cards"];
export const characters: CharacterRawData[] = downloaded["characters"];
export const entities: EntityRawData[] = downloaded["entities"];
export const keywords: KeywordRawData[] = downloaded["keywords"];
