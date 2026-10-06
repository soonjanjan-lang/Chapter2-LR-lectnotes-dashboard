/* Quiz banks. Each item: q (question HTML), x (optional excerpt), o (options), a (index of best answer),
   f (feedback shown after answering; one string, or an array with one string per option). */
window.LR_QUIZZES = {

  journals: {
    title: 'Journal case cards',
    items: [
      {
        q: 'Case A: <i>Journal of Applied Regional Economics</i>&dagger;. Listed in Scopus Sources (Q2 in Economics and Econometrics) and in the Clarivate Master Journal List (ESCI). The web address on the journal page matches the one in both lists. Fee: none. Average time from submission to acceptance: five months.',
        o: ['Credible: read and cite its articles, judging each on its merits', 'Predatory: avoid', 'Hijacked: avoid this website', 'Cannot tell without the impact factor'],
        a: 0,
        f: 'Indexed in two curated lists, a verified web address, no fee and a realistic review time are all good signs. As with any journal, judge each article by its design and data.'
      },
      {
        q: 'Case B: <i>International Journal of Economics, Management, Engineering and Medical Sciences</i>&dagger;. Invites you by email ("Dear Esteemed Professor"). Promises review in 5 days. Displays a "Global Impact Factor 6.2". Not found in Scopus Sources or the Master Journal List.',
        o: ['Credible but new', 'Predatory: avoid', 'Discontinued from Scopus', 'Acceptable for Malaysian evidence only'],
        a: 1,
        f: 'Very broad scope, flattering spam, an implausible review time, an invented metric and no indexing in the official lists: a textbook predatory profile.'
      },
      {
        q: 'Case C: <i>Journal of Asian Economic Policy</i>&dagger; is indexed in Scopus. You reach a site with the same title and ISSN through a search engine. It asks for USD 450 by bank transfer to a personal account. The web address differs from the one listed in Scopus.',
        o: ['Credible: it is in Scopus', 'Probably a hijacked copy: use only the website listed in Scopus', 'Predatory but citable', 'Discontinued'],
        a: 1,
        f: 'Hijackers copy the title and ISSN of real journals. The web address listed in Scopus or the Master Journal List is the one to trust, and payments to personal accounts are a strong warning. Check the Retraction Watch Hijacked Journal Checker.'
      },
      {
        q: 'Case D: <i>Jurnal Ekonomi Wilayah</i>&dagger;, a Malaysian journal indexed in MyCite but not in Scopus or Web of Science. Named editorial board at Malaysian universities, published peer-review policy, articles in Malay and English, two issues a year.',
        o: ['Predatory: avoid', 'Legitimate local journal: usable, especially for Malaysian evidence, with careful judgement of each article', 'Hijacked', 'Only citable if it has an impact factor'],
        a: 1,
        f: 'Many sound Malaysian journals are not in Scopus or Web of Science. Transparent editors and peer review, and MyCite indexing, make it legitimate. Weigh each study\'s design, and prefer stronger sources for claims your argument depends on.'
      },
      {
        q: 'Case E: <i>Economic Studies Review</i>&dagger; was discontinued by Scopus in 2024 for publication concerns. The article you want to cite appeared in 2021, while the journal was still indexed.',
        o: ['Never cite it', 'Cite freely: it was indexed in 2021', 'Read it critically; cite it only if the design is sound, and prefer corroborating evidence', 'Report the journal to Scopus'],
        a: 2,
        f: 'Articles published while a journal was indexed usually remain in Scopus, but a discontinuation is a reason for extra scrutiny. Judge the article itself and look for corroboration.'
      }
    ]
  },

  apa: {
    title: 'APA 7 check',
    items: [
      { q: 'Which in-text citation is correct for a work by three authors, cited for the first time?', o: ['(Cengiz, Dube, Lindner, 2019)', '(Cengiz et al., 2019)', '(Cengiz et al 2019)', '(Cengiz and others, 2019)'], a: 1, f: 'APA 7 uses "et al." from the first citation for three or more authors, with a full stop after "al" and a comma before the year.' },
      { q: 'Which narrative citation is correct?', o: ['Grubel & Scott (1966) argue that ...', 'Grubel and Scott (1966) argue that ...', '(Grubel and Scott, 1966) argue that ...', 'Grubel & Scott, 1966, argue that ...'], a: 1, f: 'Use "and" in narrative citations and "&" inside parentheses.' },
      { q: 'You read Patinkin (1968) only as quoted in Soon (2010). What goes in your reference list?', o: ['Patinkin (1968) only', 'Soon (2010) only', 'Both', 'Neither'], a: 1, f: 'Cite as (Patinkin, 1968, as cited in Soon, 2010) and list only Soon (2010), the work you actually read. Better still, read Patinkin.' },
      { q: 'How should a DOI appear in an APA 7 reference?', o: ['doi:10.1086/259394', 'DOI: 10.1086/259394', 'https://doi.org/10.1086/259394', 'Retrieved from https://doi.org/10.1086/259394'], a: 2, f: 'APA 7 presents DOIs as URLs, with no label and no "Retrieved from".' },
      { q: 'You read twelve papers for background but cite only nine. What does the reference list contain?', o: ['All twelve', 'The nine cited', 'The nine cited, plus the other three under "Further reading"', 'Only the papers quoted directly'], a: 1, f: 'APA uses a reference list of works cited. Uncited reading belongs, if anywhere, in a bibliography, which APA does not use. "You cite: References. You just read: Bibliography."' }
    ]
  },

  gaps: {
    title: 'Which type of gap?',
    items: [
      { q: 'Which type of gap is this?', x: '"Estimates of the effect of remittances on child schooling are positive in Latin America but negative or zero in several African studies, and no study has examined why."', o: ['Evidence gap', 'Population gap', 'Temporal gap', 'Practical-knowledge conflict gap'], a: 0, f: 'Conflicting findings are the defining feature of an evidence gap. A study that explains the conflict fills it.' },
      { q: 'Which type of gap is this?', x: '"All Malaysian studies of returns to education estimate wage equations by OLS, which does not address ability bias."', o: ['Knowledge gap', 'Methodological gap', 'Theoretical gap', 'Contextual gap'], a: 1, f: 'The problem is how the question has been answered: a methodological gap.' },
      { q: 'Which type of gap is this?', x: '"The brain gain hypothesis predicts that the prospect of emigration raises investment in education, but it has not been tested with individual data from Malaysia."', o: ['Empirical gap', 'Evidence gap', 'Practical-knowledge conflict gap', 'Knowledge gap'], a: 0, f: 'A theoretical prediction awaiting a test is an empirical gap. The Malaysian setting adds a contextual element.' },
      { q: 'Which type of gap is this?', x: '"Although research consistently finds targeted transfers more cost-effective than price controls, governments continue to rely on price controls, and the reasons have not been studied."', o: ['Evidence gap', 'Methodological gap', 'Practical-knowledge conflict gap', 'Population gap'], a: 2, f: 'Practice departs from what research recommends: a practical-knowledge conflict gap.' },
      { q: 'Which type of gap is this?', x: '"Studies of retirement saving sample salaried workers with compulsory pension contributions; e-hailing drivers have not been studied."', o: ['Population gap', 'Theoretical gap', 'Temporal gap', 'Evidence gap'], a: 0, f: 'A neglected group: a population gap. It becomes convincing only with the reason the group should behave differently (volatile income, no automatic saving).' },
      { q: 'Which type of gap is this?', x: '"All estimates of Malaysian food demand elasticities use survey rounds from before 2020."', o: ['Knowledge gap', 'Temporal gap', 'Methodological gap', 'Population gap'], a: 1, f: 'The evidence may be out of date after a structural change: a temporal or data gap.' },
      { q: 'Which type of gap is this?', x: '"Neither the individual human capital model nor the household model of migration explains why students whose families paid for study abroad plan to return."', o: ['Theoretical gap', 'Empirical gap', 'Population gap', 'Evidence gap'], a: 0, f: 'Existing theories cannot explain the pattern: a theoretical gap.' },
      { q: 'Which type of gap is this?', x: '"The fuel subsidy targeting introduced last year has not yet been evaluated."', o: ['Knowledge gap', 'Evidence gap', 'Methodological gap', 'Theoretical gap'], a: 0, f: 'No research exists yet because the policy is new: a knowledge gap. Explain why the answer matters for policy.' }
    ]
  },

  frameworks: {
    title: 'Classify the framework',
    items: [
      { q: 'A diagram shows: Issue, then RQ1 to RQ4, then RO1 to RO3, then survey and interviews, then datasets and reports, then "policy recommendations". What is it mainly?', o: ['Theoretical framework', 'Conceptual framework', 'Research framework', 'Analytical framework'], a: 2, f: 'It maps the process of the study, not relationships between variables: a research framework.' },
      { q: 'A section derives, from utility maximisation, that labour supply falls when non-labour income rises, and states the sign of the derivative. What is it?', o: ['Theoretical framework (mathematical form)', 'Research framework', 'Conceptual framework', 'Summary matrix'], a: 0, f: 'An established theory stated formally with signed predictions: a theoretical framework in mathematical form.' },
      { q: 'A diagram links "financial literacy", "trust in banks" and "distance to branch" to "account use", with "income group" moderating the links and H1 to H4 on the arrows. What is it?', o: ['Research framework', 'Conceptual framework', 'Analytical framework', 'Mind map'], a: 1, f: 'Study-specific variables, hypothesised relationships and a moderator: a conceptual framework. It should cite the theories behind each arrow.' },
      { q: 'A flowchart: estimate a demand system for each income group, derive elasticities, compute compensating variation, compare groups with bootstrap confidence intervals. What is it?', o: ['Analytical framework', 'Theoretical framework', 'Research framework', 'Conceptual framework'], a: 0, f: 'It specifies how the data will be analysed to answer the questions: an analytical framework.' },
      { q: 'A table traces each explanatory variable (years of schooling, union membership, overtime hours) to a concept and to the theory that justifies it, all pointing to "wage". What is it?', o: ['Theoretical framework', 'Research framework', 'Analytical framework', 'Summary matrix'], a: 0, f: 'Theory, concept and variable, as in the lecturer\'s wage diagram. It is a theoretical framework that also does the work of a conceptual one.' },
      { q: 'A thesis labels its project timeline (Gantt chart) as the "theoretical framework". What is the main problem?', o: ['Gantt charts must be in Chapter 1', 'It contains no theory and no relationships between variables', 'It should be called a conceptual framework', 'Nothing, if the supervisor agrees'], a: 1, f: 'A timeline is a project-management tool. Whatever the label, a framework must show theory and relationships.' }
    ]
  }
};
