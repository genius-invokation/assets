// @ts-check
import rawData from "../../src/output/imageNames.json" with { type: "json" };

/**
 * @typedef {import("@vercel/node").VercelRequest} VercelRequest
 * @typedef {import("@vercel/node").VercelResponse} VercelResponse
 */

/** @type {Record<string, string>} */
export const imageMap = rawData;

/**
 *
 * @param {VercelRequest} req
 * @param {VercelResponse} res
 * @returns
 */
export default function handler(req, res) {
  return res.status(200).json(imageMap);
}