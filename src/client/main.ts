import { buffIconMapping } from "@gi-tcg/static-data/buffIconMapping";
import type { EntityRawData } from "@gi-tcg/static-data";
import { entities as allEntities } from "#common/data_v2.js";
import allIcons from "../output/buffIconList.json";

import "./style.css";

const entities = allEntities.filter(
  (entity) => !entity.hidden && !("cardFace" in entity),
);

const icons = new Map<string, EntityRawData[]>();

for (const entity of entities) {
  if (!entity.buffIconHash) {
    continue;
  }
  if (!icons.has(entity.buffIconHash)) {
    icons.set(entity.buffIconHash, []);
  }
  icons.get(entity.buffIconHash)!.push(entity as EntityRawData);
}

const getFreeIcons = () =>
  allIcons.filter((icon) => !Object.values(buffIconMapping).includes(icon));

const iconListElement = document.querySelector("#iconList")!;
const editViewElement = document.querySelector("#editView")!;
const popupElement = document.querySelector("#popup")! as HTMLDialogElement;
const freeIconListElement = document.querySelector("#freeIconList")!;
const cancelBtn = document.querySelector("#cancel")!;
const exportBtn = document.querySelector("#export")!;

function refresh() {
  iconListElement.innerHTML = "";
  for (const [iconHash] of icons) {
    const icon = document.createElement("div");
    icon.classList.add("icon");
    if (buffIconMapping[iconHash]) {
      const img = document.createElement("img");
      img.src = `/assets/${buffIconMapping[iconHash]}.webp`;
      icon.appendChild(img);
    } else {
      const div = document.createElement("div");
      div.classList.add("unknown");
      icon.appendChild(div);
    }
    icon.title = iconHash;
    icon.addEventListener("click", () => {
      showIcon(iconHash);
    });
    iconListElement.appendChild(icon);
  }
}

function showIcon(hash: string) {
  editViewElement.innerHTML = "";
  if (buffIconMapping[hash]) {
    const img = document.createElement("img");
    img.src = `/assets/${buffIconMapping[hash]}.webp`;
    img.title = buffIconMapping[hash];
    editViewElement.appendChild(img);
  }
  const reselectButton = document.createElement("button");
  reselectButton.textContent = "Reselect";
  reselectButton.addEventListener("click", () => {
    reselect(hash);
  });
  editViewElement.appendChild(reselectButton);

  const h3 = document.createElement("h3");
  h3.textContent = hash;
  editViewElement.appendChild(h3);

  for (const entity of icons.get(hash)!) {
    const ul = document.createElement("ul");
    ul.classList.add("entity");
    const li = document.createElement("li");
    const id = document.createElement("strong");
    id.textContent = String(entity.id);
    li.append(id, ` ${entity.name}`);
    li.title = entity.description;
    ul.appendChild(li);
    editViewElement.appendChild(ul);
  }
}

function reselect(hash: string) {
  freeIconListElement.innerHTML = "";

  const freeIcons = getFreeIcons();
  const offBtn = document.createElement("button");
  offBtn.textContent = "Off";
  offBtn.classList.add("icon");
  offBtn.addEventListener("click", () => {
    delete buffIconMapping[hash];
    popupElement.close();
    refresh();
    showIcon(hash);
  });
  freeIconListElement.appendChild(offBtn);

  for (const freeIcon of freeIcons) {
    const icon = document.createElement("button");
    icon.classList.add("icon");
    const img = document.createElement("img");
    img.src = `/assets/${freeIcon}.webp`;
    icon.appendChild(img);
    icon.title = freeIcon;
    icon.addEventListener("click", () => {
      buffIconMapping[hash] = freeIcon;
      popupElement.close();
      refresh();
      showIcon(hash);
    });
    freeIconListElement.appendChild(icon);
  }
  popupElement.showModal();
}

cancelBtn.addEventListener("click", () => popupElement.close());
exportBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(buffIconMapping, null, 2)], {
      type: "application/json",
    }),
  );
  a.download = "buff_icons.json";
  a.click();
});

refresh();
