// @ts-check
import { all } from "../data.js";

/**
 * @typedef {import("@vercel/node").VercelRequest} VercelRequest
 * @typedef {import("@vercel/node").VercelResponse} VercelResponse
 */

/**
 * 
 * @param {string | string[] | undefined} type 
 * @returns {"icon" | "cardFace" | "unspecified"}
 */
const checkType = (type)  => {
  if (Array.isArray(type) || !type) {
    return "unspecified";
  }
  if (type.toLocaleLowerCase() === "icon") {
    return "icon";
  }
  if (type.toLocaleLowerCase() === "cardface") {
    return "cardFace";
  }
  return "unspecified";
}


/**
 *
 * @param {VercelRequest} req
 * @param {VercelResponse} res
 * @returns
 */
export default function handler(req, res) {
  const { id, thumb, type } = req.query;
  if (Array.isArray(id)) {
    res.status(400)
      .send("Bad request (multiple id)");
    return;
  }
  const ty = checkType(type);
  const data = all.find((x) => x.id === Number(id));
  if (!data) {
    res.status(404)
      .send("Not found");
    return;
  }
  let imageName;
  if ("cardFace" in data && (ty === "cardFace" || ty === "unspecified")) {
    imageName = data.cardFace;
  } else {
    for (const key of ["icon", "skillIcon", "buffIcon"]) {
      if (key in data && (ty === "icon" || ty === "unspecified")) {
        imageName = data[key];
        break;
      }
    }
  }
  if (!imageName) {
    res.status(404)
      .send("Not found (no image)");
    return;
  }
  let url;
  if (thumb) {
    url = `/assets/thumbs/${imageName}.webp`;
  } else {
    url = `/assets/${imageName}.webp`;
  }
  res.status(307).setHeader("Location", url).send(void 0);
}