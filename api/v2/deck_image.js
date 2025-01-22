// @ts-check
import sharp from "sharp";
import { decodeRaw } from "@gi-tcg/utils";
import { characters, actionCards } from "#common/data_v2.js";
import path from "node:path";

const shareIdMap = new Map(
  [...characters, ...actionCards].map((x) => [x.shareId, x]),
);

/**
 * @typedef {import("@vercel/node").VercelRequest} VercelRequest
 * @typedef {import("@vercel/node").VercelResponse} VercelResponse
 */

const WIDTH = 800;
const HEIGHT = 1200;

const CHARACTER_WIDTH = 150;
const CARD_WIDTH = 100;
const CHARACTER_HEIGHT = Math.round(150 * (11 / 7));
const CARD_HEIGHT = Math.round(100 * (11 / 7));

const GAP = 15;

const Y_PADDING = Math.round(
  (HEIGHT - CHARACTER_HEIGHT - CARD_HEIGHT * 5 - GAP * 4) / 3,
);
const X_CARD_PADDING = Math.round((WIDTH - CARD_WIDTH * 6 - GAP * 5) / 2);
const X_CHARACTER_PADDING = Math.round(
  (WIDTH - CHARACTER_WIDTH * 3 - GAP * 2) / 2,
);

const IMAGE_DIR = path.resolve(import.meta.dirname, "../../public/assets");

/**
 *
 * @param {VercelRequest} req
 * @param {VercelResponse} res
 * @returns
 */
export default async function handler(req, res) {
  const { code } = req.query;
  if (typeof code !== "string") {
    res.status(400).send("Bad request (code)");
    return;
  }
  try {
    const data = decodeRaw(code);
    if (data.length !== 33) {
      throw new Error(`Expect exactly 33 cards`);
    }
    const cards = [];
    for (const shareId of data) {
      const card = shareIdMap.get(shareId);
      if (!card) {
        throw new Error(`Card of share ID ${shareId} not found`);
      }
      cards.push(card);
    }
    console.log({ Y_PADDING, X_CARD_PADDING, X_CHARACTER_PADDING });
    const image = sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    });
    /** @type {import("sharp").OverlayOptions[]} */
    const composites = [];
    for (let i = 0; i < 3; i++) {
      const ch = cards[i];
      const cardFace = await sharp(`${IMAGE_DIR}/${ch.cardFace}.webp`)
        .resize(CHARACTER_WIDTH, CHARACTER_HEIGHT)
        .toBuffer();
      composites.push({
        input: cardFace,
        top: Y_PADDING,
        left: X_CHARACTER_PADDING + i * (CHARACTER_WIDTH + GAP),
      });
    }
    for (let i = 3; i < 33; i++) {
      const ch = cards[i];
      const xIndex = (i - 3) % 6;
      const yIndex = Math.floor((i - 3) / 6);
      const cardFace = await sharp(`${IMAGE_DIR}/${ch.cardFace}.webp`)
        .resize(CARD_WIDTH, CARD_HEIGHT)
        .toBuffer();
      composites.push({
        input: cardFace,
        top: 2 * Y_PADDING + CHARACTER_HEIGHT + yIndex * (CARD_HEIGHT + GAP),
        left: X_CARD_PADDING + xIndex * (CARD_WIDTH + GAP),
      });
    }
    const result = await image.composite(composites).png().toBuffer();
    res.setHeader("Content-Type", "image/png").send(result);
  } catch (e) {
    res.redirect(
      `https://placehold.jp/${WIDTH}x${HEIGHT}.png?text=${encodeURIComponent(
        e.message,
      )}&css=${encodeURIComponent(`{"font-size":"30px"}`)}`,
    );
  }
}
