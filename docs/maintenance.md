# 内容与素材维护

正式页面不从 CMS 或 Markdown 读取内容。修改 `content/*.ts` 后重新构建即可。

## 内容入口

- `content/site.ts`：导航、首页文案与各页 SEO。
- `content/events.ts`：活动日历、活动介绍与活动照片。
- `content/contests.ts`：当期主题赛、状态边界、规则和历届冠军。
- `content/gallery.ts`：画廊照片与分页文案。
- `content/photo-manifest.generated.ts`：自动发现的照片 ID、路径、尺寸、文件名日期和精确引用类型；由命令生成且被 Git 忽略，不手工编辑。
- `content/about.ts`：关于文案、五个平台账号与外链、赞助说明和团队成员。
- `content/readiness.ts`：正式发布占位门禁。

站点文案以及照片中已经提供的标题、说明或替代文本都要同时提供 `zh` 和 `en`。照片元数据可以整个省略；作者明确未知时使用 `unknown`，主动匿名使用 `anonymous`。未知日期直接省略。

## 首页背景

首页背景只能使用社团确认并提供的本地素材。将图片放入 `public/images/home/`，再把 `content/site.ts` 中的 `homeBackgroundSrc` 从 `null` 改为对应的 `/images/home/<文件名>` 路径。没有合适素材时保持 `null`，页面会使用设计好的纯黑背景，不请求外部图片，且不会阻止正式发布。

## 摄影图片

横图和竖图使用同一套流程，不需要把原图预先裁成统一比例。建议保留社团提供的最大可用版本，但不设 1600 像素的硬门槛。常见的 3840×2160 横图可直接使用；相机方向信息纠正后为竖图时，脚本会自动读取为 2160×3840。脚本只按照 EXIF 校正相机方向，不会根据长宽猜测方向，也不会为了统一版式擅自旋转照片。

1. 将 JPG、JPEG 或 PNG 放入 `assets/source/photos/<project>/.../<filename>.<ext>`。第一层项目目录必需，例如 `events/`、`gallery/`、`contests/`，未来可增加其他项目。
2. 项目名和文件 basename 只允许小写英文字母、数字和连字符。同项目 basename 必须唯一，不能用不同扩展名或中间目录区分同名照片。
3. 在内容文件中显式选图，并填写无法推导的元数据。放入目录不会自动发布；未被任何内容引用的源图会使内容校验失败，待筛选照片应放在照片根目录之外。
4. 运行 `npm run images:build` 更新类型提示和图片；准备提交时运行 `npm run build`。

资产 ID 为“项目名 + 连字符 + basename”，例如 `events/class/photo-coaching-2026-09-04-0.png` 对应 `events-photo-coaching-2026-09-04-0`。中间目录不参与 ID，移动这些目录不会改变引用。修改项目名或 basename 会改变 ID；同名换扩展名不改变 ID，但必须移走旧文件。拼接后的 ID 也必须全局唯一：`a-b/c.png` 与 `a/b-c.png` 会被判定冲突。符号链接不允许用作照片来源。

文件名中以连字符或首尾界定的严格、有效 `YYYY-MM-DD` 自动成为日期；多图序号保留在 ID 中，不属于日期。有推导日期时禁止再配置 `date`，即使数值相同；没有可识别日期时可手填有效 ISO 日期，也可省略。非法日历日期和多个日期片段报错，不猜测。缺少前导零的 `2026-1-17` 不会推导，应改为 `2026-01-17`。

照片配置示例（填入现有集合解析函数的数组）：

```ts
// gallery：日期从文件名推导
{ asset: "gallery-2026-08-28", author: "PrismShot" }

// events：旧文件名无日期，按需手填
{
  asset: "events-photo-coaching-01",
  date: "2026-08-14",
  alt: { zh: "可选的照片描述", en: "Optional photograph description" },
  focalPoint: { x: 50, y: 42 },
}
```

作者逐张填写、可选、无默认值。标题、说明、替代文本必须中英文成对提供。未取得 alt 时显示通用“摄影作品 / Photograph”。`focalPoint` 是当前内容位置的裁切焦点，x/y 使用 0–100 的有限数值；它不改变原图或灯箱的完整比例展示。尺寸由原图自动读取，不提供手工断言或覆盖。

### 各页面图片配置

- 活动：在 `activityInputs` 对应活动的 `photos` 数组中显式列出 `asset`，每项活动 1–6 张，保留配置顺序。
- 画廊：在 `resolvePhotos([...], "gallery", true)` 数组中列出 `asset`。自动按最终日期倒序；同日保持配置顺序，无日期排最后并保持相对顺序。
- 历届冠军：在 `resolveChampions([...])` 中填写正整数 `issue`，例如 `{ issue: 13, theme: { zh: "失控", en: "Out of Control" }, author: "0-Nova-0" }`。自动关联 `contests/issue13.*` 并按期号倒序；不再填写重复 id/image。主题和作者可选，照片日期有值时在灯箱显示，与比赛赛程分开。
- 当期主题赛：主视觉保持显式配置，例如 `resolvePhoto({ asset: "contests-issue13" }, "current contest visual")`；不按当期期号猜测。冠军卡片保持 4:5 裁切，灯箱显示完整原图。

普通内容 ID 默认等于资产 ID，只有需要独立标识时才填 `id`。同一资产可以跨活动或页面复用，每个位置可独立填写署名、说明和焦点；同一 gallery 或同一活动的 photos 内不允许重复资产，换一个 id 也不能绕过检查。

### 生成命令与缓存

`photos:manifest` 仅扫描源文件并读取尺寸，不编码图片。`lint`、`typecheck`、`content:validate` 会自动先生成 manifest；内容校验检查引用、孤立照片、日期和内容规则，不要求已生成图片变体。`images:build` 自动准备 manifest、编码图片并验证产物。`dev` 和 `build` 会先完成内容与图片准备。首次克隆必须取回 Git LFS 实体，不能仅有指针文件。

开发服务器启动后新增、改名或替换源图，执行 `npm run images:build` 刷新；当前没有后台源图扫描器。普通内容配置更新由 Next 开发服务器监听。

图片按 480、960、1600 目标档位生成 WebP/AVIF，绝不放大，重复实际宽度去重；文件名保留档位，srcset 使用真实宽度。路径为 `/generated/photos/<asset-id>-<档位>.<format>`。图像编码仅应用 EXIF 方向，不复制 EXIF 信息。

manifest、响应式图片和 `.photo-cache/` 都不提交。缓存根据源内容及编码参数摘要失效，同名换图即使保留旧时间戳也会重建。构建完成后清理照片生成目录中的陈旧命名变体，不删除源图。照片 URL 稳定，部署头要求浏览器重新验证缓存；Next 带哈希的静态资源仍使用长期缓存。

验证命令：`npm run test:photos` 覆盖生成与解析规则；`npm run build && npm run test:photos:browser` 覆盖中英文桌面/手机照片加载、srcset 和灯箱。浏览器检查需要 Chromium，默认 `/usr/bin/chromium`，可通过 `CHROMIUM_PATH` 指定。

## Cloudflare Pages 图片构建

Cloudflare 的 `Next.js (Static HTML Export)` 预设默认使用 `npx next build`。该命令不会触发本项目在 npm `prebuild` 生命周期中配置的内容校验和图片生成，因此必须在 Pages 的构建设置中手动覆盖为：

```text
Build command: npm run build
Build output directory: out
```

构建日志必须包含 `[images] verified ... variants`。部署后至少抽查一个 `/generated/photos/*.avif` 或 `.webp` 地址返回 `200`；若页面正常但这些地址返回 `404`，优先检查构建命令是否仍为预设的 `npx next build`，然后重新部署。

## 社交链接与二维码

在 `content/about.ts` 中同时修改账号名和 `href`。二维码由同一个 `href` 在静态构建时生成，不需要提交二维码图片，也没有浏览器端二维码依赖。QQ 必须替换为可直接访问的加群链接。

首页的 QQ、VRChat、Discord 链接在 `content/site.ts` 中单独配置，两处应保持一致。

## 团队成员

团队成员的姓名、双语职务和照片都在 `content/about.ts` 的 `teamMembers` 中维护。正式照片提供前，`portraitSrc` 保持 `null`，页面显示品牌化占位；替换时将照片放入 `public/images/about/`，把 `portraitSrc` 改为对应的 `/images/about/<文件名>`，并同时确认中英文 `portraitAlt`。四张照片使用统一的 4:5 卡片裁切，页面组件不需要改动。

全部人物照片替换并检查授权后，将 `content/readiness.ts` 中的 `teamPortraits` 改为 `true`。

## 一周年摄影赛

一周年摄影赛是独立顶级页面，默认关闭。运行 `PRISMSHOT_ANNIVERSARY=1 npm run build` 会同时生成 `/anniversary` 与 `/en/anniversary`，并在两种语言的导航和 sitemap 中加入入口；不设置该变量重新构建会同时移除这些内容。

页面名称和中英文“敬请期待”文案在 `content/site.ts` 中维护。导航顺序与路由段集中在 `lib/i18n.ts`，开关规则在 `lib/site-features.ts`。不要只改路由文件夹或单独添加一种语言的入口。

## 发布门禁

普通开发允许占位内容。准备正式发布时：

1. 替换摄影作品、介绍文案、比赛数据和全部社交账号；首页背景若不提供则保留纯黑默认背景。
2. 逐项人工检查二维码、外链、中英文；能获得准确图片描述时一并完善替代文本。
3. 将 `content/readiness.ts` 中对应项目改为 `true`。
4. 运行 `PRISMSHOT_RELEASE=1 npm run build`。

内容 ID 重复、已提供的日期格式错误、图片资产或变体不完整、活动图片数量超出 1–6 或仍有占位项时，校验会阻止发布构建。缺少可选照片元数据本身不会阻止发布。
