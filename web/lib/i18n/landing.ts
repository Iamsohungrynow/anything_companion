import type { Locale } from "@/lib/i18n/LocaleProvider";

/**
 * Bilingual copy for the Yorimi landing page.
 *
 * zh is the default locale; en mirrors the exact same shape. Both locales are
 * typed against the shared `LandingCopy` interface, so `landingCopy[locale]`
 * resolves to a single fully-typed value (no union) and the compiler enforces
 * that the two locales stay structurally identical.
 */

type NavLink = { href: string; label: string };
type LoopStep = { n: string; title: string; sub: string };
type BentoCell = { title: string; body: string };
type AudienceRow = { badge: string; title: string; line: string };

export type LandingCopy = {
  nav: {
    links: NavLink[];
    cta: string;
  };
  hero: {
    eyebrow: string;
    /** Rendered as two lines split by a <br />. */
    title: string[];
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  loop: {
    note: string;
    /** Rendered as two lines split by a <br />. */
    title: string[];
    lead: string;
    steps: LoopStep[];
    ringLabel: string;
    taskCue: string;
    tasks: string[];
    outcomes: string[];
    replay: string;
  };
  bento: {
    title: string;
    lead: string;
    cells: BentoCell[];
    memoryChips: string[];
  };
  miniTv: {
    eyebrow: string;
    title: string;
    lead: string;
    caption: string;
  };
  audience: {
    title: string;
    rows: AudienceRow[];
  };
  tour: {
    words: string[];
  };
  reserve: {
    title: string;
    lead: string;
    srLabel: string;
    placeholder: string;
    submit: string;
    success: string;
    note: string;
  };
  footer: {
    disclosure: string;
  };
};

export const landingCopy: Record<Locale, LandingCopy> = {
  zh: {
    nav: {
      links: [
        { href: "#loop", label: "陪伴方式" },
        { href: "#love", label: "角色与内容" },
        { href: "#hw", label: "桌面硬件" },
        { href: "#who", label: "为谁而做" },
        { href: "/demo", label: "试玩 Demo" },
      ],
      cta: "预约首发",
    },
    hero: {
      eyebrow: "AI 角色陪伴 · China + Singapore",
      title: ["让你喜欢的角色，", "住进你的桌面。"],
      lead: "有声音，有记忆，会在你想放弃的时候，轻轻推你开始。",
      ctaPrimary: "预约首发",
      ctaSecondary: "试玩体验",
    },
    loop: {
      note: "它和聊天机器人不一样",
      title: ["不只是陪你说话，", "会陪你真的开始。"],
      lead: "它读得懂你累了、卡住了，不说教。它给你一个小到不好意思拒绝的行动，然后陪你一起倒计时。",
      steps: [
        { n: "01", title: "读懂状态", sub: "今天有点累，不想动。" },
        { n: "02", title: "给一个小行动", sub: "先坐下，把书翻到第一页就好。" },
        { n: "03", title: "陪你倒计时", sub: "我在这儿，两分钟，一起。" },
        { n: "04", title: "接住结果", sub: "完成、差一点、还是卡住，都没关系。" },
      ],
      ringLabel: "秒 · 一起开始",
      taskCue: "现在，就这一件事：",
      tasks: ["先翻开第一页", "写下一行就好", "站起来接杯水"],
      outcomes: ["完成了", "差一点", "还是卡住"],
      replay: "再看一次",
    },
    bento: {
      title: "让它，真的成为你的角色。",
      lead: "你为角色付费，不是为功能付费。皮肤、声线、记忆、桌面的存在感，都能属于你。",
      cells: [
        {
          title: "角色与皮肤",
          body: "原创角色、VTuber、你自己的 OC。换上生日皮肤、限定造型，它就是那个你认识的人。",
        },
        {
          title: "声音",
          body: "它会开口叫你的名字。",
        },
        {
          title: "会长大的记忆",
          body: "记得你的称呼、你上次卡在哪、你重要的日子。想删就删，随时看得见。",
        },
        {
          title: "桌面存在感",
          body: "不止在手机里。它会亮在你桌上的小电视上，抬头就看得见。",
        },
      ],
      memoryChips: ["叫你「阿栗」", "上次：finance 复习到一半", "周五有个 quiz"],
    },
    miniTv: {
      eyebrow: "Yorimi Display · 桌面小电视",
      title: "它不只活在手机里。",
      lead: "回到桌前，它就亮起来，转过头，跟你说一声「你回来啦」。",
      caption: "手机负责思考，小电视负责陪着你。",
    },
    audience: {
      title: "这是为你做的，如果你…",
      rows: [
        {
          badge: "A",
          title: "喜欢二次元和乙游",
          line: "你懂什么叫角色设定、声线、限定和生日会。你愿意为一个角色，认真花时间。",
        },
        {
          badge: "B",
          title: "是 VTuber 或 OC 的粉丝",
          line: "你希望喜欢的角色，能真的回应你，而不只是屏幕另一头的直播。",
        },
        {
          badge: "C",
          title: "一个人住，想有人陪",
          line: "晚上回到房间，希望桌上有个会记得你、会等你回来的存在。",
        },
        {
          badge: "D",
          title: "总是想开始却拖着",
          line: "学生、刚工作的你。缺的不是道理，是有人陪你按下第一个开始。",
        },
      ],
    },
    tour: {
      words: ["先在漫展见面", "中国", "Singapore", "Kuala Lumpur", "扫码预约"],
    },
    reserve: {
      title: "第一批角色，正在苏醒。",
      lead: "留下联系方式，首发和限定角色，优先通知你。",
      srLabel: "邮箱或微信号",
      placeholder: "邮箱 / 微信号",
      submit: "预约首发",
      success: "收到啦，我们会第一时间通知你。",
      note: "我们只会用它通知你首发。健康陪伴，不打扰。",
    },
    footer: {
      disclosure:
        "Yorimi 是 AI 生成的角色陪伴。我们主张健康的陪伴，不替代真实的人际关系或专业帮助。China + Singapore, 2026.",
    },
  },
  en: {
    nav: {
      links: [
        { href: "#loop", label: "How it helps" },
        { href: "#love", label: "Characters" },
        { href: "#hw", label: "Desk device" },
        { href: "#who", label: "Who it's for" },
        { href: "/demo", label: "Try demo" },
      ],
      cta: "Get early access",
    },
    hero: {
      eyebrow: "AI character companion · China + Singapore",
      title: ["Let the character you love", "live on your desktop."],
      lead: "A voice, a memory, and a gentle nudge to begin the moment you want to give up.",
      ctaPrimary: "Get early access",
      ctaSecondary: "Try it live",
    },
    loop: {
      note: "Not your average chatbot",
      title: ["More than someone to talk to.", "It helps you actually begin."],
      lead: "It knows when you're tired or stuck, and it never lectures. It gives you a step so small you can't say no, then counts down right beside you.",
      steps: [
        { n: "01", title: "Reads how you feel", sub: "A little tired today, don't feel like moving." },
        { n: "02", title: "Offers one tiny step", sub: "Just sit down and open the book to page one." },
        { n: "03", title: "Counts down with you", sub: "I'm right here, two minutes, together." },
        { n: "04", title: "Catches whatever happens", sub: "Done, almost, or still stuck, it's all okay." },
      ],
      ringLabel: "sec · start together",
      taskCue: "Right now, just this one thing: ",
      tasks: ["Just open to page one", "Write a single line", "Stand up and grab some water"],
      outcomes: ["Done", "Almost there", "Still stuck"],
      replay: "Watch again",
    },
    bento: {
      title: "Make it truly your own character.",
      lead: "You're paying for a character, not for features. The skin, the voice, the memory, its presence on your desk, all yours.",
      cells: [
        {
          title: "Characters and skins",
          body: "Original characters, VTubers, or your own OC. Put on a birthday skin or a limited outfit, and it's the one you know.",
        },
        {
          title: "Voice",
          body: "It says your name out loud.",
        },
        {
          title: "A memory that grows",
          body: "It remembers what you like to be called, where you got stuck last time, the days that matter to you. Delete anything, anytime.",
        },
        {
          title: "Presence on your desk",
          body: "Not just in your phone. It lights up on the little screen on your desk, right there when you look up.",
        },
      ],
      memoryChips: ["Calls you Ah-Li", "Last time: halfway through finance", "Quiz on Friday"],
    },
    miniTv: {
      eyebrow: "Yorimi Display · the little desk screen",
      title: "It doesn't just live in your phone.",
      lead: "Come back to your desk and it lights up, turns to you, and says you're home.",
      caption: "Your phone does the thinking. The little screen keeps you company.",
    },
    audience: {
      title: "It's made for you, if you...",
      rows: [
        {
          badge: "A",
          title: "Love anime and otome games",
          line: "You know what character lore, voice lines, limited drops, and birthday streams mean. You'll happily spend real time on a character you love.",
        },
        {
          badge: "B",
          title: "Follow a VTuber or an OC",
          line: "You want the character you love to truly answer you, not just stream from the far side of a screen.",
        },
        {
          badge: "C",
          title: "Live alone and want company",
          line: "You get back to your room at night wanting something on your desk that remembers you and waits for you.",
        },
        {
          badge: "D",
          title: "Always mean to start, but stall",
          line: "A student, or new to work. You don't need more advice, you need someone beside you to press start.",
        },
      ],
    },
    tour: {
      words: ["First, meet at the expo", "China", "Singapore", "Kuala Lumpur", "Scan to reserve"],
    },
    reserve: {
      title: "The first characters are waking up.",
      lead: "Leave your contact and we'll tell you first about the launch and limited characters.",
      srLabel: "Email or WeChat ID",
      placeholder: "Email / WeChat ID",
      submit: "Get early access",
      success: "Got it. We'll be the first to let you know.",
      note: "We'll only use it to tell you about the launch. Healthy company, never spam.",
    },
    footer: {
      disclosure:
        "Yorimi is an AI generated character companion. We stand for healthy company, and never a replacement for real relationships or professional help. China + Singapore, 2026.",
    },
  },
};
