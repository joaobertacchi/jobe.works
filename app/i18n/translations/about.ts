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
      leadership: string;
      background: string;
      today: string;
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
};

export const aboutTranslations = {
  en: {
    seo: {
      title: "About JOBE | Engineering that Works",
      description:
        "JOBE is a senior engineering consultancy founded by João Bertacchi. It takes AI products to production, rescues mobile apps, and structures teams and architecture to grow safely.",
    },
    title: "About JOBE",
    description:
      "JOBE is a senior engineering consultancy founded by João Bertacchi. It helps companies take AI products from proof of concept to production, recover and modernize mobile apps, and structure teams and architecture to grow safely.",
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
          "João Bertacchi is a software engineer with more than 20 years of experience turning ideas into products that work in production, for real users and for the business. Over his career, he has led the delivery of critical applications for global brands such as PepsiCo, Gatorade, Pfizer, Nestlé, Equinox, and BNP Paribas.",
        leadership:
          "As Director of Technology at ProFUSION, he led more than 50 engineers across mobile, frontend, and backend teams, scaled the mobile engineering practice from 10 to more than 50 professionals, and defined architecture standards and best practices adopted company-wide.",
        background:
          "Before that, he spent nearly nine years at Embraer — in R&D for the Defense & Security unit and then as technical lead for Digital Transformation, defining cloud architecture and quality standards for suppliers. He was also co-founder and CTO of an education startup and a researcher at RWTH Aachen University in Germany. He holds a degree in Computer Engineering from Unicamp and a master's in Computer Science.",
        today:
          "Today, he combines leadership with hands-on engineering. He founded StockCast, a platform for Brazilian stock market investors with more than 9,000 downloads, building the mobile app, the backend, and an AI financial-analysis pipeline (Claude and Gemini) from scratch — and applying spec-driven development with AI agents every day.",
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
    emailAddress: "contato@jobe.works",
  },
  "pt-BR": {
    seo: {
      title: "Sobre a JOBE | Engenharia que Funciona",
      description:
        "A JOBE é uma consultoria de engenharia sênior fundada por João Bertacchi. Leva produtos de IA à produção, resgata apps mobile e estrutura times e arquitetura para crescer com segurança.",
    },
    title: "Sobre a JOBE",
    description:
      "A JOBE é uma consultoria de engenharia sênior fundada por João Bertacchi. Ajuda empresas a levar produtos com IA da prova de conceito para a produção, recuperar e modernizar apps mobile e estruturar times e arquitetura para crescer com segurança.",
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
          "João Bertacchi é engenheiro de software com mais de 20 anos de experiência transformando ideias em produtos que funcionam em produção, para usuários reais e para o negócio. Ao longo da carreira, liderou a entrega de aplicações críticas para marcas globais como PepsiCo, Gatorade, Pfizer, Nestlé, Equinox e BNP Paribas.",
        leadership:
          "Como Diretor de Tecnologia na ProFUSION, liderou mais de 50 engenheiros em times de mobile, frontend e backend, escalou a prática de engenharia mobile de 10 para mais de 50 profissionais e definiu padrões de arquitetura e boas práticas adotados em toda a empresa.",
        background:
          "Antes disso, passou quase nove anos na Embraer — em P&D da unidade de Defesa e Segurança e depois como líder técnico de Transformação Digital, definindo arquitetura em nuvem e padrões de qualidade para fornecedores. Também foi cofundador e CTO de uma startup de educação e pesquisador na RWTH Aachen, na Alemanha. É formado em Engenharia de Computação pela Unicamp, com mestrado em Ciência da Computação.",
        today:
          "Hoje, une a visão de liderança à prática direta de engenharia. É fundador do StockCast, plataforma para investidores da B3 com mais de 9 mil downloads, onde construiu do zero o app mobile, o backend e um pipeline de análise financeira com IA (Claude e Gemini) — e aplica, no dia a dia, o desenvolvimento orientado por especificações com agentes de IA.",
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
  },
} satisfies Record<SupportedLocale, AboutTranslation>;
