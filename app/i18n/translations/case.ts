import type { SupportedLocale } from "../config";

export type CasePassage = { label: string; text: string };

export type CaseTranslation = {
  seo: {
    title: string;
    description: string;
  };
  title: string;
  subtitle: string;
  introduction: {
    context: string;
    system: string;
    overview: string;
  };
  sections: {
    funnel: {
      heading: string;
      context: string;
      strategy: string;
      decision: CasePassage;
      result: CasePassage;
      principle: CasePassage;
    };
    pipelines: {
      heading: string;
      constraint: string;
      operation: string;
      maintenance: string;
      decision: CasePassage;
      principle: CasePassage;
    };
    ai: {
      heading: string;
      limitation: string;
      decision: CasePassage;
      modelChoice: string;
      principle: CasePassage;
    };
    conclusion: {
      heading: string;
      status: string;
      next: string;
      commitment: string;
    };
  };
};

export const caseTranslations = {
  en: {
    seo: {
      title: "StockCast Case Study | JOBE — Engineering that Works",
      description:
        "How we evolved StockCast, a production system processing financial media, AI, and data 24/7: analytics architecture, 24/7 pipelines, and AI workflows.",
    },
    title: "StockCast",
    subtitle:
      "Evolving real systems when the technical foundation starts to limit the business",
    introduction: {
      context:
        "When a product finds product-market fit and starts to grow, technical decisions from the early stage often become bottlenecks. Integrations break, manual processes prevent scale, and observability disappears.",
      system:
        "StockCast, a system in production since January 2026 operated by JOBE's founder, was the environment where we tested how to resolve these limits in practice. With ~9,500 installs, 323 companies monitored, and more than 8,400 documents indexed, StockCast is not an MVP seeking validation. It is a real system processing media, AI, and financial data 24/7.",
      overview:
        "The challenges faced here are the same ones that limit growing companies. Below, we detail three real engineering problems and the principles we applied to overcome them.",
    },
    sections: {
      funnel: {
        heading:
          "1. The funnel was lying: when the right metric requires the right architecture",
        context:
          "Early in the operation, the volume of installs grew consistently. Product instrumentation, however, revealed an invisible bottleneck: very few users reached the system's main action (playing a conference). Acquisition was optimized for install volume, bringing in users with no alignment to the value proposition.",
        strategy:
          "We changed the strategy to optimize campaigns for qualified in-app events. That is when the analytics architecture failed. We tried to maintain architectural purity by using a single tool (PostHog) to guarantee privacy and data control. But when integrating those mobile events with Google Ads, the abstraction broke: the ad platform read the app events as web traffic, invalidating mobile optimization.",
        decision: {
          label: "The decision:",
          text: "We abandoned the purity of a single tool and integrated the Google Analytics SDK directly into the app.",
        },
        result: {
          label: "The result:",
          text: "With acquisition corrected and new notification journeys introduced, the activation rate (defined as users who open the app and play an audio within equivalent 30-day windows) jumped from 6% to 26%.",
        },
        principle: {
          label: "The JOBE principle:",
          text: "Abstractions should simplify the system. When architectural purity creates more operational complexity than a direct integration, pragmatism must win. Instrumenting the real funnel matters more than vanity metrics.",
        },
      },
      pipelines: {
        heading: "2. 24/7 pipelines and the real limit of automation",
        constraint:
          "Indexing financial documents and conferences from more than 300 companies requires monitoring public sources (CVM/B3 and investor-relations sites) that offer no free push mechanisms. The alternative is periodic polling, which creates a critical infrastructure trade-off: latency × cost × risk of IP blocking.",
        operation:
          "We built a pipeline that operates 24/7, using internal triggers and batch execution to minimize unnecessary requests. The system detects, records, and fires notifications for new documents in approximately 2.5 minutes, on average, with no human intervention in the normal flow.",
        maintenance:
          "However, automation runs into the reality of unstructured data. Identifying URLs across hundreds of investor-relations sites with distinct HTML structures still requires maintenance. And in processing financial analyses derived from those documents, the risk of error (hallucination) is unacceptable.",
        decision: {
          label: "The decision:",
          text: "We exhaustively automated the ingestion, media re-encoding, and notification infrastructure. But we kept human-in-the-loop and rigorous supervision in the generation and validation of financial analyses.",
        },
        principle: {
          label: "The JOBE principle:",
          text: "Automation ends where reliability is not yet sufficient. Production systems require knowing what to automate and, above all, where human intervention is non-negotiable to protect the product's value.",
        },
      },
      ai: {
        heading: "3. AI in production requires a workflow, not just prompts",
        limitation:
          'Generating deep analyses and podcasts from long audio files and financial PDFs exposes the limitations of AI when it is treated as a "black box". Trying to generate the final content directly from raw sources results in inconsistencies, loss of context, and high computing cost.',
        decision: {
          label: "The architectural decision:",
          text: "We inserted an intermediate artifact. The system first consolidates a structured, segmented analysis. Only from that validated artifact do we generate the final products (podcasts and text summaries). This enables reuse, consistency, and empirical validation.",
        },
        modelChoice:
          "In addition, model selection is treated as a continuous engineering decision, not a fixed bet. In transcription tests, we found that generalist models outperformed models dedicated exclusively to audio. The hypothesis? In domains dense with acronyms, indicators, and financial jargon, broad contextual knowledge resolves ambiguities that the acoustic signal alone cannot capture.",
        principle: {
          label: "The JOBE principle:",
          text: "AI in production is not about using the model of the moment. It is about decomposing workflows, creating validatable intermediate artifacts, swapping models according to the cost/quality relationship, and understanding the business domain to evaluate results.",
        },
      },
      conclusion: {
        heading:
          "Conclusion: The technical foundation does not need to be rewritten, it needs to evolve",
        status:
          "StockCast has not yet reached commercial product-market fit, and its monetization is still in a discovery phase. But from an engineering standpoint, it fulfills its role: proving that problems of scale, observability, integration, and automation are solved with precise diagnosis, not with far-fetched rewrites.",
        next: "When your technical foundation starts to limit your business's growth, the next step does not have to be starting from scratch. You need to identify what is actually holding the product back and evolve the existing base with the least possible risk.",
        commitment:
          "JOBE works on exactly this challenge. We strengthen technical foundations so that growing products gain more reliability, observability, and capacity to evolve, turning bottleneck engineering into an engine for your business's expansion.",
      },
    },
  },
  "pt-BR": {
    seo: {
      title: "Estudo de Caso StockCast | JOBE — Engenharia que Funciona",
      description:
        "Como evoluímos o StockCast, um sistema em produção que processa mídia, IA e dados financeiros 24x7: arquitetura de analytics, pipelines 24x7 e workflows de IA.",
    },
    title: "StockCast",
    subtitle:
      "Evoluindo sistemas reais quando a base técnica começa a limitar o negócio",
    introduction: {
      context:
        "Quando um produto encontra product-market fit e começa a crescer, decisões técnicas do estágio inicial frequentemente se tornam gargalos. Integrações quebram, processos manuais impedem a escala e a observabilidade some.",
      system:
        "O StockCast, sistema em produção desde janeiro de 2026 operado pelo fundador da JOBE, foi o ambiente onde testamos como resolver esses limites na prática. Com ~9.500 instalações, 323 empresas monitoradas e mais de 8.400 documentos indexados, o StockCast não é um MVP em busca de validação. É um sistema real que processa mídia, IA e dados financeiros 24x7.",
      overview:
        "Os desafios enfrentados aqui são os mesmos que limitam empresas em expansão. Abaixo, detalhamos três problemas reais de engenharia e os princípios que aplicamos para superá-los.",
    },
    sections: {
      funnel: {
        heading:
          "1. O funil mentia: quando a métrica certa exige a arquitetura certa",
        context:
          "No início da operação, o volume de instalações crescia de forma consistente. A instrumentação do produto, contudo, revelou um gargalo invisível: pouquíssimos usuários chegavam à ação principal do sistema (reproduzir uma conferência). A aquisição estava otimizada para volume de installs, trazendo usuários sem qualquer alinhamento com a proposta de valor.",
        strategy:
          "Mudamos a estratégia para otimizar campanhas por eventos in-app qualificados. Foi aí que a arquitetura de analytics falhou. Tentávamos manter a pureza arquitetural usando uma única ferramenta (PostHog) para garantir privacidade e controle de dados. Mas, ao integrar esses eventos móveis ao Google Ads, a abstração quebrou: a plataforma de anúncios lia os eventos do app como tráfego web, invalidando a otimização para mobile.",
        decision: {
          label: "A decisão:",
          text: "Abandonamos a pureza de uma ferramenta única e integramos o SDK do Google Analytics diretamente no aplicativo.",
        },
        result: {
          label: "O resultado:",
          text: "Com a aquisição corrigida e a introdução de novas jornadas de notificação, a taxa de ativação (definida como usuários que abrem o app e reproduzem um áudio em janelas equivalentes de 30 dias) saltou de 6% para 26%.",
        },
        principle: {
          label: "O princípio JOBE:",
          text: "Abstrações devem simplificar o sistema. Quando a pureza arquitetural gera mais complexidade operacional que uma integração direta, o pragmatismo deve vencer. Instrumentar o funil real importa mais que métricas de vaidade.",
        },
      },
      pipelines: {
        heading: "2. Pipelines 24x7 e o limite real da automação",
        constraint:
          "Indexar documentos financeiros e conferências de mais de 300 empresas exige monitorar fontes públicas (CVM/B3 e sites de RI) que não oferecem mecanismos de push gratuitos. A alternativa é o polling periódico, o que cria um trade-off crítico de infraestrutura: latência × custo × risco de bloqueio de IP.",
        operation:
          "Construímos um pipeline que opera 24x7, utilizando triggers internos e execução em batch para minimizar requisições desnecessárias. O sistema detecta, registra e dispara notificações de novos documentos em aproximadamente 2,5 minutos, em média, sem intervenção humana no fluxo normal.",
        maintenance:
          "Porém, a automação esbarra na realidade dos dados não estruturados. Identificar URLs em centenas de sites de RI com estruturas HTML distintas ainda exige manutenção. E no processamento de análises financeiras derivadas desses documentos, o risco de erro (alucinação) é inaceitável.",
        decision: {
          label: "A decisão:",
          text: "Automatizamos exaustivamente a infraestrutura de ingestão, recodificação de mídia e notificação. Mas mantivemos human-in-the-loop e supervisão rigorosa na geração e validação de análises financeiras.",
        },
        principle: {
          label: "O princípio JOBE:",
          text: "A automação termina onde a confiabilidade ainda não é suficiente. Sistemas em produção exigem saber o que automatizar e, principalmente, onde a intervenção humana é inegociável para proteger o valor do produto.",
        },
      },
      ai: {
        heading: "3. IA em produção exige workflow, não apenas prompts",
        limitation:
          'Gerar análises profundas e podcasts a partir de áudios longos e PDFs financeiros expõe as limitações da IA quando tratada como "caixa preta". Tentar gerar o conteúdo final diretamente das fontes brutas resulta em inconsistências, perda de contexto e alto custo de computação.',
        decision: {
          label: "A decisão arquitetural:",
          text: "Inserimos um artefato intermediário. O sistema primeiro consolida uma análise estruturada e segmentada. Só a partir desse artefato validado é que geramos os produtos finais (podcasts e resumos textuais). Isso permite reutilização, consistência e validação empírica.",
        },
        modelChoice:
          "Além disso, a escolha dos modelos é tratada como uma decisão de engenharia contínua, não como uma aposta fixa. Nos testes de transcrição, descobrimos que modelos generalistas superaram modelos dedicados exclusivamente a áudio. A hipótese? Em domínios densos em siglas, indicadores e jargões financeiros, o conhecimento contextual amplo resolve ambiguidades que o sinal acústico sozinho não captura.",
        principle: {
          label: "O princípio JOBE:",
          text: "IA em produção não é sobre usar o modelo da moda. É sobre decompor workflows, criar artefatos intermediários validáveis, trocar modelos conforme a relação custo/qualidade e entender o domínio do negócio para avaliar os resultados.",
        },
      },
      conclusion: {
        heading:
          "Conclusão: A base técnica não precisa ser reescrita, precisa evoluir",
        status:
          "O StockCast ainda não atingiu product-market fit comercial e sua monetização segue em fase de descoberta. Mas, do ponto de vista de engenharia, ele cumpre seu papel: provar que problemas de escala, observabilidade, integração e automação se resolvem com diagnóstico preciso, não com reescritas mirabolantes.",
        next: "Quando a sua base técnica começa a limitar o crescimento do seu negócio, a próxima etapa não precisa ser recomeçar do zero. É preciso identificar o que realmente trava o produto e evoluir a base existente com o menor risco possível.",
        commitment:
          "A JOBE atua exatamente neste desafio. Fortalecemos bases técnicas para que produtos em crescimento ganhem mais confiabilidade, observabilidade e capacidade de evolução, transformando a engenharia de gargalo em motor de expansão do seu negócio.",
      },
    },
  },
} satisfies Record<SupportedLocale, CaseTranslation>;
