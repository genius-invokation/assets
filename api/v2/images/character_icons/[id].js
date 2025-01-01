// @ts-check
import { characters } from "#common/data_v2.js";

/**
 * @typedef {import("@vercel/node").VercelRequest} VercelRequest
 * @typedef {import("@vercel/node").VercelResponse} VercelResponse
 */

const ICONS_MAP = Object.fromEntries(characters.map((ch) => [ch.id, ch.icon]));

/**
 * 
 * @param {VercelRequest} req 
 * @param {VercelResponse} res 
 * @returns 
 */
export default function handler(req, res) {
  const { id, thumb } = req.query;
  if (Array.isArray(id)) {
    res.status(400)
      .send("Bad request (multiple id)");
    return;
  }
  const icon = ICONS_MAP[id];
  if (!icon) {
    res.status(404)
      .send("Not found");
    return;
  }
  let url;
  if (thumb) {
    url = `/assets/thumbs/${icon}.webp`;
  } else {
    url = `/assets/${icon}.webp`;
  }
  res.status(307).setHeader("Location", url).send(void 0);
}