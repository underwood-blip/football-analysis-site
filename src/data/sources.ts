export interface SourceInfo {
  key: string;
  name: string;
  url?: string;
  status: "usable" | "manual-only" | "blocked";
  description: string;
}

export const SOURCES: SourceInfo[] = [
  {
    key: "football-data",
    name: "football-data.co.uk",
    url: "https://football-data.co.uk/data.php",
    status: "usable",
    description:
      "主力來源：免費 CSV，含賽果、xG（近年）、多家莊家賠率與亞盤。URL 規則為 /mmz4281/{賽季}/{聯賽代碼}.csv，英超代碼 E0。注意必須使用不帶 www 的網域，否則會拿到 302 空內容。",
  },
  {
    key: "titan007",
    name: "球探網 titan007",
    url: "https://zq.titan007.com/cn/League/36.html",
    status: "blocked",
    description:
      "實測有 WAF，自動請求回 HTTP 442（已被WAF系統攔截）。無法直接抓取，只適合當人工核對連結，本站不對其自動化。",
  },
  {
    key: "hkjc",
    name: "香港馬會足智彩",
    url: "https://bet.hkjc.com/ch/football",
    status: "manual-only",
    description:
      "賠率與賽程頁為前端動態載入，無公開 API。只做人工核對用，本站不自動化抓取。",
  },
];
