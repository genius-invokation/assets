import type {
  ActionCardRawData,
  CharacterRawData,
  EntityRawData,
  KeywordRawData,
} from "@gi-tcg/static-data";
import { outputDir } from "./config";

export async function generateData() {
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

  const actionCards: ActionCardRawData[] = downloaded["action_cards.json"];
  const characters: CharacterRawData[] = downloaded["characters.json"];
  const entities: EntityRawData[] = downloaded["entities.json"];
  const keywords: KeywordRawData[] = downloaded["keywords.json"];
  return { actionCards, characters, entities, keywords };
}
