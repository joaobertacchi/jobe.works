import type { SupportedLocale } from "../config";

export type AboutTranslation = {
  seo: {
    title: string;
    description: string;
  };
  title: string;
  description: string;
  sections: {
    name: { title: string; description: string };
    positioning: { title: string; description: string };
    founder: {
      title: string;
      introduction: string;
      stockcast: { beforeLink: string; afterLink: string };
      vox: { beforeLink: string; afterLink: string };
      experience: string;
      leadership: string;
      background: string;
      consulting: string;
      portraitAlt: string;
      portraitCaption: string;
      linksLabel: string;
      links: {
        stockcast: string;
        caseStudy: string;
        vox: string;
        linkedin: string;
        github: string;
      };
    };
    principles: { title: string; description: string };
    principlesList: {
      diagnostic: string;
      evidence: string;
      production: string;
      recurring: string;
    };
  };
  emailLabel: string;
  emailAddress: string;
  cta: { description: string; action: string };
};

export const aboutTranslations = {
  en: {
    seo: {
      title: "About JOBE | Engineering that Works",
      description:
        "JOBE is a senior engineering consultancy founded by João Bertacchi. It takes AI products to production, rescues fragile systems and mobile apps, and structures teams and architecture to grow safely.",
    },
    title: "About JOBE",
    description:
      "JOBE is a senior engineering consultancy founded by João Bertacchi. It helps companies take AI products from proof of concept to production, recover and modernize systems and mobile apps, and structure teams and architecture to grow safely.",
    sections: {
      name: {
        title: "The name",
        description:
          "JOBE comes from JOão and BErtacchi — with a nod to job, the work itself. The tagline carries the same double meaning: engineering that works, the works of JOBE, jobe.works.",
      },
      positioning: {
        title: "Engineering that Works",
        description:
          "Proofs of concept, technology choices, and code are not enough on their own. What matters is engineering that works in production and delivers for the business — the standard behind every JOBE engagement.",
      },
      founder: {
        title: "The founder",
        introduction:
          "João Bertacchi is a software engineer and the founder of JOBE. He leads the consultancy and works directly on the architecture, code, and operation of production systems.",
        stockcast: {
          beforeLink: "He founded",
          afterLink:
            ", a platform for Brazilian stock market investors with more than 10,000 downloads. He built its mobile application, backend, and AI-powered financial analysis pipeline from scratch, and continues to develop and operate the product himself.",
        },
        vox: {
          beforeLink:
            "StockCast needed to transcribe about 180 hours of earnings calls each quarter. João built and operated an AI transcription pipeline for that workload, used benchmarks to measure transcription quality, and optimized processing costs. That internal infrastructure became",
          afterLink: ", a standalone commercial transcription API.",
        },
        experience:
          "With more than 20 years of software engineering experience, João has led the delivery of critical applications for global brands such as PepsiCo, Gatorade, Pfizer, Nestlé, Equinox, and BNP Paribas.",
        leadership:
          "As Director of Technology at ProFUSION, he scaled the engineering practice from 10 to more than 50 professionals across mobile, frontend, and backend teams, and established architecture standards and best practices adopted company-wide.",
        background:
          "Before that, he spent nearly nine years at Embraer — in R&D for the Defense & Security unit and then as technical lead for Digital Transformation, defining cloud architecture and quality standards for suppliers. He was also co-founder and CTO of an education startup and a professional worker at RWTH Aachen University in Germany. He holds a degree in Computer Engineering from Unicamp.",
        consulting:
          "João brings to JOBE the experience of leading large engineering teams and the hands-on responsibility of building and operating his own products. That combination shapes how he consults. He examines how systems work today, identifies what matters most, and helps teams implement solutions they can operate reliably.",
        portraitAlt: "Portrait of João Bertacchi in a white shirt and glasses",
        portraitCaption: "João Bertacchi · Founder",
        linksLabel: "Founder products and profiles",
        links: {
          stockcast: "StockCast",
          caseStudy: "StockCast case study",
          vox: "JOBE Vox",
          linkedin: "LinkedIn",
          github: "GitHub",
        },
      },
      principles: {
        title: "How JOBE works",
        description: "Four principles behind every engagement:",
      },
      principlesList: {
        diagnostic:
          "Assessment before prescription — JOBE understands your context first, then recommends the path. You don't have to guess which service you need.",
        evidence:
          "Evidence over opinion — recommendations come from your code, architecture, and operations, not from assumptions.",
        production:
          "Production is the finish line — a proof of concept is a start; the work is done when it holds up for real users and for the business.",
        recurring:
          "Long-term partnership — after delivery, JOBE can stay alongside as fractional CTO, through team enablement, or supporting AI security and governance.",
      },
    },
    emailLabel: "Work with JOBE",
    emailAddress: "contact@jobe.works",
    cta: {
      description:
        "Every engagement starts with an Initial Assessment: a structured conversation about your product, what worries you, and where to begin.",
      action: "Book an Initial Assessment",
    },
  },
  "pt-BR": {
    seo: {
      title: "Sobre a JOBE | Engenharia que Funciona",
      description:
        "A JOBE é uma consultoria de engenharia sênior fundada por João Bertacchi. Leva produtos de IA à produção, resgata sistemas frágeis e apps mobile e estrutura times e arquitetura para crescer com segurança.",
    },
    title: "Sobre a JOBE",
    description:
      "A JOBE é uma consultoria de engenharia sênior fundada por João Bertacchi. Ajuda empresas a levar produtos com IA da prova de conceito para a produção, recuperar e modernizar sistemas e apps mobile e estruturar times e arquitetura para crescer com segurança.",
    sections: {
      name: {
        title: "O nome",
        description:
          "JOBE vem de JOão e BErtacchi — com um aceno à palavra job, o trabalho em si. O slogan carrega o mesmo duplo sentido: engenharia que funciona, a obra da JOBE, jobe.works.",
      },
      positioning: {
        title: "Engenharia que Funciona",
        description:
          "Provas de conceito, escolhas de tecnologia e código não bastam sozinhos. O que importa é engenharia que funciona em produção e entrega resultado para o negócio — o padrão por trás de todo trabalho da JOBE.",
      },
      founder: {
        title: "O fundador",
        introduction:
          "João Bertacchi é engenheiro de software e fundador da JOBE. Lidera a consultoria e atua diretamente na arquitetura, no código e na operação de sistemas em produção.",
        stockcast: {
          beforeLink: "Fundou o",
          afterLink:
            ", plataforma para investidores da B3 com mais de 10 mil downloads. Construiu do zero o aplicativo, o backend e o pipeline de análise financeira com IA, e continua desenvolvendo e operando o produto.",
        },
        vox: {
          beforeLink:
            "O StockCast precisava transcrever cerca de 180 horas de teleconferências de resultados por trimestre. João desenvolveu e operou um pipeline de transcrição com IA para esse volume, mediu a qualidade das transcrições com benchmarks e otimizou os custos de processamento. Essa infraestrutura interna deu origem ao",
          afterLink:
            ", uma API comercial de transcrição oferecida como produto independente.",
        },
        experience:
          "Em mais de 20 anos de experiência com engenharia de software, João liderou a entrega de aplicações críticas para marcas globais como PepsiCo, Gatorade, Pfizer, Nestlé, Equinox e BNP Paribas.",
        leadership:
          "Como Diretor de Tecnologia na ProFUSION, ele expandiu a área de engenharia de 10 para mais de 50 profissionais nas equipes de mobile, frontend e backend, além de estabelecer padrões de arquitetura e melhores práticas adotados em toda a empresa.",
        background:
          "Antes disso, passou quase nove anos na Embraer — em P&D da unidade de Defesa e Segurança e depois como líder técnico de Transformação Digital, definindo arquitetura em nuvem e padrões de qualidade para fornecedores. Também foi cofundador e CTO de uma startup de educação e colaborador da RWTH Aachen, na Alemanha. É formado em Engenharia de Computação pela Unicamp.",
        consulting:
          "João traz para a JOBE a experiência de liderar grandes equipes de engenharia e a responsabilidade direta de construir e operar seus próprios produtos. Essa combinação orienta seu trabalho na consultoria. Ele avalia como os sistemas funcionam hoje, identifica as prioridades e ajuda as equipes a implementar soluções que consigam operar com segurança.",
        portraitAlt: "Retrato de João Bertacchi de camisa branca e óculos",
        portraitCaption: "João Bertacchi · Fundador",
        linksLabel: "Produtos e perfis do fundador",
        links: {
          stockcast: "StockCast",
          caseStudy: "Estudo de caso StockCast",
          vox: "JOBE Vox",
          linkedin: "LinkedIn",
          github: "GitHub",
        },
      },
      principles: {
        title: "Como a JOBE trabalha",
        description: "Quatro princípios por trás de todo trabalho:",
      },
      principlesList: {
        diagnostic:
          "Avaliação antes da prescrição — a JOBE entende seu contexto primeiro e depois recomenda o caminho. Você não precisa adivinhar qual serviço contratar.",
        evidence:
          "Evidência acima de opinião — as recomendações vêm do seu código, da sua arquitetura e da sua operação, não de suposições.",
        production:
          "Produção é a linha de chegada — uma prova de conceito é o começo; o trabalho termina quando o produto se sustenta para usuários reais e para o negócio.",
        recurring:
          "Parceria de longo prazo — depois da entrega, a JOBE pode seguir junto como CTO sob demanda, capacitando o time ou apoiando a segurança e a governança de IA.",
      },
    },
    emailLabel: "Trabalhe com a JOBE",
    emailAddress: "contato@jobe.works",
    cta: {
      description:
        "Todo trabalho começa por uma Avaliação Inicial: uma conversa estruturada sobre seu produto, o que preocupa você e por onde começar.",
      action: "Agendar Avaliação Inicial",
    },
  },
} satisfies Record<SupportedLocale, AboutTranslation>;
