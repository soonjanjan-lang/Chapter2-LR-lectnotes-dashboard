/* Prompt library for the literature review.
   Slots in {{double braces}} are filled by the prompt builder.
   Each prompt: id, stage, title, use (where to run it), purpose, body, after (what to check). */
window.LR_PROMPTS = {
  stages: [
    { id: 'S', name: 'Scope and search' },
    { id: 'R', name: 'Read and extract' },
    { id: 'W', name: 'Synthesise and write' },
    { id: 'F', name: 'Framework' },
    { id: 'C', name: 'Check and revise' }
  ],

  fields: [
    { key: 'topic', label: 'Topic', placeholder: 'e.g. food price inflation and household welfare', example: 'food price inflation and the welfare of low-income households' },
    { key: 'rq', label: 'Research question(s)', placeholder: 'e.g. How do B40 households adjust food spending when prices rise?', example: 'How responsive is the food spending of B40, M40 and T20 households in Malaysia to food prices, and what welfare loss did the 2022 to 2023 price increases cause each group?' },
    { key: 'setting', label: 'Country or setting', placeholder: 'e.g. Malaysia', example: 'Malaysia' },
    { key: 'field', label: 'Field of economics', placeholder: 'e.g. development economics', example: 'applied microeconomics (household demand and welfare)' },
    { key: 'period', label: 'Publication period to cover', placeholder: 'e.g. 2000 to 2026, plus seminal works', example: '1980 to 2026, plus seminal works' },
    { key: 'data', label: 'Data you plan to use', placeholder: 'e.g. Household Expenditure Survey (DOSM)', example: 'Household Expenditure Survey microdata (DOSM), 2016, 2019 and 2022 rounds; food CPI' },
    { key: 'method', label: 'Method you plan to use', placeholder: 'e.g. QUAIDS', example: 'Quadratic Almost Ideal Demand System, estimated by income group; compensating variation' },
    { key: 'words', label: 'Word limit for the output', placeholder: 'e.g. 400', example: '400' }
  ],

  prompts: [
    {
      id: 'S1', stage: 'S', title: 'Sharpen the research question',
      use: 'Any chat assistant',
      purpose: 'Turn a broad topic into answerable, researchable questions before you search.',
      body:
'ROLE: Act as an experienced PhD supervisor in {{field}}.\n\n' +
'CONTEXT: I am a PhD student in economics at a Malaysian university. My provisional topic is "{{topic}}", set in {{setting}}. My draft research question is: "{{rq}}". I expect to use {{data}}.\n\n' +
'TASK: Help me sharpen the research question. Do not write my literature review.\n' +
'1. Identify what is vague in my question (concepts, population, period, outcome).\n' +
'2. Propose three sharper alternative questions, each answerable with the data I named.\n' +
'3. For each alternative, state the likely type of contribution (new evidence, new setting, better method, theory test).\n' +
'4. List the bodies of literature I would need to review for each alternative, as subject areas, not as specific papers.\n\n' +
'CONSTRAINTS: Do not cite specific studies or authors; I will find the literature myself. If an alternative depends on data I may not have, say so.\n\n' +
'OUTPUT: A short table (alternative question | contribution type | literatures to review | data risk), followed by one paragraph recommending which alternative to pursue and why.\n\n' +
'SELF-CHECK: Before answering, confirm that every alternative is a question, not a topic, and could be answered within a three-year PhD.',
      after: ['Discuss the alternatives with your supervisor before searching.', 'The assistant knows nothing about recent Malaysian policy changes unless you tell it.']
    },
    {
      id: 'S2', stage: 'S', title: 'Keywords, synonyms and JEL codes',
      use: 'Any chat assistant',
      purpose: 'Build the concept table for your search.',
      body:
'ROLE: Act as an academic librarian specialising in economics databases (EconLit, Scopus, Web of Science, Google Scholar).\n\n' +
'CONTEXT: My research question is: "{{rq}}". The setting is {{setting}}.\n\n' +
'TASK:\n' +
'1. Break the question into its main concepts (usually 3 or 4).\n' +
'2. For each concept, list synonyms, related terms, British and American spellings, and terms used in older literature.\n' +
'3. Suggest the JEL classification codes most relevant to each concept, with their official titles.\n' +
'4. Suggest terms to EXCLUDE because they commonly bring in irrelevant results.\n\n' +
'CONSTRAINTS: Give only search terms and codes, not papers or authors. If you are unsure whether a JEL code title is exact, mark it "check".\n\n' +
'OUTPUT: A concept table with one column per concept and one row per term, then a list of JEL codes (code, title, concept), then the exclusion list.\n\n' +
'SELF-CHECK: Make sure each synonym would actually appear in the title or abstract of an economics paper.',
      after: ['Check every JEL code against the official list on the AEA website.', 'Add terms you find in the keywords of papers you already know.']
    },
    {
      id: 'S3', stage: 'S', title: 'Draft Boolean search strings',
      use: 'Any chat assistant',
      purpose: 'Translate your concept table into strings for each database.',
      body:
'ROLE: Act as an expert in systematic literature searching.\n\n' +
'CONTEXT: I am reviewing the literature on {{topic}}, published {{period}}. My concept table is below.\n\n' +
'[PASTE YOUR CONCEPT TABLE HERE]\n\n' +
'TASK: Write search strings for:\n' +
'(a) Google Scholar, remembering that it has no truncation, handles brackets inconsistently, cuts very long queries, and supports intitle:, allintitle:, author:, source: and the minus sign;\n' +
'(b) Scopus Advanced Search, using TITLE-ABS-KEY, truncation (*), AND, OR, AND NOT and PUBYEAR;\n' +
'(c) EconLit on EBSCOhost, using TI and AB field codes and truncation.\n' +
'For Google Scholar, give three short strings (broad, focused, title-only) rather than one long one.\n\n' +
'CONSTRAINTS: Use only the terms in my concept table unless you flag an addition as a suggestion. Explain any syntax you use.\n\n' +
'OUTPUT: Each string in its own code block, with a one-line note on what it is designed to find.\n\n' +
'SELF-CHECK: Verify that brackets are balanced and that OR is used only within a concept and AND only between concepts.',
      after: ['Run each string and record the date and number of hits in your search log.', 'Compare with the Boolean builder in the Searching lesson.']
    },
    {
      id: 'S4', stage: 'S', title: 'Screen abstracts against criteria',
      use: 'Any chat assistant (paste abstracts) or Gemini Notebook',
      purpose: 'A first-pass screen of many abstracts, which you then check.',
      body:
'ROLE: Act as a second reviewer in a systematic literature review.\n\n' +
'CONTEXT: My research question is "{{rq}}". My inclusion criteria are:\n' +
'- empirical studies using household or individual data;\n' +
'- published {{period}};\n' +
'- peer-reviewed articles, recognised working-paper series, or theses;\n' +
'[ADD OR EDIT CRITERIA]\n' +
'My exclusion criteria are: [LIST].\n\n' +
'TASK: For each abstract below, decide INCLUDE, EXCLUDE or UNSURE, and give the single criterion that decides it.\n\n' +
'[PASTE ABSTRACTS, EACH STARTING WITH ITS NUMBER AND AUTHOR-YEAR]\n\n' +
'CONSTRAINTS: Judge only from the abstract text given. Do not use outside knowledge about the papers. When the abstract does not give enough information, answer UNSURE rather than guessing.\n\n' +
'OUTPUT: A table: number | author-year | decision | deciding criterion | quote from the abstract that supports the decision.\n\n' +
'SELF-CHECK: Every INCLUDE must quote text showing the study is empirical and on topic.',
      after: ['You make the final decisions. Read every UNSURE abstract yourself.', 'Record screening counts for your PRISMA diagram.']
    },
    {
      id: 'R1', stage: 'R', title: 'Structured reading note for one paper',
      use: 'Gemini Notebook (one source selected) or a chat assistant with the PDF attached',
      purpose: 'A first draft of your reading note, linked to the paper.',
      body:
'ROLE: Act as a careful research assistant in {{field}}.\n\n' +
'CONTEXT: I am reading the attached paper for the literature review of my thesis on {{topic}}.\n\n' +
'TASK: Complete this reading-note template using only the paper:\n' +
'- Full reference (APA 7)\n' +
'- Research question\n' +
'- Theory or mechanism\n' +
'- Data: country, years, unit, N\n' +
'- Method and identification strategy\n' +
'- Main findings, with magnitudes and the table or page where each is reported\n' +
'- Robustness checks reported\n' +
'- Limitations stated by the authors\n' +
'- Questions the authors leave open\n\n' +
'CONSTRAINTS: Quote numbers exactly as printed. If an item is not in the paper, write "not reported". Do not evaluate the paper; I will add my own evaluation.\n\n' +
'OUTPUT: The completed template, then a list of any passages you found ambiguous.\n\n' +
'SELF-CHECK: For each finding, check that the table or page number you give actually contains that number.',
      after: ['Add your own fields: limitations in your view, relevance to your study.', 'Check the APA reference against the article page.']
    },
    {
      id: 'R2', stage: 'R', title: 'Extract a matrix from several papers',
      use: 'Gemini Notebook (Data Table or chat)',
      purpose: 'Fill the summary matrix from your uploaded sources.',
      body:
'ROLE: Act as a meticulous research assistant building a literature matrix.\n\n' +
'CONTEXT: The selected sources are empirical studies for the section of my review on {{topic}}.\n\n' +
'TASK: Create one row per study with these columns: author and year | country | period | data and N | dependent variable | key explanatory variables | estimation method | identification strategy | main finding with magnitude and table or page | limitations stated by authors.\n\n' +
'CONSTRAINTS:\n' +
'- Use only the sources. Write "not reported" where a source is silent.\n' +
'- Keep each cell under 30 words.\n' +
'- Do not merge studies, even if they use the same data.\n' +
'- List any source you excluded (for example, a review article) below the table, with the reason.\n\n' +
'OUTPUT: A table, then the exclusion list.\n\n' +
'SELF-CHECK: Count the rows and confirm the count matches the number of empirical sources selected.',
      after: ['Click the citations and verify every cell.', 'Add your own columns for credibility, journal check and relevance.']
    },
    {
      id: 'R3', stage: 'R', title: 'Explain a method I do not understand',
      use: 'Any chat assistant',
      purpose: 'Learn an unfamiliar estimator well enough to evaluate papers that use it.',
      body:
'ROLE: Act as a patient econometrics lecturer teaching PhD students.\n\n' +
'CONTEXT: Several papers in my review of {{topic}} use the following method, which I do not fully understand: [NAME THE METHOD, e.g. "synthetic control", "QUAIDS", "partial proportional odds model"].\n\n' +
'TASK:\n' +
'1. Explain the method in plain language first, then formally with the key equation.\n' +
'2. State its identifying assumptions and what happens if each one fails.\n' +
'3. List the diagnostics a careful paper should report.\n' +
'4. Give three questions I should ask when judging a paper that uses it.\n' +
'5. Say when this method would be a poor choice.\n\n' +
'CONSTRAINTS: Do not cite specific papers unless you are certain they exist; prefer naming the standard textbook treatment. Flag anything you are unsure about.\n\n' +
'OUTPUT: Headed sections for 1 to 5, under {{words}} words in total.\n\n' +
'SELF-CHECK: Make sure the formal equation uses consistent notation with the plain-language explanation.',
      after: ['Confirm the explanation against a textbook or the original methods paper.', 'Use the five questions when filling the method column of your matrix.']
    },
    {
      id: 'W1', stage: 'W', title: 'Find themes in my matrix',
      use: 'Any chat assistant (paste your matrix) or Gemini Notebook',
      purpose: 'Group studies into themes for thematic writing.',
      body:
'ROLE: Act as a senior researcher in {{field}} who writes survey articles.\n\n' +
'CONTEXT: Below is my literature matrix for a review on {{topic}}. My research question is "{{rq}}".\n\n' +
'[PASTE MATRIX]\n\n' +
'TASK:\n' +
'1. Propose 3 to 6 themes that organise these studies in a way that serves my research question.\n' +
'2. Assign each study to one or more themes.\n' +
'3. Within each theme, note where studies agree, where they disagree, and what might explain the disagreement (data, method, setting, period).\n' +
'4. Identify any theme with fewer than three studies.\n\n' +
'CONSTRAINTS: Use only the studies in the matrix. Do not add studies or findings. Do not write paragraphs of the review.\n\n' +
'OUTPUT: For each theme: name | studies | agreements | disagreements and possible reasons. Then a list of thin themes.\n\n' +
'SELF-CHECK: Confirm every study in the matrix appears under at least one theme.',
      after: ['Rename the themes in your own words.', 'Use thin themes as a reading list.']
    },
    {
      id: 'W2', stage: 'W', title: 'Chapter 2 outline in a funnel',
      use: 'Any chat assistant',
      purpose: 'A section outline that matches your research questions.',
      body:
'ROLE: Act as a PhD supervisor in economics with experience examining theses.\n\n' +
'CONTEXT: My thesis asks: "{{rq}}" in {{setting}}, using {{data}} and {{method}}. My themes from the literature are:\n' +
'[LIST YOUR THEMES]\n\n' +
'TASK: Propose a section outline for Chapter 2 (Literature Review) that:\n' +
'- opens with the theoretical literature;\n' +
'- reviews the empirical literature thematically, funnelling from international to comparable economies to {{setting}};\n' +
'- includes sections for the literature gap and the framework;\n' +
'- maps each section to the research question(s) it serves.\n\n' +
'CONSTRAINTS: Headings must be specific noun phrases, not generic labels such as "Previous studies". Do not invent literature.\n\n' +
'OUTPUT: A numbered outline (2.1, 2.2, ...) with one sentence per section on its purpose, then a table mapping sections to research questions.\n\n' +
'SELF-CHECK: Make sure every research question is served by at least one section, and that no section is unrelated to any question.',
      after: ['Check the outline against your mind map.', 'Ask your supervisor whether the framework belongs in Chapter 2 or 3 in your school.']
    },
    {
      id: 'W3', stage: 'W', title: 'Critique my synthesis paragraph',
      use: 'Any chat assistant',
      purpose: 'Feedback on whether a paragraph synthesises, without rewriting it for you.',
      body:
'ROLE: Act as a demanding but fair thesis examiner in economics.\n\n' +
'CONTEXT: Below is a paragraph from my literature review on {{topic}}.\n\n' +
'[PASTE PARAGRAPH]\n\n' +
'TASK: Assess the paragraph against four moves: (1) a claim about the literature in the first sentence; (2) evidence from several studies grouped together; (3) analysis that compares studies and explains differences or judges credibility; (4) a link to my study or the next paragraph.\n' +
'For each move, say whether it is present, weak or missing, and quote the sentence concerned. Then give the three most important improvements.\n\n' +
'CONSTRAINTS: Do NOT rewrite the paragraph. Do not add citations or claims. Comment on the argument, not on minor grammar.\n\n' +
'OUTPUT: A four-row table (move | present / weak / missing | quoted sentence | comment), then three numbered improvements.\n\n' +
'SELF-CHECK: Make sure every comment refers to a specific sentence.',
      after: ['Revise the paragraph yourself.', 'Run the revised version through the critique again only if the changes were substantial.']
    },
    {
      id: 'W4', stage: 'W', title: 'Stress-test my gap statement',
      use: 'Any chat assistant',
      purpose: 'Find the weaknesses an examiner would find.',
      body:
'ROLE: Act as a sceptical external examiner for a PhD in {{field}}.\n\n' +
'CONTEXT: My research question is "{{rq}}" in {{setting}}. My gap statement is:\n\n' +
'[PASTE GAP STATEMENT]\n\n' +
'TASK:\n' +
'1. Classify the gap (evidence, knowledge, practical-knowledge conflict, methodological, empirical, theoretical, population, contextual, temporal) and say whether more than one type applies.\n' +
'2. Apply three tests: Is it real (what evidence would I need to show it)? Does it matter (for theory or policy)? Can it be filled with {{data}} and {{method}}?\n' +
'3. Ask the five hardest questions an examiner would ask about it.\n' +
'4. Point out any claim that is too strong (for example, "no study has ever ...").\n\n' +
'CONSTRAINTS: Do not rewrite the statement and do not invent studies that might already fill the gap; instead, tell me what kind of study I should search for to make sure.\n\n' +
'OUTPUT: Headed sections for 1 to 4.\n\n' +
'SELF-CHECK: Make sure the examiner questions are specific to my statement, not generic.',
      after: ['Search specifically for the kinds of study it says could already fill the gap.', 'Answer each examiner question in a sentence; weak answers show where to strengthen the statement.']
    },
    {
      id: 'W5', stage: 'W', title: 'Polish language without changing content',
      use: 'Any chat assistant',
      purpose: 'Clearer English that keeps your meaning, your citations and your voice.',
      body:
'ROLE: Act as an academic copy-editor for economics theses, writing in British English.\n\n' +
'CONTEXT: Below is a passage from my literature review. English is my second language.\n\n' +
'[PASTE PASSAGE]\n\n' +
'TASK: Improve grammar, clarity and concision.\n\n' +
'CONSTRAINTS:\n' +
'- Keep my meaning, my argument and every citation exactly as they are (same authors, years and page numbers).\n' +
'- Do not add claims, examples, hedges or citations.\n' +
'- Keep APA 7 citation format.\n' +
'- Keep sentences varied in length. Avoid these words and phrases: delve, tapestry, pivotal, crucial, underscore, landscape, realm, robust (except as an econometric term), "plays a vital role", "in today\'s world", "it is important to note".\n' +
'- Do not use em dashes.\n\n' +
'OUTPUT: (1) The revised passage. (2) A numbered list of every change you made and why, so that I can accept or reject each one.\n\n' +
'SELF-CHECK: Compare the citations in your version with mine before answering; they must be identical.',
      after: ['Accept changes one by one; reject any that change your meaning.', 'Check your university\'s rules on disclosing language-editing assistance.']
    },
    {
      id: 'F1', stage: 'F', title: 'Check my framework\'s alignment',
      use: 'Any chat assistant',
      purpose: 'Find unjustified arrows and misaligned variables.',
      body:
'ROLE: Act as a PhD examiner in {{field}} reviewing a framework.\n\n' +
'CONTEXT: Research questions: "{{rq}}". Planned method: {{method}}. My framework, described in words:\n\n' +
'[DESCRIBE EACH BOX AND ARROW, e.g. "Food price index -> food budget share (H1, negative), justified by demand theory (Deaton & Muellbauer, 1980)"]\n\n' +
'TASK:\n' +
'1. Check that every research question is represented in the framework.\n' +
'2. For each arrow, say whether my stated justification supports it, and flag arrows with no justification.\n' +
'3. Identify variables that are likely to be needed as controls, moderators or mediators, given the method.\n' +
'4. Classify the framework as theoretical, conceptual, research or analytical, and say whether its label fits.\n\n' +
'CONSTRAINTS: Do not draw or redesign the framework. Do not add citations; if you suggest a missing variable, describe the kind of literature that would justify it.\n\n' +
'OUTPUT: A checklist for 1, a table for 2 (arrow | justification | adequate? | comment), and lists for 3 and 4.\n\n' +
'SELF-CHECK: Make sure each suggestion in 3 is consistent with {{method}}.',
      after: ['Find the literature for any suggested variable before adding it.', 'Update your Theory-Concept-Variable worksheet.']
    },
    {
      id: 'F2', stage: 'F', title: 'Theory-concept-variable table from my notes',
      use: 'Any chat assistant',
      purpose: 'Organise your own notes into the worksheet format.',
      body:
'ROLE: Act as a research methods tutor.\n\n' +
'CONTEXT: Below are my notes on the theories relevant to {{topic}}, and the variables available in {{data}}.\n\n' +
'[PASTE NOTES AND VARIABLE LIST]\n\n' +
'TASK: Organise my notes into a table with columns: theory (with the citation from my notes) | concept | variable and how it is measured in my data | expected sign | research question.\n\n' +
'CONSTRAINTS: Use only the theories, citations and variables in my notes. Where a concept has no available variable, write "no variable in data". Where my notes give no expected sign, write "not stated".\n\n' +
'OUTPUT: The table, then a list of concepts without variables and variables without concepts.\n\n' +
'SELF-CHECK: Every citation in the table must appear in my notes.',
      after: ['Concepts without variables need a proxy or must be dropped.', 'Variables without concepts need a justification or must be dropped.']
    },
    {
      id: 'C1', stage: 'C', title: 'Examiner simulation for a section',
      use: 'Any chat assistant',
      purpose: 'Anticipate examiner comments before submission.',
      body:
'ROLE: Act as an external examiner for an economics PhD thesis at a Malaysian university. You are thorough, fair and specific.\n\n' +
'CONTEXT: The thesis asks "{{rq}}" in {{setting}}. Below is one section of Chapter 2.\n\n' +
'[PASTE SECTION]\n\n' +
'TASK: Write examiner comments on:\n' +
'(a) organisation: thematic synthesis or author-by-author summary?\n' +
'(b) critical evaluation of designs and evidence;\n' +
'(c) coverage: are seminal and recent works plausibly present? (Do not name works you think are missing; describe the kind of work.)\n' +
'(d) link to the research questions and the gap;\n' +
'(e) academic writing: claims, hedging, citation practice.\n' +
'Give an overall judgement: acceptable, minor revisions, or major revisions.\n\n' +
'CONSTRAINTS: Quote the sentence each comment refers to. Do not rewrite the section.\n\n' +
'OUTPUT: Numbered comments under headings (a) to (e), then the overall judgement with two sentences of justification.\n\n' +
'SELF-CHECK: At least half the comments should identify a specific weakness, not just praise.',
      after: ['Respond to each comment in a revision table, as you would to real examiners.', 'Compare with the examiner-style rubric in the Toolkit.']
    },
    {
      id: 'C2', stage: 'C', title: 'Coherence across the chapter',
      use: 'Any chat assistant (paste headings and first and last sentences)',
      purpose: 'Check that the chapter reads as one argument.',
      body:
'ROLE: Act as a developmental editor for academic theses.\n\n' +
'CONTEXT: Below are the headings of my Chapter 2, with the first and last sentence of each section.\n\n' +
'[PASTE]\n\n' +
'TASK:\n' +
'1. Summarise the argument of the chapter in five sentences, using only what is given.\n' +
'2. Identify any point where the argument jumps without a link.\n' +
'3. Identify sections whose last sentence does not prepare the next section.\n' +
'4. Say whether the chapter ends at the gap and the framework.\n\n' +
'CONSTRAINTS: Do not invent content for the sections. Do not rewrite headings unless asked.\n\n' +
'OUTPUT: Headed sections for 1 to 4.\n\n' +
'SELF-CHECK: If your five-sentence summary does not match my research question "{{rq}}", say so.',
      after: ['If the summary surprises you, the chapter does not yet say what you intend.']
    },
    {
      id: 'C3', stage: 'C', title: 'Do my sentences match my sources?',
      use: 'Gemini Notebook, with the cited papers uploaded',
      purpose: 'Catch misreported findings before an examiner does.',
      body:
'ROLE: Act as a fact-checker for academic writing.\n\n' +
'CONTEXT: The selected sources are the papers cited in the passage below, from my literature review on {{topic}}.\n\n' +
'[PASTE PASSAGE]\n\n' +
'TASK: For every sentence that cites a source, check whether the source supports the sentence. Classify each as SUPPORTED, PARTLY SUPPORTED, NOT SUPPORTED, or SOURCE NOT AVAILABLE, and quote the passage from the source that you relied on.\n\n' +
'CONSTRAINTS: Use only the sources. Do not judge whether the claims are true in general; judge only whether the cited source supports them.\n\n' +
'OUTPUT: A table: sentence | cited source | verdict | supporting or contradicting quote with page.\n\n' +
'SELF-CHECK: For every SUPPORTED verdict, make sure the quote actually says what the sentence claims, including magnitudes and direction.',
      after: ['Fix every PARTLY and NOT SUPPORTED sentence.', 'For SOURCE NOT AVAILABLE, upload the paper or check it by hand.']
    },
    {
      id: 'C4', stage: 'C', title: 'Find AI-style phrasing in my draft',
      use: 'Any chat assistant',
      purpose: 'Remove generic, inflated or formulaic phrasing.',
      body:
'ROLE: Act as an academic writing tutor who helps students write plainly and precisely.\n\n' +
'CONTEXT: Below is a draft passage from my literature review.\n\n' +
'[PASTE PASSAGE]\n\n' +
'TASK: Identify:\n' +
'1. inflated or generic words and phrases (for example: delve, pivotal, crucial, landscape, realm, tapestry, underscore, "plays a vital role", "in today\'s rapidly changing world");\n' +
'2. formulaic structures (every paragraph ending with a summary sentence, lists of three, "not only ... but also", rhetorical questions);\n' +
'3. claims without a citation or without specifics (numbers, places, periods);\n' +
'4. sentences that say nothing a reader did not already know.\n\n' +
'CONSTRAINTS: Quote each problem and suggest a plainer alternative, but do not rewrite the passage as a whole and do not add new content or citations.\n\n' +
'OUTPUT: A table: quoted text | problem type | suggested alternative.\n\n' +
'SELF-CHECK: Do not flag technical terms used in their technical sense (for example, "robust standard errors").',
      after: ['Also run the passage through the slop scanner in the AI slop lesson.', 'Read the revised passage aloud: it should sound like you.']
    }
  ]
};
