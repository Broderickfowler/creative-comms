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

## Foundation scope

This sprint establishes the repository, documentation, shell, navigation, and placeholder Command page. It does not implement revenue scoring, a CRM, prospect CRUD, automated messaging, payments, AI generation, or external integrations. Revenue-producing functionality is the priority for subsequent sprints; keep implementation decisions simple and reversible.
