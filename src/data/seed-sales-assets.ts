import type { SalesAsset, SalesAssetFields } from "@/types/sales-asset";
function asset(
  id: string,
  fields: Omit<SalesAssetFields, "url" | "status">,
  now: string,
): SalesAsset {
  return {
    ...fields,
    id,
    url: `https://example.com/sekairos/${id}`,
    status: "Active",
    isExample: true,
    createdAt: now,
    updatedAt: now,
  };
}
export function seedSalesAssets(now = new Date().toISOString()): SalesAsset[] {
  return [
    asset(
      "founder-review",
      {
        name: "Operational Intelligence Review",
        type: "Offer",
        icp: "Founder / Local Business",
        offer: "Operational Intelligence Review",
        description:
          "Example outline for reviewing business priorities, operational friction, and the next practical change.",
        useWhen:
          "Start by verifying the desired outcome, ownership, and scope.",
      },
      now,
    ),
    asset(
      "founder-capacity",
      {
        name: "Capacity Sprint Demo",
        type: "Demo",
        icp: "Founder / Local Business",
        offer: "Capacity Sprint",
        description:
          "Example walkthrough of a manual handoff moving to an owned next action.",
        useWhen:
          "A manual process is consuming capacity needed for the desired outcome.",
      },
      now,
    ),
    asset(
      "founder-crm",
      {
        name: "CRM / Follow-Up System Demo",
        type: "Demo",
        icp: "Founder / Local Business",
        offer: "CRM / Follow-Up System",
        description:
          "Example inquiry-to-owner-to-follow-up workflow for a founder-led business.",
        useWhen: "Prospect context or CRM follow-up ownership is scattered.",
      },
      now,
    ),
    asset(
      "soccer-review",
      {
        name: "Academy Operations Review",
        type: "Offer",
        icp: "Soccer Club / Academy",
        offer: "Academy Operations Review",
        description:
          "Example review of academy priorities, operating responsibilities, and workflow constraints.",
        useWhen:
          "The academy needs to establish which operational change to scope first.",
      },
      now,
    ),
    asset(
      "soccer-enrollment",
      {
        name: "Player Enrollment Demo",
        type: "Demo",
        icp: "Soccer Club / Academy",
        offer: "Player Enrollment System",
        description:
          "Example of the application-to-trial-to-payment-to-enrollment workflow with accountable parent follow-up.",
        useWhen:
          "Demonstrates the application-to-trial-to-payment-to-enrollment workflow when player enrollment is the priority.",
      },
      now,
    ),
    asset(
      "soccer-capacity",
      {
        name: "Athletic Operations Capacity Sprint",
        type: "Demo",
        icp: "Soccer Club / Academy",
        offer: "Athletic Operations Capacity Sprint",
        description:
          "Example of a scoped operational handoff that makes academy responsibilities visible.",
        useWhen:
          "Manual coordination or handoffs are limiting academy capacity.",
      },
      now,
    ),
    asset(
      "soccer-command",
      {
        name: "Sekairos Athletics Command Center",
        type: "Demo",
        icp: "Soccer Club / Academy",
        offer: "Sekairos Athletics Command Center",
        description:
          "Example command view for academy priorities, owners, and next actions.",
        useWhen:
          "The academy needs shared visibility across operational responsibilities.",
      },
      now,
    ),
    asset(
      "college-audit",
      {
        name: "Athletics Technology & Capacity Audit",
        type: "Offer",
        icp: "College Athletics",
        offer: "Athletics Technology & Capacity Audit",
        description:
          "Example audit outline for existing athletics technology, authorized stakeholders, and capacity constraints.",
        useWhen:
          "Verify technology, institutional ownership, procurement, and the scope before choosing a change.",
      },
      now,
    ),
    asset(
      "college-capacity",
      {
        name: "Athletic Operations Capacity Sprint",
        type: "Demo",
        icp: "College Athletics",
        offer: "Athletic Operations Capacity Sprint",
        description:
          "Example institutional workflow with a defined owner and handoff.",
        useWhen:
          "An athletics operational handoff or manual process needs a focused review.",
      },
      now,
    ),
    asset(
      "college-command",
      {
        name: "Athletics Command Center",
        type: "Demo",
        icp: "College Athletics",
        offer: "Athletics Command Center",
        description:
          "Example of sponsor context, accountable handoffs, and athletic operations priorities.",
        useWhen:
          "Sponsor and partner follow-up need clearer visibility and ownership.",
      },
      now,
    ),
    asset(
      "college-systems",
      {
        name: "Cross-System Operations Layer",
        type: "Demo",
        icp: "College Athletics",
        offer: "Cross-System Operations Layer",
        description:
          "Example outline for accountable handoffs between existing institutional systems.",
        useWhen:
          "Cross-system friction or silos threaten the desired outcome; integrations still require discovery.",
      },
      now,
    ),
  ];
}
