import type { Locale } from "@/lib/i18n";

import { resolvePhotos } from "../lib/photo-content";
import type { LocalizedText, PhotoContent, PhotoInput } from "./types";

export type EventKind = "gather" | "partner" | "class";

export interface CalendarMonth {
    year: number;
    month: number;
}

export interface CalendarEvent {
    id: string;
    date: string;
    kind: EventKind;
    typeLabel: LocalizedText;
    title: LocalizedText;
    time: string;
    note: LocalizedText;
}

export interface ActivityContent {
    id: string;
    name: LocalizedText;
    summary: LocalizedText;
    description: LocalizedText;
    meta: LocalizedText[];
    photos: PhotoContent[];
}

export const configuredEventMonths: readonly CalendarMonth[] = [
    { year: 2026, month: 9 },
];

export const calendarEvents: readonly CalendarEvent[] = [
    {
        id: "class-2026-09-04",
        date: "2026-09-04",
        kind: "class",
        typeLabel: { zh: "摄影教学", en: "Workshop" },
        title: { zh: "教练，我要学摄影", en: "Coach, Teach Me Photography" },
        time: "21:30",
        note: {
            zh: "",
            en: "",
        },
    },
    {
        id: "partner-2026-09-11",
        date: "2026-09-11",
        kind: "partner",
        typeLabel: { zh: "双人组队挑战", en: "Two-person team challenge" },
        title: { zh: "同镜搭子", en: "Frame Partners" },
        time: "21:30",
        note: {
            zh: "",
            en: "",
        },
    },
    {
        id: "gather-2026-09-18",
        date: "2026-09-18",
        kind: "gather",
        typeLabel: { zh: "集体合拍", en: "Group shoot" },
        title: {
            zh: "主题赛摄影展 + 相聚一镜",
            en: "Theme Contest Exhibition + Together in One Frame",
        },
        time: "21:30",
        note: {
            zh: "",
            en: "",
        },
    },
    {
        id: "class-2026-09-25",
        date: "2026-09-25",
        kind: "class",
        typeLabel: { zh: "摄影教学", en: "Workshop" },
        title: { zh: "教练，我要学摄影", en: "Coach, Teach Me Photography" },
        time: "21:30",
        note: {
            zh: "",
            en: "",
        },
    },
];

const activityInputs: readonly (Omit<ActivityContent, "photos"> & { photos: readonly PhotoInput[] })[] = [
    {
        id: "together-one-frame",
        name: { zh: "相聚一镜", en: "Together in One Frame" },
        summary: {
            zh: "围绕主题展开集体合拍，用镜头定格每一次美好同框。",
            en: "A themed group shoot that turns every shared frame into a memory.",
        },
        description: {
            zh: "活动提前一周开放合照主题征集与讨论，活动期间以摄影创作为核心，开展集体合拍活动，用镜头定格社团温暖瞬间，记录每一次美好同框。",
            en: "One week before each event, the community opens submissions and discussion for the group-photo theme. The event centres on photography and a collaborative group shoot, capturing the club's warm moments and every memorable frame we share.",
        },
        meta: [
            {
                zh: "形式 · 主题合拍 / 集体创作",
                en: "Format · Themed group creation",
            },
            { zh: "规模 · 全体成员开放", en: "Access · Open to all members" },
        ],
        photos: [
            {
                asset: "events-together-one-frame-01",
                author: "PrismShot",
                date: "2026-08-28",
            },
            {
                asset: "events-together-one-frame-02",
                author: "PrismShot",
                date: "2026-08-07",
            },
            {
                asset: "events-together-one-frame-03",
                author: "anonymous",
                date: "2026-02-27",
            },
            {
                asset: "events-together-one-frame-04",
                author: "PrismShot",
                date: "2026-06-05",
            },
        ],
    },
    {
        id: "frame-partners",
        name: { zh: "同镜搭子", en: "Frame Partners" },
        summary: {
            zh: "两人自由组队，通过盲盒卡组完成基础与进阶摄影挑战。",
            en: "Teams of two use mystery card decks to complete core and advanced photography challenges.",
        },
        description: {
            zh: "参与者可自由组队，以两人为一组参与盲盒挑战。基础卡组包含任务状态卡、镜头卡与氛围卡三类。完成基础挑战后，即可解锁进阶玩法。完成对应挑战可兑换社团定制奖品，三项进阶挑战全部完成后，还可解锁专属神秘定制奖品。",
            en: "Participants form teams of two for a mystery-card challenge. The core deck contains task-status, lens, and atmosphere cards; completing the core challenge unlocks the advanced rounds. Each completed challenge can be redeemed for a club-made prize, while completing all three advanced challenges unlocks an exclusive mystery prize.",
        },
        meta: [
            {
                zh: "基础卡组 · 任务状态卡 / 镜头卡 / 氛围卡",
                en: "Core deck · Task-status / lens / atmosphere cards",
            },
            {
                zh: "终极挑战 · 解锁四类盲盒卡组，完成创作挑战",
                en: "Ultimate challenge · Unlock four card categories and complete a creative challenge",
            },
            {
                zh: "趣味复刻 · 完成 Meme 图片复刻创作",
                en: "Meme recreation · Recreate a meme image",
            },
            {
                zh: "互拍创作 · 互相拍摄专属头像与封面作品",
                en: "Portrait swap · Create personalised profile and cover images for one another",
            },
            {
                zh: "挑战奖励 · 完成对应挑战兑换定制奖品；三项进阶全部完成解锁神秘奖品",
                en: "Challenge rewards · Redeem custom prizes; complete all three advanced challenges to unlock a mystery prize",
            },
        ],
        photos: [
            {
                asset: "events-frame-partners-01",
                author: "~KY39~ X TsurumiUmi",
                date: "2026-07-31",
            },
            {
                asset: "events-frame-partners-02",
                author: "樱井绮萝萝 X 小夜",
                date: "2026-08-21",
            },
            {
                asset: "events-frame-partners-03",
                author: "Guiltfix X 小鹭",
                date: "2026-08-21",
            },
            {
                asset: "events-frame-partners-04",
                author: "SenSundy白",
                date: "2026-08-21",
            },
        ],
    },
    {
        id: "photo-coaching",
        name: { zh: "教练，我要学摄影", en: "Coach, Teach Me Photography" },
        summary: {
            zh: "从摄影插件到现场实操，零基础也能轻松开始虚拟摄影。",
            en: "From camera tools to field practice, a friendly start for new photographers.",
        },
        description: {
            zh: "VRChat 专项摄影教学，聚焦插件功能讲解与实操。活动前半段是茶话会环节，将介绍插件的基础功能与使用方法，活动后半段开启实战教学，带领大家上手练习插件拍摄技巧。",
            en: "This VRChat photography workshop focuses on camera plugin features and hands-on practice. The first half is a relaxed discussion introducing the plugin's core features and how to use them; the second moves into practical instruction, guiding everyone through its photography tools and techniques.",
        },
        meta: [
            {
                zh: "形式 · 茶话会 + 实战教学",
                en: "Format · Talk and guided practice",
            },
            { zh: "难度 · 零基础友好", en: "Level · Beginner-friendly" },
            {
                zh: "内容 · 插件教学与实战",
                en: "Topics · Plugin instruction and hands-on practice",
            },
        ],
        photos: [
            {
                asset: "events-photo-coaching-01",
                date: "2026-08-14",
            },
            {
                asset: "events-photo-coaching-02",
                date: "2026-08-14",
            },
            {
                asset: "events-photo-coaching-03",
                author: "SenSundy白",
                date: "2026-07-03",
            },
            {
                asset: "events-photo-coaching-04",
                author: "~KY39~",
                date: "2026-05-22",
            },
        ],
    },
];

export const activities: readonly ActivityContent[] = activityInputs.map((activity) => ({
    ...activity,
    photos: resolvePhotos(activity.photos, activity.id),
}));

export const eventPageCopy: Record<
    Locale,
    {
        calendarSection: {
            number: string;
            title: string;
            accent: string;
            note: string;
        };
        programSection: {
            number: string;
            title: string;
            accent: string;
            note: string;
        };
        selectedDateLabel: string;
        emptyDate: string;
        monthPrevious: string;
        monthNext: string;
        weekdays: readonly string[];
        legends: Record<EventKind, string>;
        photoGroupLabel: string;
    }
> = {
    zh: {
        calendarSection: {
            number: "01 / Calendar",
            title: "周常活动｜",
            accent: "每周五 21:30",
            note: "活动时间均为北京时间（UTC+8），活动开启后将在游戏群组房间内进行。",
        },
        programSection: {
            number: "02 / Program",
            title: "提前加入群组，",
            accent: "等待本周的镜头召集",
            note: "选择活动名称查看详情。点击照片进入大图预览。",
        },
        selectedDateLabel: "Selected date · UTC+8",
        emptyDate: "这一天暂时没有已配置活动。",
        monthPrevious: "上一个有活动的月份",
        monthNext: "下一个有活动的月份",
        weekdays: ["一", "二", "三", "四", "五", "六", "日"],
        legends: { gather: "相聚一镜", partner: "同镜搭子", class: "摄影教学" },
        photoGroupLabel: "活动照片",
    },
    en: {
        calendarSection: {
            number: "01 / Calendar",
            title: "Weekly events | ",
            accent: "Every Friday at 21:30",
            note: "All event times are shown in China Standard Time (UTC+8), and events take place in the in-game group instance.",
        },
        programSection: {
            number: "02 / Program",
            title: "Join the group ahead of time, ",
            accent: "and await this week's photo call",
            note: "Select an activity name to view its details. Select a photograph to open the viewer.",
        },
        selectedDateLabel: "Selected date · UTC+8",
        emptyDate: "No event is currently configured for this date.",
        monthPrevious: "Previous month with events",
        monthNext: "Next month with events",
        weekdays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        legends: {
            gather: "Group shoot",
            partner: "Frame Partners",
            class: "Workshop",
        },
        photoGroupLabel: "Event photographs",
    },
};
