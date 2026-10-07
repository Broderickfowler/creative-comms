import type { Prospect, ProspectFields, Intelligence } from "@/types/prospect";
import {
  createProspect,
  blankProspect,
} from "@/features/prospects/domain/defaults";
function seed(
  id: string,
  fields: Partial<ProspectFields> & Pick<ProspectFields, "companyName" | "icp">,
  intelligence: Intelligence,
  now: string,
): Prospect {
  const prospect = createProspect(
    {
      ...blankProspect,
      source: "Fictional sprint example",
      status: "Qualified",
      notes:
        "Fictional example — not a live prospect. Signals and opportunity values are illustrative and unverified.",
      estimatedOpportunityValue: 0,
      ...fields,
    },
    id,
    now,
  );
  return { ...prospect, isFictional: true, intelligence };
}
export function seedProspects(now = new Date().toISOString()): Prospect[] {
  return [
    seed(
      "fictional-founder",
      {
        companyName: "Norte Studio",
        icp: "Founder / Local Business",
        contactFirstName: "Mariana",
        contactLastName: "Ortega",
        contactRole: "Founder",
        website: "https://norte-studio.example",
        email: "mariana@norte-studio.example",
        industry: "Creative services",
        location: "Monterrey, Mexico",
        estimatedOpportunityValue: 18000,
        status: "Call Now",
      },
      {
        desiredOutcome: "Create consistent qualified retainer conversations.",
        visionSignal:
          "Predictable pipeline without the founder chasing every inquiry.",
        moneySignal:
          "Three illustrative retainer opportunities at US$6,000/month; budget unconfirmed.",
        operationalFriction:
          "Prospect context is scattered and follow-up depends on memory.",
        timingSignal: "An account lead starts next month.",
        sekairosOpportunity:
          "Explore a focused prospect-to-follow-up workflow.",
        verificationNeeded:
          "Confirm decision maker, actual pipeline value, and workflow ownership.",
        scores: {
          desire: 18,
          vision: 18,
          money: 22,
          friction: 13,
          timing: 8,
          sekairosFit: 9,
        },
      },
      now,
    ),
    seed(
      "fictional-soccer",
      {
        companyName: "Sierra Football Academy",
        icp: "Soccer Club / Academy",
        contactFirstName: "Diego",
        contactLastName: "Santos",
        contactRole: "Academy Director",
        website: "https://sierra-academy.example",
        email: "diego@sierra-academy.example",
        industry: "Youth soccer",
        location: "Austin, Texas",
        estimatedOpportunityValue: 6000,
      },
      {
        desiredOutcome:
          "Convert more trial-session inquiries into enrolled players.",
        visionSignal:
          "A reliable intake process without extra administrative work for coaches.",
        moneySignal:
          "Illustrative 20 open player places at US$250/month; approved budget unknown.",
        operationalFriction:
          "Parent inquiries and trial follow-up live in separate message threads.",
        timingSignal: "Spring intake planning begins in six weeks.",
        sekairosOpportunity:
          "Clarify ownership and timing for parent-inquiry follow-up.",
        verificationNeeded:
          "Verify enrollment targets, communication consent, and who approves changes.",
        scores: {
          desire: 16,
          vision: 15,
          money: 18,
          friction: 12,
          timing: 7,
          sekairosFit: 8,
        },
      },
      now,
    ),
    seed(
      "fictional-college",
      {
        companyName: "Westbridge College Athletics",
        icp: "College Athletics",
        contactFirstName: "Alex",
        contactLastName: "Morgan",
        contactRole: "Assistant Director, Partnerships",
        website: "https://westbridge-athletics.example",
        email: "alex@westbridge-athletics.example",
        industry: "College athletics",
        location: "Columbus, Ohio",
        estimatedOpportunityValue: 25000,
        status: "Researching",
      },
      {
        desiredOutcome:
          "Reduce missed sponsor follow-ups before the next season.",
        visionSignal:
          "Clear sponsor context and accountable internal handoffs.",
        moneySignal:
          "Illustrative US$25,000 sponsorship package; procurement and budget unverified.",
        operationalFriction:
          "Opportunities stall between development and athletic operations.",
        timingSignal: "A planning meeting is scheduled next quarter.",
        sekairosOpportunity:
          "Explore a scoped partner-opportunity handoff workflow.",
        verificationNeeded:
          "Confirm authorized stakeholders, procurement rules, and a real deadline.",
        scores: {
          desire: 13,
          vision: 13,
          money: 16,
          friction: 10,
          timing: 5,
          sekairosFit: 6,
        },
      },
      now,
    ),
  ];
}
