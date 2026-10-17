import {
  maxToolRounds,
  roundLimitReply,
  runToolLoop,
  toFunctionTools,
  type ModelMessage,
  type ModelReply,
  type ToolCall,
} from './ai-chat-loop.js';
import { logtoMcpTools } from './mcp-logto-tools.js';

/**
 * Covers src/routes/ai-chat-loop.ts. The model is a scripted fake, so the loop is tested without
 * the OpenAI API or a Management API.
 */
const { jest } = import.meta;

const user: ModelMessage = { role: 'user', content: 'Create an org called Acme' };

const toolCall = (id: string, name: string, args: unknown): ToolCall => ({
  id,
  type: 'function',
  function: { name, arguments: JSON.stringify(args) },
});

const forever = (): ModelReply => ({
  content: undefined,
  toolCalls: [toolCall('c', 'list_roles', {})],
});

/** Answers the nth model call with the nth scripted reply; nothing is returned past the script. */
const scripted = (replies: ModelReply[]) => {
  const callModel: jest.Mock<Promise<ModelReply | undefined>, [ModelMessage[]]> = jest.fn(
    async (_conversation: ModelMessage[]) => replies[callModel.mock.calls.length - 1]
  );

  return { callModel };
};

describe('runToolLoop', () => {
  it('returns the answer directly when the model calls no tool', async () => {
    const { callModel } = scripted([{ content: 'Hello', toolCalls: [] }]);
    const executeTool = jest.fn(async (_call: ToolCall) => 'unused');

    const result = await runToolLoop({ messages: [user], callModel, executeTool });

    expect(result).toEqual({ content: 'Hello', ok: true });
    expect(executeTool).not.toHaveBeenCalled();
  });

  it('feeds a tool result back to the model before the final answer', async () => {
    const { callModel } = scripted([
      { content: undefined, toolCalls: [toolCall('c1', 'list_applications', {})] },
      { content: 'There is one app.', toolCalls: [] },
    ]);
    const executeTool = jest.fn(async (_call: ToolCall) => '[{"id":"app-1"}]');

    const result = await runToolLoop({ messages: [user], callModel, executeTool });

    expect(result).toEqual({ content: 'There is one app.', ok: true });
    expect(callModel.mock.calls[1]?.[0]).toContainEqual({
      role: 'tool',
      tool_call_id: 'c1',
      content: '[{"id":"app-1"}]',
    });
  });

  it('runs every tool call from one reply, in order', async () => {
    const { callModel } = scripted([
      {
        content: undefined,
        toolCalls: [toolCall('c1', 'list_roles', {}), toolCall('c2', 'list_users', {})],
      },
      { content: 'Done', toolCalls: [] },
    ]);
    const executeTool = jest.fn(async (_call: ToolCall) => '{}');

    await runToolLoop({ messages: [user], callModel, executeTool });

    expect(executeTool.mock.calls.map(([call]) => call.id)).toEqual(['c1', 'c2']);
  });

  it('stops at the round limit instead of looping forever', async () => {
    const callModel = jest.fn(async (_conversation: ModelMessage[]) => forever());
    const executeTool = jest.fn(async (_call: ToolCall) => '{}');

    const result = await runToolLoop({ messages: [user], callModel, executeTool });

    expect(result).toEqual({ content: roundLimitReply, ok: true });
    expect(callModel).toHaveBeenCalledTimes(maxToolRounds);
  });

  it('reports a failed model call as not ok', async () => {
    const { callModel } = scripted([]);
    const executeTool = jest.fn(async (_call: ToolCall) => '{}');

    const result = await runToolLoop({ messages: [user], callModel, executeTool });

    expect(result).toEqual({ content: '', ok: false });
  });
});

describe('toFunctionTools', () => {
  it('offers every tool with its parameters', () => {
    const offered = toFunctionTools(logtoMcpTools);
    const create = offered.find(
      ({ function: definition }) => definition.name === 'create_application'
    );

    expect(offered).toHaveLength(logtoMcpTools.length);
    expect(create?.function.parameters).toMatchObject({
      type: 'object',
      required: ['name', 'type'],
    });
  });
});
