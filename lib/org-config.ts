import path from "path";

export type QuoteFormat = "excel" | "setup";

export interface OrgConfig {
  code: string;
  slug: string;
  label: string;
  dataDir: string;
  quoteFile: string;
  quoteFormat: QuoteFormat;
}

const ORG_CONFIGS: Record<string, OrgConfig> = {
  "4521": {
    code: "4521",
    slug: "jal",
    label: "JAL",
    dataDir: path.join(process.cwd(), "app", "jal"),
    quoteFile: "excel_quote.json",
    quoteFormat: "excel",
  },
  "5281": {
    code: "5281",
    slug: "alm",
    label: "ALM",
    dataDir: path.join(process.cwd(), "app", "alm"),
    quoteFile: "quote.json",
    quoteFormat: "setup",
  },
};

export function getOrgByCode(code: string): OrgConfig | null {
  return ORG_CONFIGS[code] ?? null;
}

export function getOrgBySlug(slug: string): OrgConfig | null {
  return Object.values(ORG_CONFIGS).find((o) => o.slug === slug) ?? null;
}
