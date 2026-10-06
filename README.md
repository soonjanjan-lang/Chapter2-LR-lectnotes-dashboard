# Chapter 2: The Literature Review

An interactive teaching dashboard on the literature review chapter of a PhD thesis in economics. It was prepared for the PhD Research Methods course at Universiti Utara Malaysia (semester A261).

**Live site:** https://soonjanjan-lang.github.io/Chapter2-LR-lectnotes-dashboard/

## What is inside

Thirteen lessons, each with sub-tabs, notes, economics examples, worked examples and exercises with model answers:

| Lesson | Highlights |
|---|---|
| Start here | Contents, the nine-stage LR journey, a four-session teaching plan |
| What and why | Definitions, types of review, purposes, where Chapter 2 sits in the thesis |
| Searching | Search strategy and JEL codes, a Google Scholar manual with a Boolean query builder, databases and Malaysian sources, snowballing, AI search tools, reference management, reading |
| Journal quality | Indexes and rankings, predatory and hijacked journals, a ten-minute check, a legitimacy scorecard, case cards |
| Writing well | Anonymised bad examples, organising approaches, paragraph anatomy, annotated exemplars, language toolkit, APA 7 |
| Chapter blueprint | Structure; topical and empirical, theoretical, Malaysian and methods literature; the chapter summary |
| Literature gap | Nine gap types with economics examples, how to find a gap, the gap statement, a quiz |
| Frameworks | Theoretical, conceptual, research and analytical frameworks; a decision tree; the lecturer's diagrams redrawn |
| Matrix and mind map | Summary and synthesis matrices, a matrix builder with CSV export, Gemini Notebook (formerly NotebookLM) guides, an interactive mind map |
| AI prompts | Prompt anatomy, 18 complete prompts, a prompt builder, responsible use |
| AI slop | Word list, patterns, fake citations, detector limits, a slop scanner |
| Practice | Tutorials T1 to T8, class activities, printable worksheets |
| Toolkit | Self-check, examiner rubric, common comments, timeline, glossary, FAQ, reading list, downloads |

Keyboard: `/` search, `P` presenter mode, `T` theme, arrow keys for the previous or next part.

## Editing

Content lives in `src/sections/` (one HTML file per lesson). After editing, rebuild `index.html`:

```powershell
powershell -ExecutionPolicy Bypass -File .\build.ps1
```

Styling is in `assets/css/`, behaviour in `assets/js/`, and the prompt library, slop lexicon and quiz banks in `assets/js/data/`. See `CLAUDE.md` for conventions.

## Notes

- Studies marked † are fictional, written for teaching. All other cited works are real and were checked.
- Tool entries (matrix, checklists, progress) are saved only in the visitor's browser.
- The original lecture notes are in `source-notes/`.
