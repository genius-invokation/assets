// @ts-check
import { imageMap } from "../images";

/**
 * @typedef {import("@vercel/node").VercelRequest} VercelRequest
 * @typedef {import("@vercel/node").VercelResponse} VercelResponse
 */

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
  const image = imageMap[id];
  if (!image) {
    res.status(404)
      .send("Not found");
    return;
  }
  let url;
  if (thumb) {
    url = `/assets/thumbs/${image}.webp`;
  } else {
    url = `/assets/${image}.webp`;
  }
  res.status(307).setHeader("Location", url).send(void 0);
}