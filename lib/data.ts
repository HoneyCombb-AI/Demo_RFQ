// lib/data.ts

// ============================================================
// TYPE DEFINITIONS — Feature Graph
// ============================================================

export interface Evidence {
  page_index: number | null;
  image_name: string;
  visual_location: string;
  cited_text: string | null;
  evidence_type: string;
  confidence: number;
}

export interface PartEnvelope {
  length_mm: number;
  width_mm: number;
  height_mm: number;
  max_diameter_mm: number | null;
  estimated_volume_cm3: number | null;
  estimated_weight_kg: number | null;
  envelope_shape: string;
}

export interface CoordinateSystem {
  primary_axis: string;
  orientation_notes: string;
  datum_origin: string;
}

export interface FeatureGeometry {
  diameter_mm: number | null;
  inner_diameter_mm: number | null;
  outer_diameter_mm: number | null;
  length_mm: number | null;
  depth_mm: number | null;
  depth_condition: string | null;
  width_mm: number | null;
  height_mm: number | null;
  taper_ratio: number | null;
  taper_included_angle_deg: number | null;
  radius_mm: number | null;
  angle_deg: number | null;
  pitch_mm: number | null;
  thread_class: string | null;
  hole_count: number | null;
  pcd_mm: number | null;
  profile_length_mm: number | null;
  area_mm2: number | null;
  wall_thickness_mm: number | null;
  position_description: string | null;
  axis_direction: string | null;
}

export interface SurfaceFinish {
  ra_value: number | null;
  finish_symbol: string;
  notes: string;
}

export interface DimensionalTolerance {
  dimension_type: string;
  nominal_value_mm: number;
  plus_mm: number | null;
  minus_mm: number | null;
  tolerance_class: string | null;
  is_critical: boolean;
}

export interface GdtControl {
  gdt_type: string;
  tolerance_value_mm: number;
  material_condition: string | null;
  datum_references: string[];
  applied_to: string;
  confidence: number;
}

export interface Feature {
  feature_id: string;
  feature_type: string;
  name: string;
  description: string;
  geometry: FeatureGeometry;
  surface_finish: SurfaceFinish | null;
  material_condition: string | null;
  access_directions: string[];
  estimated_material_removal: number | null;
  dimensional_tolerances: DimensionalTolerance[];
  gdt_controls: GdtControl[];
  source_views: string[];
  confidence: number;
}

export interface PartInfo {
  name: string;
  drawing_number: string;
  revision: string | null;
  material: string;
  quantity: number | null;
  units: string;
  title_block_notes: string[];
  confidence: number;
}

export interface FeatureGraphData {
  analysis_id: string;
  source: {
    file: string;
    page_count: number;
    prepared_images: Array<{
      page_index: number;
      image_path: string;
      image_name: string;
      width_px: number;
      height_px: number;
    }>;
  };
  part: PartInfo;
  feature_graph: {
    part_envelope: PartEnvelope;
    coordinate_system: CoordinateSystem;
    features: Feature[];
    part_level_specs?: {
      general_tolerance_standard: string | null;
      general_notes: Array<{
        note_text: string;
        category: string;
      }>;
    };
  };
}

// ============================================================
// TYPE DEFINITIONS — Spec List
// ============================================================

export interface SpecItem {
  spec_id: string;
  feature_id: string;
  feature_name: string;
  spec_type: string;
  description: string;
  nominal_value: string;
  tolerance_or_class: string | null;
  is_critical: boolean;
  source_views: string[];
}

// ============================================================
// TYPE DEFINITIONS — Feasibility Result
// ============================================================

export interface FeasibilityRisk {
  risk_type: string;
  description: string;
  mitigation: string;
  affected_feature_ids: string[];
}

export interface SpecAssessment {
  feature_id: string;
  feature_name: string;
  spec_category: string;
  spec_description: string;
  nominal_value: string;
  tolerance_or_requirement: string;
  verdict: string;
  reasoning: string;
  risk_description: string | null;
  mitigation: string | null;
  required_process: string;
  shop_capability_reference: string;
}

export interface FeatureAssessment {
  feature_id: string;
  feature_name: string;
  feature_type: string;
  overall_verdict: string;
  spec_assessments: SpecAssessment[];
  notes: string;
}

export interface Clarification {
  clarification_id: string;
  question: string;
  why_it_matters: string;
  blocks: string[];
  suggested_default: string | null;
  priority: string;
}

export interface Assumption {
  assumption_id: string;
  text: string;
  applies_to: string[];
  impact: string;
  confidence: number;
}

export interface FeasibilityData {
  analysis_id: string;
  source_feature_graph_id: string;
  feasibility: {
    can_proceed: boolean;
    status: string;
    risk_level: string;
    blockers: string[];
    risks: FeasibilityRisk[];
    outside_processes_needed: string[];
    material_machinable: boolean;
    tolerances_achievable: boolean;
    machines_available: boolean;
    part_fits_envelopes: boolean;
    assessment_notes: string;
  };
  feature_assessments: FeatureAssessment[];
  clarifications: Clarification[];
  assumptions: Assumption[];
  reasoning_summary: string;
}

// ============================================================
// TYPE DEFINITIONS — Deconstructed Route
// ============================================================

export interface StockStartingDimensions {
  diameter_mm: number | null;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  thickness_mm: number | null;
  notes: string | null;
}

export interface StockInfo {
  form: string;
  material: string;
  starting_dimensions: StockStartingDimensions;
  machining_allowance_mm: number;
  why: string;
  confidence: number;
}

export interface Workholding {
  method: string;
  grip_description: string;
  special_fixture_required: boolean;
  fixture_notes: string | null;
}

export interface DeconstructedFormulaInputs {
  process_type: string;
  start_diameter_mm: number | null;
  finish_diameter_mm: number | null;
  cut_length_mm: number | null;
  depth_of_cut_mm: number | null;
  number_of_passes: number | null;
  hole_diameter_mm: number | null;
  hole_depth_mm: number | null;
  hole_count: number | null;
  thread_pitch_mm: number | null;
  profile_length_mm: number | null;
  milling_width_mm: number | null;
  milling_length_mm: number | null;
  axial_depth_mm: number | null;
  material_machinability: string | null;
  tolerance_class: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

export interface DeconstructedSubOp {
  sub_op_id: string;
  sequence: number;
  operation_type: string;
  operation_name: string;
  target_feature_ids: string[];
  reason: string;
  formula_hint: string;
  formula_inputs: DeconstructedFormulaInputs;
}

export interface DeconstructedSetup {
  setup_id: string;
  sequence: number;
  setup_name: string;
  machine_family: string;
  machine_reason: string;
  workholding: Workholding;
  datum_references: string[];
  stock_state_before: string;
  stock_state_after: string;
  access_directions: string[];
  sub_operations: DeconstructedSubOp[];
}

export interface DeconstructedRouteData {
  analysis_id: string;
  source_feature_graph_id: string;
  stock: StockInfo;
  route: {
    route_name: string;
    route_reason: string;
    part_family: string;
    base_geometry: string;
    total_setups: number;
    total_sub_operations: number;
    setups: DeconstructedSetup[];
  };
  clarifications: Clarification[];
  assumptions: Assumption[];
  confidence: {
    overall: number;
    feasibility: number;
    stock_selection: number;
    route_planning: number;
    formula_inputs: number;
  };
}

// ============================================================
// TYPE DEFINITIONS — Computed Route
// ============================================================

export interface CuttingParameters {
  cutting_speed_m_min: number | null;
  rpm: number | null;
  rpm_capped: boolean;
  feed_per_rev_mm: number | null;
  feed_per_tooth_mm: number | null;
  feed_rate_mm_min: number | null;
  flute_count: number | null;
  tool_diameter_mm: number | null;
  step_over_mm: number | null;
  depth_per_pass_mm: number | null;
  number_of_passes: number | null;
  reversal_factor: number | null;
}

export interface CycleTime {
  cutting_time_min: number;
  non_cutting_time_min: number;
  total_time_min: number;
  formula_family: string;
  cutting_parameters: CuttingParameters;
  calculation_notes: string[];
  confidence: string;
  warnings: string[];
}

export interface ComputedFormulaInputs {
  process_type: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface ComputedSubOp {
  sub_op_id: string;
  sequence: number;
  operation_type: string;
  operation_name: string;
  formula_hint: string;
  target_feature_ids: string[];
  formula_inputs_used: ComputedFormulaInputs;
  cycle_time: CycleTime;
  skipped: boolean;
  skip_reason: string | null;
}

export interface TimeSummary {
  setup_time_min: number;
  handling_time_min: number;
  total_cutting_time_min: number;
  total_non_cutting_time_min: number;
  total_machining_time_min: number;
  sub_operation_count: number;
  outside_process: boolean;
}

export interface ComputedSetup {
  setup_id: string;
  sequence: number;
  setup_name: string;
  machine_family: string;
  in_house: boolean;
  outside_process: boolean;
  sub_operations: ComputedSubOp[];
  time_summary: TimeSummary;
}

export interface TotalSummary {
  total_setups: number;
  total_sub_operations: number;
  total_setup_time_min: number;
  total_handling_time_min: number;
  total_cutting_time_min: number;
  total_non_cutting_time_min: number;
  total_machining_time_min: number;
  total_time_min: number;
  outside_process_count: number;
  confidence: string;
}

export interface ComputedRouteData {
  analysis_id: string;
  shop_profile_basis: {
    profile_path: string;
    profile_name: string;
    material_machinability_key: string;
    notes: string[];
  };
  part_family: string;
  base_geometry: string;
  material: string;
  setups: ComputedSetup[];
  total_summary: TotalSummary;
  global_warnings: string[];
  global_assumptions: string[];
}

// ============================================================
// TYPE DEFINITIONS — Excel Quote
// ============================================================

export interface QuoteStock {
  form: string;
  bar_diameter_mm: number;
  item_length_mm: number;
  gross_weight_kg: number;
  net_weight_kg: number;
  net_weight_for_ht_kg: number;
  scrap_weight_kg: number;
  bar_route_blank_cost_inr: number;
}

export interface OperationCost {
  operation: string;
  cycle_time_sec: number;
  cost_inr: number;
  hourly_rate_inr: number;
}

export interface CostSummaryData {
  bar_route_blank_cost_inr: number;
  total_machining_cost_inr: number;
  heat_treatment_cost_inr: number;
  total_cost_inr: number;
  profit_and_overhead_inr: number;
  tool_cost_inr: number;
  rejection_cost_inr: number;
  inspection_cost_inr: number;
  cleaning_cost_inr: number;
  scrap_recovery_inr: number;
  packaging_cost_inr: number;
  fob_cost_inr: number;
  ex_works_price_per_piece_inr: number;
  price_in_euro: number;
}

export interface ExcelQuoteData {
  analysis_id: string;
  part_name: string;
  material: string;
  quantity: number;
  currency: string;
  stock: QuoteStock;
  cycle_times: Record<string, Record<string, number>>;
  operations_cost_breakdown: OperationCost[];
  cost_summary: CostSummaryData;
}

// ============================================================
// UNIFIED REPORT DATA
// ============================================================

export interface PartLevelSpec {
  label: string;
  value: string;
  detail?: string;
}

export interface ReportData {
  slug: string;
  folderName: string;
  featureGraph: FeatureGraphData;
  specList: SpecItem[];
  feasibility: FeasibilityData;
  deconstructedRoute: DeconstructedRouteData;
  computedRoute: ComputedRouteData;
  excelQuote: ExcelQuoteData;
  partLevelSpecs: PartLevelSpec[];
  balloonedImageUrl: string;
  originalImageUrl: string;
}

export interface PartListItem {
  slug: string;
  folderName: string;
  drawingNumber: string;
  partName: string;
  material: string;
}

// ============================================================
// HELPER UTILITIES
// ============================================================

/** Format a tolerance from plus/minus values */
export function formatTolerance(
  plus: number | null,
  minus: number | null,
): string {
  if (plus === null && minus === null) return "-";
  const p = plus !== null ? (plus >= 0 ? `+${plus}` : `${plus}`) : "+0";
  const m = minus !== null ? `${minus}` : "-0";
  return `${p} / ${m}`;
}

/** Format a dimension type slug into a readable label */
export function formatDimensionType(dimType: string): string {
  return dimType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Format time in minutes to display string */
export function formatTime(minutes: number): string {
  return `${minutes.toFixed(2)} min`;
}

/** Format currency (INR) */
export function formatCurrency(
  value: number,
  currency: string = "INR",
): string {
  const symbol = currency === "INR" ? "₹" : currency === "EUR" ? "€" : "$";
  return `${symbol}${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Get the machine family display label */
export function formatMachineFamily(family: string): string {
  return family.replace(/_/g, " ").toUpperCase();
}


// ============================================================

