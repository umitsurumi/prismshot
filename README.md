# PrismShot

PrismShot 棱镜定格的中英双语静态官网。正式页面按照已通过评审的居中原型实现，内容通过 TypeScript 配置维护。

## 技术基线

- Next.js 16（App Router）
- React 19
- TypeScript
- ESLint
- npm
- 静态导出到 `out/`
- Sharp 构建时响应式图片
- Cloudflare Pages 部署

## 目录

```text
CONTEXT.md           活动、主题赛、画廊与署名的统一领域语言
app/                 中英文静态路由与 SEO 文件
components/          共享布局、页面模块与浏览器交互
content/             类型化双语内容配置
assets/source/       构建前摄影源素材
docs/requirements/   原始需求、确认稿与视觉参考
docs/prototype/      唯一保留的 HTML 原型
public/images/       Logo、首页等直接使用的素材
public/generated/    构建时生成且不提交的响应式图片
scripts/             内容校验与图片生成
```

资料入口见 [`docs/README.md`](./docs/README.md)，内容更新见 [`docs/maintenance.md`](./docs/maintenance.md)，部署见 [`docs/deployment.md`](./docs/deployment.md)。实现与验收以 [`docs/requirements/design.md`](./docs/requirements/design.md) 为最终约定。

## 本地命令

```bash
npm install
npm run dev
npm run content:validate
npm run images:build
npm run photos:manifest
npm run test:photos
npm run lint
npm run typecheck
npm run build
```

先执行 `git lfs pull` 取回源照片实体。`npm run dev` 会先校验内容并生成本地响应式图片。`npm run build` 会先校验内容并生成多档 WebP/AVIF，然后按 `next.config.ts` 的静态导出配置生成 `out/`。

照片资产清单自动生成，不需要维护 `photo-assets.ts` 或尺寸文件。lint/typecheck/content:validate 自动准备 manifest；开发期间变更源图后运行 `npm run images:build`。完整构建后可用 `npm run test:photos:browser` 检查中英文照片页面（需要 Chromium）。

一周年摄影赛默认不参与构建。需要同时启用中英文页面、导航入口和 sitemap 条目时，使用 `PRISMSHOT_ANNIVERSARY=1 npm run build`；取消该变量后重新构建即可关闭。必须通过 `npm run build` 构建，构建后的收尾校验会保证开关状态与静态产物一致。

正式发布构建需设置 `PRISMSHOT_RELEASE=1`。只要 [`content/readiness.ts`](./content/readiness.ts) 仍存在未确认项，发布构建就会失败；普通开发和预览构建不受影响。
