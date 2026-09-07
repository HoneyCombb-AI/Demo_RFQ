import fs from "fs/promises";
import path from "path";
import {
  FeatureGraphData,
  SpecItem,
  ComponentSpecData,
  FeasibilityData,
  DeconstructedRouteData,
  ComputedRouteData,
  JttQuoteData,
  PartLevelSpec,
  ReportData,
  PartListItem,
} from "./data";

const QUOTE_FILE = "quote.json";

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
    return files.includes("feature_graph_result.json") || files.includes("quote.json");
  } catch {
    return false;
  }
}

export async function getPartsList(orgSlug: string): Promise<PartListItem[]> {
  const dataDir = orgDataDir(orgSlug);
  try {
    const entries = await fs.readdir(dataDir);
    const parts: PartListItem[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dataDir, entry);
      if (!(await isDataDir(fullPath))) continue;

      const fgr = await readJson<any>(path.join(fullPath, "feature_graph_result.json"));
      const quote = await readJson<any>(path.join(fullPath, "quote.json"));
      const feasRaw = await readJson<any>(path.join(fullPath, "feasibility_result.json"));

      parts.push({
        slug: slugify(entry),
        folderName: entry,
        drawingNumber: fgr?.part?.drawing_number || feasRaw?.drawing_number || quote?.drawing_number || entry,
        partName: fgr?.part?.name || feasRaw?.source_drawing || quote?.part_name || entry,
        material: fgr?.part?.material || feasRaw?.material || quote?.material || null,
      });
    }

    return parts;
  } catch {
    return [];
  }
}

export async function resolveSlug(slug: string, orgSlug: string): Promise<string | null> {
  const dataDir = orgDataDir(orgSlug);
  try {
    const entries = await fs.readdir(dataDir);
    for (const entry of entries) {
      if (slugify(entry) === slug) {
        const fullPath = path.join(dataDir, entry);
        if (await isDataDir(fullPath)) return entry;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function derivePartLevelSpecs(fg: FeatureGraphData, feasRaw?: any): PartLevelSpec[] {
  const specs: PartLevelSpec[] = [];
  const features = fg.feature_graph.features || [];

  // PART IDENTITY
  if (fg.part.drawing_number) {
    specs.push({ label: "DRAWING NO.", value: fg.part.drawing_number });
  }
  if (fg.part.name) {
    specs.push({ label: "PART NAME", value: fg.part.name });
  }
  if (fg.part.revision) {
    specs.push({ label: "REVISION", value: fg.part.revision });
  }
  if (fg.part.units) {
    specs.push({ label: "UNITS", value: fg.part.units });
  }

  // MATERIAL
  const mat = fg.part.material ?? "";
  if (mat) {
    specs.push({ label: "MATERIAL", value: mat });
  }

  // HEAT TREATMENT — only if present in feasibility data
  const ht = feasRaw?.heat_treatment;
  if (ht) {
    specs.push({ label: "HEAT TREATMENT", value: ht });
  }

  // GENERAL TOLERANCE — only if explicitly stated in a tolerance_class field
  const dinTol = features
    .flatMap((f) => f.dimensional_tolerances || [])
    .find((t) => t.tolerance_class?.includes("DIN") || t.tolerance_class?.includes("2768") || t.tolerance_class?.includes("ISO"));
  if (dinTol?.tolerance_class) {
    const dinMatch = dinTol.tolerance_class.match(/DIN\s*ISO\s*2768[-\s]*\w+/i);
    specs.push({
      label: "GENERAL TOL.",
      value: dinMatch ? dinMatch[0] : dinTol.tolerance_class,
    });
  }

  // GENERAL NOTES — only if present in the feature graph part_level_specs
  const generalNotes = fg.feature_graph.part_level_specs?.general_notes || [];
  for (const note of generalNotes) {
    if (note.note_text) {
      specs.push({ label: note.category?.toUpperCase() || "NOTE", value: note.note_text });
    }
  }

  return specs;
}

async function getDrawingPageUrls(
  dir: string,
  orgSlug: string,
  slug: string,
): Promise<{ balloonedImageUrls: string[]; originalImageUrls: string[] }> {
  const apiBase = `/api/images/${orgSlug}/${slug}`;
  return {
    balloonedImageUrls: [`${apiBase}/ballooned`],
    originalImageUrls: [`${apiBase}/original`],
  };
}

export async function getReportData(
  slug: string,
  orgSlug: string,
): Promise<ReportData | null> {

  const folderName = await resolveSlug(slug, orgSlug);
  if (!folderName) return null;

  const dir = path.join(orgDataDir(orgSlug), folderName);

  const [fgr, specList, feasRaw, routeResult, cycleTimeResult, quote] = await Promise.all([
    readJson<any>(path.join(dir, "feature_graph_result.json")),
    readJson<SpecItem[]>(path.join(dir, "spec_list.json")),
    readJson<any>(path.join(dir, "feasibility_result.json")),
    readJson<any>(path.join(dir, "route_result.json")),
    readJson<any>(path.join(dir, "cycle_time_result.json")),
    readJson<any>(path.join(dir, "quote.json")),
  ]);

  if (!fgr || !specList || !routeResult || !cycleTimeResult || !quote) {
    return null;
  }

  // 1. Synthesize FeatureGraphData
  const drawingNumber = fgr.part?.drawing_number || feasRaw?.drawing_number || quote?.drawing_number || folderName;
  const partName = fgr.part?.name || feasRaw?.source_drawing || quote?.part_name || folderName;
  const material = fgr.part?.material || feasRaw?.material || quote?.material || null;

  const envelope = fgr.feature_graph?.part_envelope || {};
  const features = (fgr.feature_graph?.features || []).map((feat: any) => ({
    ...feat,
    dimensional_tolerances: (feat.dimensional_tolerances || []).map((tol: any) => ({
      ...tol,
      nominal_value_mm: tol.nominal_value_mm ?? tol.nominal_mm ?? null,
      nominal_mm: tol.nominal_mm ?? tol.nominal_value_mm ?? null,
      plus_mm: tol.plus_mm ?? null,
      minus_mm: tol.minus_mm ?? null,
      tolerance_class: tol.tolerance_class ?? null,
      is_critical: tol.is_critical ?? false,
    })),
    gdt_controls: feat.gdt_controls || [],
    access_directions: feat.access_directions || [],
    surface_finish: feat.surface_finish || null,
  }));

  const featureGraph: FeatureGraphData = {
    analysis_id: fgr.analysis_id,
    source: fgr.source ?? {
      file: null,
      page_count: null,
      prepared_images: [],
    },
    part: {
      drawing_number: drawingNumber,
      name: partName,
      revision: fgr.part?.revision ?? null,
      material: material,
      quantity: fgr.part?.quantity ?? quote?.quantity ?? null,
      units: fgr.part?.units ?? null,
      title_block_notes: fgr.part?.title_block_notes || [],
      confidence: fgr.part?.confidence ?? null,
    },
    feature_graph: {
      part_envelope: {
        length_mm: envelope.length_mm ?? null,
        width_mm: envelope.width_mm ?? envelope.max_diameter_mm ?? envelope.height_mm ?? null,
        height_mm: envelope.height_mm ?? envelope.max_diameter_mm ?? null,
        max_diameter_mm: envelope.max_diameter_mm ?? null,
        estimated_volume_cm3: envelope.estimated_volume_cm3 ?? null,
        estimated_weight_kg: envelope.estimated_weight_kg ?? quote.weights?.gross_weight_kg ?? null,
        envelope_shape: envelope.envelope_shape ?? null,
      },
      coordinate_system: fgr.feature_graph?.coordinate_system ?? null,
      features,
      part_level_specs: fgr.feature_graph?.part_level_specs ?? { general_tolerance_standard: null, general_notes: [] },
    },
  };

  // 2. Synthesize FeasibilityData
  const clarifications = (routeResult.clarifications || fgr.clarifications || feasRaw?.clarifications || []).map((c: any) => ({
    clarification_id: c.clarification_id,
    question: c.question,
    why_it_matters: c.why_it_matters,
    blocks: Array.isArray(c.blocks) ? c.blocks.map(String) : [],
    suggested_default: c.suggested_default ?? null,
    priority: c.priority,
  }));

  const assumptions = (routeResult.assumptions || fgr.assumptions || feasRaw?.assumptions || []).map((a: any) => ({
    assumption_id: a.assumption_id,
    text: a.text,
    applies_to: a.applies_to || [],
    impact: a.impact,
    confidence: a.confidence,
  }));

  const outsideOps = (routeResult.operations || []).filter((o: any) => o.in_house === false);

  const feasibility: FeasibilityData = {
    analysis_id: feasRaw?.analysis_id ?? null,
    source_feature_graph_id: featureGraph.analysis_id,
    feasibility: {
      can_proceed: feasRaw?.feasibility?.can_proceed ?? null,
      status: feasRaw?.feasibility?.status ?? null,
      risk_level: feasRaw?.feasibility?.risk_level ?? null,
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
              reason: o.setup_note ?? null,
              sequence_position: `Op ${o.sequence}`,
              estimated_lead_time_days: null,
            })),
      material_machinable: feasRaw?.feasibility?.material_machinable ?? null,
      tolerances_achievable: feasRaw?.feasibility?.tolerances_achievable ?? null,
      machines_available: feasRaw?.feasibility?.machines_available ?? null,
      part_fits_envelopes: feasRaw?.feasibility?.part_fits_envelopes ?? null,
      assessment_notes: feasRaw?.feasibility?.assessment_notes ?? feasRaw?.feasibility_assessment ?? null,
    },
    spec_assessments: feasRaw?.spec_assessments || [],
    clarifications,
    assumptions,
  };

  // 3. Synthesize DeconstructedRouteData
  const deconstructedSetups = (routeResult.operations || []).map((op: any) => ({
    setup_id: `SETUP-${String(op.sequence).padStart(2, "0")}`,
    sequence: op.sequence,
    setup_name: op.name,
    machine_family: op.machine_family ?? null,
    machine_reason: op.setup_note ?? null,
    workholding: {
      method: null,
      grip_description: op.setup_note ?? null,
      special_fixture_required: false,
      fixture_notes: null,
    },
    datum_references: op.datum_references || [],
    stock_state_before: null,
    stock_state_after: null,
    access_directions: [],
    sub_operations: (op.sub_operations || []).map((sub: any) => ({
      sub_op_id: `SETUP-${String(op.sequence).padStart(2, "0")}-SUB-${String(sub.sequence).padStart(2, "0")}`,
      sequence: sub.sequence,
      operation_type: sub.operation_type,
      operation_name: sub.operation_type?.replace(/_/g, " ") ?? null,
      target_feature_ids: sub.target_feature_ids || [],
      reason: null,
      formula_hint: sub.inputs?.kind ?? sub.operation_type ?? null,
      formula_inputs: sub.inputs || {},
    })),
  }));

  const deconstructedRoute: DeconstructedRouteData = {
    analysis_id: routeResult.analysis_id,
    source_feature_graph_id: featureGraph.analysis_id,
    stock: {
      form: routeResult.stock?.form ?? null,
      material: fgr.part?.material ?? null,
      starting_dimensions: {
        diameter_mm: routeResult.stock?.diameter_mm ?? null,
        bore_diameter_mm: routeResult.stock?.bore_diameter_mm ?? null,
        length_mm: routeResult.stock?.length_mm ?? null,
        width_mm: routeResult.stock?.width_mm ?? null,
        height_mm: routeResult.stock?.height_mm ?? null,
        thickness_mm: routeResult.stock?.thickness_mm ?? null,
        notes: null,
      },
      machining_allowance_mm: routeResult.stock?.machining_allowance_mm ?? null,
      why: null,
      confidence: null,
    },
    route: {
      route_name: "",
      route_reason: "",
      part_family: routeResult.part_family ?? null,
      base_geometry: routeResult.base_geometry ?? null,
      total_setups: deconstructedSetups.length,
      total_sub_operations: deconstructedSetups.reduce((acc: number, s: any) => acc + s.sub_operations.length, 0),
      setups: deconstructedSetups,
    },
    clarifications,
    assumptions,
    confidence: null,
  };

  // 4. Synthesize ComputedRouteData
  // cycle_time JSON: cycleTimeResult.operations[] (same sequence as route)
  // each ctOp has: sequence, name, t_op_total_sec, t_machining_sec, t_handling_sec, setup_time_sec, sub_op_results[]
  // each sub_op_result has: operation_seq, sub_op_seq, operation_type, t_cut_sec, t_tool_sec, t_rapid_sec, t_sub_total_sec, trace{}
  // trace has: Vc, rpm, fn, doc, max_doc, passes, etc.
  const ctOperations: any[] = cycleTimeResult.operations || [];

  const setups = (routeResult.operations || []).map((op: any) => {
    const setupId = `SETUP-${String(op.sequence).padStart(2, "0")}`;
    const ctOp = ctOperations.find((c: any) => c.sequence === op.sequence);
    const subCtList: any[] = ctOp?.sub_op_results || [];

    const computedSubOps = (op.sub_operations || []).map((sub: any) => {
      const subSeq: number = sub.sequence;
      const subOpId = `${setupId}-SUB-${String(subSeq).padStart(2, "0")}`;
      const subCt = subCtList.find((s: any) => s.sub_op_seq === subSeq);

      // Times in JSON are in seconds — convert to minutes for internal representation
      const cuttingTimeMin: number = (subCt?.t_cut_sec ?? 0) / 60;
      const nonCuttingTimeMin: number = ((subCt?.t_tool_sec ?? 0) + (subCt?.t_rapid_sec ?? 0)) / 60;
      const totalTimeMin: number = subCt?.t_sub_total_sec != null
        ? subCt.t_sub_total_sec / 60
        : (cuttingTimeMin + nonCuttingTimeMin);

      // Cutting parameters come from subCt.trace
      const trace = subCt?.trace || {};

      return {
        sub_op_id: subOpId,
        sequence: subSeq,
        operation_type: sub.operation_type,
        operation_name: sub.operation_type?.replace(/_/g, " ") ?? null,
        formula_hint: sub.inputs?.kind || sub.operation_type || "",
        target_feature_ids: sub.target_feature_ids || [],
        formula_inputs_used: sub.inputs || {},
        cycle_time: {
          cutting_time_min: cuttingTimeMin,
          non_cutting_time_min: nonCuttingTimeMin,
          total_time_min: totalTimeMin,
          formula_family: sub.operation_type || "",
          cutting_parameters: {
            cutting_speed_m_min: trace.Vc ?? null,
            rpm: trace.rpm ?? null,
            rpm_capped: false,
            feed_per_rev_mm: trace.fn ?? null,
            feed_per_tooth_mm: null,
            feed_rate_mm_min: (trace.fn && trace.rpm) ? +(trace.fn * trace.rpm).toFixed(2) : null,
            flute_count: null,
            tool_diameter_mm: null,
            step_over_mm: null,
            depth_per_pass_mm: trace.doc ?? trace.max_doc ?? null,
            number_of_passes: trace.passes ?? null,
            reversal_factor: null,
          },
          calculation_notes: subCt?.warnings?.length ? subCt.warnings : [],
          confidence: null,
          warnings: subCt?.warnings || [],
        },
        skipped: false,
        skip_reason: null,
      };
    });

    // Times in JSON are in seconds — convert to minutes
    const opTotalMin: number = (ctOp?.t_op_total_sec ?? 0) / 60;
    const opMachiningMin: number = (ctOp?.t_machining_sec ?? 0) / 60;
    const opHandlingMin: number = (ctOp?.t_handling_sec ?? 0) / 60;
    const opSetupMin: number = ((ctOp?.setup_time_sec ?? op.setup_time_sec ?? 0)) / 60;

    return {
      setup_id: setupId,
      sequence: op.sequence,
      setup_name: op.name,
      machine_family: op.machine_family ?? null,
      in_house: op.in_house ?? true,
      outside_process: !(op.in_house ?? true),
      sub_operations: computedSubOps,
      time_summary: {
        setup_time_min: opSetupMin,
        handling_time_min: opHandlingMin,
        cutting_time_min: opMachiningMin,
        total_machining_time_min: opTotalMin,
        total_time_min: opTotalMin,
        total_non_cutting_time_min: opHandlingMin,
        sub_operation_count: computedSubOps.length,
        outside_process: !(op.in_house ?? true),
      },
    };
  });

  // Total times — derive from summing operations (all values in JSON are seconds, convert to minutes)
  // t_op_total_sec = t_setup_per_piece_sec + t_handling_sec + t_machining_sec
  const totalTimeMin: number = ctOperations.reduce((acc: number, c: any) => acc + (c.t_op_total_sec ?? 0), 0) / 60;
  const totalPureMachiningMin: number = ctOperations.reduce((acc: number, c: any) => acc + (c.t_machining_sec ?? 0), 0) / 60;
  const totalHandlingMin: number = ctOperations.reduce((acc: number, c: any) => acc + (c.t_handling_sec ?? 0), 0) / 60;

  const computedRoute: ComputedRouteData = {
    analysis_id: cycleTimeResult.analysis_id || `computed_${folderName}`,
    shop_profile_basis: {
      profile_path: cycleTimeResult.shop_profile_basis?.profile_path ?? null,
      profile_name: cycleTimeResult.shop_profile_basis?.profile_name ?? null,
      material_machinability_key: fgr.part?.material || quote.material || "",
      notes: cycleTimeResult.shop_profile_basis?.notes || [],
    },
    part_family: routeResult.part_family || "",
    base_geometry: routeResult.base_geometry || "",
    material: fgr.part?.material || quote.material || "",
    setups,
    total_summary: {
      total_setups: setups.length,
      total_sub_operations: setups.reduce((acc: number, s: any) => acc + s.sub_operations.length, 0),
      total_setup_time_min: ctOperations.reduce((acc: number, c: any) => acc + (c.setup_time_sec ?? 0), 0) / 60,
      total_handling_time_min: totalHandlingMin,
      total_cutting_time_min: totalPureMachiningMin,
      total_non_cutting_time_min: totalHandlingMin,
      total_pure_machining_time_min: totalPureMachiningMin,
      total_machining_time_min: totalTimeMin,
      total_time_min: totalTimeMin,
      outside_process_count: (routeResult.operations || []).filter((o: any) => o.in_house === false).length,
      confidence: null,
    },
    global_warnings: [],
    global_assumptions: assumptions.map((a: any) => a.text),
  };

  const partLevelSpecs = derivePartLevelSpecs(featureGraph, feasRaw);
  const { balloonedImageUrls, originalImageUrls } = await getDrawingPageUrls(dir, orgSlug, slug);

  const componentSpecs: ComponentSpecData[] = fgr.component_specs || [];
  const singleComponentSpec = componentSpecs.length > 0 ? componentSpecs[0] : null;

  return {
    slug,
    folderName,
    orgSlug,
    featureGraph,
    specList,
    componentSpec: singleComponentSpec,
    componentSpecs,
    feasibility,
    deconstructedRoute,
    computedRoute,
    quote,
    partLevelSpecs,
    balloonedImageUrls,
    originalImageUrls,
  };
}

export async function findImageFile(
  folderName: string,
  type: "ballooned" | "original",
  orgSlug: string,
  page: number = 1,
): Promise<string | null> {
  const dir = path.join(orgDataDir(orgSlug), folderName);
  const p = String(page).padStart(3, "0");
  const candidates =
    type === "ballooned"
      ? [`ballooned_drawing.png`, `ballooned_drawing_${p}.png`, `balloon_drawing.png`, `page_001_original.png`, `page_${p}_original.png`, `page_${p}_vlm.png`, `original_drawing.png`]
      : [`page_001_original.png`, `page_${p}_original.png`, `page_${p}_vlm.png`, `original_drawing.png`, `ballooned_drawing.png`, `ballooned_drawing_${p}.png`];

  for (const name of candidates) {
    try {
      await fs.access(path.join(dir, name));
      return path.join(dir, name);
    } catch {
      // try next candidate
    }
  }
  return null;
}
