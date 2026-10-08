import type { CategoryId, QuestionId } from "../../scorecard/questions";
import type { Answer, FindingSeverity, Verdict } from "../../scorecard/scoring";
import type { SupportedLocale } from "../config";

type QuestionCopy = { text: string; hint: string; topic: string };
type VerdictCopy = { label: string; summary: string };

export type ScorecardTranslation = {
  seo: { title: string; description: string };
  intro: {
    eyebrow: string;
    title: string;
    description: string;
    stats: { questions: string; duration: string; signup: string };
    start: string;
    note: string;
  };
  answers: Record<Answer, string>;
  categories: Record<CategoryId, string>;
  categoryShort: Record<CategoryId, string>;
  questions: Record<QuestionId, QuestionCopy>;
  navigation: {
    back: string;
    position: string;
    progress: string;
    shortcutHint: string;
  };
  results: {
    eyebrow: string;
    readiness: string;
    scoreAnnouncement: string;
    criticalBanner: string;
    verdicts: Record<Verdict, VerdictCopy>;
    categoriesTitle: string;
    findingsTitle: string;
    noFindings: string;
    severities: Record<FindingSeverity, string>;
    findings: Record<CategoryId, { critical: string; gap: string }>;
    unknownsTitle: string;
    unknownsDescription: string;
    copyLink: string;
    copied: string;
    copyFallback: string;
    retake: string;
    nextStep: {
      title: string;
      description: string;
      cta: string;
      strongTitle: string;
      strongDescription: string;
      strongCta: string;
    };
  };
  mailto: { subject: string; body: string; none: string };
};

export const scorecardTranslations = {
  en: {
    seo: {
      title: "Production Readiness Check | JOBE — Engineering that Works",
      description:
        "A free 20-question check for AI products in production: get a readiness score, critical risk flags, and the issues to address first.",
    },
    intro: {
      eyebrow: "Production Readiness Check",
      title: "Is your product ready for production?",
      description:
        "Twenty questions across delivery, testing, security, operations, recovery, performance, and privacy. Get a readiness score, the critical risks behind it, and where to look first.",
      stats: {
        questions: "20 questions",
        duration: "~4 minutes",
        signup: "No sign-up",
      },
      start: "Start the check",
      note: "Answers stay in your browser.",
    },
    answers: {
      yes: "Yes",
      partial: "Partially",
      no: "No",
      unknown: "I don't know",
      na: "Not applicable",
    },
    categories: {
      delivery: "Development & Delivery",
      testing: "Testing & Quality",
      security: "Security",
      observability: "Observability & Operations",
      reliability: "Reliability & Recovery",
      performance: "Performance & Growth",
      privacy: "Data & Privacy",
    },
    categoryShort: {
      delivery: "Delivery",
      testing: "Testing",
      security: "Security",
      observability: "Observability",
      reliability: "Recovery",
      performance: "Performance",
      privacy: "Privacy",
    },
    questions: {
      q01: {
        text: "Do code changes go through review before reaching production?",
        hint: "e.g. pull requests, merge requests, or another code review process.",
        topic: "Code review",
      },
      q02: {
        text: "Are changes validated automatically before being merged or released?",
        hint: "e.g. tests, build, lint, or other CI checks.",
        topic: "Automated validation (CI)",
      },
      q03: {
        text: "Is the production release process consistent and reproducible?",
        hint: "e.g. an automated pipeline or a clearly defined procedure, not improvised manual deploys.",
        topic: "Reproducible releases",
      },
      q04: {
        text: "Can you tell which version of the code is running in production and roll back a problematic release?",
        hint: "e.g. versioned releases, deploy history, or one-step rollback.",
        topic: "Release versioning and rollback",
      },
      q05: {
        text: "Do the product's main flows have automated tests?",
        hint: "e.g. sign-up, login, payment, or other business-critical flows.",
        topic: "Automated tests for key flows",
      },
      q06: {
        text: "Do tests run automatically whenever relevant changes are made?",
        hint: "e.g. on every pull request or push to the main branch.",
        topic: "Automatic test execution",
      },
      q07: {
        text: "Are passwords, tokens, API keys, and other secrets kept out of the source code?",
        hint: "e.g. environment variables or a secrets manager, never committed to the repository.",
        topic: "Secrets management",
      },
      q08: {
        text: "Does the backend correctly check who can access or modify each protected piece of data or functionality?",
        hint: "Hiding an option or screen in the interface is not enough.",
        topic: "Backend authorization",
      },
      q09: {
        text: "Is data received from users, APIs, and other external systems validated on the backend?",
        hint: "e.g. schema validation for requests, webhooks, and integration responses.",
        topic: "Backend input validation",
      },
      q10: {
        text: "Is the product protected against common web application and API vulnerabilities?",
        hint: "e.g. injection, XSS, unauthorized data access, and insecure configuration.",
        topic: "Protection against common vulnerabilities",
      },
      q11: {
        text: "Is sensitive data properly protected in transit and at rest?",
        hint: "e.g. HTTPS and appropriate protection for credentials and personal information.",
        topic: "Protection of sensitive data",
      },
      q12: {
        text: "Are the product's dependencies and libraries checked for known vulnerabilities?",
        hint: "e.g. Dependabot, npm audit, Snyk, or an equivalent tool.",
        topic: "Dependency vulnerability checks",
      },
      q13: {
        text: "Are unexpected production errors recorded and possible to investigate?",
        hint: "e.g. an error tracking tool, or structured logs with stack traces.",
        topic: "Production error tracking",
      },
      q14: {
        text: "Can you quickly tell if the product is down or showing an abnormal number of errors?",
        hint: "e.g. monitoring, health checks, or alerts.",
        topic: "Availability and error monitoring",
      },
      q15: {
        text: "Is there a backup strategy for data that cannot be lost?",
        hint: "If the product stores no persistent data that matters, answer Not applicable.",
        topic: "Backup strategy",
      },
      q16: {
        text: "Are you confident those backups can actually be restored?",
        hint: "e.g. a restore has been tested or there is a proven procedure.",
        topic: "Backup restore confidence",
      },
      q17: {
        text: "Are failures or slowness in external services handled without leaving the product stuck indefinitely?",
        hint: "e.g. timeouts, controlled retries, and proper handling of unavailability.",
        topic: "Handling external service failures",
      },
      q18: {
        text: "Do the main flows perform acceptably with the current volume of users and data?",
        hint: "e.g. key pages and API calls respond quickly under real usage.",
        topic: "Current performance",
      },
      q19: {
        text: "Does the team know the main bottlenecks or limits that could appear if usage grows significantly?",
        hint: "e.g. database load, third-party rate limits, or AI inference costs.",
        topic: "Known growth bottlenecks",
      },
      q20: {
        text: "Does the team know what personal or sensitive data the product collects, and have adequate controls for access, retention, and deletion?",
        hint: "Also consider applicable legal or contractual requirements.",
        topic: "Personal data controls",
      },
    },
    navigation: {
      back: "Back",
      position: "Question %{current} of %{total}",
      progress: "Check progress",
      shortcutHint: "Tip: press 1–4 to answer",
    },
    results: {
      eyebrow: "Your result",
      readiness: "Readiness",
      scoreAnnouncement:
        "Production Readiness Score: %{score} out of 100. Readiness: %{verdict}.",
      criticalBanner:
        "Critical risk: at least one critical risk should be addressed before considering the product production-ready.",
      verdicts: {
        strong: {
          label: "Strong foundation",
          summary:
            "The product shows a solid foundation for production. There may still be specific risks or opportunities to improve.",
        },
        someGaps: {
          label: "Some important gaps",
          summary:
            "A reasonable foundation, with gaps worth addressing before growth or higher criticality.",
        },
        significantGaps: {
          label: "Significant readiness gaps",
          summary:
            "There are relevant engineering, security, or operational gaps. A deeper technical review is recommended.",
        },
        needsAttention: {
          label: "Needs attention",
          summary:
            "The overall score is reasonable, but a critical risk needs to be addressed first.",
        },
        highRisk: {
          label: "High risk",
          summary:
            "Several signs suggest the product does not yet have the controls needed for reliable production operation.",
        },
      },
      categoriesTitle: "By category",
      findingsTitle: "Main findings",
      noFindings:
        "No major findings. Your answers point to a solid foundation.",
      severities: {
        criticalRisk: "Critical risk",
        criticalGap: "Critical gap",
        gap: "Gap",
      },
      findings: {
        delivery: {
          critical:
            "You may not be able to tell what's running in production or roll back a bad release quickly.",
          gap: "Changes may reach production without consistent review, automated checks, or a repeatable release process.",
        },
        testing: {
          critical:
            "Business-critical flows may break without any automated signal.",
          gap: "Key product flows may break without automated tests catching it first.",
        },
        security: {
          critical:
            "Access control, secrets, or data protection may need review before more users rely on the product.",
          gap: "Input validation or dependency checks may leave avoidable openings.",
        },
        observability: {
          critical:
            "Production failures may go unnoticed until users report them.",
          gap: "Problems in production may not be detected or investigated quickly.",
        },
        reliability: {
          critical:
            "Data that cannot be lost may not be recoverable after an incident.",
          gap: "Slow or failing external services may leave the product stuck.",
        },
        performance: {
          critical: "Performance may not hold under the current load.",
          gap: "Performance limits may surface as usage grows.",
        },
        privacy: {
          critical:
            "Personal data collection, retention, or deletion may not be under control.",
          gap: "There may be limited visibility into how personal data is handled.",
        },
      },
      unknownsTitle: "Areas to verify",
      unknownsDescription:
        "You answered “I don't know” on critical controls. These areas may never have been assessed, or lack visibility.",
      copyLink: "Copy result link",
      copied: "Link copied",
      copyFallback: "Copy this link:",
      retake: "Retake",
      nextStep: {
        title: "Discover which risks to fix first",
        description:
          "Book an Initial Assessment to review these findings and identify the highest-impact actions.",
        cta: "Book an Initial Assessment",
        strongTitle: "Keep it that way as you grow",
        strongDescription:
          "A short conversation can confirm the foundation and spot risks before they scale.",
        strongCta: "Talk about your next stage",
      },
    },
    mailto: {
      subject: "Production Readiness Check — %{score}/100",
      body: "Hello JOBE team,\n\nI took the Production Readiness Check and would like to book an Initial Assessment.\n\nScore: %{score}/100\nReadiness: %{verdict}\nMain findings: %{findings}\nAreas to verify: %{unknowns}\n\nResult: %{url}\n",
      none: "none",
    },
  },
  "pt-BR": {
    seo: {
      title: "Autoavaliação de Produção | JOBE — Engenharia que Funciona",
      description:
        "Uma autoavaliação gratuita de 20 perguntas para produtos de IA em produção: receba uma nota de prontidão, alertas de riscos críticos e os pontos a tratar primeiro.",
    },
    intro: {
      eyebrow: "Autoavaliação de Produção",
      title: "Seu produto está pronto para produção?",
      description:
        "Vinte perguntas sobre entrega, testes, segurança, operação, recuperação, desempenho e privacidade. Receba uma nota de prontidão, os riscos críticos por trás dela e por onde começar.",
      stats: {
        questions: "20 perguntas",
        duration: "~4 minutos",
        signup: "Sem cadastro",
      },
      start: "Começar a autoavaliação",
      note: "As respostas ficam no seu navegador.",
    },
    answers: {
      yes: "Sim",
      partial: "Parcialmente",
      no: "Não",
      unknown: "Não sei",
      na: "Não se aplica",
    },
    categories: {
      delivery: "Desenvolvimento & Entrega",
      testing: "Testes & Qualidade",
      security: "Segurança",
      observability: "Observabilidade & Operação",
      reliability: "Confiabilidade & Recuperação",
      performance: "Desempenho & Crescimento",
      privacy: "Dados & Privacidade",
    },
    categoryShort: {
      delivery: "Entrega",
      testing: "Testes",
      security: "Segurança",
      observability: "Observabilidade",
      reliability: "Recuperação",
      performance: "Desempenho",
      privacy: "Privacidade",
    },
    questions: {
      q01: {
        text: "Alterações no código passam por revisão antes de chegar à produção?",
        hint: "Ex.: Pull Request, Merge Request ou outro processo de code review.",
        topic: "Revisão de código",
      },
      q02: {
        text: "Alterações são validadas automaticamente antes de serem integradas ou publicadas?",
        hint: "Ex.: execução automática de testes, build, lint ou outras verificações via CI.",
        topic: "Validação automática (CI)",
      },
      q03: {
        text: "O processo de publicação em produção é consistente e reproduzível?",
        hint: "Ex.: pipeline automatizado ou procedimento claramente definido, evitando deploys manuais improvisados.",
        topic: "Publicação reproduzível",
      },
      q04: {
        text: "É possível identificar qual versão do código está rodando em produção e reverter uma publicação problemática?",
        hint: "Ex.: releases versionadas, histórico de deploys ou rollback em um passo.",
        topic: "Versionamento e rollback de releases",
      },
      q05: {
        text: "Os principais fluxos do produto possuem testes automatizados?",
        hint: "Ex.: cadastro, login, pagamento ou outros fluxos essenciais para o negócio.",
        topic: "Testes automatizados dos fluxos principais",
      },
      q06: {
        text: "Os testes são executados automaticamente sempre que mudanças relevantes são realizadas?",
        hint: "Ex.: a cada pull request ou push na branch principal.",
        topic: "Execução automática de testes",
      },
      q07: {
        text: "Senhas, tokens, chaves de API e outros secrets são mantidos fora do código-fonte?",
        hint: "Ex.: variáveis de ambiente ou um gerenciador de secrets, nunca commitados no repositório.",
        topic: "Gestão de secrets",
      },
      q08: {
        text: "O backend verifica corretamente quem pode acessar ou modificar cada dado ou funcionalidade protegida?",
        hint: "Não basta esconder uma opção ou tela na interface.",
        topic: "Autorização no backend",
      },
      q09: {
        text: "Dados recebidos de usuários, APIs e outros sistemas externos são validados no backend?",
        hint: "Ex.: validação de schema em requisições, webhooks e respostas de integrações.",
        topic: "Validação de entradas no backend",
      },
      q10: {
        text: "O produto possui proteção contra vulnerabilidades comuns de aplicações web e APIs?",
        hint: "Ex.: injection, XSS, acesso indevido a dados e configurações inseguras.",
        topic: "Proteção contra vulnerabilidades comuns",
      },
      q11: {
        text: "Dados sensíveis são protegidos adequadamente durante transmissão e armazenamento?",
        hint: "Ex.: HTTPS e proteção apropriada para credenciais e informações pessoais.",
        topic: "Proteção de dados sensíveis",
      },
      q12: {
        text: "Dependências e bibliotecas utilizadas pelo produto são verificadas em busca de vulnerabilidades conhecidas?",
        hint: "Ex.: Dependabot, npm audit, Snyk ou ferramenta equivalente.",
        topic: "Verificação de vulnerabilidades em dependências",
      },
      q13: {
        text: "Erros inesperados em produção são registrados e podem ser investigados?",
        hint: "Ex.: ferramenta de error tracking ou logs estruturados com stack trace.",
        topic: "Registro de erros em produção",
      },
      q14: {
        text: "É possível saber rapidamente se o produto está indisponível ou apresentando uma quantidade anormal de erros?",
        hint: "Ex.: monitoramento, health check ou alertas.",
        topic: "Monitoramento de disponibilidade e erros",
      },
      q15: {
        text: "Existe uma estratégia de backup para os dados que não podem ser perdidos?",
        hint: "Se o produto não armazena dados persistentes relevantes, responda Não se aplica.",
        topic: "Estratégia de backup",
      },
      q16: {
        text: "Existe confiança de que esses backups realmente podem ser restaurados?",
        hint: "Ex.: a restauração já foi testada ou existe um procedimento comprovado.",
        topic: "Confiabilidade da restauração de backups",
      },
      q17: {
        text: "Falhas ou lentidão de serviços externos são tratadas sem deixar o produto indefinidamente travado?",
        hint: "Ex.: timeouts, retries controlados e tratamento adequado de indisponibilidade.",
        topic: "Tratamento de falhas de serviços externos",
      },
      q18: {
        text: "Os principais fluxos apresentam desempenho aceitável com o volume atual de usuários e dados?",
        hint: "Ex.: páginas e chamadas de API principais respondem rápido com o uso real.",
        topic: "Desempenho atual",
      },
      q19: {
        text: "A equipe conhece os principais gargalos ou limitações que podem aparecer se o uso do produto crescer significativamente?",
        hint: "Ex.: carga no banco de dados, limites de APIs de terceiros ou custo de inferência de IA.",
        topic: "Gargalos de crescimento conhecidos",
      },
      q20: {
        text: "A equipe sabe quais dados pessoais ou sensíveis o produto coleta e possui controles adequados para acesso, retenção e exclusão?",
        hint: "Considere também requisitos legais ou contratuais aplicáveis ao produto.",
        topic: "Controles de dados pessoais",
      },
    },
    navigation: {
      back: "Voltar",
      position: "Pergunta %{current} de %{total}",
      progress: "Progresso da autoavaliação",
      shortcutHint: "Dica: use as teclas 1–4 para responder",
    },
    results: {
      eyebrow: "Seu resultado",
      readiness: "Prontidão",
      scoreAnnouncement:
        "Nota de prontidão para produção: %{score} de 100. Prontidão: %{verdict}.",
      criticalBanner:
        "Risco crítico: existe pelo menos um risco crítico que deve ser tratado antes de considerar o produto pronto para produção.",
      verdicts: {
        strong: {
          label: "Base sólida",
          summary:
            "O produto apresenta uma base sólida para operação em produção. Ainda podem existir riscos específicos ou oportunidades de melhoria.",
        },
        someGaps: {
          label: "Lacunas importantes",
          summary:
            "Uma base razoável, com lacunas que merecem tratamento antes de crescimento ou aumento de criticidade.",
        },
        significantGaps: {
          label: "Lacunas significativas",
          summary:
            "Existem lacunas relevantes de engenharia, segurança ou operação. Uma análise técnica mais aprofundada é recomendada.",
        },
        needsAttention: {
          label: "Requer atenção",
          summary:
            "A pontuação geral é razoável, mas existe um risco crítico que deve ser tratado primeiro.",
        },
        highRisk: {
          label: "Alto risco",
          summary:
            "Diversos sinais indicam que o produto ainda não possui os controles necessários para operação confiável em produção.",
        },
      },
      categoriesTitle: "Por categoria",
      findingsTitle: "Principais pontos de atenção",
      noFindings:
        "Nenhum ponto de atenção relevante. Suas respostas indicam uma base sólida.",
      severities: {
        criticalRisk: "Risco crítico",
        criticalGap: "Lacuna crítica",
        gap: "Lacuna",
      },
      findings: {
        delivery: {
          critical:
            "Pode não ser possível saber o que está rodando em produção ou reverter rapidamente uma publicação problemática.",
          gap: "Alterações podem chegar à produção sem revisão consistente, verificações automáticas ou um processo de publicação reproduzível.",
        },
        testing: {
          critical:
            "Fluxos críticos para o negócio podem quebrar sem nenhum sinal automático.",
          gap: "Fluxos principais podem quebrar sem que testes automatizados detectem antes.",
        },
        security: {
          critical:
            "Controle de acesso, secrets ou proteção de dados podem precisar de revisão antes de mais usuários dependerem do produto.",
          gap: "Validação de entradas ou verificação de dependências podem deixar brechas evitáveis.",
        },
        observability: {
          critical:
            "Falhas em produção podem passar despercebidas até que usuários reclamem.",
          gap: "Problemas em produção podem não ser detectados ou investigados rapidamente.",
        },
        reliability: {
          critical:
            "Dados que não podem ser perdidos podem não ser recuperáveis após um incidente.",
          gap: "Serviços externos lentos ou indisponíveis podem deixar o produto travado.",
        },
        performance: {
          critical: "O desempenho pode não se sustentar com a carga atual.",
          gap: "Limites de desempenho podem aparecer com o crescimento do uso.",
        },
        privacy: {
          critical:
            "A coleta, retenção ou exclusão de dados pessoais pode não estar sob controle.",
          gap: "Pode haver pouca visibilidade sobre como dados pessoais são tratados.",
        },
      },
      unknownsTitle: "Áreas para verificar",
      unknownsDescription:
        "Você respondeu “Não sei” em controles críticos. Estas áreas talvez nunca tenham sido avaliadas ou carecem de visibilidade.",
      copyLink: "Copiar link do resultado",
      copied: "Link copiado",
      copyFallback: "Copie este link:",
      retake: "Refazer",
      nextStep: {
        title: "Descubra quais riscos corrigir primeiro",
        description:
          "Agende uma Avaliação Inicial para revisar os principais pontos de atenção e identificar as ações de maior impacto.",
        cta: "Agendar Avaliação Inicial",
        strongTitle: "Mantenha essa base enquanto cresce",
        strongDescription:
          "Uma conversa curta pode confirmar essa base e identificar riscos antes que escalem.",
        strongCta: "Conversar sobre a próxima fase",
      },
    },
    mailto: {
      subject: "Autoavaliação de Produção — %{score}/100",
      body: "Olá, equipe JOBE,\n\nFiz a Autoavaliação de Produção e gostaria de agendar uma Avaliação Inicial.\n\nNota: %{score}/100\nProntidão: %{verdict}\nPrincipais pontos de atenção: %{findings}\nÁreas para verificar: %{unknowns}\n\nResultado: %{url}\n",
      none: "nenhum",
    },
  },
} satisfies Record<SupportedLocale, ScorecardTranslation>;
