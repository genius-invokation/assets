import { BunRequest } from "bun";
import {
  characters,
  entities,
  actionCards,
  keywords,
  type ActionCardRawData,
  type EntityRawData,
} from "../../genius-invokation-moyu-s7/packages/static-data/src/index";
import { HEADERS } from "./headers";

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
  }, {} as Record<number, EntityRawData | ActionCardRawData | (EntityRawData & ActionCardRawData)>),
);

export const all = [...characters, ...allEntities, ...skills, ...keywords];

export async function allDataHandler(req: BunRequest): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("OK", { status: 200, headers: HEADERS });
  }
  return Response.json(all, {
    headers: HEADERS,
  });
}

export async function dataHandler(
  req: BunRequest<"/api/v3/data/:id">,
): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("OK", { status: 200, headers: HEADERS });
  }
  const { id } = req.params;
  let found;
  let numberId = Number(id);
  if (numberId < 0) {
    found = keywords.find((obj) => obj.id === -numberId);
  } else {
    found = all.find((obj) => obj.id === numberId);
  }
  if (found) {
    return Response.json(found, {
      headers: HEADERS,
    });
  } else {
    return new Response("Not found", { status: 404, headers: HEADERS });
  }
}

const checkType = (type: string | null): "icon" | "cardFace" | "unspecified" => {
  if (!type) {
    return "unspecified";
  }
  if (type.toLocaleLowerCase() === "icon") {
    return "icon";
  }
  if (type.toLocaleLowerCase() === "cardface") {
    return "cardFace";
  }
  return "unspecified";
};

const dataIncludesElements = [
  ...[
    "UI_Gcg_Buff_Common_Element_Physics",
    "UI_Gcg_Buff_Common_Element_Ice",
    "UI_Gcg_Buff_Common_Element_Water",
    "UI_Gcg_Buff_Common_Element_Fire",
    "UI_Gcg_Buff_Common_Element_Electric",
    "UI_Gcg_Buff_Common_Element_Wind",
    "UI_Gcg_Buff_Common_Element_Rock",
    "UI_Gcg_Buff_Common_Element_Grass",
    "UI_Gcg_Buff_Common_Element_Piercing", // not exists
    "UI_Gcg_Buff_Common_Element_Heal",
  ].map((icon, id) => ({ id, icon })),
  ...all,
];

/**
 *
 * @param {VercelRequest} req
 * @param {VercelResponse} res
 * @returns
 */
export async function imageHandler(req: BunRequest<"/api/v3/images/:id">): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("OK", { status: 200, headers: HEADERS });
  }
  const { id } = req.params;
  const type = new URLSearchParams(new URL(req.url).searchParams).get("type");
  const ty = checkType(type);
  const data = dataIncludesElements.find((x) => x.id === Number(id));
  if (!data) {
    return new Response("Not found (no data)", { status: 404, headers: HEADERS });
  }
  let imageName;
  if ("cardFace" in data && (ty === "cardFace" || ty === "unspecified")) {
    imageName = data.cardFace;
  } else {
    for (const key of ["icon", "skillIcon", "buffIcon"]) {
      if (key in data && (ty === "icon" || ty === "unspecified")) {
        imageName = (data as any)[key];
        break;
      }
    }
  }
  if (!imageName) {
    return new Response("Not found (no image)", { status: 404, headers: HEADERS });
  }
  const url = `/assets/${imageName}.webp`;
  return new Response(null, {
    status: 307,
    headers: {
      Location: url,
      ...HEADERS,
    }
  })
}
