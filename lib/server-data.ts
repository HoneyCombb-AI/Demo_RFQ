import fs from "fs/promises";
import path from "path";
import {
  FeatureGraphData,
  SpecItem,
  ComponentSpecData,
  FeasibilityData,
  DeconstructedRouteData,
  ComputedRouteData,
  ExcelQuoteData,
  SetupQuoteData,
  ObscQuoteData,
  JttQuoteData,
  PartLevelSpec,
  ReportData,
  PartListItem,
} from "./data";

const ORG_CONFIGS: Record<string, { quoteFile: string; quoteFormat: "excel" | "setup" | "obsc" | "jtt" }> = {
  jtt:  { quoteFile: "quote.json",       quoteFormat: "jtt"   },
  alt:  { quoteFile: "quote.json",       quoteFormat: "setup" },
  sft:  { quoteFile: "quote.json",       quoteFormat: "setup" },
  ltt:  { quoteFile: "quote.json",       quoteFormat: "setup" },
  obsc: { quoteFile: "quote.json",       quoteFormat: "obsc"  },
};

function orgDataDir(orgSlug: string): string {
  return path.join(process.cwd(), "app", orgSlug);
}

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
    return (
      files.includes("feature_graph.json") ||
      files.includes("feature_graph_result.json") ||
      files.includes("drawing_metadata.json")
    );
  } catch {
    return false;
  }
}

export async function getPartsList(orgSlug: string = "jtt"): Promise<PartListItem[]> {
  if (!ORG_CONFIGS[orgSlug]) return [];
  const dataDir = orgDataDir(orgSlug);
  const entries = await fs.readdir(dataDir);
  const parts: PartListItem[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dataDir, entry);
    if (!(await isDataDir(fullPath))) continue;

    const fg = await readJson<FeatureGraphData>(path.join(fullPath, "feature_graph.json"));
    if (fg) {
      parts.push({
        slug: slugify(entry),
        folderName: entry,
        drawingNumber: fg.part.drawing_number,
        partName: fg.part.name,
        material: fg.part.material ?? "Not specified",
      });
    } else {
      const dm = await readJson<any>(path.join(fullPath, "drawing_metadata.json"));
      const fgr = await readJson<any>(path.join(fullPath, "feature_graph_result.json"));
      const q = await readJson<any>(path.join(fullPath, "quote.json"));

      parts.push({
        slug: slugify(entry),
        folderName: entry,
        drawingNumber: dm?.drawing_number || fgr?.part?.drawing_number || q?.drawing_number || entry,
        partName: dm?.part_name || fgr?.part?.name || q?.part_name || entry,
        material: dm?.material_raw || fgr?.part?.material || q?.material || "Not specified",
      });
    }
  }

  return parts;
}

export async function resolveSlug(slug: string, orgSlug: string = "jtt"): Promise<string | null> {
  if (!ORG_CONFIGS[orgSlug]) return null;
  const dataDir = orgDataDir(orgSlug);
  const entries = await fs.readdir(dataDir);
  for (const entry of entries) {
    if (slugify(entry) === slug) {
      const fullPath = path.join(dataDir, entry);
      if (await isDataDir(fullPath)) return entry;
    }
  }
  return null;
}

export function derivePartLevelSpecs(fg: FeatureGraphData): PartLevelSpec[] {
  const specs: PartLevelSpec[] = [];
  const features = fg.feature_graph.features;

  const mat = fg.part.material ?? "";
  const materialType = mat.toLowerCase().includes("case")
    ? "case-hardening steel"
    : mat.toLowerCase().includes("alloy")
      ? "alloy steel"
      : "steel";
  specs.push({
    label: "MATERIAL",
    value: mat || "Not specified",
    detail: `(${materialType})`,
  });

  // HEAT TREATMENT
  const htNote = fg.feature_graph.part_level_specs?.general_notes?.find(
    (n) => n.category === "heat_treatment",
  )?.note_text;
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
    specs.push({
      label: "GENERAL TOL.",
      value: fg.feature_graph.part_level_specs.general_tolerance_standard,
    });
  } else {
    const edgeBreakFeature = features.find((f) => f.feature_type === "edge_break");
    if (edgeBreakFeature) {
      const dinTol = edgeBreakFeature.dimensional_tolerances.find(
        (t) => t.tolerance_class?.includes("DIN") || t.tolerance_class?.includes("2768"),
      );
      if (dinTol?.tolerance_class) {
        const dinMatch = dinTol.tolerance_class.match(/DIN\s*ISO\s*2768[-\s]*\w+/i);
        specs.push({
          label: "GENERAL TOL.",
          value: dinMatch ? dinMatch[0] : dinTol.tolerance_class,
        });
      }
    }
  }

  // General notes
  if (fg.feature_graph.part_level_specs?.general_notes) {
    const categoryMap: Record<string, string> = {
      deburr: "DEBURR",
      tolerance: "TOLERANCE",
      finish: "FINISH",
      other: "OTHER",
      inspection: "INSPECTION",
    };
    for (const [cat, label] of Object.entries(categoryMap)) {
      const note = fg.feature_graph.part_level_specs.general_notes.find(
        (n) => n.category === cat,
      );
      if (note) {
        specs.push({ label, value: note.note_text });
      } else if (cat === "other") {
        specs.push({
          label: "OTHER",
          value: "RoHS and REACH compliant according to the valid EU directive at the time of delivery.",
        });
      }
    }
  } else {
    const edgeBreakFeature = features.find((f) => f.feature_type === "edge_break");
    const finishes = features
      .filter((f) => f.surface_finish)
      .map((f) => ({ symbol: f.surface_finish!.finish_symbol, notes: f.surface_finish!.notes }));
    if (finishes.length > 0) {
      const finishSymbols = [...new Set(finishes.map((f) => f.symbol))].join(", ");
      const mainNote = finishes[0]?.notes || "";
      specs.push({
        label: "FINISH",
        value: `General surface texture block shows ${finishSymbols} as specified local finish classes; Rz values are not converted to Ra.`,
        detail: mainNote !== "" ? mainNote : undefined,
      });
    }
    if (edgeBreakFeature) {
      specs.push({ label: "DEBURR", value: "Sharp edges must be completely deburred; burrs removed." });
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

async function loadObscReportData(
  dir: string,
  slug: string,
  folderName: string,
  orgSlug: string = "obsc"
): Promise<ReportData | null> {
  const [fgr, dm, specList, routeResult, cycleTimeResult, quote] = await Promise.all([
    readJson<any>(path.join(dir, "feature_graph_result.json")),
    readJson<any>(path.join(dir, "drawing_metadata.json")),
    readJson<SpecItem[]>(path.join(dir, "spec_list.json")),
    readJson<any>(path.join(dir, "route_result.json")),
    readJson<any>(path.join(dir, "cycle_time_result.json")),
    readJson<ObscQuoteData>(path.join(dir, "quote.json")),
  ]);

  if (!fgr || !specList || !routeResult || !cycleTimeResult || !quote) {
    return null;
  }

  // 1. Synthesize FeatureGraphData
  const partName = dm?.part_name || fgr.part?.name || quote.part_name || folderName;
  const drawingNumber = dm?.drawing_number || fgr.part?.drawing_number || quote.drawing_number || folderName;
  const material = dm?.material_raw || fgr.part?.material || quote.material || "Not specified";
  const titleBlockNotes = (dm?.general_notes || []).map((n: any) => n.note_text);
  if (dm?.extraction_notes) {
    titleBlockNotes.push(dm.extraction_notes);
  }

  const envelope = fgr.feature_graph?.part_envelope || {};
  const features = (fgr.feature_graph?.features || []).map((feat: any) => ({
    ...feat,
    dimensional_tolerances: (feat.dimensional_tolerances || []).map((tol: any) => ({
      ...tol,
      nominal_value_mm: tol.nominal_value_mm ?? tol.nominal_mm ?? 0,
      nominal_mm: tol.nominal_mm ?? tol.nominal_value_mm ?? 0,
      plus_mm: tol.plus_mm ?? null,
      minus_mm: tol.minus_mm ?? null,
      tolerance_class: tol.tolerance_class ?? null,
      is_critical: tol.is_critical ?? false,
    })),
  }));

  const featureGraph: FeatureGraphData = {
    analysis_id: fgr.analysis_id || `analysis_${folderName}`,
    source: {
      file: `${folderName}.pdf`,
      page_count: 1,
      prepared_images: [
        {
          page_index: 1,
          image_path: path.join(dir, "page_001_original.png"),
          image_name: "page_001_original.png",
          width_px: 3000,
          height_px: 2000,
        },
      ],
    },
    part: {
      name: partName,
      drawing_number: drawingNumber,
      revision: dm?.revision || fgr.part?.revision || null,
      material: material,
      quantity: fgr.part?.quantity || quote.quantity || 100,
      units: fgr.part?.units || "mm",
      title_block_notes: titleBlockNotes,
      confidence: 1,
    },
    feature_graph: {
      part_envelope: {
        length_mm: envelope.length_mm ?? 0,
        width_mm: envelope.width_mm ?? envelope.max_diameter_mm ?? envelope.height_mm ?? 0,
        height_mm: envelope.height_mm ?? envelope.max_diameter_mm ?? 0,
        max_diameter_mm: envelope.max_diameter_mm ?? null,
        estimated_volume_cm3: envelope.estimated_volume_cm3 ?? null,
        estimated_weight_kg: envelope.estimated_weight_kg ?? quote.weights?.gross_weight_kg ?? null,
        envelope_shape: envelope.envelope_shape ?? "cylindrical",
      },
      coordinate_system: fgr.feature_graph?.coordinate_system || {
        primary_axis: "Z",
        orientation_notes: "",
        datum_origin: "",
      },
      features,
      part_level_specs: {
        general_tolerance_standard:
          dm?.general_notes?.find((n: any) => n.category === "tolerance")?.note_text || null,
        general_notes: dm?.general_notes || [],
      },
    },
  };

  // 2. Synthesize FeasibilityData
  const clarifications = (routeResult.clarifications || fgr.clarifications || []).map((c: any) => ({
    clarification_id: c.clarification_id || "C01",
    question: c.question || "",
    why_it_matters: c.why_it_matters || "",
    blocks: Array.isArray(c.blocks) ? c.blocks.map(String) : [],
    suggested_default: c.suggested_default || null,
    priority: c.priority || "medium",
  }));

  const assumptions = (routeResult.assumptions || fgr.assumptions || []).map((a: any) => ({
    assumption_id: a.assumption_id || "A01",
    text: a.text || "",
    applies_to: a.applies_to || [],
    impact: a.impact || "medium",
    confidence: a.confidence || 0.9,
  }));

  const outsideOps = (routeResult.operations || []).filter((o: any) => o.in_house === false);

  const feasibility: FeasibilityData = {
    analysis_id: `feasibility_${folderName}`,
    source_feature_graph_id: featureGraph.analysis_id,
    feasibility: {
      can_proceed: true,
      status: "feasible",
      risk_level: "low",
      blockers: [],
      risks: [],
      outside_processes_needed: outsideOps.map((o: any) => ({
        process: o.name,
        reason: o.setup_note || "Outside processing required",
        sequence_position: `Op ${o.sequence}`,
        estimated_lead_time_days: null,
      })),
      material_machinable: true,
      tolerances_achievable: true,
      machines_available: true,
      part_fits_envelopes: true,
      assessment_notes:
        dm?.extraction_notes ||
        fgr.feature_graph?.part_notes ||
        `Manufacturing analysis confirms part is feasible on CNC Turning and VMC milling equipment using standard tooling. Material ${material} is machinable.`,
    },
    clarifications,
    assumptions,
  };

  // 3. Synthesize DeconstructedRouteData and ComputedRouteData
  const deconstructedSetups: any[] = [];
  const computedSetups: any[] = [];

  let totalCuttingTime = 0;
  let totalNonCuttingTime = 0;
  let totalMachiningTime = 0;
  let totalSetupTime = 0;
  let totalHandlingTime = 0;
  let totalSubOpsCount = 0;

  const rawOps: any[] = routeResult.operations || [];
  const ctOps: any[] = cycleTimeResult.operations || [];

  for (const op of rawOps) {
    const setupId = `S${String(op.sequence).padStart(3, "0")}`;
    const ctOp = ctOps.find((o: any) => o.sequence === op.sequence);

    const deconstructedSubOps: any[] = [];
    const computedSubOps: any[] = [];

    let setupCuttingTime = 0;
    let setupNonCuttingTime = 0;

    const rawSubOps: any[] = op.sub_operations || [];
    const ctSubOps: any[] = ctOp?.sub_op_results || [];

    for (const subOp of rawSubOps) {
      totalSubOpsCount++;
      const subOpId = `${setupId}_OP${String(subOp.sequence).padStart(2, "0")}`;
      const subOpRes = ctSubOps.find((r: any) => r.sub_op_seq === subOp.sequence);

      const tCut = subOpRes?.t_cut_min ?? 0;
      const tTool = subOpRes?.t_tool_min ?? 0;
      const tRapid = subOpRes?.t_rapid_min ?? 0;
      const tSubTotal = subOpRes?.t_sub_total_min ?? tCut;

      setupCuttingTime += tCut;
      setupNonCuttingTime += tTool + tRapid;

      deconstructedSubOps.push({
        sub_op_id: subOpId,
        sequence: subOp.sequence,
        operation_type: subOp.operation_type,
        operation_name: (subOp.operation_type || "").replace(/_/g, " ").toUpperCase(),
        target_feature_ids: subOp.target_feature_ids || [],
        reason: subOp.reason || "",
        formula_hint: subOp.inputs?.kind || subOp.operation_type,
        formula_inputs: subOp.inputs || { process_type: subOp.operation_type },
      });

      computedSubOps.push({
        sub_op_id: subOpId,
        sequence: subOp.sequence,
        operation_type: subOp.operation_type,
        operation_name: (subOp.operation_type || "").replace(/_/g, " ").toUpperCase(),
        formula_hint: subOp.inputs?.kind || subOp.operation_type,
        target_feature_ids: subOp.target_feature_ids || [],
        formula_inputs_used: subOp.inputs || { process_type: subOp.operation_type },
        cycle_time: {
          cutting_time_min: tCut,
          non_cutting_time_min: tTool + tRapid,
          total_time_min: tSubTotal,
          formula_family: subOpRes?.kind ?? subOp.operation_type,
          cutting_parameters: {
            cutting_speed_m_min: subOpRes?.trace?.Vc ?? null,
            rpm: subOpRes?.rpm ?? subOpRes?.trace?.rpm ?? null,
            rpm_capped: false,
            feed_per_rev_mm: subOpRes?.trace?.fn ?? null,
            feed_per_tooth_mm: subOpRes?.trace?.fz ?? null,
            feed_rate_mm_min: subOpRes?.feed_mm_min ?? subOpRes?.trace?.feed_rate ?? null,
            flute_count: subOpRes?.trace?.flute_count ?? null,
            tool_diameter_mm: subOpRes?.trace?.tool_diameter ?? null,
            step_over_mm: subOpRes?.trace?.ae ?? null,
            depth_per_pass_mm: subOpRes?.trace?.ap ?? null,
            number_of_passes: subOpRes?.trace?.steps ?? subOpRes?.trace?.pass_count ?? null,
            reversal_factor: null,
          },
          calculation_notes: subOpRes?.trace
            ? Object.entries(subOpRes.trace).map(([k, v]) => `${k}: ${v}`)
            : [],
          confidence: "high",
          warnings: subOpRes?.warnings || [],
        },
        skipped: false,
        skip_reason: null,
      });
    }

    const sTime = ctOp?.setup_time_min ?? op.setup_time_min ?? 0;
    const hTime = ctOp?.t_handling_min ?? 0;
    const mTime =
      ctOp?.t_machining_min ??
      (ctOp?.t_op_total_min ? ctOp.t_op_total_min - (ctOp.t_setup_per_piece_min ?? 0) : setupCuttingTime);

    totalCuttingTime += setupCuttingTime;
    totalNonCuttingTime += setupNonCuttingTime;
    totalMachiningTime += mTime;
    totalSetupTime += sTime;
    totalHandlingTime += hTime;

    deconstructedSetups.push({
      setup_id: setupId,
      sequence: op.sequence,
      setup_name: op.name,
      machine_family: op.machine_family,
      machine_reason: op.setup_note || "",
      workholding: {
        method: op.setup_note?.split(".")[0] || "Standard fixturing",
        grip_description: "",
        special_fixture_required: false,
        fixture_notes: null,
      },
      datum_references: op.datum_references || [],
      stock_state_before: "",
      stock_state_after: "",
      access_directions: [],
      sub_operations: deconstructedSubOps,
    });

    computedSetups.push({
      setup_id: setupId,
      sequence: op.sequence,
      setup_name: op.name,
      machine_family: op.machine_family,
      in_house: op.in_house ?? true,
      outside_process: !(op.in_house ?? true),
      sub_operations: computedSubOps,
      time_summary: {
        setup_time_min: sTime,
        handling_time_min: hTime,
        total_cutting_time_min: setupCuttingTime,
        total_non_cutting_time_min: setupNonCuttingTime,
        total_machining_time_min: mTime,
        sub_operation_count: rawSubOps.length,
        outside_process: !(op.in_house ?? true),
      },
    });
  }

  const stockForm = routeResult.stock?.form || (quote.weights?.raw_bar_dia_mm ? "tube" : "round_bar");
  const stockDiameter = quote.weights?.actual_bar_dia_mm || quote.weights?.raw_bar_dia_mm || envelope.max_diameter_mm || null;
  const stockLength = envelope.length_mm ? envelope.length_mm + 2.0 : null;

  const deconstructedRoute: DeconstructedRouteData = {
    analysis_id: `route_${folderName}`,
    source_feature_graph_id: featureGraph.analysis_id,
    stock: {
      form: stockForm,
      material: material,
      starting_dimensions: {
        diameter_mm: stockDiameter,
        length_mm: stockLength,
        width_mm: envelope.width_mm || null,
        height_mm: envelope.height_mm || null,
        thickness_mm: null,
        notes: quote.weights
          ? `Raw bar Ø: ${quote.weights.raw_bar_dia_mm}mm, Actual Ø: ${quote.weights.actual_bar_dia_mm}mm, Gross weight: ${quote.weights.gross_weight_kg}kg`
          : null,
      },
      machining_allowance_mm: 1.0,
      why: assumptions.find((a: any) => a.assumption_id === "A01")?.text || "Stock selected based on envelope and minimal material removal",
      confidence: 0.95,
    },
    route: {
      route_name: `Manufacturing Route for ${drawingNumber}`,
      route_reason: `${routeResult.part_family || "Rotational"} component routing utilizing ${rawOps.length} manufacturing operations.`,
      part_family: routeResult.part_family || "hybrid",
      base_geometry: routeResult.base_geometry || "rotational",
      total_setups: rawOps.length,
      total_sub_operations: totalSubOpsCount,
      setups: deconstructedSetups,
    },
    clarifications,
    assumptions,
    confidence: {
      overall: 0.95,
      feasibility: 0.95,
      stock_selection: 0.95,
      route_planning: 0.95,
      formula_inputs: 0.95,
    },
  };

  const computedRoute: ComputedRouteData = {
    analysis_id: `computed_route_${folderName}`,
    shop_profile_basis: {
      profile_path: "profiles/obsc_standard.json",
      profile_name: "OBSC Standard Production Profile",
      material_machinability_key: "aluminum_standard",
      notes: ["CNC Lathe, VMC 3-Axis, Bench Deburr, Outside Anodize/Plating, Inspection"],
    },
    part_family: routeResult.part_family || "hybrid",
    base_geometry: routeResult.base_geometry || "rotational",
    material: material,
    setups: computedSetups,
    total_summary: {
      total_setups: rawOps.length,
      total_sub_operations: totalSubOpsCount,
      total_setup_time_min: totalSetupTime,
      total_handling_time_min: totalHandlingTime,
      total_cutting_time_min: totalCuttingTime,
      total_non_cutting_time_min: totalNonCuttingTime,
      total_machining_time_min: totalMachiningTime,
      total_time_min: cycleTimeResult.t_cycle_per_part_min || totalMachiningTime + totalHandlingTime,
      outside_process_count: outsideOps.length,
      confidence: "high",
    },
    global_warnings: cycleTimeResult.warnings || [],
    global_assumptions: assumptions.map((a: any) => a.text),
  };

  const partLevelSpecs = derivePartLevelSpecs(featureGraph);
  const { balloonedImageUrls, originalImageUrls } = await getDrawingPageUrls(dir, orgSlug, slug);

  return {
    slug,
    folderName,
    orgSlug,
    quoteFormat: "obsc",
    featureGraph,
    specList,
    componentSpec: null,
    feasibility,
    deconstructedRoute,
    computedRoute,
    excelQuote: null,
    setupQuote: null,
    obscQuote: quote,
    jttQuote: null,
    partLevelSpecs,
    balloonedImageUrls,
    originalImageUrls,
  };
}

async function loadJttReportData(
  dir: string,
  slug: string,
  folderName: string,
  orgSlug: string
): Promise<ReportData | null> {
  const [fgr, specList, componentSpec, feasRaw, routeResult, cycleTimeResult, quote] = await Promise.all([
    readJson<any>(path.join(dir, "feature_graph_result.json")),
    readJson<SpecItem[]>(path.join(dir, "spec_list.json")),
    readJson<ComponentSpecData>(path.join(dir, "component_spec.json")),
    readJson<any>(path.join(dir, "feasibility_result.json")),
    readJson<any>(path.join(dir, "route_result.json")),
    readJson<any>(path.join(dir, "cycle_time_result.json")),
    readJson<JttQuoteData>(path.join(dir, "quote.json")),
  ]);

  if (!fgr || !specList || !routeResult || !cycleTimeResult || !quote) {
    return null;
  }

  // 1. Synthesize FeatureGraphData
  const partName = fgr.part?.name || feasRaw?.source_drawing || quote.part_name || folderName;
  const drawingNumber = fgr.part?.drawing_number || feasRaw?.drawing_number || quote.drawing_number || folderName;
  const material = fgr.part?.material || feasRaw?.material || quote.material || "16MnCr5";
  const titleBlockNotes: string[] = [];
  if (feasRaw?.heat_treatment) {
    titleBlockNotes.push(`Heat Treatment: ${feasRaw.heat_treatment}`);
  }

  const envelope = fgr.feature_graph?.part_envelope || {};
  const features = (fgr.feature_graph?.features || []).map((feat: any) => ({
    ...feat,
    dimensional_tolerances: (feat.dimensional_tolerances || []).map((tol: any) => ({
      ...tol,
      nominal_value_mm: tol.nominal_value_mm ?? tol.nominal_mm ?? 0,
      nominal_mm: tol.nominal_mm ?? tol.nominal_value_mm ?? 0,
      plus_mm: tol.plus_mm ?? null,
      minus_mm: tol.minus_mm ?? null,
      tolerance_class: tol.tolerance_class ?? null,
      is_critical: tol.is_critical ?? false,
    })),
  }));

  const featureGraph: FeatureGraphData = {
    analysis_id: fgr.analysis_id || `analysis_${folderName}`,
    source: {
      file: `${folderName}.pdf`,
      page_count: 1,
      prepared_images: [
        {
          page_index: 1,
          image_path: path.join(dir, "page_001_original.png"),
          image_name: "page_001_original.png",
          width_px: 3000,
          height_px: 2000,
        },
      ],
    },
    part: {
      drawing_number: drawingNumber,
      name: partName,
      revision: fgr.part?.revision || null,
      material,
      quantity: fgr.part?.quantity || quote.quantity || 100,
      units: fgr.part?.units || "mm",
      title_block_notes: titleBlockNotes,
      confidence: 1,
    },
    feature_graph: {
      part_envelope: {
        length_mm: envelope.length_mm ?? 0,
        width_mm: envelope.width_mm ?? envelope.max_diameter_mm ?? envelope.height_mm ?? 0,
        height_mm: envelope.height_mm ?? envelope.max_diameter_mm ?? 0,
        max_diameter_mm: envelope.max_diameter_mm ?? null,
        estimated_volume_cm3: envelope.estimated_volume_cm3 ?? null,
        estimated_weight_kg: envelope.estimated_weight_kg ?? quote.weights?.gross_weight_kg ?? null,
        envelope_shape: envelope.envelope_shape ?? "cylindrical",
      },
      coordinate_system: fgr.feature_graph?.coordinate_system || {
        primary_axis: "Z",
        orientation_notes: "",
        datum_origin: "",
      },
      features,
      part_level_specs: {
        general_tolerance_standard: null,
        general_notes: feasRaw?.heat_treatment
          ? [{ note_text: feasRaw.heat_treatment, category: "heat_treatment" }]
          : [],
      },
    },
  };

  // 2. Synthesize FeasibilityData
  const clarifications = (routeResult.clarifications || fgr.clarifications || []).map((c: any) => ({
    clarification_id: c.clarification_id || "C01",
    question: c.question || "",
    why_it_matters: c.why_it_matters || "",
    blocks: Array.isArray(c.blocks) ? c.blocks.map(String) : [],
    suggested_default: c.suggested_default || null,
    priority: c.priority || "medium",
  }));

  const assumptions = (routeResult.assumptions || fgr.assumptions || []).map((a: any) => ({
    assumption_id: a.assumption_id || "A01",
    text: a.text || "",
    applies_to: a.applies_to || [],
    impact: a.impact || "medium",
    confidence: a.confidence || 0.9,
  }));

  const outsideOps = (routeResult.operations || []).filter((o: any) => o.in_house === false);

  const feasibility: FeasibilityData = {
    analysis_id: feasRaw?.analysis_id || `feasibility_${folderName}`,
    source_feature_graph_id: featureGraph.analysis_id,
    feasibility: {
      can_proceed: feasRaw?.feasibility?.can_proceed ?? true,
      status: feasRaw?.feasibility?.status ?? "feasible_with_risks",
      risk_level: feasRaw?.feasibility?.risk_level ?? "medium",
      blockers: feasRaw?.feasibility?.blockers ?? [],
      risks: (feasRaw?.feasibility?.risks || []).map((r: any) => ({
        risk_type: r.risk_type,
        description: r.description,
        mitigation: r.mitigation,
        affected_feature_ids: r.affected_spec_ids || r.affected_feature_ids || [],
      })),
      outside_processes_needed:
        feasRaw?.feasibility?.outside_processes_needed && feasRaw.feasibility.outside_processes_needed.length > 0
          ? feasRaw.feasibility.outside_processes_needed
          : outsideOps.map((o: any) => ({
              process: o.name,
              reason: o.setup_note || "Outside processing required",
              sequence_position: `Op ${o.sequence}`,
              estimated_lead_time_days: null,
            })),
      material_machinable: feasRaw?.feasibility?.material_machinable ?? true,
      tolerances_achievable: feasRaw?.feasibility?.tolerances_achievable ?? true,
      machines_available: feasRaw?.feasibility?.machines_available ?? true,
      part_fits_envelopes: feasRaw?.feasibility?.part_fits_envelopes ?? true,
      assessment_notes:
        feasRaw?.feasibility?.assessment_notes ||
        (feasRaw?.heat_treatment
          ? `Heat Treatment: ${feasRaw.heat_treatment}`
          : "Manufacturing analysis confirms part is feasible on CNC Turning, Gear Hobbing, and Grinding equipment."),
    },
    spec_assessments: feasRaw?.spec_assessments || [],
    clarifications,
    assumptions,
  };

  // 3. Synthesize DeconstructedRouteData and ComputedRouteData
  const deconstructedSetups: any[] = [];
  const computedSetups: any[] = [];

  let totalCuttingTime = 0;
  let totalNonCuttingTime = 0;
  let totalMachiningTime = 0;
  let totalSetupTime = 0;
  let totalHandlingTime = 0;
  let totalSubOpsCount = 0;

  const rawOps: any[] = routeResult.operations || [];
  const ctOps: any[] = cycleTimeResult.operations || [];

  for (const op of rawOps) {
    const setupId = `S${String(op.sequence).padStart(3, "0")}`;
    const ctOp = ctOps.find((o: any) => o.sequence === op.sequence);

    const deconstructedSubOps: any[] = [];
    const computedSubOps: any[] = [];

    let setupCuttingTime = 0;
    let setupNonCuttingTime = 0;

    const rawSubOps: any[] = op.sub_operations || [];
    const ctSubOps: any[] = ctOp?.sub_op_results || [];

    for (const subOp of rawSubOps) {
      totalSubOpsCount++;
      const subOpId = `${setupId}_OP${String(subOp.sequence).padStart(2, "0")}`;
      const subOpRes = ctSubOps.find((r: any) => r.sub_op_seq === subOp.sequence);

      const tCut = subOpRes?.t_cut_min ?? 0;
      const tTool = subOpRes?.t_tool_min ?? 0;
      const tRapid = subOpRes?.t_rapid_min ?? 0;
      const tSubTotal = subOpRes?.t_sub_total_min ?? tCut;

      setupCuttingTime += tCut;
      setupNonCuttingTime += tTool + tRapid;

      deconstructedSubOps.push({
        sub_op_id: subOpId,
        sequence: subOp.sequence,
        operation_type: subOp.operation_type,
        operation_name: (subOp.operation_type || "").replace(/_/g, " ").toUpperCase(),
        target_feature_ids: subOp.target_feature_ids || [],
        reason: subOp.reason || "",
        formula_hint: subOp.inputs?.kind || subOp.operation_type,
        formula_inputs: subOp.inputs || { process_type: subOp.operation_type },
      });

      computedSubOps.push({
        sub_op_id: subOpId,
        sequence: subOp.sequence,
        operation_type: subOp.operation_type,
        operation_name: (subOp.operation_type || "").replace(/_/g, " ").toUpperCase(),
        formula_hint: subOp.inputs?.kind || subOp.operation_type,
        target_feature_ids: subOp.target_feature_ids || [],
        formula_inputs_used: subOp.inputs || { process_type: subOp.operation_type },
        cycle_time: {
          cutting_time_min: tCut,
          non_cutting_time_min: tTool + tRapid,
          total_time_min: tSubTotal,
          formula_family: subOpRes?.kind ?? subOp.operation_type,
          cutting_parameters: {
            cutting_speed_m_min: subOpRes?.trace?.Vc ?? null,
            rpm: subOpRes?.rpm ?? subOpRes?.trace?.rpm ?? null,
            rpm_capped: false,
            feed_per_rev_mm: subOpRes?.trace?.fn ?? null,
            feed_per_tooth_mm: subOpRes?.trace?.fz ?? null,
            feed_rate_mm_min: subOpRes?.feed_mm_min ?? subOpRes?.trace?.feed_rate ?? null,
            flute_count: subOpRes?.trace?.flute_count ?? null,
            tool_diameter_mm: subOpRes?.trace?.tool_diameter ?? null,
            step_over_mm: subOpRes?.trace?.ae ?? null,
            depth_per_pass_mm: subOpRes?.trace?.ap ?? null,
            number_of_passes: subOpRes?.trace?.steps ?? subOpRes?.trace?.pass_count ?? null,
            reversal_factor: null,
          },
          calculation_notes: subOpRes?.trace
            ? Object.entries(subOpRes.trace).map(([k, v]) => `${k}: ${v}`)
            : [],
          confidence: "high",
          warnings: subOpRes?.warnings || [],
        },
        skipped: false,
        skip_reason: null,
      });
    }

    const sTime = ctOp?.setup_time_min ?? op.setup_time_min ?? 0;
    const hTime = ctOp?.t_handling_min ?? 0;
    const mTime =
      ctOp?.t_machining_min ??
      (ctOp?.t_op_total_min ? ctOp.t_op_total_min - (ctOp.t_setup_per_piece_min ?? 0) : setupCuttingTime);

    totalCuttingTime += setupCuttingTime;
    totalNonCuttingTime += setupNonCuttingTime;
    totalMachiningTime += mTime;
    totalSetupTime += sTime;
    deconstructedSetups.push({
      setup_id: setupId,
      sequence: op.sequence,
      setup_name: op.name,
      machine_family: op.machine_family,
      machine_reason: op.setup_note || `${op.name} utilizing ${op.machine_family}`,
      workholding: {
        method: op.setup_note?.split(".")[0] || "Standard fixturing",
        grip_description: op.setup_note || "",
        special_fixture_required: false,
        fixture_notes: null,
      },
      datum_references: op.datum_references || [],
      stock_state_before: "Preceding operation state",
      stock_state_after: "Completed operation state",
      access_directions: [],
      sub_operations: deconstructedSubOps,
    });

    computedSetups.push({
      setup_id: setupId,
      sequence: op.sequence,
      setup_name: op.name,
      machine_family: op.machine_family,
      in_house: op.in_house ?? true,
      outside_process: !(op.in_house ?? true),
      sub_operations: computedSubOps,
      time_summary: {
        setup_time_min: sTime,
        handling_time_min: hTime,
        total_cutting_time_min: setupCuttingTime,
        total_non_cutting_time_min: setupNonCuttingTime,
        total_machining_time_min: mTime,
        sub_operation_count: rawSubOps.length,
        outside_process: !(op.in_house ?? true),
      },
    });
  }

  const stockForm = "round_bar";
  const stockDiameter = quote.weights?.actual_bar_dia_mm || quote.weights?.raw_bar_dia_mm || envelope.max_diameter_mm || null;
  const stockLength = envelope.length_mm ? envelope.length_mm + 2.0 : null;

  const deconstructedRoute: DeconstructedRouteData = {
    analysis_id: `route_${folderName}`,
    source_feature_graph_id: featureGraph.analysis_id,
    stock: {
      form: stockForm,
      material: material,
      starting_dimensions: {
        diameter_mm: stockDiameter,
        length_mm: stockLength,
        width_mm: envelope.width_mm || null,
        height_mm: envelope.height_mm || null,
        thickness_mm: null,
        notes: quote.weights
          ? `Raw bar Ø: ${quote.weights.raw_bar_dia_mm}mm, Actual Ø: ${quote.weights.actual_bar_dia_mm}mm, Gross weight: ${quote.weights.gross_weight_kg}kg`
          : null,
      },
      machining_allowance_mm: 1.0,
      why: assumptions.find((a: any) => a.assumption_id === "A01")?.text || "Stock selected based on envelope and minimal material removal",
      confidence: 0.95,
    },
    route: {
      route_name: `Manufacturing Route for ${drawingNumber}`,
      route_reason: `${routeResult.part_family || "Rotational"} component routing utilizing ${rawOps.length} manufacturing operations.`,
      part_family: routeResult.part_family || "rotational",
      base_geometry: routeResult.base_geometry || "rotational",
      total_setups: rawOps.length,
      total_sub_operations: totalSubOpsCount,
      setups: deconstructedSetups,
    },
    clarifications,
    assumptions,
    confidence: {
      overall: 0.95,
      feasibility: 0.95,
      stock_selection: 0.95,
      route_planning: 0.95,
      formula_inputs: 0.95,
    },
  };

  const computedRoute: ComputedRouteData = {
    analysis_id: `computed_route_${folderName}`,
    shop_profile_basis: {
      profile_path: "profiles/jtt_gear_standard.json",
      profile_name: "JTT Gear & Shaft Production Profile",
      material_machinability_key: "case_hardened_steel",
      notes: ["CNC Turning, Gear Hobbing, Gear Shaving, Vacuum Carburizing Heat Treatment, OD/ID/Gear Grinding"],
    },
    part_family: routeResult.part_family || "rotational",
    base_geometry: routeResult.base_geometry || "rotational",
    material: material,
    setups: computedSetups,
    total_summary: {
      total_setups: rawOps.length,
      total_sub_operations: totalSubOpsCount,
      total_setup_time_min: totalSetupTime,
      total_handling_time_min: totalHandlingTime,
      total_cutting_time_min: totalCuttingTime,
      total_non_cutting_time_min: totalNonCuttingTime,
      total_machining_time_min: totalMachiningTime,
      total_time_min: cycleTimeResult.t_cycle_per_part_min || totalMachiningTime + totalHandlingTime,
      outside_process_count: outsideOps.length,
      confidence: "high",
    },
    global_warnings: cycleTimeResult.warnings || [],
    global_assumptions: assumptions.map((a: any) => a.text),
  };

  const partLevelSpecs = derivePartLevelSpecs(featureGraph);
  const { balloonedImageUrls, originalImageUrls } = await getDrawingPageUrls(dir, orgSlug, slug);

  return {
    slug,
    folderName,
    orgSlug,
    quoteFormat: "jtt",
    featureGraph,
    specList,
    componentSpec,
    feasibility,
    deconstructedRoute,
    computedRoute,
    excelQuote: null,
    setupQuote: null,
    obscQuote: null,
    jttQuote: quote,
    partLevelSpecs,
    balloonedImageUrls,
    originalImageUrls,
  };
}

export async function getReportData(
  slug: string,
  orgSlug: string = "jtt",
): Promise<ReportData | null> {
  const orgCfg = ORG_CONFIGS[orgSlug];
  if (!orgCfg) return null;

  const folderName = await resolveSlug(slug, orgSlug);
  if (!folderName) return null;

  const dir = path.join(orgDataDir(orgSlug), folderName);

  if (orgSlug === "obsc" || orgCfg.quoteFormat === "obsc") {
    return loadObscReportData(dir, slug, folderName, orgSlug);
  }

  if (orgSlug === "jtt" || orgCfg.quoteFormat === "jtt") {
    return loadJttReportData(dir, slug, folderName, orgSlug);
  }

  const [featureGraph, specList, feasibility, deconstructedRoute, computedRoute] =
    await Promise.all([
      readJson<FeatureGraphData>(path.join(dir, "feature_graph.json")),
      readJson<SpecItem[]>(path.join(dir, "spec_list.json")),
      readJson<FeasibilityData>(path.join(dir, "feasibility_result.json")),
      readJson<DeconstructedRouteData>(path.join(dir, "deconstructed_route.json")),
      readJson<ComputedRouteData>(path.join(dir, "computed_route.json")),
    ]);

  if (!featureGraph || !specList || !feasibility || !deconstructedRoute || !computedRoute) {
    return null;
  }

  let excelQuote: ExcelQuoteData | null = null;
  let setupQuote: SetupQuoteData | null = null;

  if (orgCfg.quoteFormat === "excel") {
    excelQuote = await readJson<ExcelQuoteData>(path.join(dir, orgCfg.quoteFile));
    if (!excelQuote) return null;
  } else {
    setupQuote = await readJson<SetupQuoteData>(path.join(dir, orgCfg.quoteFile));
    if (!setupQuote) return null;
  }

  const partLevelSpecs = derivePartLevelSpecs(featureGraph);

  const apiBase = `/api/images/${orgSlug}/${slug}`;
  const { balloonedImageUrls, originalImageUrls } = await getDrawingPageUrls(dir, orgSlug, slug);

  return {
    slug,
    folderName,
    orgSlug,
    quoteFormat: orgCfg.quoteFormat,
    featureGraph,
    specList,
    componentSpec: null,
    feasibility,
    deconstructedRoute,
    computedRoute,
    excelQuote,
    setupQuote,
    obscQuote: null,
    jttQuote: null,
    partLevelSpecs,
    balloonedImageUrls,
    originalImageUrls,
  };
}

async function getDrawingPageUrls(
  dir: string,
  orgSlug: string,
  slug: string,
): Promise<{ balloonedImageUrls: string[]; originalImageUrls: string[] }> {
  const apiBase = `/api/images/${orgSlug}/${slug}`;
  try {
    const files = await fs.readdir(dir);
    const balloonedMulti = files.filter((f) => /^ballooned_drawing_\d+\.png$/i.test(f)).sort();
    const originalMulti = files.filter((f) => /^page_\d+_vlm\.png$/i.test(f)).sort();
    if (balloonedMulti.length > 0) {
      return {
        balloonedImageUrls: balloonedMulti.map((_, i) => `${apiBase}/ballooned?page=${i + 1}`),
        originalImageUrls: originalMulti.map((_, i) => `${apiBase}/original?page=${i + 1}`),
      };
    }
  } catch {
    // fall through
  }
  return {
    balloonedImageUrls: [`${apiBase}/ballooned`],
    originalImageUrls: [`${apiBase}/original`],
  };
}

export async function findImageFile(
  folderName: string,
  type: "ballooned" | "original",
  orgSlug: string = "jtt",
  page: number = 1,
): Promise<string | null> {
  const dir = path.join(orgDataDir(orgSlug), folderName);
  const p = String(page).padStart(3, "0");
  const candidates =
    type === "ballooned"
      ? [`ballooned_drawing.png`, `ballooned_drawing_${p}.png`]
      : [`page_001_original.png`, `page_${p}_original.png`, `page_${p}_vlm.png`];
  for (const name of candidates) {
    try {
      await fs.access(path.join(dir, name));
      return path.join(dir, name);
    } catch {
      // try next
    }
  }
  return null;
}
