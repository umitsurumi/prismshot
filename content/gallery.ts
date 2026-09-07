import type { Locale } from "@/lib/i18n";

import { resolvePhotos } from "../lib/photo-content";

export const galleryPhotos = resolvePhotos([
    {
        asset: "gallery-2026-08-28",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-08-07",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-07-18",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-07-11",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-06-26",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-06-05",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-05-02",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-04-10",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-03-20-1",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-03-20-0",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-02-27",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-02-07-1",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-02-07-0",
        author: "PrismShot",
    },
    {
        asset: "gallery-2026-01-17",
        author: "PrismShot",
    },
    {
        asset: "gallery-2025-12-13-1",
        author: "PrismShot",
    },
    {
        asset: "gallery-2025-12-13-0",
        author: "PrismShot",
    },
], "gallery", true);

export const galleryPageCopy: Record<
    Locale,
    {
        section: {
            number: string;
            title: string;
            accent: string;
            note: string;
        };
        showing: string;
        of: string;
        photographs: string;
        sorted: string;
        loadMore: string;
        allLoaded: string;
        photographyBy: string;
    }
> = {
    zh: {
        section: {
            number: "01 / Collection",
            title: "那些值得被",
            accent: "再次看见",
            note: "",
        },
        showing: "正在展示",
        of: "/",
        photographs: "张活动照片",
        sorted: "按拍摄日期 · 新 → 旧",
        loadMore: "加载更多 24 张",
        allLoaded: "已展示全部照片",
        photographyBy: "摄影",
    },
    en: {
        section: {
            number: "01 / Collection",
            title: "Moments worth ",
            accent: "seeing again",
            note: "",
        },
        showing: "Showing",
        of: "/",
        photographs: "event photographs",
        sorted: "Capture date · New → Old",
        loadMore: "Load 24 more",
        allLoaded: "All photographs shown",
        photographyBy: "Photography",
    },
};
