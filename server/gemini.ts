import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface GenerateAdPromptInput {
  empresa: string;
  produto?: string;
  servico?: string;
  publico: string;
  diferencial: string;
  site: string;
}

export interface GeneratedAdContent {
  headlines: string[];
  descriptions: string[];
  callToActions: string[];
  keywords: Array<{
    text: string;
    matchType: 'BROAD' | 'PHRASE' | 'EXACT';
  }>;
  negativeKeywords: string[];
}

export async function generateAdWithAi(input: GenerateAdPromptInput): Promise<GeneratedAdContent> {
  const ai = getAiClient();

  const systemInstruction = `
Você é o motor de Inteligência Artificial do DivulgadorAds, especialista certificado em campanhas de alta performance na Rede de Pesquisa do Google Ads (Responsive Search Ads).
Sua missão é gerar textos persuasivos, palavras-chave qualificadas e palavras-chave negativas.

REGRAS RÍGIDAS DE COMPLIANCE E POLÍTICA DE PUBLICIDADE DO GOOGLE ADS:
1. Limites de Caracteres:
   - Cada título (headline) DEVE ter no MÁXIMO 30 caracteres (incluindo espaços e pontuações).
   - Cada descrição DEVE ter no MÁXIMO 90 caracteres (incluindo espaços e pontuações).
2. Proibições Absolutas:
   - NUNCA use promessas enganosas ou exageradas.
   - NUNCA afirme ou sugira: "primeiro lugar garantido", "vendas garantidas", "clientes garantidos", "Google aprovou", "100% garantido".
   - NUNCA use pontuações excessivas (ex: "!!!", "???", "compre AGORA!!!").
   - NUNCA use palavras em CAIXA ALTA completa a menos que seja sigla comercial (ex: CRM, ERP, WhatsApp).
3. Qualidade:
   - Gere entre 8 e 12 títulos altamente atraentes e variados (destacando benefícios, diferenciais, localização e chamada).
   - Gere 4 descrições claras, éticas e envolventes.
   - Gere 10 a 15 palavras-chave estratégicas balanceadas entre ampla, de frase e exata.
   - Gere 6 a 10 palavras-chave negativas para evitar cliques inúteis (como grátis, pirata, pdf, reclamação, etc.).
`.trim();

  const userPrompt = `
Gere o material completo de Responsive Search Ads para a seguinte empresa:
- Nome da Empresa: ${input.empresa}
- Produto: ${input.produto || 'Não informado'}
- Serviço: ${input.servico || 'Não informado'}
- Público-Alvo: ${input.publico}
- Diferencial Competitivo: ${input.diferencial}
- Website: ${input.site}

Retorne estritamente o JSON conforme o schema exigido.
`.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headlines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Títulos com no máximo 30 caracteres cada',
            },
            descriptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Descrições com no máximo 90 caracteres cada',
            },
            callToActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Chamadas para ação adequadas ao negócio',
            },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  matchType: {
                    type: Type.STRING,
                    enum: ['BROAD', 'PHRASE', 'EXACT'],
                  },
                },
                required: ['text', 'matchType'],
              },
              description: 'Palavras-chave recomendadas',
            },
            negativeKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Palavras-chave negativas recomendadas',
            },
          },
          required: ['headlines', 'descriptions', 'callToActions', 'keywords', 'negativeKeywords'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Não foi possível obter resposta do Gemini.');
    }

    const parsed: GeneratedAdContent = JSON.parse(text);

    // Filter and sanitize lengths as strict protection
    parsed.headlines = parsed.headlines.map(h => h.trim().substring(0, 30)).filter(Boolean);
    parsed.descriptions = parsed.descriptions.map(d => d.trim().substring(0, 90)).filter(Boolean);

    return parsed;
  } catch (error: any) {
    console.error('Error generating ads with Gemini:', error);
    throw new Error(error.message || 'Erro ao gerar anúncios com inteligência artificial.');
  }
}
