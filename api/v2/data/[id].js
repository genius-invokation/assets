// @ts-check

import { all, keywords } from "../data.js";

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
export default async function handler(req, res) {
  const { id } = req.query;
  if (Array.isArray(id)) {
    res.status(400)
      .send("Bad request (multiple id)");
    return;
  }
  if (id.endsWith(".webp")) {
    const response = await fetch(`https://gi-tcg-card-data-img.vercel.app/${id}`);
    res.status(200).send(response);
    return;
  }
  let found;
  if (id.startsWith("K")) {
    found = keywords.find((obj) => obj.id === Number(id.slice(1)));
  } else {
    found = all.find((obj) => obj.id === Number(id));
  }
  if (found) {
    res.status(200).json(found);
    return;
  } else {
    res.status(404).send("Not found");
    return;
  }
}