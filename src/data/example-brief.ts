import type { ExampleBrief } from "@/types/intelligence";

// Fictional business context for the foundation UI; never treat this as a live record.
export const exampleBrief = {
  contact: "Mariana Ortega",
  role: "Head of Operations",
  company: "Norte Studio",
  context: "A B2B creative studio preparing to grow its retainer business.",
  signals: [
    {
      lens: "DESIRE",
      question: "What do they want?",
      example: "Create a consistent flow of qualified retainer conversations.",
    },
    {
      lens: "VISION",
      question: "What does success look like?",
      example:
        "A predictable pipeline that lets the founder focus on client work.",
    },
    {
      lens: "MONEY",
      question: "Where is value moving?",
      example:
        "Three potential retainers worth $6,000/month each; budget unconfirmed.",
    },
    {
      lens: "FRICTION",
      question: "What threatens the outcome?",
      example: "Prospect context is scattered and follow-up depends on memory.",
    },
    {
      lens: "TIMING",
      question: "Why act now?",
      example:
        "A new account lead starts next month; the handoff needs a repeatable process.",
    },
    {
      lens: "SEKAIROS FIT",
      question: "What should Sekairos offer?",
      example:
        "Explore a focused pipeline and follow-up workflow; fit still needs validation.",
    },
  ],
} satisfies ExampleBrief;
