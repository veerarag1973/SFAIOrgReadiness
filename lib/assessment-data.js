// lib/assessment-data.js
// SpanForge AI Organisational Readiness Assessment v2.0

export const MAX_TOTAL_SCORE = 150
export const MAX_DIMENSION_SCORE = 25

export const DIMENSION_MATURITY_LEVELS = [
  { id: 'nascent', label: 'Nascent', range: [0, 10], tone: 'Critical gaps block meaningful AI investment.' },
  { id: 'emerging', label: 'Emerging', range: [11, 17], tone: 'Readiness work is underway but key dependencies remain weak.' },
  { id: 'operational', label: 'Operational', range: [18, 22], tone: 'Core foundations exist and can support lower-risk AI programmes.' },
  { id: 'leading', label: 'Leading', range: [23, 25], tone: 'This dimension is operating at a mature, repeatable level.' },
]

export const DIMENSIONS = [
  {
    id: 'strategy',
    label: 'Strategy',
    number: 1,
    color: 'var(--discover)',
    description: 'Does leadership have a coherent, funded, and committed AI strategy?',
    maturityBands: DIMENSION_MATURITY_LEVELS,
    economicsLink: 'Q2 (dedicated AI budget) directly connects to AI Economics. A budget that does not model inference cost at production scale will run out before the project delivers value. See AI Economics question E1 (cost of inference) and E3 (portfolio-level ROI model) when reviewing your Strategy score.',
    playbook: {
      nascent: [
        'Appoint a named AI executive owner.',
        'Define 3 specific AI goals for the next 12 months.',
        'Secure a dedicated AI budget line item.',
        'Run a use-case prioritisation exercise.',
      ],
      emerging: [
        'Formalise strategy with measurable milestones.',
        'Connect AI strategy to the business planning cycle.',
        'Build a portfolio review cadence.',
        'Define investment gate criteria.',
      ],
      operational: [
        'Optimise portfolio allocation.',
        'Expand AI governance to subsidiaries or regions.',
        'Publish the AI strategy externally as a trust signal.',
        'Benchmark against AI leaders in your industry.',
      ],
    },
  },
  {
    id: 'data',
    label: 'Data',
    number: 2,
    color: 'var(--design)',
    description: 'Is your data ready to power AI systems at the quality and scale required?',
    maturityBands: DIMENSION_MATURITY_LEVELS,
    playbook: {
      nascent: [
        'Conduct a data asset inventory within 30 days.',
        'Appoint data owners per domain.',
        'Run the first data quality audit.',
        'Review consent status for the top 5 data sources.',
      ],
      emerging: [
        'Implement a data quality metrics dashboard.',
        'Establish data governance workflows.',
        'Build the first production-grade data pipeline.',
        'Conduct an AI-specific bias assessment for the priority use case.',
      ],
      operational: [
        'Automate data quality monitoring.',
        'Implement record-level consent tracking.',
        'Build data lineage across all AI systems.',
        'Extend AI-specific risk assessment to all data sources.',
      ],
    },
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    number: 3,
    color: 'var(--build)',
    description: 'Can your systems support AI at production scale, speed, and reliability?',
    maturityBands: DIMENSION_MATURITY_LEVELS,
    playbook: {
      nascent: [
        'Conduct an infrastructure gap assessment for AI workloads.',
        'Provision a cloud compute environment for the first AI project.',
        'Select and deploy a basic MLOps toolset.',
        'Review enterprise API availability for priority AI use cases.',
      ],
      emerging: [
        'Build a production-grade data pipeline for the first use case.',
        'Implement model registry and deployment automation.',
        'Conduct an AI security review against OWASP LLM Top 10.',
        'Set up auto-scaling for AI inference workloads.',
      ],
      operational: [
        'Implement a full MLOps platform across AI projects.',
        'Build self-healing infrastructure with automated anomaly response.',
        'Complete AI security certification planning.',
        'Implement FinOps for AI workloads with automated optimisation.',
      ],
    },
    economicsLink: 'Infrastructure decisions are inseparable from economics. Auto-scaling (Q15) is a cost management decision as much as a performance decision. Compute provisioning (Q11) must be modelled against expected inference volume. See AI Economics question E1 (inference cost modelling) before finalising your Infrastructure investment plan.',
  },
  {
    id: 'talent',
    label: 'Talent',
    number: 4,
    color: 'var(--red)',
    description: 'Do you have the skills to build, evaluate, deploy, govern, and sustain AI?',
    maturityBands: DIMENSION_MATURITY_LEVELS,
    playbook: {
      nascent: [
        'Map required roles against current capability.',
        'Start hiring for the highest-priority gap and allow 4 to 6 months.',
        'Identify domain experts for the priority use case.',
        'Run an executive AI literacy workshop.',
      ],
      emerging: [
        'Complete the core technical team across ML, data, and MLOps.',
        'Embed domain experts in the first AI project team.',
        'Engage an AI governance specialist in legal or DPO functions.',
        'Establish an internal AI knowledge-sharing forum.',
      ],
      operational: [
        'Build a structured AI capability development programme.',
        'Create AI career pathways and progression frameworks.',
        'Establish an AI Centre of Excellence.',
        'Publish the AI talent strategy externally to attract talent.',
      ],
    },
  },
  {
    id: 'governance',
    label: 'Governance',
    number: 5,
    color: 'var(--govern)',
    description: 'Can you govern AI responsibly and meet regulatory obligations?',
    maturityBands: DIMENSION_MATURITY_LEVELS,
    playbook: {
      nascent: [
        'Conduct an AI inventory across all business units.',
        'Apply EU AI Act risk classification to each system.',
        'Appoint a named owner for the highest-risk AI system.',
        'Engage the DPO for AI-specific obligations review.',
      ],
      emerging: [
        'Build AI incident response playbooks for the top 3 failure modes.',
        'Operationalise the first T.R.U.S.T. Framework controls.',
        'Complete an EU AI Act compliance gap assessment.',
        'Run the first structured AI ethics review on the priority project.',
      ],
      operational: [
        'Automate governance monitoring across AI systems.',
        'Publish AI transparency statements for high-risk systems.',
        'Plan toward ISO 42001 AI Management System certification.',
        'Establish an external AI ethics advisory board.',
      ],
    },
    economicsLink: 'Portfolio-level ROI tracking (AI Economics E3) is a governance function. If your Governance dimension score is developing but your Economics score is low, you have governance structures without the financial accountability mechanisms that make them effective. The two must be built together.',
  },
  {
    id: 'culture',
    label: 'Culture',
    number: 6,
    color: 'var(--scale)',
    description: 'Will your organisation adopt, sustain, and improve AI, or resist and abandon it?',
    maturityBands: DIMENSION_MATURITY_LEVELS,
    playbook: {
      nascent: [
        'Conduct an employee sentiment survey on AI.',
        'Identify the 3 most vocal AI sceptics and listen to them.',
        'Publish an honest workforce narrative from the CEO.',
        'Start with one team where the culture is strongest.',
      ],
      emerging: [
        'Implement a blameless post-mortem process for AI failures.',
        'Run a data literacy programme for all managers.',
        'Involve front-line employees in the UX design of the first AI tool.',
        'Create an internal AI champions network.',
      ],
      operational: [
        'Embed data-driven decision metrics in performance reviews.',
        'Publish an annual AI impact report for employees.',
        'Establish an AI innovation fund owned by front-line teams.',
        'Create an AI talent exchange programme across business units.',
      ],
    },
  },
]

function anchors(low, middle, high) {
  return [low, low, middle, high, high]
}

export const QUESTIONS = [
  {
    questionId: 'Q01',
    dimension: 'strategy',
    order: 1,
    title: 'Has the board approved a specific AI strategy with named owners and measurable 12-month targets?',
    whyWeAsk: 'Vague ambition provides no operational direction and will not protect AI projects when budget pressure arrives. A real strategy specifies which business functions matter, what investment is required, what milestones define progress, and who is accountable.',
    anchors: anchors(
      'No AI strategy exists beyond general intent. Executive support exists in principle but no specific investment decisions have been made.',
      'A strategy document exists but lacks specific milestones, measurable outcomes, or a clear link to business priorities and funding.',
      'A board-approved strategy defines the investment envelope, named executive owner, measurable 12-month targets, and quarterly review cadence.'
    ),
  },
  {
    questionId: 'Q02',
    dimension: 'strategy',
    order: 2,
    title: 'Is there a dedicated AI budget separate from general IT or innovation budgets?',
    whyWeAsk: 'AI investment commingled with general IT budgets is the first cut under cost pressure. A dedicated budget signals strategic commitment and forces lifecycle cost planning across operations, retraining, and compliance.',
    anchors: anchors(
      'AI projects are funded ad hoc. No central AI investment plan exists and funding must be secured project by project.',
      'A partial AI budget exists but it does not cover full lifecycle cost, and operations, governance, or infrastructure are excluded.',
      'A dedicated AI budget approved at board level covers programmes, platform infrastructure, talent, tooling, governance, and ongoing operations.'
    ),
  },
  {
    questionId: 'Q03',
    dimension: 'strategy',
    order: 3,
    title: 'Has the organisation prioritised the 3 to 5 business problems most suited to AI using consistent criteria?',
    whyWeAsk: 'Spreading investment across too many concurrent experiments produces a portfolio of underfunded failures. Organisations that succeed identify a small number of high-value, high-feasibility use cases and go deep.',
    anchors: anchors(
      'No formal prioritisation exists. Multiple teams pursue independent experiments without a central portfolio view, duplicating effort and competing for talent.',
      'Prioritisation has started but is incomplete. Some use cases are identified without consistent criteria, funding, or accountable owners.',
      'A formal prioritisation exercise is complete. The top 3 to 5 use cases are documented with business case, feasibility, data readiness, and a named owner.'
    ),
  },
  {
    questionId: 'Q04',
    dimension: 'strategy',
    order: 4,
    title: 'Does the AI strategy align with and serve the broader business strategy instead of existing as a separate technology initiative?',
    whyWeAsk: 'AI adjacent to business strategy generates technology for its own sake. AI embedded in business strategy produces workflow redesign and measurable value.',
    anchors: anchors(
      'AI strategy is owned by IT with limited business unit involvement. Business leaders see it as an IT project.',
      'AI strategy references business priorities but is not operationalised. Business units are aware but have not redesigned core workflows.',
      'AI strategy is co-owned by business and technology. Each programme has a business owner committed to workflow redesign and AI is embedded in business planning cycles.'
    ),
  },
  {
    questionId: 'Q05',
    dimension: 'strategy',
    order: 5,
    title: 'Is there a governance structure for AI investment decisions, including the authority to stop failing projects?',
    whyWeAsk: 'Organisations that cannot stop failing AI projects waste significantly more than those that never started them. Without gate criteria and portfolio authority, sunk-cost arguments override objective assessment.',
    anchors: anchors(
      'AI investment decisions are informal. There is no portfolio view, no gate criteria, and no mechanism to stop underperforming projects.',
      'A steering committee exists but lacks defined gate criteria, full portfolio visibility, or demonstrated authority to stop projects.',
      'A functioning AI governance process has defined membership, meeting cadence, documented gate criteria, full portfolio visibility, and demonstrated project-stopping authority.'
    ),
  },
  {
    questionId: 'Q06',
    dimension: 'data',
    order: 1,
    title: 'Does the organisation have a maintained inventory of data assets, including what exists, where it lives, and who owns it?',
    whyWeAsk: 'You cannot build AI on data you cannot find. Without an inventory, every project begins with a long data discovery exercise before a single model is trained.',
    anchors: anchors(
      'No data inventory exists. Assets are discovered project by project through tribal knowledge with no central catalogue or consistent ownership.',
      'A partial inventory covers critical domains but is incomplete, unmaintained, or inaccessible to project teams.',
      'A maintained data catalogue covers material assets with location, format, owner, quality rating, consent status, and access method, and is integrated into project kickoff.'
    ),
  },
  {
    questionId: 'Q07',
    dimension: 'data',
    order: 2,
    title: 'Is data quality actively managed with defined standards, measurement, and named accountability?',
    whyWeAsk: 'Data quality does not improve on its own. Without active management, quality degrades as systems change. For AI, poor data produces confidently wrong models.',
    anchors: anchors(
      'Data quality is not systematically managed. Issues are discovered reactively with no defined standards, regular measurement, or named accountability.',
      'Some quality management exists for critical domains but is not comprehensive, not connected to AI requirements, and not systematically measured.',
      'Defined quality standards exist across material domains with named stewards, regular measurement, leadership reporting, and a documented remediation process with SLAs.'
    ),
  },
  {
    questionId: 'Q08',
    dimension: 'data',
    order: 3,
    title: 'Is there a data governance framework covering access, usage, retention, consent, and lineage?',
    whyWeAsk: 'AI creates new processing purposes that must be explicitly governed. Demonstrable data governance is a precondition for deploying AI in regulated contexts.',
    anchors: anchors(
      'No formal framework exists. Access is managed informally, retention is undefined or unenforced, and consent tracking is absent.',
      'A framework exists on paper but is not fully operationalised. Some policies are defined but not consistently enforced.',
      'A comprehensive framework is operationalised with role-based access controls, system-enforced retention, record-level consent tracking, and queryable data lineage for material flows.'
    ),
  },
  {
    questionId: 'Q09',
    dimension: 'data',
    order: 4,
    title: 'Can you rapidly build reliable, monitored data pipelines that deliver clean, current data to AI systems in production?',
    whyWeAsk: 'The most common late-stage AI failure is discovering the production data pipeline is more complex and fragile than the model itself. Production AI needs pipelines that are reliable, observable, and maintainable.',
    anchors: anchors(
      'Pipelines are built ad hoc using manual processes or fragile scripts. There is no standard tooling, no monitoring, and no documented ownership.',
      'Some pipeline infrastructure exists but is inconsistently implemented, partially monitored, and reliant on individual expertise instead of documented systems.',
      'Mature data engineering is in place with standard tooling, automated monitoring, documented ownership, and a track record of delivering reliable production pipelines on predictable timelines.'
    ),
  },
  {
    questionId: 'Q10',
    dimension: 'data',
    order: 5,
    title: 'Has data been assessed for AI-specific risks such as bias, representativeness, and consent for training purposes?',
    whyWeAsk: 'Using personal data for AI training is a new processing purpose requiring a separate legal basis in many regimes. Historical data also encodes historical biases that are expensive and reputationally damaging when discovered after deployment.',
    anchors: anchors(
      'No AI-specific data risk assessment exists. Data is used for AI training without formal assessment of bias, representativeness, or training consent.',
      'Some awareness exists and is discussed, but there is no formal framework. Bias analysis happens project by project without standard methodology.',
      'An AI-specific data risk assessment framework is applied to all material AI programmes. Bias and representativeness analysis is standard and legal reviews consent for training across all data sources.'
    ),
  },
  {
    questionId: 'Q11',
    dimension: 'infrastructure',
    order: 1,
    title: 'Do you have access to compute, whether cloud, on-premise, or hybrid, for AI training and production inference?',
    whyWeAsk: 'Infrastructure constraints surface late and are expensive to fix after architecture decisions are locked. Training and inference have very different compute profiles and both must be planned and costed before commitment.',
    anchors: anchors(
      'No dedicated AI compute exists. Workloads compete with production systems and requirements for intended AI systems have not been assessed.',
      'Some cloud compute is used for experiments, but production-grade infrastructure with appropriate scaling, availability, and cost management has not been provisioned.',
      'Compute infrastructure is planned and provisioned for training and inference, with clear understanding of requirements and cloud spend governance controls in place.'
    ),
  },
  {
    questionId: 'Q12',
    dimension: 'infrastructure',
    order: 2,
    title: 'Can AI systems integrate with core enterprise systems such as CRM, ERP, and databases without prohibitive engineering?',
    whyWeAsk: 'An AI model that cannot connect to the systems it reads from and writes to is a research project. Enterprise integration is consistently underestimated and frequently causes long delays or project abandonment.',
    anchors: anchors(
      'Legacy systems have limited API access. Integration requires significant custom engineering or vendor negotiation for every connection.',
      'Key systems have APIs but integration is complex, inconsistently documented, and requires significant engineering per connection.',
      'A well-documented integration architecture exists with APIs or data feeds for material enterprise systems, and an API gateway or integration platform provides standardised access.'
    ),
  },
  {
    questionId: 'Q13',
    dimension: 'infrastructure',
    order: 3,
    title: 'Is there an MLOps capability with the tools and processes required to deploy, monitor, and update AI models in production?',
    whyWeAsk: 'MLOps is to AI what DevOps is to software. Without it, models cannot be reliably deployed, updated without manual intervention, or monitored for degradation.',
    anchors: anchors(
      'No MLOps capability exists. Deployment is manual and ad hoc with no model registry, automated pipeline, or production monitoring.',
      'Some MLOps tooling exists, perhaps a model registry or basic CI/CD, but it is not comprehensive. Production monitoring is limited and retraining is manual.',
      'A mature MLOps capability exists with model versioning, automated deployment pipelines, production monitoring and alerting, drift detection, retraining pipelines, and rollback capability.'
    ),
  },
  {
    questionId: 'Q14',
    dimension: 'infrastructure',
    order: 4,
    title: 'Are security controls sufficient for AI-specific risks such as prompt injection, model inversion, and adversarial examples?',
    whyWeAsk: 'AI creates attack surfaces that traditional security frameworks are not designed to address. Prompt injection, model extraction, and adversarial inputs require dedicated controls.',
    anchors: anchors(
      'Security controls have not been reviewed for AI-specific risks. Standard application security is applied to AI without assessing adequacy.',
      'Some AI security considerations have been raised and partially addressed, but controls are not systematic.',
      'An AI security framework is in place covering prompt injection prevention, model access controls, inference-time data protection, adversarial input detection, and output monitoring for security anomalies.'
    ),
  },
  {
    questionId: 'Q15',
    dimension: 'infrastructure',
    order: 5,
    title: 'Can your infrastructure scale automatically to meet peak AI workload demand and scale down for cost efficiency?',
    whyWeAsk: 'AI workloads are spiky. Fixed-capacity infrastructure will either fail under load or be over-provisioned at enormous cost. Auto-scaling is a production prerequisite.',
    anchors: anchors(
      'Infrastructure is largely fixed capacity. Scaling requires manual provisioning that takes days or weeks, with no auto-scaling and no AI cost management process.',
      'Some auto-scaling exists in cloud environments but is not consistently applied. Cost monitoring exists but is not connected to AI-specific optimisation.',
      'Auto-scaling infrastructure is used for AI workloads with defined scaling policies based on measured demand, plus automated cost management with spend alerts, rightsizing, and regular optimisation reviews.'
    ),
  },
  {
    questionId: 'Q16',
    dimension: 'talent',
    order: 1,
    title: 'Are core AI technical roles covered across ML engineering, data engineering, and MLOps?',
    whyWeAsk: 'Each of these roles is distinct and cannot be substituted. All three are required for production AI and the hiring timeline must be factored into programme planning.',
    anchors: anchors(
      'Core AI technical roles do not exist. Projects assume talent will be hired or contracted as needed without accounting for time or cost.',
      'Some AI technical talent exists, perhaps in data science, but ML engineering, data engineering, and MLOps are not all covered by dedicated roles.',
      'Complete AI technical capability exists with dedicated roles, defined accountabilities, career paths, and a talent acquisition plan with realistic timelines covering all gaps.'
    ),
  },
  {
    questionId: 'Q17',
    dimension: 'talent',
    order: 2,
    title: 'Are domain experts accessible and embedded in AI projects to validate outputs and guide model development?',
    whyWeAsk: 'AI models learn statistical patterns, but domain experts determine whether those patterns correspond to business correctness. They provide ground truth, identify edge cases, and catch errors technical review misses.',
    anchors: anchors(
      'Domain expertise exists in business units but is not accessible. Subject matter experts are too busy or there is no process for engagement.',
      'Domain experts are consulted at key milestones but not embedded in development. Edge-case identification and label validation remain incomplete.',
      'Domain experts are formally embedded in project teams with defined time commitments for label validation, edge-case identification, output review, and acceptance testing.'
    ),
  },
  {
    questionId: 'Q18',
    dimension: 'talent',
    order: 3,
    title: 'Does the leadership team have sufficient AI literacy to make informed investment and governance decisions?',
    whyWeAsk: 'AI governance failures often trace back to AI illiteracy at executive level. Leaders need to understand capabilities, limitations, governance concepts, and the questions to ask at each lifecycle gate.',
    anchors: anchors(
      'Leadership has superficial AI awareness from news and vendor presentations. Proposals are approved or rejected based on intuition rather than structured evaluation.',
      'Some leaders have developed AI literacy through workshops, but it is uneven across the team and not treated as a leadership development priority.',
      'A structured AI literacy programme has been completed by the full leadership team and leaders understand capabilities, limitations, governance concepts, and the questions to ask at each lifecycle gate.'
    ),
  },
  {
    questionId: 'Q19',
    dimension: 'talent',
    order: 4,
    title: 'Do you have AI governance expertise across data protection, legal, and ethics capability with AI specialism?',
    whyWeAsk: 'General legal and compliance teams are not equipped to govern AI without upskilling or augmentation. Responsible persons, DPIAs, and impact assessments require AI-specific expertise.',
    anchors: anchors(
      'No dedicated AI governance expertise exists. Legal and compliance review AI using general frameworks not designed for AI-specific risks.',
      'A DPO exists and is aware of AI obligations but lacks deep AI governance expertise. Legal review is inconsistent and does not cover all governance dimensions.',
      'A dedicated AI governance capability exists with DPO expertise, AI-specialist legal counsel, and a structured ethics review process integrated into project delivery.'
    ),
  },
  {
    questionId: 'Q20',
    dimension: 'talent',
    order: 5,
    title: 'Is there a plan to build AI capability continuously rather than treat it as a one-time hiring or training exercise?',
    whyWeAsk: 'AI capability built today will be partially obsolete within 12 months. Sustainable AI leadership requires ongoing investment in learning, not a one-off programme.',
    anchors: anchors(
      'AI capability building is reactive. Skills are acquired only when a project requires them and are not maintained after. There is no ongoing programme or budget.',
      'Some ongoing capability building occurs, such as annual training budgets or conferences, but it is not systematic and not connected to the AI roadmap.',
      'A structured AI capability development programme exists with role-specific learning paths, annual training budgets, internal knowledge-sharing, external communities of practice, and skills tracking against roadmap needs.'
    ),
  },
  {
    questionId: 'Q21',
    dimension: 'governance',
    order: 1,
    title: 'Has a comprehensive AI inventory been completed with EU AI Act risk classification for each system?',
    whyWeAsk: 'You cannot govern what you have not catalogued. Without an inventory, you do not know your exposure across internal systems, vendor-embedded AI, or business-unit experimentation.',
    anchors: anchors(
      'No AI inventory exists. There is no systematic view of AI systems in use and vendor-embedded AI or business-unit projects have not been identified.',
      'A partial inventory covers visible AI systems. Risk classification is applied to some but not all systems and is not maintained as new systems are deployed.',
      'A comprehensive AI inventory is maintained across all systems, including vendor-embedded AI, with risk classification under EU AI Act, DPDP, and sector regulations, and it is updated on deployment and reviewed quarterly.'
    ),
  },
  {
    questionId: 'Q22',
    dimension: 'governance',
    order: 2,
    title: 'Is the governance framework operationalised as technical controls rather than just policy documents?',
    whyWeAsk: 'Policy documents are not governance. Real governance requires principles embedded as technical controls, such as audit logs, named system owners, and output filtering for safety guardrails.',
    anchors: anchors(
      'The governance framework exists only as policy documents and is not operationalised as technical controls. Compliance is self-reported with no verification mechanism.',
      'Some principles are operationalised, such as audit logging for some systems, but the framework is not consistently applied and gaps between policy and practice remain known.',
      'The governance framework is operationalised as technical controls across production AI systems and compliance is verified through automated monitoring rather than self-certification.'
    ),
  },
  {
    questionId: 'Q23',
    dimension: 'governance',
    order: 3,
    title: 'Has the organisation mapped its obligations under the EU AI Act, GDPR, DPDP, and NIST AI RMF with a compliance plan?',
    whyWeAsk: 'Regulatory compliance for AI is specific and non-trivial. Not knowing your obligations is not a defence, especially when multiple frameworks overlap.',
    anchors: anchors(
      'Regulatory compliance has not been formally assessed. The organisation is aware of regulations in general but has not mapped specific obligations or developed a compliance plan.',
      'A high-level compliance assessment has been conducted but is incomplete. Some systems are reviewed against one framework, but cross-framework mapping is not in place.',
      'A comprehensive AI compliance programme maps all systems against relevant frameworks, with milestones and accountable owners for high-risk systems, reviewed quarterly as regulations evolve.'
    ),
  },
  {
    questionId: 'Q24',
    dimension: 'governance',
    order: 4,
    title: 'Is there a functioning AI incident response capability covering detection, containment, investigation, and learning?',
    whyWeAsk: 'AI incidents are often invisible until they have caused significant harm at scale. Standard IT incident processes are not designed for silent AI failures such as drift, bias, consent violations, or hallucination spikes.',
    anchors: anchors(
      'There is no AI incident response capability. AI incidents would be handled through standard IT processes not designed for AI-specific failure modes, and there is no monitoring for silent failures.',
      'A basic incident response capability exists but is not comprehensive. Some monitoring is in place and playbooks exist for some incident types but not the full range.',
      'A comprehensive AI incident response capability exists with proactive monitoring, incident classification, defined escalation paths, named owners, tested playbooks, and post-incident review feeding governance improvements.'
    ),
  },
  {
    questionId: 'Q25',
    dimension: 'governance',
    order: 5,
    title: 'Is there a structured AI ethics review process embedded in the project lifecycle?',
    whyWeAsk: 'Ethics review is not legal compliance review. Legal asks whether the minimum requirements are met. Ethics asks whether the organisation should proceed at all and how to handle unresolved harm.',
    anchors: anchors(
      'No AI ethics review process exists. AI systems are reviewed for legal compliance only, with ethical implications handled informally or not at all.',
      'Ethics is considered informally during development, but there is no structured methodology, consistent process, or accountability for outcomes.',
      'A structured AI ethics review is embedded in the project lifecycle with defined review points, impact assessment methodology, accountability for implementing outcomes, and escalation for unresolved concerns.'
    ),
  },
  {
    questionId: 'Q26',
    dimension: 'culture',
    order: 1,
    title: 'Is decision-making genuinely data-driven, or do intuition and hierarchy routinely override evidence?',
    whyWeAsk: 'AI is a mechanism for making evidence-based decisions at scale. Organisations where senior intuition overrides data will not consistently adopt AI recommendations.',
    anchors: anchors(
      'Decisions are primarily driven by seniority and intuition. Data is presented to support decisions already made, and challenging a senior leader with evidence is professionally risky.',
      'Data is valued in some contexts, particularly analytical functions, but it does not consistently drive decisions and leaders vary in willingness to be challenged by evidence.',
      'A demonstrable data-driven culture exists across the organisation. Leaders model evidence-based behaviour and hold teams accountable for recommendations grounded in data.'
    ),
  },
  {
    questionId: 'Q27',
    dimension: 'culture',
    order: 2,
    title: 'Are AI failures met with learning and improvement, or blame and avoidance?',
    whyWeAsk: 'AI systems will fail. A blame culture causes teams to underreport incidents and optimise for appearing successful instead of becoming successful.',
    anchors: anchors(
      'AI failures are met with blame and negative consequences. Problems are underreported, risks are hidden, and teams optimise for appearances.',
      'The stated culture is blameless but actual practice is inconsistent. Some failures are treated as learning, while others are met with blame depending on visibility.',
      'A demonstrable learning culture exists around AI failures. Post-incident reviews focus on system and process improvement, and leadership models this explicitly.'
    ),
  },
  {
    questionId: 'Q28',
    dimension: 'culture',
    order: 3,
    title: 'Do employees who will work alongside AI systems trust them, and have they been involved in design?',
    whyWeAsk: 'The most technically strong AI system delivers no value if the people it is meant to help do not trust it or find workarounds to avoid it. Trust must be earned through transparency and involvement.',
    anchors: anchors(
      'There is significant employee distrust of AI based on fear of displacement, accuracy concerns, or past negative technology experiences. AI initiatives face active resistance.',
      'Employee sentiment is mixed and context dependent. Some teams are enthusiastic, others sceptical, and no systematic trust-building effort exists.',
      'A proactive programme builds employee trust through transparent communication, shared performance data, genuine design involvement, open concern channels, and tracked trust measures.'
    ),
  },
  {
    questionId: 'Q29',
    dimension: 'culture',
    order: 4,
    title: 'Can leadership accept short-term disruption for long-term AI capability, or does every project need immediate ROI?',
    whyWeAsk: 'Building foundational AI capability takes time. Organisations demanding immediate ROI from every investment will never build the infrastructure, governance, and talent that make high-value AI possible.',
    anchors: anchors(
      'Every AI investment must show positive ROI within 6 to 12 months. Foundational investments are viewed as overhead and projects not showing fast results are cancelled.',
      'Leadership intellectually accepts foundational investment but in practice applies short-term pressure. Foundational projects are started and then de-scoped when faster-return initiatives compete.',
      'Leadership explicitly distinguishes foundational investment from project-level investment. Foundational budgets are protected through quarterly cycles and evaluated against capability metrics, not just financial return.'
    ),
  },
  {
    questionId: 'Q30',
    dimension: 'culture',
    order: 5,
    title: 'Is there a clear, honest workforce narrative about AI impact, with a genuine support plan for affected roles?',
    whyWeAsk: 'Organisations without a credible workforce narrative create information vacuums filled by fear and rumour. A clear narrative acknowledges change, commits to support, and gives realistic timelines.',
    anchors: anchors(
      'There is no workforce narrative beyond vague reassurances. Employees interpret AI through speculation and change management is considered only after deployment.',
      'A narrative exists but is aspirational and not credible. It focuses on opportunity without acknowledging disruption and there is a gap between official messaging and employee experience.',
      'A clear, honest, credible workforce narrative acknowledges role changes, specifies support such as reskilling and redeployment, gives realistic timelines, and is developed with employee involvement and communicated by senior leaders.'
    ),
  },
]

export const QUICK_SCAN_QUESTIONS = [
  {
    id: 'QS1',
    dimension: 'strategy',
    prompt: 'Has the board approved a specific AI strategy with named owners and measurable targets?',
    questionId: 'Q01',
  },
  {
    id: 'QS2',
    dimension: 'strategy',
    prompt: 'Is there a dedicated, protected AI budget that covers build, operations, and governance?',
    questionId: 'Q02',
  },
  {
    id: 'QS3',
    dimension: 'data',
    prompt: 'Does a maintained inventory of your data assets exist, with quality ratings and ownership?',
    questionId: 'Q06',
  },
  {
    id: 'QS4',
    dimension: 'data',
    prompt: 'Has all data intended for AI training been reviewed for consent, bias, and regulatory compliance?',
    questionId: 'Q10',
  },
  {
    id: 'QS5',
    dimension: 'infrastructure',
    prompt: 'Is production-grade AI infrastructure, including compute, pipelines, and MLOps, provisioned and tested?',
    questionId: 'Q13',
  },
  {
    id: 'QS6',
    dimension: 'infrastructure',
    prompt: 'Can AI systems be integrated with your core enterprise systems without prohibitive engineering effort?',
    questionId: 'Q12',
  },
  {
    id: 'QS7',
    dimension: 'talent',
    prompt: 'Do you have dedicated ML engineers, data engineers, and MLOps engineers in post?',
    questionId: 'Q16',
  },
  {
    id: 'QS8',
    dimension: 'talent',
    prompt: 'Has the full leadership team completed a structured AI literacy programme?',
    questionId: 'Q18',
  },
  {
    id: 'QS9',
    dimension: 'governance',
    prompt: 'Has a comprehensive AI inventory been completed with risk classification under the EU AI Act?',
    questionId: 'Q21',
  },
  {
    id: 'QS10',
    dimension: 'culture',
    prompt: 'Is there a clear, honest workforce narrative about AI impact on roles, with a support plan?',
    questionId: 'Q30',
  },
]

export const BENCHMARKS = [
  {
    id: 'large-enterprise',
    label: 'Large enterprise (>5,000 employees)',
    typicalScore: '70-85',
    aiLeaders: '110+',
    topQuartile: '100+',
    sizeKeys: ['5000+'],
  },
  {
    id: 'mid-market',
    label: 'Mid-market (500-5,000 employees)',
    typicalScore: '55-75',
    aiLeaders: '100+',
    topQuartile: '90+',
    sizeKeys: ['201-500', '501-1000', '1000+'],
  },
  {
    id: 'financial-services',
    label: 'Financial services (regulated)',
    typicalScore: '75-90',
    aiLeaders: '120+',
    topQuartile: '105+',
    industries: ['Financial Services'],
  },
  {
    id: 'healthcare',
    label: 'Healthcare (regulated)',
    typicalScore: '65-80',
    aiLeaders: '110+',
    topQuartile: '95+',
    industries: ['Healthcare'],
  },
  {
    id: 'technology',
    label: 'Technology / digital-native companies',
    typicalScore: '80-100',
    aiLeaders: '130+',
    topQuartile: '115+',
    industries: ['Technology'],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing / industrial',
    typicalScore: '50-70',
    aiLeaders: '100+',
    topQuartile: '85+',
    industries: ['Manufacturing'],
  },
  {
    id: 'government',
    label: 'Government / public sector',
    typicalScore: '45-65',
    aiLeaders: '90+',
    topQuartile: '75+',
    industries: ['Government & Public Sector'],
  },
  {
    id: 'professional-services',
    label: 'Consulting / professional services',
    typicalScore: '65-80',
    aiLeaders: '110+',
    topQuartile: '95+',
    industries: ['Professional Services'],
  },
]

export const FAILURE_SIGNALS = [
  {
    id: 'strategy-below-12',
    label: 'Strategy below 12',
    threshold: 12,
    dimensionIds: ['strategy'],
    summary: 'AI projects without board-level commitment lose budget in the first quarterly reforecast. Without a funded strategy, projects are cancelled before delivering value.',
    evidence: 'MIT NANDA 2025: 95% of AI pilots fail to deliver measurable P&L return. Executive ownership is the primary differentiator of the 5% that succeed.',
  },
  {
    id: 'data-below-12',
    label: 'Data below 12',
    threshold: 12,
    dimensionIds: ['data'],
    summary: 'No data infrastructure means every AI project begins with a 3–6 month data discovery exercise. Most never recover. Poor training data produces confidently wrong models.',
    evidence: 'Informatica CDO Insights 2025: Data quality and readiness is cited by 43% of organisations as the #1 obstacle to AI success.',
  },
  {
    id: 'governance-below-12',
    label: 'Governance below 12',
    threshold: 12,
    dimensionIds: ['governance'],
    summary: 'Operating AI without governance creates regulatory exposure under the EU AI Act (enforceable August 2026, fines up to €35M or 7% of global turnover) and DPDP.',
    evidence: 'Stanford AI Index 2025: Only 11% of organisations have fully implemented fundamental responsible AI capabilities despite widespread AI adoption.',
  },
  {
    id: 'talent-below-12',
    label: 'Talent below 12',
    threshold: 12,
    dimensionIds: ['talent'],
    summary: 'Missing ML, data, or MLOps roles cannot be filled fast enough to save a committed project. Hiring ML talent takes 3–6 months on average. Projects stall at the build phase.',
    evidence: 'RAND Corporation 2024: Missing domain expertise is one of the five root causes of AI project failure, identified across 80%+ of failed programmes.',
  },
  {
    id: 'any-below-10',
    label: 'Any single dimension below 10',
    threshold: 10,
    anyDimension: true,
    summary: 'A critical gap in any dimension will undermine projects regardless of scores in other dimensions. AI projects fail at their weakest link, not their strongest.',
    evidence: 'BCG Research: Only 26% of companies generate tangible value from AI. 74% struggle to scale — most cite one or two critical gaps that block the entire programme.',
  },
]

export const BONUS_AI_ECONOMICS = {
  intro: 'These prompts do not change the 150-point score. Treat a score below 8/15 as a risk flag for your overall programme.',
  riskThreshold: 8,
  questions: [
    {
      id: 'E1',
      title: 'Do you understand the cost of AI inference at production scale, and has it been modelled in the business case?',
      whyWeAsk: 'Inference at scale is often much more expensive than the initial business case models. Costs can become the reason an otherwise successful AI system is shut down 6 to 12 months after launch.',
    },
    {
      id: 'E2',
      title: 'Does the organisation have a rigorous build-vs-buy-vs-partner framework for AI, and is it applied consistently?',
      whyWeAsk: 'Organisations that default to building when buying or partnering would be faster and cheaper consistently overspend on AI. This is one of the highest-return governance decisions leaders can standardise.',
    },
    {
      id: 'E3',
      title: 'Is there a portfolio-level ROI model for AI that tracks cumulative investment against cumulative value delivered across projects?',
      whyWeAsk: 'Portfolio-level value tracking is what allows leaders to justify continued investment, stop weak programmes, and scale the small number of initiatives that produce meaningful returns.',
    },
  ],
}

export const ROADMAP_MONTHS = [
  {
    id: 'month-1',
    title: 'Month 1 - Foundations',
    tasks: [
      'Complete the full AI inventory — all AI systems, their risk classification, their owners.',
      'Appoint named owners for Strategy, Data, Governance, and Talent dimensions.',
      'Run the Executive Quick Scan with the full leadership team and document disagreements.',
      'Identify your two critical gaps (lowest dimension scores) and assign a 90-day lead per gap.',
      'Conduct data asset inventory for the top 3 priority use cases.',
      'Engage legal and DPO for AI regulatory obligation mapping (EU AI Act / DPDP).',
      'Run executive AI literacy workshop — minimum 2 hours, all C-suite.',
    ],
  },
  {
    id: 'month-2',
    title: 'Month 2 - Infrastructure and Controls',
    tasks: [
      'Build first production-grade data pipeline for the priority use case.',
      'Operationalise the first three T.R.U.S.T. Framework controls as technical controls.',
      'Implement basic MLOps — model registry and deployment automation for the first project.',
      'Define AI incident response playbooks for the three most likely failure modes.',
      'Complete build vs buy vs partner evaluation for each prioritised use case.',
      'Run first structured data quality audit on priority use case data.',
      'Publish honest workforce narrative — communicated personally by CEO or equivalent.',
    ],
  },
  {
    id: 'month-3',
    title: 'Month 3 - First AI Pilot Under Governance',
    tasks: [
      'Launch first AI pilot using the SpanForge Build phase CI/CD gate framework.',
      'AgentOBS active before first production request — behavioural baseline established.',
      'Run post-90-day re-assessment and re-score all six dimensions.',
      'Document lessons learned and update the readiness plan for the next 90 days.',
      'Publish a 90-day progress update internally to build trust and momentum.',
      'Submit first AI system to EU AI Act compliance review if high-risk classification applies.',
      'Set the date for the next formal readiness assessment — 6 months from today.',
    ],
  },
]

export const WORKSHOP_FACILITATION_GUIDE = {
  participants: 'AI lead, CTO/CIO, data lead, legal or compliance, HR, and 2 to 3 business-unit representatives. Minimum 5 people, maximum 10.',
  duration: '3 hours for the full 30-question assessment. 90 minutes for the executive quick scan only.',
  rule: 'Each participant should score independently before discussion. If two scores differ by more than 2 points, the disagreement is the data and should be discussed before averaging.',
  timeAllocation: 'Allow around 20 minutes per dimension, plus 15 minutes at the end for scoring summary and roadmap priorities.',
  conflictResolution: 'Ask: What would need to be true for this to be a 5? That surfaces the gap more usefully than debating the current score.',
  reassessment: 'Set the next workshop date before closing the current one. Recommended cadence: every 6 months.',
}

export const SCORE_GUIDE = [
  {
    id: 'ready',
    label: 'Ready',
    range: [120, 150],
    description: 'Proceed with confidence. Benchmark against AI leaders in your sector.',
  },
  {
    id: 'developing',
    label: 'Developing',
    range: [90, 119],
    description: 'AI projects can begin in stronger dimensions. Address gaps within 90 days.',
  },
  {
    id: 'emerging',
    label: 'Emerging',
    range: [75, 89],
    description: 'Targeted readiness work required. Use the dimension playbooks.',
  },
  {
    id: 'nascent',
    label: 'Nascent',
    range: [0, 74],
    description: 'Stop. Build foundations first — do not commit to significant AI investment.',
  },
]

export const BENCHMARK_METHODOLOGY = {
  note: 'These are indicative ranges based on composite research — directional guidance, not precise benchmarking. Sources include McKinsey State of AI 2025, PwC Responsible AI Survey 2025, Stanford AI Index 2025, and Gartner AI surveys 2024–2025. Industry groupings reflect broad patterns; your organisation may sit between categories. Use these ranges to orient your score, not to declare readiness or non-readiness by comparison alone. For validated sector-specific benchmarking, consult the SpanForge platform where registered users can compare scores against anonymised peer data.',
  tips: [
    'Use them to orient, not to conclude. A score of 75 in a sector where the typical range is 70–85 tells you that you are average — not that you are ready.',
    'Focus on the AI Leaders threshold. That is the score at which organisations report meaningful financial returns from AI. That is your real target.',
    'If your score is above the Top Quartile threshold, check your dimension scores — a high total driven by two or three strong dimensions with weak ones hidden beneath is a common pattern.',
    'Sector context matters. A score of 80 in financial services (where the typical range is 75–90) is less impressive than the same score in manufacturing (typical range 50–70).',
  ],
}

export const RECOMMENDED_USAGE_PATH = {
  intro: 'The assessment is designed to be used in sequence. Do not attempt all 30 questions in a solo sitting. The workshop format produces significantly better results than individual completion.',
  note: 'If you are short on time, the Executive Quick Scan alone (10 questions) is sufficient to identify critical gaps and decide whether to proceed. The full 30-question workshop is the recommended path for any organisation considering significant AI investment.',
  steps: [
    { id: 'step-1', label: 'Run it today', body: 'Score all 6 dimensions honestly. Use the workshop format for best results.' },
    { id: 'step-2', label: 'Re-run in 6 months', body: 'Compare scores against your previous assessment. Track improvement per dimension.' },
    { id: 'step-3', label: 'Track improvement', body: 'The SpanForge platform tracks scores over time for registered users.' },
    { id: 'step-4', label: 'Share with your board', body: 'The visual output page is your board-ready one-page summary.' },
  ],
}

export const PLATFORM_UPGRADE = {
  tagline: 'This is a system, not a one-time document — run it, re-run it, track your improvement.',
  headline: 'SpanForge Platform',
  sub: 'Free account. No credit card.',
  url: 'https://getspanforge.com',
  steps: [
    { id: 'p-1', label: 'Run it today', body: 'Score all 6 dimensions honestly. Use the workshop format for best results.' },
    { id: 'p-2', label: 'Re-run in 6 months', body: 'Compare scores against your previous assessment. Track improvement per dimension.' },
    { id: 'p-3', label: 'Track improvement', body: 'The SpanForge platform tracks scores over time for registered users.' },
    { id: 'p-4', label: 'Share with your board', body: 'The visual output page is your board-ready one-page summary.' },
  ],
}

export const DISCOVER_GATE = {
  minTotalScore: 90,
  minDimensionScore: 12,
}

export const DIMENSIONS_BY_ID = Object.fromEntries(
  DIMENSIONS.map((dimension) => [dimension.id, dimension])
)

export const QUESTIONS_BY_DIMENSION = DIMENSIONS.reduce((acc, dimension) => {
  acc[dimension.id] = QUESTIONS.filter((question) => question.dimension === dimension.id)
    .sort((left, right) => left.order - right.order)
  return acc
}, {})

export const QUESTIONS_BY_ID = Object.fromEntries(
  QUESTIONS.map((question) => [question.questionId, question])
)
