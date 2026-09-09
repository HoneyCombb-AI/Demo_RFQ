// lib/engineer-workflow.ts

import { ComputedSetup, DeconstructedSetup, ReportData } from "./data";

export interface MachineOption {
  family: string;
  displayName: string;
  shortName: string;
  defaultHourlyRate: number; // INR/hr
  category: "milling" | "turning" | "grinding" | "edm" | "bench" | "outside";
  description: string;
}

export const AVAILABLE_MACHINES: MachineOption[] = [
  {
    family: "vmc_3axis",
    displayName: "VMC 3-Axis Center",
    shortName: "VMC 3-Axis",
    defaultHourlyRate: 400,
    category: "milling",
    description: "Standard 3-axis vertical machining center for prismatic parts",
  },
  {
    family: "vmc_4axis",
    displayName: "VMC 4-Axis (Rotary)",
    shortName: "VMC 4-Axis",
    defaultHourlyRate: 600,
    category: "milling",
    description: "Vertical machining center equipped with 4th axis rotary table",
  },
  {
    family: "vmc_5axis",
    displayName: "VMC 5-Axis (Simultaneous)",
    shortName: "VMC 5-Axis",
    defaultHourlyRate: 850,
    category: "milling",
    description: "Simultaneous 5-axis for complex contours & single-setup access",
  },
  {
    family: "hmc_4axis",
    displayName: "HMC / BMC Horizontal Mill",
    shortName: "BMC / HMC",
    defaultHourlyRate: 950,
    category: "milling",
    description: "Boring & milling horizontal center with tombstone multi-part pallet",
  },
  {
    family: "cnc_lathe",
    displayName: "CNC Turning Center",
    shortName: "CNC Lathe",
    defaultHourlyRate: 350,
    category: "turning",
    description: "2-axis CNC turning lathe for cylindrical turning & boring",
  },
  {
    family: "mill_turn",
    displayName: "Mill-Turn Multi-Tasking",
    shortName: "Mill-Turn",
    defaultHourlyRate: 750,
    category: "turning",
    description: "Multi-spindle mill-turn for complete part machining in one setup",
  },
  {
    family: "saw",
    displayName: "Automatic Cut-off Saw",
    shortName: "Saw Cut",
    defaultHourlyRate: 200,
    category: "bench",
    description: "Bandsaw blanking with automatic stock feed",
  },
  {
    family: "surface_grind",
    displayName: "Precision Surface Grinder",
    shortName: "Surface Grinder",
    defaultHourlyRate: 300,
    category: "grinding",
    description: "Reciprocating surface grinding for flatness & tight thickness",
  },
  {
    family: "cylindrical_grind",
    displayName: "OD / Cylindrical Grinder",
    shortName: "OD Grinder",
    defaultHourlyRate: 350,
    category: "grinding",
    description: "Outer diameter precision round grinding between centers",
  },
  {
    family: "wire_edm",
    displayName: "Wire EDM Center",
    shortName: "Wire EDM",
    defaultHourlyRate: 600,
    category: "edm",
    description: "Electrical discharge wire cutting for tight contours & hard metals",
  },
  {
    family: "finish_bench",
    displayName: "Bench Deburr & Finishing",
    shortName: "Bench Deburr",
    defaultHourlyRate: 200,
    category: "bench",
    description: "Manual edge break, tumbling, vibratory deburr & wash",
  },
  {
    family: "surface_finishing",
    displayName: "Surface Finishing / Anodize",
    shortName: "Anodize/Plating",
    defaultHourlyRate: 200,
    category: "outside",
    description: "Type II/III anodize, chromate conversion, or plating (Outside)",
  },
  {
    family: "heat_treat",
    displayName: "Heat Treatment Furnace",
    shortName: "Heat Treat",
    defaultHourlyRate: 250,
    category: "outside",
    description: "Vacuum hardening, stress relief, solution anneal (Outside)",
  },
  {
    family: "cmm_inspection",
    displayName: "CMM Quality Metrology",
    shortName: "CMM Inspection",
    defaultHourlyRate: 500,
    category: "outside",
    description: "Coordinate measuring machine 100% first-article inspection",
  },
];

export function getMachineMeta(family: string): MachineOption {
  const match = AVAILABLE_MACHINES.find(
    (m) => m.family.toLowerCase() === family.toLowerCase()
  );
  if (match) return match;
  return {
    family,
    displayName: family.replace(/_/g, " ").toUpperCase(),
    shortName: family.replace(/_/g, " "),
    defaultHourlyRate: 350,
    category: "milling",
    description: "General Machine Family",
  };
}

export interface InteractiveSetup {
  setup_id: string;
  sequence: number;
  setup_name: string;
  machine_family: string;
  in_house: boolean;
  outside_process: boolean;
  setup_time_min: number;
  cycle_time_sec: number;
  hourly_rate_inr: number;
  workholding_method?: string;
  setup_note?: string;
  datum_references?: string[];
  sub_operations_count: number;
  is_custom?: boolean;
  is_edited?: boolean;
  raw_computed_setup?: ComputedSetup;
  raw_deconstructed_setup?: DeconstructedSetup;
}

export interface QuoteCustomization {
  rawMaterialRatePerKg: number; // e.g. 320 INR/kg
  grossWeightKg: number;
  netWeightKg: number;
  customMaterialCostPerPiece?: number;
  useManualMaterialCost: boolean;
  scrapCreditPct: number; // e.g. 10%
  marginPct: number; // e.g. 20%
  factoryOverheadPct: number; // e.g. 25%
}

export interface RecalibrationResult {
  appliedPrompt: string;
  changesSummary: string[];
  timeDeltaMin: number;
  costDeltaInr: number;
  newSetups: InteractiveSetup[];
}

/**
 * Initializes interactive setups from report data
 */
export function initInteractiveSetups(data: ReportData): InteractiveSetup[] {
  const computed = data.computedRoute;
  const deconstructed = data.deconstructedRoute.route;
  const quoteOps = data.quote?.machining_operations || [];

  return computed.setups.map((cs, idx) => {
    const ds = deconstructed.setups.find((s) => s.setup_id === cs.setup_id);
    const qOp = quoteOps.find(
      (qo: any) =>
        qo.sequence === cs.sequence ||
        qo.operation_name?.toLowerCase() === cs.setup_name?.toLowerCase()
    );

    const machineMeta = getMachineMeta(cs.machine_family);
    const cycleTimeMin = cs.time_summary?.total_machining_time_min ?? 0.5;
    const cycleTimeSec = qOp?.cycle_time_sec ?? +(cycleTimeMin * 60).toFixed(1);
    const hourlyRate = qOp?.hourly_rate_inr ?? machineMeta.defaultHourlyRate;

    return {
      setup_id: cs.setup_id,
      sequence: idx + 1,
      setup_name: cs.setup_name,
      machine_family: cs.machine_family,
      in_house: cs.in_house,
      outside_process: cs.outside_process,
      setup_time_min: cs.time_summary?.setup_time_min ?? 15,
      cycle_time_sec: cycleTimeSec,
      hourly_rate_inr: hourlyRate,
      workholding_method: ds?.workholding?.method ?? ds?.workholding?.grip_description ?? "Standard Vise / Clamps",
      setup_note: ds?.machine_reason ?? cs.setup_name,
      datum_references: ds?.datum_references ?? [],
      sub_operations_count: cs.sub_operations?.length ?? 1,
      is_custom: false,
      is_edited: false,
      raw_computed_setup: cs,
      raw_deconstructed_setup: ds,
    };
  });
}

/**
 * Perform realistic simulated AI route recalibration based on engineer guidance
 */
export function simulateAiRecalibration(
  currentSetups: InteractiveSetup[],
  prompt: string,
  data: ReportData
): RecalibrationResult {
  const lowerPrompt = prompt.toLowerCase();
  const changes: string[] = [];
  let updated: InteractiveSetup[] = JSON.parse(JSON.stringify(currentSetups));

  // Rule 1: CNC instead of VMC / BMC / HMC recommendation
  if (
    lowerPrompt.includes("cnc") ||
    lowerPrompt.includes("bmc") ||
    lowerPrompt.includes("hmc") ||
    lowerPrompt.includes("horizontal")
  ) {
    const isCnc = lowerPrompt.includes("cnc") && !lowerPrompt.includes("bmc") && !lowerPrompt.includes("hmc");
    const machineFamily = isCnc ? "mill_turn" : "hmc_4axis";
    const setupTitle = isCnc ? "CNC Mill-Turn – Multi-Axis Contour & Datum Setup" : "BMC 4-Axis – Multi-Face Datum & Pocket Milling";
    const machineDisplayName = isCnc ? "CNC Mill-Turn Center" : "HMC / BMC";
    const rate = isCnc ? 750 : 950;

    const vmcIndices = updated
      .map((s, idx) => ({ s, idx }))
      .filter((item) => item.s.machine_family.includes("vmc"));

    if (vmcIndices.length >= 2) {
      // Consolidate VMC ops into one CNC/BMC setup
      const firstIdx = vmcIndices[0].idx;
      const secondIdx = vmcIndices[1].idx;

      const combinedCycleSec = +(
        (updated[firstIdx].cycle_time_sec + updated[secondIdx].cycle_time_sec) *
        0.82
      ).toFixed(1); // 18% cycle time reduction due to multi-axis indexing

      updated[firstIdx] = {
        ...updated[firstIdx],
        setup_name: setupTitle,
        machine_family: machineFamily,
        hourly_rate_inr: rate,
        cycle_time_sec: combinedCycleSec,
        setup_time_min: 25,
        workholding_method: isCnc ? "Collet Chuck & Tailstock Support" : "Horizontal Tombstone Fixture with Quick-Lock Clamps",
        setup_note: isCnc
          ? "Consolidated facing, thickness contour, and hole pattern into a single CNC multi-axis setup."
          : "Consolidated Datum A facing, thickness contour, and multi-angle hole pattern on 4-axis BMC pallet.",
        is_edited: true,
      };

      // Remove the redundant second VMC setup
      updated.splice(secondIdx, 1);
      changes.push(
        `Consolidated Op 2 & Op 3 into a single ${machineDisplayName} setup (-1 handling setup, -18% cut cycle).`
      );
      changes.push(`Switched machine family from VMC to ${machineDisplayName} (₹${rate}/hr rate).`);
    } else if (vmcIndices.length === 1) {
      const idx = vmcIndices[0].idx;
      updated[idx] = {
        ...updated[idx],
        setup_name: isCnc ? "CNC Mill-Turn – High-Speed Contour & Hole Setup" : "BMC 4-Axis – High-Speed Face & Contour Milling",
        machine_family: machineFamily,
        hourly_rate_inr: rate,
        cycle_time_sec: +(updated[idx].cycle_time_sec * 0.85).toFixed(1),
        is_edited: true,
      };
      changes.push(`Migrated VMC 3-axis to ${machineDisplayName}.`);
    }
  }

  // Rule 2: Remove OD Grinding or Grinding
  if (
    lowerPrompt.includes("grind") ||
    lowerPrompt.includes("od grinding") ||
    lowerPrompt.includes("no grinding")
  ) {
    const grindIdx = updated.findIndex((s) =>
      s.machine_family.includes("grind")
    );
    if (grindIdx !== -1) {
      const removed = updated.splice(grindIdx, 1)[0];
      changes.push(
        `Eliminated redundant ${removed.setup_name} step based on surface tolerance assessment.`
      );
    } else {
      changes.push(
        "Verified route does not require OD grinding (flat plate geometry is mill-finished)."
      );
    }
  }

  // Rule 3: Datum A sequencing / First step
  if (
    lowerPrompt.includes("datum a") ||
    lowerPrompt.includes("first step") ||
    lowerPrompt.includes("reorder") ||
    lowerPrompt.includes("order")
  ) {
    // Ensure saw cut / blanking is 1, Datum A is 2
    const datumIdx = updated.findIndex(
      (s) =>
        s.setup_name.toLowerCase().includes("datum a") ||
        s.datum_references?.includes("A")
    );
    if (datumIdx > 1) {
      const datumOp = updated.splice(datumIdx, 1)[0];
      updated.splice(1, 0, datumOp);
      changes.push(
        "Re-sequenced route: Prioritized Datum A establishment immediately following blanking."
      );
    } else {
      changes.push(
        "Validated datum precedence: Primary Datum A reference established prior to critical holes."
      );
    }
  }

  // Rule 4: Vacuum fixture / Distortion mitigation
  if (
    lowerPrompt.includes("vacuum") ||
    lowerPrompt.includes("fixture") ||
    lowerPrompt.includes("distort")
  ) {
    updated = updated.map((s) => {
      if (s.machine_family.includes("vmc") || s.machine_family.includes("hmc")) {
        return {
          ...s,
          workholding_method: "Sacrificial Vacuum Plate Fixture with Zero-Point Clamping",
          setup_note:
            s.setup_note +
            " (Optimized with vacuum holding to prevent thin-wall plate deflection).",
          is_edited: true,
        };
      }
      return s;
    });
    changes.push(
      "Updated workholding across milling setups to dedicated vacuum chuck to prevent part deflection."
    );
  }

  // Rule 5: Move Deburr before Anodize
  if (
    lowerPrompt.includes("deburr") ||
    lowerPrompt.includes("anodize") ||
    lowerPrompt.includes("surface finish")
  ) {
    const deburrIdx = updated.findIndex((s) =>
      s.machine_family.includes("bench")
    );
    const finishIdx = updated.findIndex((s) =>
      s.machine_family.includes("surface_finishing")
    );
    if (deburrIdx !== -1 && finishIdx !== -1 && deburrIdx > finishIdx) {
      const deburrOp = updated.splice(deburrIdx, 1)[0];
      updated.splice(finishIdx, 0, deburrOp);
      changes.push("Reordered sequence: Deburring placed prior to chemical anodizing.");
    }
  }

  // Fallback if no specific rule matched
  if (changes.length === 0) {
    changes.push("Analyzed tool path engagement and chip clearance constraints.");
    changes.push("Optimized cutting speeds (Vc +10%) and feed rates for AL 6061.");
    updated = updated.map((s) => ({
      ...s,
      cycle_time_sec: +(s.cycle_time_sec * 0.92).toFixed(1),
      is_edited: true,
    }));
    changes.push("Reduced overall cycle time by 8% through high-efficiency adaptive milling.");
  }

  // Re-index sequence numbers
  updated.forEach((s, idx) => {
    s.sequence = idx + 1;
  });

  const originalTotalSec = currentSetups.reduce((acc, s) => acc + s.cycle_time_sec, 0);
  const newTotalSec = updated.reduce((acc, s) => acc + s.cycle_time_sec, 0);
  const timeDeltaMin = +((newTotalSec - originalTotalSec) / 60).toFixed(2);

  return {
    appliedPrompt: prompt,
    changesSummary: changes,
    timeDeltaMin,
    costDeltaInr: 0,
    newSetups: updated,
  };
}
