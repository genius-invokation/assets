import type {
  ActionCardRawData,
  CharacterRawData,
  EntityRawData,
  KeywordRawData,
} from "@gi-tcg/static-data";
import { outputDir } from "./config";

// 从 github 获取最新的数据

const GITHUB_CONTENT_BASE = `https://raw.githubusercontent.com/genius-invokation/genius-invokation/refs/heads/main/packages/static-data/src/data`;

const FILENAMES = ["action_cards", "characters", "entities", "keywords"];

const downloaded: Record<string, any[]> = {};

for (const filename of FILENAMES) {
  const data = await fetch(`${GITHUB_CONTENT_BASE}/${filename}.json`).then(
    (r) => r.text(),
  );
  downloaded[filename] = JSON.parse(data).map((src) => ({
    ...src,
    category: filename,
  }));
  await Bun.write(
    `${outputDir}/${filename}.json`,
    JSON.stringify(downloaded[filename]),
  );
}

export const actionCards: ActionCardRawData[] = downloaded["action_cards"];
export const characters: CharacterRawData[] = downloaded["characters"];
export const entities: EntityRawData[] = downloaded["entities"];
export const keywords: KeywordRawData[] = downloaded["keywords"];
