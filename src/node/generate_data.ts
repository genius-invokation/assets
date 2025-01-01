import type {
  ActionCardRawData,
  CharacterRawData,
  EntityRawData,
  KeywordRawData,
} from "@gi-tcg/static-data";
import { outputDir } from "./config";

// 从 github 获取最新的数据

const GITHUB_CONTENT_BASE = `https://raw.githubusercontent.com/genius-invokation/genius-invokation/refs/heads/main/packages/static-data/src/data`;

const FILENAMES = [
  "action_cards.json",
  "characters.json",
  "entities.json",
  "keywords.json",
];

const downloaded: Record<string, any[]> = {};

for (const filename of FILENAMES) {
  const data = await fetch(`${GITHUB_CONTENT_BASE}/${filename}`).then((r) =>
    r.text(),
  );
  downloaded[filename] = JSON.parse(data);
  await Bun.write(`${outputDir}/${filename}`, data);
}

export const actionCards: ActionCardRawData[] = downloaded["action_cards.json"];
export const characters: CharacterRawData[] = downloaded["characters.json"];
export const entities: EntityRawData[] = downloaded["entities.json"];
export const keywords: KeywordRawData[] = downloaded["keywords.json"];
