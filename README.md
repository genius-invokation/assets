# gi-tcg-assets

此仓库存放用于生成七圣召唤模拟器静态资产的代码。资产产生路径如下：

```mermaid
flowchart TB;
genshin:[Genshin client] -- YarikStudio --> texture2D:[Texture2D folder];
ambr:[ambr.top]---->staticData:["@gi-tcg/static-data"];
genshinData:[GenshinData Repo]---->staticData:;
staticData:---->genImageTs:[/"node/generate_images.ts"/];
staticData:---->ambr:;
texture2D:---->genImageTs:;
genImageTs:---->webp:["dist/assets/*.webp"];
webp:--"node/generate_thumbs.ts"-->webpThumb:["dist/assets/thumbs/*.webp"];
webp:---->frontend:;
genImageTs:---->imageList:[buffIconList.json];
genImageTs:---->imageNames:[imageNames.json];
imageList:---->frontend:["client/* (Buff Icon Edit Page)"];
frontend:--"Manual update"-->buffIconMapping:[buffIconMapping.json];
buffIconMapping:---->staticData:;

webp:-...->api:[Vercel Functions];
webpThumb:-...->api:;
imageNames:-...->api:;
staticData:-...->api:;
```

其中 [AssetStudio](https://github.com/yarik0chka/YarikStudio) 的命令为：

> 编译前设置 `AssetStudio.CLI/App.config` 的 `allowDuplicates` 为 `True`

```
.\AssetStudio.CLI.exe --silent "D:\Genshin Impact Game\YuanShen_Data\StreamingAssets\AssetBundles\blocks" "D:\gi-assets"  --types Texture2D --game GI --names "^UI_Gcg_(Buff|Cardface|Debuff|Char_AvatarIcon|Char_MonsterIcon)|^Skill_|^MonsterSkill_|^Btn_(Natsaurus|Vehicle)"
```
