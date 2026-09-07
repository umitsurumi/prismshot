# Cloudflare Pages 部署

项目输出标准静态文件，不依赖 Cloudflare 运行时。

## 构建设置

- Framework preset：Next.js (Static HTML Export)
- Build command：`npm run build`
- Build output directory：`out`
- Node.js：22（仓库含 `.node-version`）

> Cloudflare 的该框架预设默认填入 `npx next build`，必须手动改成 `npm run build`。直接运行 Next CLI 会绕过 npm `prebuild`，导致 `public/generated/` 中的响应式图片没有生成，页面引用的 `/generated/photos/*` 在线上返回 404。

构建前确保 Git LFS 源图实体已下载（`git lfs pull`）。manifest 不入库，由构建独立生成；日志应有 `[photos] manifest ready`、内容校验和 `[images] verified`。同名替换照片会按内容摘要重建，生成照片使用 `max-age=0, must-revalidate`，避免稳定 URL 被旧的不可变缓存长期占用。已在旧策略下缓存的客户端可能需要一次缓存刷新。

正式生产环境设置：

```text
NEXT_PUBLIC_SITE_URL=https://prismshot.top
PRISMSHOT_RELEASE=1
```

一周年摄影赛使用可选的构建变量控制：

```text
PRISMSHOT_ANNIVERSARY=1
```

不设置时，构建收尾阶段会移除中英文周年页静态文件，并校验导航与 sitemap 中没有入口；设置为 `1` 时则同时生成两种语言的页面与入口。该行为依赖 npm `postbuild`，因此 Cloudflare 的构建命令必须保持为 `npm run build`。

预览环境设置 `PRISMSHOT_PREVIEW=1`，生成的页面与 `robots.txt` 会禁止索引。正式分支不要设置该变量。

## 域名

在 Pages 项目中绑定 `prismshot.top`。若需要将 `*.pages.dev` 永久跳转到规范域名，应在 Cloudflare 控制台使用 Bulk Redirect 配置；不要在静态站点中写死会影响预览环境的全局重定向。

`public/_headers` 为带哈希的 Next 静态资源设置长期缓存，为生成照片设置重新验证缓存，并添加基础安全响应头。部署后抽查 `/`、`/en`、常驻内容页、`/robots.txt` 和 `/sitemap.xml`，并直接访问至少一个 `/generated/photos/*.webp` 或 `.avif` 地址确认返回 200。周年页关闭时确认 `/anniversary` 与 `/en/anniversary` 返回 404；开启时确认两页均返回 200。
