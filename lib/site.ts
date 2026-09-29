// The app's identity in one place. The icon, share card, manifest, robots and sitemap read it.

export const site = {
  /** Shown in the header, the tab title and the share card. */
  name: "Mosaic",
  /** Home-screen label: 12 characters or fewer. */
  shortName: "Mosaic",
  /** One plain sentence: what it does and for whom. */
  description: "Scouting reports for VALORANT pro teams: how they win, where they're weak and how to beat them, from real VCT matches.",
  /** Production URL, no trailing slash. Makes share-image URLs absolute. */
  url: "https://mosaic-plum.vercel.app",
  /** Brand key: privacy and support links live at kitchenlabs-one.vercel.app/apps/<slug>/. */
  slug: "mosaic",
  /** A public showcase: robots.ts allows crawling and sitemap.ts lists the pages. */
  isPublic: true,
  /** Must equal --bg in kl-tokens.css (light, dark) so browser chrome never flashes. */
  themeColor: { light: "#F2F4F9", dark: "#0B0F1A" },
  /** Share-card colours (Satori can't read CSS variables): the app's accent and neutrals. */
  card: { bg: "#F2F4F9", ink: "#121829", ink2: "#5A6479", accent: "#0F766E" },
} as const;

/** Required by Riot's "Legal Jibber Jabber" policy for fan projects, word for word. */
export const RIOT_DISCLAIMER =
  "Mosaic was created under Riot Games' \"Legal Jibber Jabber\" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.";
