import { IInstance } from '@/models/IInstance';
import { IToken } from '@/models/IToken';
import { GetContentExportResults } from '@/services/sitecore/contentExportToolUtil';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface ChatRequest {
  messages: any[];
  instanceData: IInstance;
  tokenData: IToken;
  model: string;
}

export async function POST(req: Request) {
  const { messages, instanceData, tokenData, model = 'gpt-4o-mini' }: ChatRequest = await req.json();

  console.log('Chat request:', { messages, instanceData, tokenData, model });

  const openAiClient = createOpenAI({
    apiKey: tokenData.token,
  });

  const systemPrompt = {
    role: 'system',
    content: `You are a Sitecore Content Operations expert assistant. 
    You have access to the following Sitecore instance: ${instanceData.name} (${instanceData.instanceType}).

    Instructions
    - Always ask to confirm before running any functions
    - Tool is for Marketers, so avoid showing how to do the request programmatically
    
    Format your responses using markdown:
    - Use **bold** for important concepts
    - Use bullet points for lists
    - Keep responses concise and practical
    - Break up long responses with headings
    
    Respond concisely and focus on practical solutions.`,
  };

  const result = streamText({
    model: openAiClient(model),
    messages: [systemPrompt, ...messages],
    tools: {
      get_content: {
        description: 'Get content from a Sitecore instance',
        parameters: z.object({
          startItem: z.string().describe('The item to start exporting from, must be a valid Guid'),
          templates: z.string().describe('The templates to export, must be a valid guid'),
          fields: z.string().describe('The fields to export'),
        }),
        execute: async ({ startItem, templates, fields }) => {
          try {
            if (!instanceData || !instanceData.name) {
              return {
                result: {
                  error: 'Invalid instance configuration',
                },
              };
            }

            const fnResult = await GetContentExportResults(
              instanceData.instanceType,
              instanceData.graphQlEndpoint,
              instanceData.apiToken,
              startItem,
              templates,
              fields
            );

            if (Array.isArray(fnResult) && fnResult.length > 100) {
              return {
                result: {
                  data: fnResult.slice(0, 100),
                  message: 'Results limited to first 100 items',
                  total: fnResult.length,
                },
              };
            }

            return {
              result: fnResult || { error: 'No content found' },
            };
          } catch (error) {
            console.log(error);
            return {
              result: {
                error: error instanceof Error ? error.message : 'An error occurred fetching content',
              },
            };
          }
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
