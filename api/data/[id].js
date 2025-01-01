import data from "#common/data.js";

/**
 * @typedef {import("@vercel/node").VercelRequest} VercelRequest
 * @typedef {import("@vercel/node").VercelResponse} VercelResponse
 *
 * @typedef {import("genshin-db").Language} Language
 */

/**
 *
 * @param {VercelRequest} req
 * @param {VercelResponse} res
 * @returns
 */
export default function handler(req, res) {
  const { id, lang = "ChineseSimplified", type } = req.query;
  if (Array.isArray(id) || Array.isArray(lang)) {
    res.status(400).send("Bad request (multiple id or lang)");
    return;
  }
  const selectedLang = data[/** @type {Language} */ (lang)];
  if (typeof selectedLang === "undefined") {
    res
      .status(400)
      .send(
        `Bad request (invalid lang)\nAvailable languages are: ${languages.join(
          ", ",
        )}`,
      );
    return;
  }
  const found = selectedLang.find(
    (obj) => obj.id === Number(id) && (type ? obj.TYPE === type : true),
  );
  if (found) {
    res.status(200).json(found);
    return;
  } else {
    res.status(404).send("Not found");
    return;
  }
}
