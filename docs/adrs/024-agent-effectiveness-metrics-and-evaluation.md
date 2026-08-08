# ADR 024 — Agent Effectiveness Metrics and Evaluation

**Status:** Accepted

## Context

This project is an AI-agent harness for creating and evolving static websites.

The success of the template should not be measured only by software quality metrics. The primary goal is to determine whether the repository structure, documentation, examples, validation, and architectural rules improve AI-agent effectiveness.

The evaluation baseline is:

```text
id="a9f2qv"
template repository
        ↓
AI agent performs website-development task
        ↓
validated implementation
```

The purpose of evaluation is to measure whether the template helps agents produce correct, maintainable, architecturally consistent results with reduced human intervention.

This evaluation should measure the value of the harness, not the capability of a specific AI model.

## Decision

Create a separate evaluation repository containing:

- benchmark tasks;
- execution tooling;
- metric collection;
- evaluation reports.

The template repository should not contain benchmark infrastructure.

The evaluation repository consumes released versions of the template as the starting point.

## Evaluation Repository

The evaluation repository is responsible for:

- defining representative website-development tasks;
- executing tasks against template versions;
- collecting metrics;
- comparing template iterations;
- identifying regressions.

Conceptually:

```text
id="v8m5qs"
Template version
        ↓
Evaluation task
        ↓
AI agent execution
        ↓
Validation
        ↓
Metrics
        ↓
Evaluation report
```

## Benchmark Purpose

Benchmark tasks are not intended to measure AI models.

They measure:

> how effectively an AI agent can use this template as a starting point.

The same task may be executed against different:

- template versions;
- agent configurations;
- models;

to understand whether the harness improves outcomes.

## Representative Tasks

The evaluation repository should contain realistic website-development tasks.

Examples:

- create a localized marketing page;
- add a new reusable section;
- create a new design-system component;
- add a contact form integration;
- add analytics tracking;
- add a new locale;
- update SEO metadata;
- implement a new page using existing conventions;
- fix a failing Playwright workflow.

Tasks should represent common activities expected from users of the template.

## Task Success Criteria

A benchmark task is considered successful only when all required validation layers pass.

Required conditions:

```text
id="8f3n2m"
Implementation completed

+

npm run check passes

+

Playwright validation passes

+

architecture-review subagent returns PASS
```

Low-severity architecture-review findings are advisory and do not block success.

High and medium severity findings indicate failure.

## Primary Metrics

### Task Completion Rate

Measures:

```text
id="z7x4pz"
successful tasks
----------------
total tasks
```

This is the primary effectiveness metric.

It answers:

> Can agents successfully use the template?

## Time to Validated Completion

Measures:

```text
id="2q1m8d"
task start
    ↓
validated completion
```

The goal is to determine whether the template reduces:

- discovery time;
- implementation uncertainty;
- correction cycles.

## Validation Iterations

Measures how many feedback cycles are required.

Example:

```text
id="7qv4mb"
implementation
    ↓
npm run check failure
    ↓
fix
    ↓
architecture review failure
    ↓
fix
    ↓
success
```

Metrics:

- number of `npm run check` failures;
- number of architecture-review cycles;
- total iterations until success.

## Human Intervention

Measures:

```text
id="k8m1sa"
human interventions per task
```

Interventions include:

- clarifying requirements;
- correcting architecture;
- manually fixing implementation;
- overriding agent decisions.

The desired evolution is moving from:

```text
developer drives agent
```

toward:

```text
developer reviews validated output
```

## Architectural Compliance

Architecture compliance is measured through the architecture-review subagent.

Track:

- high severity findings;
- medium severity findings;
- low severity findings.

Desired trend:

```text
id="b5v8m2"
high findings → near zero

medium findings → decreasing

low findings → acceptable
```

## Validation Signal Quality

The evaluation should measure whether failures are detected by the appropriate layer.

Examples:

Good:

```text
SEO violation
        ↓
SEO validator failure
```

Good:

```text
architectural drift
        ↓
architecture-review finding
```

Poor:

```text
architectural problem
        ↓
human discovers manually
```

A successful harness provides actionable feedback close to the root cause.

## Template Regression Evaluation

The evaluation repository acts as a regression system for template evolution.

Before releasing a new template version:

```text
id="c9v6qk"
old template version
        vs
new template version
```

representative tasks should be evaluated.

A template change is successful when it improves or preserves agent effectiveness.

## Metrics Storage

The evaluation repository should include tooling to record:

- task execution;
- validation results;
- review findings;
- completion time;
- intervention count;
- final status.

The format may evolve, but results should be machine-readable to allow comparison between evaluations.

## Metrics Are Not Template Requirements

The template repository does not include:

- benchmark tasks;
- evaluation scripts;
- metric dashboards;
- agent scoring infrastructure.

Those belong exclusively to the evaluation repository.

This keeps the template focused on being a production-quality starting point.

## What Is Not Measured

The evaluation should not optimize for:

### Lines of generated code

Rejected because more code does not imply better outcomes.

### Number of tests created

Rejected because test quantity does not guarantee quality.

### Number of ADRs created

Rejected because more decisions do not imply better architecture.

### Model-specific performance

Rejected because the goal is template effectiveness, not ranking AI models.

### Token consumption as a primary metric

Rejected because it varies significantly between models and workflows.

It may be observed, but it is not a core success metric.

## Agent Evaluation Workflow

The intended evaluation workflow is:

```text
id="d6p4a1"
Select template version

↓

Select benchmark task

↓

Initialize repository

↓

Run AI agent

↓

Run npm run check

↓

Run Playwright

↓

Run architecture-review subagent

↓

Record metrics

↓

Generate report
```

## Rationale

The template is successful when it creates an environment where agents naturally produce good results.

This requires measuring the full workflow:

```text
id="e5k9p2"
understanding
+
implementation
+
validation
+
architectural alignment
```

A solution that only measures whether code compiles would miss the main purpose of the project.

The separate evaluation repository keeps the template clean while allowing systematic improvement.

## Consequences

### Positive

- Template remains focused on production usage.
- Evaluation can evolve independently.
- Agent effectiveness becomes measurable.
- Template regressions can be detected.
- Improvements can be validated objectively.
- Metrics reflect the actual product goal.

### Negative

- Requires maintaining a second repository.
- Evaluation results depend partly on task quality.
- Architecture review introduces some subjective judgment.
- Running evaluations requires additional infrastructure.

These tradeoffs are accepted because improving the agent harness is a core objective.

## Rejected Alternatives

### Benchmarks Inside Template Repository

Rejected because evaluation infrastructure would increase the complexity of every template fork.

### Success Based Only on Automated Tests

Rejected because passing tests does not guarantee architectural compliance.

### Human-Only Evaluation

Rejected because it does not scale and does not provide repeatable comparison.

### Model Benchmarking

Rejected because the goal is improving the harness, not comparing models.

### No Evaluation System

Rejected because the template would evolve based only on intuition rather than evidence.
