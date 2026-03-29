// lib/assessment-data.js
// Full 30-question AI Organisational Readiness Assessment
// 6 dimensions × 5 questions each; scores 1–5 per question; max 150 total

// ─── Dimensions ───────────────────────────────────────────────────────────────

export const DIMENSIONS = [
  {
    id:          'strategy_leadership',
    label:       'Strategy & Leadership',
    number:      1,
    color:       'var(--discover)',
    description: 'Evaluates whether leadership has a clear, committed, and resourced AI vision embedded in organisational strategy.',
  },
  {
    id:          'data_infrastructure',
    label:       'Data & Infrastructure',
    number:      2,
    color:       'var(--define)',
    description: 'Assesses the quality, governance, and technical infrastructure supporting AI data pipelines and model deployment.',
  },
  {
    id:          'talent_culture',
    label:       'Talent & Culture',
    number:      3,
    color:       'var(--design)',
    description: 'Measures the human capability — skills, learning culture, and change readiness — required to adopt and sustain AI.',
  },
  {
    id:          'process_operations',
    label:       'Process & Operations',
    number:      4,
    color:       'var(--develop)',
    description: 'Examines whether operational processes are systematised, measurable, and ready to integrate AI-driven automation.',
  },
  {
    id:          'ethics_governance',
    label:       'Ethics & Governance',
    number:      5,
    color:       'var(--deliver)',
    description: 'Reviews policies, accountability structures, and risk management frameworks that govern responsible AI use.',
  },
  {
    id:          'use_case_value',
    label:       'Use-Case & Value',
    number:      6,
    color:       'var(--scale)',
    description: 'Determines whether the organisation can identify, prioritise, and measure the business value of AI opportunities.',
  },
]

// ─── Questions ────────────────────────────────────────────────────────────────
// Each anchor array maps score 1→5 to a descriptive statement.

export const QUESTIONS = [

  // ── Dimension 1: Strategy & Leadership ──────────────────────────────────────

  {
    questionId: 'Q01',
    dimension:  'strategy_leadership',
    order:      1,
    title:      'AI Vision & Strategy Clarity',
    whyWeAsk:   'A documented and communicated AI strategy is the foundation for coherent investment and execution. Without it, AI initiatives remain ad hoc and fail to compound.',
    anchors: [
      'No AI strategy or vision exists. Leadership has not discussed AI beyond surface-level awareness.',
      'AI has been discussed informally but there is no documented strategy or designated owner.',
      'A basic AI strategy document exists but is not formally adopted or widely communicated.',
      'An AI strategy is documented, approved by leadership, and shared across key teams.',
      'A robust, board-approved AI strategy is embedded in the 3–5 year business plan with clear milestones and owners.',
    ],
  },
  {
    questionId: 'Q02',
    dimension:  'strategy_leadership',
    order:      2,
    title:      'Executive Sponsorship & Commitment',
    whyWeAsk:   'AI transformation requires sustained executive attention and budget authority. Programmes without a senior sponsor consistently stall.',
    anchors: [
      'No executive is personally invested in or accountable for AI outcomes.',
      'One executive mentions AI occasionally but has no formal accountability or budget authority.',
      'An executive sponsor is named but engagement is limited to quarterly updates.',
      'A dedicated executive sponsor champions AI, holds regular reviews, and removes blockers.',
      'Multiple C-suite members are active AI sponsors with shared KPIs, a cross-functional AI council, and ringfenced budget.',
    ],
  },
  {
    questionId: 'Q03',
    dimension:  'strategy_leadership',
    order:      3,
    title:      'AI Investment & Resource Allocation',
    whyWeAsk:   'Declared commitment without budget is rhetoric. Sustained resource allocation signals institutional seriousness and enables iterative delivery.',
    anchors: [
      'No budget has been allocated for AI initiatives.',
      'Ad hoc or one-off micro-budgets have been approved reactively.',
      'A small annual budget exists but is insufficient for meaningful capability building.',
      'A realistic multi-year AI budget is in place, covering talent, tools, and infrastructure.',
      'AI investment is treated as strategic capex, with a dedicated P&L, ROI tracking, and annual uplift mechanism.',
    ],
  },
  {
    questionId: 'Q04',
    dimension:  'strategy_leadership',
    order:      4,
    title:      'AI Roadmap & Milestones',
    whyWeAsk:   'A time-bound roadmap converts strategy into accountable delivery. It also helps teams prioritise and sequence AI investments rationally.',
    anchors: [
      'No AI roadmap or workplan exists.',
      'A loose list of AI ideas has been captured but no prioritisation or timeline assigned.',
      'A roadmap exists but lacks ownership, dependencies, or success criteria.',
      'A prioritised AI roadmap with owners, timelines, and dependencies is actively maintained.',
      'A live AI roadmap is integrated into quarterly business planning, reviewed by leadership, and updated as learning accumulates.',
    ],
  },
  {
    questionId: 'Q05',
    dimension:  'strategy_leadership',
    order:      5,
    title:      'Cross-Functional Alignment on AI',
    whyWeAsk:   'AI creates value at the intersection of technology, operations, and business — siloed ownership guarantees suboptimal outcomes.',
    anchors: [
      'AI is seen entirely as an IT topic. Business units have no involvement.',
      'Isolated teams are experimenting independently with no coordination.',
      'Some cross-functional collaboration exists informally but there is no structured governance.',
      'A cross-functional AI working group meets regularly with representatives from business, tech, and data.',
      'AI governance is embedded in business-unit operating models; every major function has a designated AI lead aligned to the central strategy.',
    ],
  },

  // ── Dimension 2: Data & Infrastructure ──────────────────────────────────────

  {
    questionId: 'Q06',
    dimension:  'data_infrastructure',
    order:      1,
    title:      'Data Quality & Completeness',
    whyWeAsk:   'AI models are only as good as the data they learn from. Poor data quality is the single most common cause of failed AI projects.',
    anchors: [
      'Data quality is unknown or known to be very poor. No profiling or cleansing processes exist.',
      'Data quality issues are acknowledged but there is no systematic process to measure or address them.',
      'Data quality checks exist for some critical datasets but coverage is inconsistent.',
      'Defined data quality standards are applied across key datasets with regular monitoring dashboards.',
      'A mature data quality framework with automated profiling, alerting, and continuous improvement is embedded in the data lifecycle.',
    ],
  },
  {
    questionId: 'Q07',
    dimension:  'data_infrastructure',
    order:      2,
    title:      'Data Governance & Cataloguing',
    whyWeAsk:   'Governance determines whether data assets are discoverable, trusted, and used correctly — a prerequisite for compliant and scalable AI.',
    anchors: [
      'No data governance framework or data ownership exists.',
      'Some data ownership has been informally assigned but no policies or catalogues exist.',
      'A data governance policy exists on paper but is not consistently enforced.',
      'A data governance framework is in place with defined data owners, a partial catalogue, and basic lineage tracking.',
      'A comprehensive data catalogue, lineage system, and governance forum are actively maintained; data owners are accountable for compliance.',
    ],
  },
  {
    questionId: 'Q08',
    dimension:  'data_infrastructure',
    order:      3,
    title:      'Data Accessibility & Integration',
    whyWeAsk:   'Data locked in silos or requiring manual extraction impedes timely model development and operational AI deployment.',
    anchors: [
      'Data is siloed across systems with no APIs or integration layer. Access requires manual extraction.',
      'Some data integration exists but is fragile, batch-only, and requires significant engineering effort to use.',
      'Core datasets are accessible via APIs or a central warehouse but coverage is incomplete.',
      'A well-structured data platform provides standardised access to most operational data with documented APIs.',
      'A modern data mesh or lakehouse architecture provides real-time, self-service access to all material data assets with full lineage.',
    ],
  },
  {
    questionId: 'Q09',
    dimension:  'data_infrastructure',
    order:      4,
    title:      'Cloud & Compute Infrastructure',
    whyWeAsk:   'Scalable, elastic compute is essential for training and serving AI models. On-premise constraints or under-provisioned cloud environments are a blocking bottleneck.',
    anchors: [
      'Infrastructure is entirely on-premise with no cloud provision. Compute is severely limited.',
      'Limited cloud adoption for non-AI workloads; no GPU or ML-specific compute has been provisioned.',
      'Cloud infrastructure is in use for some workloads; basic ML compute (e.g., cloud VMs) is available on request.',
      'A cloud-first infrastructure strategy with dedicated ML compute (GPU instances, managed ML platforms) is operational.',
      'A mature MLOps infrastructure — including automated provisioning, model registries, feature stores, and CI/CD for models — is in production.',
    ],
  },
  {
    questionId: 'Q10',
    dimension:  'data_infrastructure',
    order:      5,
    title:      'Data Security & Privacy Controls',
    whyWeAsk:   'AI systems amplify data risks. Without robust security and privacy controls, organisations face regulatory, reputational, and operational exposure.',
    anchors: [
      'No specific security or privacy controls exist for AI/ML data. General IT security is ad hoc.',
      'Basic perimeter security is in place but AI/ML data is not specifically classified or protected.',
      'Data classification and basic access controls exist; GDPR/relevant regulation compliance is partial.',
      'A data security policy specific to AI workloads exists with role-based access control, encryption at rest and in transit, and documented breach response processes.',
      'Privacy-by-design is embedded in the AI development lifecycle; anonymisation, differential privacy and/or synthetic data techniques are actively used; regular third-party audits conducted.',
    ],
  },

  // ── Dimension 3: Talent & Culture ───────────────────────────────────────────

  {
    questionId: 'Q11',
    dimension:  'talent_culture',
    order:      1,
    title:      'AI & Data Science Skills Availability',
    whyWeAsk:   'Internal capability is the scarcest resource in AI. Organisations that depend entirely on external vendors cannot build proprietary advantage.',
    anchors: [
      'No data science or AI capability exists internally. The organisation is entirely dependent on vendors.',
      'One or two individuals have relevant skills but there is no team structure or shared practice.',
      'A small AI/data team exists but is under-resourced relative to business demand.',
      'A capable AI/data team is in place covering data engineering, science, and ML engineering roles with a defined career framework.',
      'A large, multi-disciplinary AI function with specialist roles (LLM engineers, MLOps, AI product managers) is scaling, with strong hiring and retention practices.',
    ],
  },
  {
    questionId: 'Q12',
    dimension:  'talent_culture',
    order:      2,
    title:      'AI Literacy Across the Organisation',
    whyWeAsk:   'Frontline staff and middle management who understand AI fundamentals make better decisions about where and how to apply it — and are less likely to misuse or under-use AI tools.',
    anchors: [
      'AI literacy is virtually zero. Most staff could not explain what AI does or how it applies to their work.',
      'A handful of individuals understand AI basics; no formal training has been offered.',
      'An introductory AI awareness programme has been delivered to some staff but coverage is patchy.',
      'Structured AI literacy training is available across all levels of the organisation with measurable completion rates.',
      'Continuous AI upskilling is embedded in the talent development framework; role-specific curricula ensure every function can apply AI appropriately.',
    ],
  },
  {
    questionId: 'Q13',
    dimension:  'talent_culture',
    order:      3,
    title:      'Experimentation & Learning Culture',
    whyWeAsk:   'AI requires iterative experimentation. Cultures that punish failure or lack psychological safety will never move beyond pilots.',
    anchors: [
      'Failure is not tolerated. Experimentation outside established processes is actively discouraged.',
      'Experimentation is tolerated in isolated pockets but there is no cultural or structural support for it.',
      'Leadership espouses a learning culture but there are few mechanisms to support safe experimentation in practice.',
      'Dedicated time and budget are allocated for AI experiments; lessons learned are shared across teams.',
      'A systematic experimentation framework (hypothesis-driven tests, rapid cycles, shared learning libraries) is embedded in the operating model.',
    ],
  },
  {
    questionId: 'Q14',
    dimension:  'talent_culture',
    order:      4,
    title:      'Change Readiness & Resistance Management',
    whyWeAsk:   'AI changes how work is done. Organisations without a structured approach to managing resistance will see adoption fail regardless of technical quality.',
    anchors: [
      'There is significant fear or resistance to AI across the workforce with no programme to address it.',
      'Resistance exists but is not being actively managed; change management is reactive.',
      'Some change management activities (communications, manager briefings) are in place but not systematic.',
      'A structured change management programme accompanies AI deployments, including stakeholder analysis, communications plans, and training.',
      'Change management is treated as a first-class workstream in every AI programme, with dedicated OCM resource, adoption metrics, and feedback loops built in.',
    ],
  },
  {
    questionId: 'Q15',
    dimension:  'talent_culture',
    order:      5,
    title:      'Leadership AI Fluency',
    whyWeAsk:   'Leaders who do not understand AI make poor investment decisions, set unrealistic expectations, and fail to protect their organisations from risk.',
    anchors: [
      'Leadership has no meaningful understanding of AI. Decisions on AI are delegated entirely to IT.',
      'Leadership has a superficial awareness of AI but cannot evaluate proposals or risks independently.',
      'Key leaders have completed introductory AI education and can ask informed questions.',
      'Most senior leaders are AI-literate, engage substantively in AI strategy, and can challenge technical recommendations.',
      'The leadership team has a sophisticated understanding of AI capabilities and limitations; AI literacy is a criterion in executive appointments.',
    ],
  },

  // ── Dimension 4: Process & Operations ───────────────────────────────────────

  {
    questionId: 'Q16',
    dimension:  'process_operations',
    order:      1,
    title:      'Process Documentation & Standardisation',
    whyWeAsk:   'AI cannot automate what has not been defined. Well-documented, standardised processes are the raw material for automation and optimisation.',
    anchors: [
      'Core processes are not documented. Delivery depends on tribal knowledge.',
      'Some processes are informally documented but coverage is inconsistent and documents are outdated.',
      'Key processes are documented to a reasonable standard but not consistently maintained or used.',
      'Most operational processes are documented, standardised, and reviewed regularly.',
      'A process excellence function ensures all material processes are documented, version-controlled, measured, and continuously improved.',
    ],
  },
  {
    questionId: 'Q17',
    dimension:  'process_operations',
    order:      2,
    title:      'Data Collection & Measurement Maturity',
    whyWeAsk:   'AI generates value through pattern recognition and prediction — both require high-quality historical and real-time operational data.',
    anchors: [
      'Little to no operational data is systematically collected. Reporting is manual and sporadic.',
      'Some operational metrics are tracked but data collection is inconsistent and unreliable.',
      'Core KPIs are measured with reasonable consistency; data is available for analysis with effort.',
      'Operational data is collected automatically, is reliable, and is available in near real-time for most key processes.',
      'Comprehensive, automated data collection covers all material processes; advanced telemetry and event streaming feed live dashboards and predictive models.',
    ],
  },
  {
    questionId: 'Q18',
    dimension:  'process_operations',
    order:      3,
    title:      'Automation Maturity',
    whyWeAsk:   'Organisations with higher baseline automation capability integrate AI faster and derive more value — AI amplifies, not replaces, existing automation.',
    anchors: [
      'Processes are almost entirely manual with no automation tooling in use.',
      'Isolated automation exists (e.g., macros, basic scripts) but is fragile and not governed.',
      'RPA or basic workflow automation has been deployed in one or two areas.',
      'Automation (RPA, workflow engines, integration middleware) is deployed systematically across several business functions.',
      'Intelligent automation — combining RPA, APIs, and ML — is embedded in core operational workflows with full monitoring and exception handling.',
    ],
  },
  {
    questionId: 'Q19',
    dimension:  'process_operations',
    order:      4,
    title:      'Agile / Iterative Delivery Capability',
    whyWeAsk:   'AI products require rapid iteration and continuous learning loops — waterfall delivery models are incompatible with how AI is built and improved.',
    anchors: [
      'The organisation uses waterfall delivery exclusively. There is no iterative delivery capability.',
      'Agile methods are used by a small number of teams but are not standard practice.',
      'Agile delivery is common in technology teams but inconsistently applied to cross-functional AI programmes.',
      'Most AI-related work is delivered in iterative sprints with defined ceremonies, backlogs, and retrospectives.',
      'A mature agile delivery culture spans technology and business teams; product thinking, OKRs, and continuous deployment are standard practice.',
    ],
  },
  {
    questionId: 'Q20',
    dimension:  'process_operations',
    order:      5,
    title:      'Vendor & Partner Management for AI',
    whyWeAsk:   'Most organisations will use AI vendors and partners. Without clear evaluation criteria and governance, vendor lock-in and underperformance are likely.',
    anchors: [
      'No framework exists for evaluating or managing AI vendors. Procurement is ad hoc.',
      'AI vendors are engaged on an ad hoc basis with no standard due diligence or performance management.',
      'Basic vendor selection criteria exist; some performance review occurs but is informal.',
      'A structured AI vendor evaluation framework is in place covering capability, data handling, ethics, SLAs, and exit provisions.',
      'Proactive ecosystem management: AI vendor landscape is reviewed annually, strategic partnerships are formalised, and vendor performance is tracked against contractual KPIs with clear escalation paths.',
    ],
  },

  // ── Dimension 5: Ethics & Governance ────────────────────────────────────────

  {
    questionId: 'Q21',
    dimension:  'ethics_governance',
    order:      1,
    title:      'AI Ethics Policy & Principles',
    whyWeAsk:   'Without explicit ethical principles, AI systems can reinforce bias, erode privacy, and expose organisations to regulatory and reputational risk.',
    anchors: [
      'No AI ethics policy or principles exist. Ethical considerations are not part of AI decisions.',
      'Awareness of AI ethics issues exists informally but no policy has been developed.',
      'A draft AI ethics policy has been written but not formally adopted or communicated.',
      'An AI ethics policy is formally adopted, communicated to relevant teams, and referenced in AI project approvals.',
      'AI ethics principles are operationalised through checklists, review boards, and training; compliance is audited and reported to the board.',
    ],
  },
  {
    questionId: 'Q22',
    dimension:  'ethics_governance',
    order:      2,
    title:      'Bias Detection & Fairness Controls',
    whyWeAsk:   'Biased AI systems can cause significant harm to individuals and expose organisations to discrimination claims — proactive testing is essential.',
    anchors: [
      'No awareness of bias risks in AI output. Bias testing has never been considered.',
      'Team members are aware of bias as a theoretical risk but no testing or controls are in place.',
      'Basic bias checks are performed on some models informally but there is no standardised process.',
      'Bias testing is a mandatory step in the model development lifecycle with documented test plans and acceptance criteria.',
      'Continuous fairness monitoring is embedded in production AI systems; diverse evaluation panels, algorithmic audits, and third-party reviews are standard practice.',
    ],
  },
  {
    questionId: 'Q23',
    dimension:  'ethics_governance',
    order:      3,
    title:      'Regulatory & Compliance Awareness',
    whyWeAsk:   'The AI regulatory landscape is evolving rapidly. Organisations that are not tracking regulatory change will face costly remediation as rules are enforced.',
    anchors: [
      'No awareness of AI-specific regulation. Legal/compliance teams are not engaged in AI governance.',
      'General awareness of relevant regulation (e.g., GDPR) but AI-specific regulatory requirements (EU AI Act, sector-specific rules) are not mapped.',
      'Relevant regulations have been identified and initial gap analyses undertaken but no remediation plan exists.',
      'Regulatory requirements are mapped to AI use cases; a compliance roadmap is in place and progress is tracked.',
      'Regulatory compliance is embedded in the AI development lifecycle; dedicated legal/regulatory resource monitors evolving requirements and the organisation proactively engages with regulators.',
    ],
  },
  {
    questionId: 'Q24',
    dimension:  'ethics_governance',
    order:      4,
    title:      'Model Explainability & Transparency',
    whyWeAsk:   'Unexplainable AI decisions undermine trust, violate regulation in many contexts, and prevent engineers from diagnosing failure modes.',
    anchors: [
      'No consideration of model explainability. Black-box outputs are accepted without scrutiny.',
      'Explainability is recognised as important but no practices or tooling are in place.',
      'Some explainability techniques (feature importance, LIME/SHAP) are used informally by the technical team.',
      'Explainability requirements are defined for each model risk tier; methods are documented and results shared with business stakeholders.',
      'Explainability is a first-class design requirement; user-facing AI decisions include human-readable explanations; explainability reports are produced for regulatory review.',
    ],
  },
  {
    questionId: 'Q25',
    dimension:  'ethics_governance',
    order:      5,
    title:      'AI Risk Management Framework',
    whyWeAsk:   'AI introduces novel risks (model drift, adversarial attacks, dual-use misuse) that require dedicated risk management beyond standard IT frameworks.',
    anchors: [
      'No AI risk management framework exists. AI risks are not categorised or tracked.',
      'AI risks are discussed informally but are not formally identified, assessed, or owned.',
      'A basic AI risk register exists but risk owners and mitigation plans are not defined.',
      'An AI risk management framework includes risk categorisation, ownership, mitigation plans, and periodic review.',
      'A mature AI risk management programme integrates with enterprise risk management; AI-specific risk appetite is board-approved; red-team exercises and incident simulations are conducted annually.',
    ],
  },

  // ── Dimension 6: Use-Case & Value ────────────────────────────────────────────

  {
    questionId: 'Q26',
    dimension:  'use_case_value',
    order:      1,
    title:      'AI Use-Case Identification & Prioritisation',
    whyWeAsk:   'Organisations that cannot systematically identify and rank AI opportunities waste resources on low-value initiatives while missing high-impact ones.',
    anchors: [
      'No process for identifying or prioritising AI use cases. Ideas emerge randomly.',
      'Use cases are occasionally suggested by individuals but are not systematically captured or evaluated.',
      'A use-case backlog exists but lacks consistent prioritisation criteria or ownership.',
      'A structured use-case identification process captures and scores opportunities against value, feasibility, and strategic fit.',
      'A dedicated AI opportunity pipeline is continuously updated from multiple intake channels; use cases are ranked by a cross-functional panel using a standardised scoring framework.',
    ],
  },
  {
    questionId: 'Q27',
    dimension:  'use_case_value',
    order:      2,
    title:      'Business Case & Value Quantification',
    whyWeAsk:   'Without quantified value expectations, AI projects cannot be prioritised, funded, or evaluated — and the business never learns from success or failure.',
    anchors: [
      'No business cases are prepared for AI initiatives. Investment decisions are made on intuition.',
      'Qualitative rationale is provided for AI investments but no financial modelling is done.',
      'Basic financial estimates exist for some AI projects but assumptions are not documented or stress-tested.',
      'AI business cases include quantified benefits (cost, revenue, risk), costs, and a defined realisation plan.',
      'Rigorous AI business cases using NPV/IRR analysis are standard; benefits are tracked against plan post-deployment and fed back into future business case accuracy.',
    ],
  },
  {
    questionId: 'Q28',
    dimension:  'use_case_value',
    order:      3,
    title:      'Proof of Concept & Pilot Methodology',
    whyWeAsk:   'Poorly designed pilots produce misleading results and either kill good ideas or advance bad ones. Structured PoC methodology is a force multiplier.',
    anchors: [
      'No structured PoC or pilot process. AI experiments proceed without success criteria.',
      'PoCs are conducted informally without defined hypotheses, controlled conditions, or success criteria.',
      'PoC success criteria are defined in advance for some projects but methodology varies widely.',
      'A standardised PoC framework includes hypothesis, success criteria, control groups, and a stage-gate to production decision.',
      'A mature pilot-to-production playbook governs all AI initiatives; rapid cycling (4–8 weeks per PoC), structured learnings capture, and a clear escalation path to production are standard.',
    ],
  },
  {
    questionId: 'Q29',
    dimension:  'use_case_value',
    order:      4,
    title:      'AI Value Realisation & Benefits Tracking',
    whyWeAsk:   'Without measurement, organisations cannot learn from AI deployments, hold teams accountable, or justify future investment.',
    anchors: [
      'No post-deployment measurement of AI value. Once deployed, outcomes are not tracked.',
      'Anecdotal feedback is occasionally gathered but no systematic tracking is in place.',
      'Some AI deployments have KPIs defined but tracking is inconsistent and rarely leads to action.',
      'Most AI solutions have defined KPIs and are reviewed quarterly; results are reported to sponsors.',
      'All AI solutions have baseline measurements, live dashboards tracking business KPIs, and quarterly value reviews feeding back into the AI investment strategy.',
    ],
  },
  {
    questionId: 'Q30',
    dimension:  'use_case_value',
    order:      5,
    title:      'Scalability & Industrialisation of AI',
    whyWeAsk:   'The gap between a successful pilot and enterprise-scale deployment is wide. Organisations must plan for industrialisation from the outset.',
    anchors: [
      'No consideration of how to scale AI beyond individual pilots.',
      'Scaling is considered aspirationally but there is no plan, architecture, or operating model to support it.',
      'Scaling challenges are understood and some foundational work (MLOps, API standardisation) has begun.',
      'An MLOps and platform strategy exists to support scaling; several models are in production with automated retraining and monitoring.',
      'AI is industrialised at scale: a production model portfolio is managed through a centralised MLOps platform with automated deployment, drift detection, retraining, and governance.',
    ],
  },
]

// ─── Derived lookups ──────────────────────────────────────────────────────────

/** Map of dimensionId → DIMENSION object */
export const DIMENSIONS_BY_ID = Object.fromEntries(
  DIMENSIONS.map((d) => [d.id, d])
)

/** Map of dimensionId → QUESTION[] */
export const QUESTIONS_BY_DIMENSION = DIMENSIONS.reduce((acc, dim) => {
  acc[dim.id] = QUESTIONS.filter((q) => q.dimension === dim.id).sort(
    (a, b) => a.order - b.order
  )
  return acc
}, {})

/** Map of questionId → QUESTION object */
export const QUESTIONS_BY_ID = Object.fromEntries(
  QUESTIONS.map((q) => [q.questionId, q])
)
