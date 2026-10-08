# Sekairos Revenue Command

## Central concept

Sekairos Revenue Command is an internal revenue execution system for Sekairos. It helps one operator determine:

- Who should I contact?
- Why should I contact them?
- What does the prospect want?
- Where is money moving?
- What operational friction threatens the desired outcome?
- What should Sekairos offer?
- What should I say?
- What happens next?

The system should turn context into a specific action that can produce revenue. It should reduce the operator's time between understanding an opportunity and executing the next step.

## Core intelligence framework

Preserve these labels exactly in product code, interfaces, and documentation.

| Term         | Meaning                                                                             | Operator question                  |
| ------------ | ----------------------------------------------------------------------------------- | ---------------------------------- |
| DESIRE       | The outcome the prospect wants now, in their terms.                                 | What do they want?                 |
| VISION       | The future state they are trying to create.                                         | What would success look like?      |
| MONEY        | Where revenue, budget, investment, or lost value is moving.                         | Where is the economic opportunity? |
| FRICTION     | The operational constraint threatening the desired outcome.                         | What is getting in the way?        |
| TIMING       | Events, deadlines, and urgency shaping the next action.                             | Why act now?                       |
| SEKAIROS FIT | The connection between the prospect's context and what Sekairos can credibly offer. | How can Sekairos help?             |

Evidence and assumptions must remain distinguishable. Unknown information should remain unknown rather than being invented. Fictional examples must be labeled as examples.

## Workspaces and terminology

**Command** is the operator's starting point for deciding and executing the next revenue action. **Prospects** hold the people, organizations, and intelligence context relevant to contact. **Opportunities** connect a desired outcome, economic value, offer, and next step. **Playbooks** hold repeatable approaches to offers, conversations, and follow-up.

A **next action** is concrete: an owner, an action, a target, and a timing decision. An **offer** must connect to DESIRE, address FRICTION, and make SEKAIROS FIT clear. Do not imply that fictional examples are qualified or that inferred budget is confirmed money.

## Current vertical slice

The first working slice connects PROSPECT → INTELLIGENCE → OPPORTUNITY SCORE → REVENUE PRIORITY → CALL PREP → CALL DEBRIEF → NEXT ACTION. Prospects can be created, edited, inspected, and deleted in a persistent browser-local workspace. The three ICP values are Founder / Local Business, Soccer Club / Academy, and College Athletics. Status is separate from score classification.

### Opportunity Score

| Lens         | Score range |
| ------------ | ----------- |
| DESIRE       | 0–20        |
| VISION       | 0–20        |
| MONEY        | 0–25        |
| FRICTION     | 0–15        |
| TIMING       | 0–10        |
| SEKAIROS FIT | 0–10        |

Scores are whole numbers, bounded at each input and validated before storage. The total sums automatically with a maximum of 100. A score of 85–100 is CALL NOW; 70–84 is ACTIVE PURSUIT; 55–69 is NURTURE; 0–54 is LOW PRIORITY. Changing scores does not silently change prospect status.

Command ranks open prospects by total descending, then the earliest required follow-up date, then status. No follow-up sorts after dated follow-ups. Status tie-break order is Call Now, Proposal, Meeting Requested, Meeting Booked, Demo Requested, Follow-Up, Qualified, Contacted, Researching, New, Nurture. Won and Lost stay in Prospects but are excluded from Command. Company name and id break exact ties deterministically.

### Call outcomes and next actions

Call Prep uses editable ICP-specific templates without an AI API. Operators must verify context and avoid unsupported claims. Saving Call Prep keeps custom wording until it is edited or reset and saved.

Requested call outcomes take precedence: Proposal Requested → Proposal, otherwise Meeting Requested → Meeting Requested, otherwise Demo Requested → Demo Requested. A meaningful conversation sets Contacted when no stronger requested outcome or existing stronger status applies; otherwise the existing status remains. Ordinary meaningful calls do not downgrade existing Demo Requested, Meeting Requested, Meeting Booked, Proposal, Won, or Lost statuses. Won and Lost remain closed even when a requested outcome is checked; reopening requires an explicit prospect status edit. Not interested / Disqualified takes precedence over requested outcomes and sets Lost.

The next-action engine is deterministic: Lost → Disqualify; Won → Nurture (closed records do not enter Command); proposal request/status → Create Proposal; meeting request/status → Schedule Meeting; demo request/status → Send Demo; email request → Send Email; follow-up required or unanswered call → Call Tomorrow; otherwise a score of 70+ → Call Tomorrow and lower scores → Nurture. This is a recommendation, not an executed action. A chosen follow-up date remains visible alongside it; Call Tomorrow is the fixed recommendation label, not an automated reschedule of that date.

Call Debrief preserves every entered field and appends immutable history. Nonempty Desired Outcome, Money Signal, Timing, and Primary Problem values update matching intelligence signals. Scores remain operator-assigned. Next Action in the form records the operator's own notes; the recommendation is computed separately. Follow-Up Date is required when Follow-Up Required is checked.

### Outreach Command

The second slice connects CALL OUTCOME → OUTREACH PACK → COPY / PREPARE TO SEND → FOLLOW-UP → PIPELINE ACTION. The operator can open a send pack directly after a debrief or from prospect detail, copy edited messages, and record a manual send.

Nine editable deterministic drafts cover Initial Email, Post-Call Follow-Up Email, Demo Email, Follow-Up Email 1, Follow-Up Email 2, WhatsApp Message, LinkedIn DM, Instagram / Facebook DM, and Voicemail. Templates use recorded context, ask questions instead of asserting unknown facts, and follow VISION → FRICTION → BUSINESS IMPACT → CAPACITY. They earn the next conversation without financial promises, monitoring claims, fake familiarity, or an AI/automation pitch. Operator edits still require human review.

Outcome precedence is proposal acknowledgment, scheduling response, Demo Send Pack, Information Send Pack, then relevant follow-up for a meaningful conversation. Without an outcome, use initial outreach. Closed Won/Lost prospects receive no persuasive drafts or copy/send actions. A new call starts a new draft context; earlier edits and sent history remain recorded.

| ICP                      | Supported offers                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Founder / Local Business | Operational Intelligence Review; Capacity Sprint; Connected Lead System; CRM / Follow-Up System                                     |
| Soccer Club / Academy    | Academy Operations Review; Player Enrollment System; Athletic Operations Capacity Sprint; Sekairos Athletics Command Center         |
| College Athletics        | Athletics Technology & Capacity Audit; Athletic Operations Capacity Sprint; Athletics Command Center; Cross-System Operations Layer |

The offer is a deterministic starting point based on ICP and recorded friction/opportunity keywords; its rationale states what still needs verification. The recommended demo is an outline or the saved Call Prep demo guidance. The operator must supply the actual demo asset/link before sending. Draft generation and copying do not create or deliver a demo.

Editing creates/updates Draft activity. Successful browser copy records Prepared. Mark Sent records the operator's manual send, stamps Sent At and Last Outreach At, and moves ordinary open stages (including Demo Requested) to Follow-Up. Proposal and meeting stages remain intact; an acknowledgment does not book a meeting or create a proposal. Sent records remain immutable; editing a sent message creates a new draft. Repeated Mark Sent on identical content is idempotent.

After the primary email is marked sent, the pack advances to follow-up copy. A fulfilled demo/information email recommendation becomes Call Tomorrow; this fixed label does not override a chosen follow-up date. Meeting/proposal recommendations remain actionable until the operator records the actual pipeline change.

Next Follow-Up Date and Follow-Up Reason are editable. Mark Sent defaults an unscheduled follow-up to the next local calendar day and keeps an existing date/reason. Clearing the date explicitly removes the scheduled follow-up, including any older call-date fallback. Command shows due/overdue follow-ups above score-ranked priorities, oldest first, and counts open priorities, due follow-ups, Demo Requests, Meeting Requests (including Meeting Booked), and Proposals from the saved local records.

### Opportunity Briefs and Sales Assets

The third slice connects PROSPECT INTELLIGENCE → OPPORTUNITY BRIEF → SALES ASSET MATCHING → SEND-READY COLLATERAL. The operator should be able to prepare prospect-specific material in under 60 seconds after an information or demo request.

Sales Assets are URL-based, local records with name, type, ICP, offer, description, use-when context, status, and timestamps. Types are Demo, Website, Case Study, PDF, Video, Offer, Proposal Example, and Other. ICPs include the three product ICPs plus Universal. Only Active assets matching the prospect's ICP or Universal are eligible. All eleven seeded assets are labeled examples and use reserved example URLs; replace those URLs with real material before sending. Inactive or deleted assets no longer match. Deleting every asset does not reseed the library.

Matching is deterministic. Exact ICP, exact recommended offer, desired outcome/opportunity keyword overlap, and the current demo/information/proposal request contribute to ranking. Matching returns primary material, optional secondary material, and a reason. Demo requests prefer demos; email requests prefer information collateral; proposal requests prefer proposal examples. Exact offer fit remains important. Ties break by asset name and id. No external content is retrieved and no performance or case-study results are invented.

Every prospect has a generated Opportunity Brief at `/prospects/[id]/brief`, with Company, Contact, Industry, Date, DESIRED OUTCOME, VISION, MONEY IN MOTION, EXECUTION FRICTION, WHY NOW, SEKAIROS OPPORTUNITY, RECOMMENDED FIRST MOVE, POTENTIAL BUSINESS IMPACT, VERIFICATION NEEDED, OPPORTUNITY SCORE/classification, and a matched asset. Generated signals come directly from saved intelligence. Generated business impact is **Requires discovery.**; estimated opportunity value never becomes invented ROI. The operator can replace that text with recorded information.

Brief edits save only customized field overrides, separate from generated defaults and underlying intelligence. Unmodified fields follow prospect intelligence; overrides remain through refresh until edited or reset. Reset removes overrides. Score and asset matching always use the actual prospect and current library, not customized brief wording. Printing shows the saved document rather than unsaved editor input.

Print / Save as PDF uses the browser's print dialog. The standard brief fits one A4 page; long custom text flows to additional pages without clipping. Navigation, application shell controls, editing forms, and internal action buttons disappear in print. Fictional-prospect and example-asset labels remain visible. Asset URLs remain readable and clickable. Save the brief as a PDF and attach it in the chosen channel; the browser-local brief URL is an operator reference, not shared hosted collateral.

Outreach shows RECOMMENDED MATERIAL, its name/link, Copy Asset Link, a secondary asset, Open Opportunity Brief, and Print / Save PDF. Add Asset Link inserts material into editable message copy without overwriting edits or repeating a URL. Nothing is sent automatically. NEXT REVENUE ACTION becomes Send Demo + Opportunity Brief when a demo request has matched material, Send Information Pack for an information request, and Prepare Proposal for a proposal request. Existing stored call recommendations remain intact.

Command's MATERIAL TO SEND queue shows open prospects with demo, email, or proposal requests and no relevant Sent activity in the current call context. Draft/Prepared activity and unrelated voicemail do not clear the queue. A relevant email or messaging-channel send clears it; a new call request reopens it even if an earlier call's material was sent. A proposal acknowledgment leaves the prospect in Proposal; clearing this outreach queue does not mean a proposal was created or a deal completed. Ordinary priorities and follow-up counts continue to use the existing rules.

### Scope boundaries

This slice has local persistence, not an external database. No CRM, email delivery, AI API, payments, automated outreach, authentication, cross-device sync, or unrelated feature is included. Estimated opportunity values are USD hypotheses, not confirmed revenue. Fictional seeds remain visibly labeled. Browser storage is not a backup or a production access-control system.
