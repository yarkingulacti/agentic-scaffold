---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, layout, motion, and copy so the result does not read as a templated AI default. Use when building or restyling a frontend, designing a landing/hero page, or the user wants a non-generic look.
---

# Frontend Design

Approach this as the design lead at a small studio known for giving every client a
visual identity that could not be mistaken for anyone else's. Make deliberate,
opinionated choices about palette, typography, and layout that are specific to this
brief, and take one real aesthetic risk you can justify.

## Ground it in the subject

If the brief does not pin down what the product is, pin it yourself before designing:
name one concrete subject, its audience, and the page's single job, and state your
choice. Use anything you already know about the user's preferences and what they're
building. Distinctive choices come from the subject's own world — its materials,
artifacts, and vernacular. Build with the brief's real content throughout.

## Design principles

- **The hero is a thesis.** Open with the most characteristic thing in the subject's
  world, in whatever form fits (headline, image, animation, live demo). The "big
  number + label + gradient accent" is the template answer — use only if truly best.
- **Typography carries the personality.** Pair display and body faces deliberately,
  set an intentional type scale; make the type treatment itself memorable.
- **Structure is information.** Numbering, eyebrows, dividers, labels should encode
  something true about the content, not decorate it. Numbered markers (01/02/03) only
  belong when the content is genuinely a sequence.
- **Motion is deliberate.** A single orchestrated moment usually lands harder than
  scattered effects. Excess animation reads as AI-generated.
- **Match complexity to the vision.** Maximalist needs elaborate execution; minimal
  needs precision in spacing, type, and detail.

## Avoid the AI defaults

Current AI design clusters around three looks: (1) warm cream (~#F4F1EA) + serif
display + terracotta accent; (2) near-black + one acid-green/vermilion accent;
(3) broadsheet hairline rules, zero border-radius, dense columns. Where the brief
pins a direction, follow it exactly. Where an axis is free, don't spend that freedom
on one of these defaults.

## Process: brainstorm → plan → critique → build → critique again

1. **Plan a compact token system**: Color (4–6 named hex values), Type (display +
   body + utility roles), Layout (one-sentence concept + ASCII wireframe), and a
   single **Signature** element the page is remembered by.
2. **Review the plan against the brief.** If any part reads like the generic default
   you'd produce for any similar page, revise it and say what changed and why.
3. **Build only after confirming uniqueness**, deriving every color and type decision
   from the revised plan. Watch CSS selector specificity (type vs element selectors
   cancelling paddings/margins).
4. **Self-critique as you build.** Take screenshots if possible — a picture is worth
   1000 tokens. Spend boldness in one place; keep everything around the signature
   quiet. Hit a quality floor quietly: responsive to mobile, visible keyboard focus,
   reduced-motion respected.

## Copy is design material

Words exist to make the design easier to understand. Write from the user's side of
the screen ("manage notifications", not "webhook config"). Active voice; an action
keeps its name through the whole flow ("Publish" button → "Published" toast). Treat
errors and empty states as direction, not mood: say what went wrong and how to fix
it. Plain verbs, sentence case, no filler.

## Credit

Adapted from the **frontend-design** skill in Anthropic's
[anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
collection. See that repository for the original and its license.
