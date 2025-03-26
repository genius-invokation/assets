// @ts-check

import { all, keywords } from "../data.js";
import { characters, actionCards } from "#common/data_v2.js";

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
    res.status(400).send("Bad request (multiple id)");
    return;
  }
  if (id.endsWith(".webp")) {
    let query = id.slice(0, -5);
    if (query && Number.isNaN(Number(query))) {
      const found = [...characters, ...actionCards].find((obj) =>
        obj.name.includes(query),
      );
      if (found) {
        query = String(found.id);
      } else {
        res.status(404).send("Not found");
        return;
      }
    }
    await fetch(`https://gi-tcg-card-data-img.vercel.app/${query}.webp`)
      .then((r) =>
        r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${r.status}`)),
      )
      .then((buf) => {
        res
          .status(200)
          .setHeader("Content-Type", "image/webp")
          .send(Buffer.from(buf));
      })
      .catch((err) => {
        res.status(502).send({ message: err.message });
      });
    return;
  }
  let found;
  let numberId = Number(id);
  if (numberId < 0) {
    found = keywords.find((obj) => obj.id === -numberId);
  } else {
    found = all.find((obj) => obj.id === numberId);
  }
  if (found) {
    res.status(200).json(found);
    return;
  } else {
    res.status(404).send("Not found");
    return;
  }
}
