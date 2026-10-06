# Prompt Log: Chapter 2 LR Lecture-Notes Dashboard

This file records every prompt from the course lecturer, plus their answers to clarifying questions, in the order they were given. New entries are **appended** at the bottom; nothing is edited or deleted.

---

## Entry 1 (2026-10-06): Initial request

> I am a professor of economics assigned to teach a PhD-level research methods course this semester, and I am updating my lecture notes, specifically on everything related to the Literature Review chapter of a PhD thesis (typically as Chapter 2). I need your help to create a dashboard containing all relevant lecture note materials, examples (preferably in the economics area), worked examples, worksheets, tutorials, guidelines, manuals, and/or any other lecture materials that you think suitable.
>
> I need the dashboard to be interactive, with clickable tabs. I need the dashboard to also contain the following:
> - You may use my previous lecture notes @allthings-Chapter2.docx  @"my RF diagrams.pdf"  @"theoretical framework eg.docx"  as a reference.
> - What's a literature review (LR)?
> - Why do we need to do an LR?
> - How do we do an LR search? (include also how to use AI to do an LR search; manual or guide on how to do a proper LR search on Google Scholar using Boolean operators)
> - Good and bad ways of writing up an LR
> - Subsections to include in the LR Chapter (usually Chapter 2 of the thesis; examples of how each subsections should be written up):
>   - LR on topical and empirical works
>   - LR on theoretical works
>   - LR on Malaysian works (for a thesis that focuses on Malaysia)
>   - Literature gap (include examples of different types of literature gap)
>   - Theoretical vs conceptual vs research vs analytical framework diagram (when to use which; if we are only allowed to just use one framework, which one should it be)
>   - LR summary table/matrix (include a guide on how to use Gemini NotebookLM to create the table)
>   - LR mindmap (include a guide on how to use Gemini NotebookLM to create the mindmap)
> - How to differentiate between good reputable journals (articles from which we should be reading) versus lousy dodgy predatory journals (articles from which we shouldn't waste time reading)
> - Include also examples of good complete well-structured detailed AI prompts we can use to help us obtain our intended output (i.e. the LR chapter)
> - Include a list of AI-writing slops, how to spot AI-writing, traces of AI-writing
> - Any other useful lecture materials you can think of on everything related to writing up the LR chapter
>
> Make the dashboard as attractive, useful, comprehensive, structured, and systematic as possible so that I can use it to teach everything related to doing LR and writing up the LR chapter. Install for me any necessary skills required to create such a dashboard (such as the UI UX Pro Max, impeccable, lottie file, frontend design skills, and any other skills you think necessary).
>
> Ask me clarifying questions to help you create a better-customised dashboard for me.
> Create a CLAUDE.md file for this project.
> Create a prompt log MD file for this project. Remember to update and append any of my new prompts into this file, including my answers to the questions you might ask me.
>
> Once the dashboard is complete and ready, push and deploy it to https://github.com/soonjanjan-lang/Chapter2-LR-lectnotes-dashboard
>
> Give me your plan first on how you intend to go about creating the dashboard for me.

### Clarifying questions and answers (Round 1)

| # | Question | Answer |
|---|----------|--------|
| 1 | Which institution and thesis context should the dashboard be tailored to? | **UUM** (library links, Malaysian context, local data sources, thesis conventions) |
| 2 | Which citation/referencing style should all the worked examples and templates use? | **APA 7th** |
| 3 | Who will use the dashboard, and how should answers to tutorials and quizzes be handled? | **Both lecturer and students; model answers hidden behind "Reveal" buttons**, plus a Presenter mode with larger text |
| 4 | On a public website, how should the third-party 'wrong way' LR excerpts (IJER, MCSER/MJSS, IJSRM) be shown? | **Anonymised re-creations**: new "bad" paragraphs on economics topics that copy each mistake, naming no real authors or journals |

### Clarifying questions and answers (Round 2)

| # | Question | Answer |
|---|----------|--------|
| 5 | If a student may use only ONE framework in Chapter 2, which should the dashboard recommend? | **Present all, no single verdict**: explain all four with a decision tree; the choice is left to the supervisor and department |
| 6 | Should one running economics case thread through all tabs? | **Multiple topics, no single thread**: different economics examples in each tab |
| 7 | Which files should go into the PUBLIC GitHub repo alongside the dashboard? | **CLAUDE.md, the prompt log (.md), and the original .docx/.pdf notes** |
| 8 | What visual style do you want? | **Scholarly modern**: deep navy/ink with a warm accent, serif headings, light and dark modes, subtle motion, a few tasteful Lottie animations |

---

## Entry 2 (2026-10-06): Mid-planning instruction

> Use CSS for visual presentation, layout, and styling of the dashboard

**Action taken:** all presentation, layout and styling is done in hand-written CSS (custom-property design tokens, CSS Grid/Flexbox). No Tailwind or Bootstrap, and no inline style manipulation from JavaScript. JavaScript handles behaviour only.

---

## Entry 3 (2026-10-06): Plan approved

The lecturer approved the implementation plan (13 main tabs, interactive tools, CSS-only styling, GitHub Pages deployment). Implementation began.

---

## Entry 4 (2026-10-06): Skills must be global

> for all the skills you install, make sure the skills can be used for other sessions/projects. Do not limit them to just this session/project only.

**Action taken:** all skills are installed at **user level** in `C:\Users\Soon Jan Jan\.claude\skills\`, not inside this project, so every future Claude Code session and project can use them:
- `frontend-design` (Anthropic)
- `ui-ux-pro-max` (nextlevelbuilder)
- `impeccable` (pbakaus)
- `motion-design` (LottieFiles)

Git, GitHub CLI and Python 3.12 were also installed system-wide via winget.
