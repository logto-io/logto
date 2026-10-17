import { type LogtoMcpTool } from './mcp-logto-tools.js';

// The tool-calling loop for Ask AI. The model may call read tools directly and propose writes; a
// proposed write only becomes a pending action, and the loop reports it back to the model as not
// yet created. Tool output is data, so the loop never treats it as an instruction.

export type ToolCall = {
  id: string;
  type?: string;
  function: { name: string; arguments: string };
};

export type ModelMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

export type ModelReply = { content?: string; toolCalls: ToolCall[] };

export const maxToolRounds = 5;
export const maxProposalsPerRequest = 3;
export const maxToolOutputLength = 8000;

/** The OpenAI function-calling definitions for the tools this caller is allowed to use. */
export const toFunctionTools = (tools: readonly LogtoMcpTool[]) =>
  tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties: tool.properties,
        ...(tool.required ? { required: tool.required } : {}),
      },
    },
  }));

export const roundLimitReply =
  'I could not finish that in one step. Try a narrower request, one change at a time.';

/**
 * Calls the model until it answers without a tool call, or the round limit is reached. Each tool
 * call is run in order and its output is fed back as a tool message.
 */
export const runToolLoop = async ({
  messages,
  callModel,
  executeTool,
  maxRounds = maxToolRounds,
}: {
  messages: ModelMessage[];
  callModel: (conversation: ModelMessage[]) => Promise<ModelReply | undefined>;
  executeTool: (call: ToolCall) => Promise<string>;
  maxRounds?: number;
}): Promise<{ content: string; ok: boolean }> => {
  const step = async (
    conversation: ModelMessage[],
    round: number
  ): Promise<{ content: string; ok: boolean }> => {
    if (round >= maxRounds) {
      return { content: roundLimitReply, ok: true };
    }

    const reply = await callModel(conversation);

    if (!reply) {
      return { content: '', ok: false };
    }

    if (reply.toolCalls.length === 0) {
      return { content: reply.content ?? '', ok: true };
    }

    // Tool calls run in order, so a later call sees the effects of an earlier one.
    const toolMessages = await reply.toolCalls.reduce<Promise<ModelMessage[]>>(
      async (previous, call) => {
        const done = await previous;
        const output = await executeTool(call);

        return [...done, { role: 'tool', tool_call_id: call.id, content: output }];
      },
      Promise.resolve([])
    );

    return step(
      [
        ...conversation,
        { role: 'assistant', content: reply.content, tool_calls: reply.toolCalls },
        ...toolMessages,
      ],
      round + 1
    );
  };

  return step(messages, 0);
};
