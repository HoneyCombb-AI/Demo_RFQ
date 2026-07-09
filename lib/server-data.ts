import fs from "fs/promises";
import path from "path";
import { 
  FeatureGraphData, 
  SpecItem, 
  FeasibilityData, 
  DeconstructedRouteData, 
  ComputedRouteData, 
  ExcelQuoteData,
  PartLevelSpec,
  ReportData,
  PartListItem
} from "./data";

const DATA_DIR = path.join(process.cwd(), "app", "jal");

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.\s]+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function isDataDir(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) return false;
    const files = await fs.readdir(dirPath);
    return files.includes("feature_graph.json");
  } catch {
    return false;
  }
}

export async function getPartsList(): Promise<PartListItem[]> {
  const entries = await fs.readdir(DATA_DIR);
  const parts: PartListItem[] = [];

  for (const entry of entries) {
    const fullPath = path.join(DATA_DIR, entry);
    if (!(await isDataDir(fullPath))) continue;

    const fg = await readJson<FeatureGraphData>(
      path.join(fullPath, "feature_graph.json"),
    );
    if (!fg) continue;

    parts.push({
      slug: slugify(entry),
      folderName: entry,
      drawingNumber: fg.part.drawing_number,
      partName: fg.part.name,
      material: fg.part.material,
    });
  }

  return parts;
}

export async function resolveSlug(slug: string): Promise<string | null> {
  const entries = await fs.readdir(DATA_DIR);
  for (const entry of entries) {
    if (slugify(entry) === slug) {
      const fullPath = path.join(DATA_DIR, entry);
      if (await isDataDir(fullPath)) return entry;
    }
  }
  return null;
}

export function derivePartLevelSpecs(fg: FeatureGraphData): PartLevelSpec[] {
  const specs: PartLevelSpec[] = [];
  const features = fg.feature_graph.features;

  const materialType = fg.part.material.toLowerCase().includes("case")
    ? "case-hardening steel"
    : fg.part.material.toLowerCase().includes("alloy")
      ? "alloy steel"
      : "steel";
  specs.push({
    label: "MATERIAL",
    value: fg.part.material,
    detail: `(${materialType})`,
  });

  // HEAT TREATMENT
  const htNote = fg.feature_graph.part_level_specs?.general_notes?.find((n) => n.category === "heat_treatment")?.note_text;
  if (htNote) {
    specs.push({ label: "HEAT TREATMENT", value: htNote });
  } else {
    const htConditions = features
      .map((f) => f.material_condition)
      .filter(Boolean)
      .filter(
        (mc) =>
          mc!.toLowerCase().includes("harden") ||
          mc!.toLowerCase().includes("temper") ||
          mc!.toLowerCase().includes("heat"),
      );
    if (htConditions.length > 0) {
      const mainHt = htConditions[0]!;
      const bodyFeature = features.find((f) => f.feature_type === "part_body");
      const bodyDesc = bodyFeature?.description || "";
      const hvMatch = bodyDesc.match(/(\d+\s*[+\-]\s*\d+\s*HV\d*)/i);
      const ehtMatch = bodyDesc.match(/(Eht\s*[\d.]+[^,]*)/i);
      let htValue = mainHt;
      if (hvMatch || ehtMatch) {
        const parts: string[] = [];
        if (hvMatch) parts.push(hvMatch[1]);
        if (ehtMatch) parts.push(ehtMatch[1]);
        htValue = `case-hardened and tempered — ${parts.join(", ")}`;
      }
      specs.push({ label: "HEAT TREATMENT", value: htValue });
    }
  }

  // GENERAL TOL
  if (fg.feature_graph.part_level_specs?.general_tolerance_standard) {
    specs.push({ label: "GENERAL TOL.", value: fg.feature_graph.part_level_specs.general_tolerance_standard });
  } else {
    const edgeBreakFeature = features.find(
      (f) => f.feature_type === "edge_break",
    );
    if (edgeBreakFeature) {
      const dinTol = edgeBreakFeature.dimensional_tolerances.find(
        (t) =>
          t.tolerance_class?.includes("DIN") ||
          t.tolerance_class?.includes("2768"),
      );
      if (dinTol?.tolerance_class) {
        const dinMatch = dinTol.tolerance_class.match(
          /DIN\s*ISO\s*2768[-\s]*\w+/i,
        );
        specs.push({
          label: "GENERAL TOL.",
          value: dinMatch ? dinMatch[0] : dinTol.tolerance_class,
        });
      }
    }
  }

  // Map directly from general_notes
  if (fg.feature_graph.part_level_specs?.general_notes) {
    const categoryMap: Record<string, string> = {
      deburr: "DEBURR",
      tolerance: "TOLERANCE",
      finish: "FINISH",
      other: "OTHER",
      inspection: "INSPECTION",
    };

    for (const [cat, label] of Object.entries(categoryMap)) {
      const note = fg.feature_graph.part_level_specs.general_notes.find((n) => n.category === cat);
      if (note) {
        specs.push({ label, value: note.note_text });
      } else if (cat === "other") {
        specs.push({
          label: "OTHER",
          value:
            "RoHS and REACH compliant according to the valid EU directive at the time of delivery.",
        });
      }
    }
  } else {
    // Fallback if general_notes missing
    const edgeBreakFeature = features.find(
      (f) => f.feature_type === "edge_break",
    );
    
    const finishes = features
      .filter((f) => f.surface_finish)
      .map((f) => ({
        symbol: f.surface_finish!.finish_symbol,
        notes: f.surface_finish!.notes,
      }));
    if (finishes.length > 0) {
      const finishSymbols = [...new Set(finishes.map((f) => f.symbol))].join(
        ", ",
      );
      const mainNote = finishes[0]?.notes || "";
      specs.push({
        label: "FINISH",
        value: `General surface texture block shows ${finishSymbols} as specified local finish classes; Rz values are not converted to Ra.`,
        detail: mainNote !== "" ? mainNote : undefined,
      });
    }

    if (edgeBreakFeature) {
      specs.push({
        label: "DEBURR",
        value: "Sharp edges must be completely deburred; burrs removed.",
      });
      const dinTol = edgeBreakFeature.dimensional_tolerances.find(
        (t) => t.tolerance_class?.includes("DIN"),
      );
      if (dinTol?.tolerance_class) {
        specs.push({
          label: "TOLERANCE",
          value: `Unspecified dimensions, external radii, chamfers and angular dimensions according to ${dinTol.tolerance_class.split(" unless")[0]}.`,
        });
      }
    }

    const rohsNote = fg.part.title_block_notes.find(
      (n) => n.toLowerCase().includes("rohs") || n.toLowerCase().includes("reach"),
    );
    specs.push({
      label: "OTHER",
      value: rohsNote || "RoHS and REACH compliant according to the valid EU directive at the time of delivery.",
    });
  }

  return specs;
}

export async function getReportData(
  slug: string,
): Promise<ReportData | null> {
  const folderName = await resolveSlug(slug);
  if (!folderName) return null;

  const dir = path.join(DATA_DIR, folderName);

  const [featureGraph, specList, feasibility, deconstructedRoute, computedRoute, excelQuote] =
    await Promise.all([
      readJson<FeatureGraphData>(path.join(dir, "feature_graph.json")),
      readJson<SpecItem[]>(path.join(dir, "spec_list.json")),
      readJson<FeasibilityData>(path.join(dir, "feasibility_result.json")),
      readJson<DeconstructedRouteData>(path.join(dir, "deconstructed_route.json")),
      readJson<ComputedRouteData>(path.join(dir, "computed_route.json")),
      readJson<ExcelQuoteData>(path.join(dir, "excel_quote.json")),
    ]);

  if (!featureGraph || !specList || !feasibility || !deconstructedRoute || !computedRoute || !excelQuote) {
    return null;
  }

  const partLevelSpecs = derivePartLevelSpecs(featureGraph);

  return {
    slug,
    folderName,
    featureGraph,
    specList,
    feasibility,
    deconstructedRoute,
    computedRoute,
    excelQuote,
    partLevelSpecs,
    balloonedImageUrl: `/api/images/${slug}/ballooned`,
    originalImageUrl: `/api/images/${slug}/original`,
  };
}

export function getImagePath(
  folderName: string,
  type: "ballooned" | "original",
): string {
  const filename =
    type === "ballooned" ? "ballooned_drawing.png" : "page_001_original.png";
  return path.join(DATA_DIR, folderName, filename);
}
