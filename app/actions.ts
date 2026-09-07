"use server"

// Server actions & helpers
// OTP / password authentication has been removed in favor of direct organization selection.
export interface OrganizationInfo {
  id: string
  name: string
  subtitle: string
  slug: string
  profileType: string
  description: string
  capabilities: string[]
}

export const ORGANIZATIONS: OrganizationInfo[] = [
  {
    id: "org_j",
    name: "Organisation J",
    subtitle: "Org J Manufacturing Facility",
    slug: "jal",
    profileType: "Gear & Shaft Profile",
    description: "Specialized CNC turning, gear hobbing, heat treatment, and precision grinding workflows.",
    capabilities: ["Automated 2D Ballooning", "Gear Hobbing & Heat Treatment", "Route & Cycle Times", "Margin Analysis"],
  },
  {
    id: "org_a",
    name: "Organisation A",
    subtitle: "Org A Precision Components",
    slug: "almity",
    profileType: "Automotive & VMC Profile",
    description: "Automotive precision turning, 3-axis VMC milling, and surface treatment costing.",
    capabilities: ["Full GD&T Extraction", "VMC Setup Costing", "Multi-part RFQ Pipeline", "Native Excel Output"],
  },
]

export async function getOrganizations(): Promise<OrganizationInfo[]> {
  return ORGANIZATIONS
}

