// @ts-check
import {
  characters,
  entities,
  actionCards,
  keywords,
} from "#common/data_v2.js";

/**
 * @typedef {import("@vercel/node").VercelRequest} VercelRequest
 * @typedef {import("@vercel/node").VercelResponse} VercelResponse
 */

const skills = [...characters, ...entities].flatMap((ch) => ch.skills);

const allEntities = Object.values(
  [...entities, ...actionCards].reduce((acc, curr) => {
    if (acc[curr.id]) {
      // 合并对象
      acc[curr.id] = { ...acc[curr.id], ...curr };
    } else {
      acc[curr.id] = curr;
    }
    return acc;
  }, {}),
);

export const all = [...characters, ...allEntities, ...skills, ...keywords];

/**
 *
 * @param {VercelRequest} req
 * @param {VercelResponse} res
 * @returns
 */
export default function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  return res.status(200).json(all);
}

export { keywords };
