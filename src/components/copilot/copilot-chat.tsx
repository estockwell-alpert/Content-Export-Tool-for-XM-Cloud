'use client';

import { cn } from '@/lib/utils';
import { enumModels } from '@/models/enumModels';
import { IInstance } from '@/models/IInstance';
import { IToken } from '@/models/IToken';
import { useChat } from '@ai-sdk/react';
import { ArrowUpRight, Brain, Loader2, RefreshCw, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface CopilotChatProps {
  instances: IInstance[];
  token: IToken;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ instances, token }) => {
  const [selectedInstance, setSelectedInstance] = useState<IInstance | undefined>(instances[0]);
  const [selectedModel, setSelectedModel] = useState<enumModels | undefined>(enumModels.gpt4omini);
  const { messages, setMessages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      instanceData: selectedInstance,
      tokenData: token,
      model: selectedModel,
    },
  });

  console.log('messages', messages);

  // Reference to the messages div for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            'Welcome! I am your Content Specialist. How can I help you with your Sitecore content operations today?',
        },
      ]);
    }
  }, []);

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'Welcome! I am your Content Specialist. How can I help you with your Sitecore content operations today?',
      },
    ]);
  };

  // Preset message options
  const presetMessages = [
    { label: 'Get Content', value: 'How do I export content?' },
    { label: 'Generate a CSV', value: 'Now that I have my data can you convert it to CSV format?' },
    {
      label: 'Profile the Content',
      value: 'Take my existing data and create a content profile for each piece of content?',
    },
  ];

  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col shadow-md">
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Content Copilot</CardTitle>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedInstance?.id}
              onValueChange={(id) => setSelectedInstance(instances.find((i) => i.id === id))}
            >
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Select instance" />
              </SelectTrigger>
              <SelectContent>
                {instances.map((instance) => (
                  <SelectItem key={instance.id} value={instance.id}>
                    {instance.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedModel} onValueChange={(value: enumModels) => setSelectedModel(value)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={enumModels.gpt4omini}>GPT-4 Mini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full w-full pr-1">
            <div className="flex flex-col gap-4 p-4">
              {messages.map((m) => (
                <div key={m.id} className="flex gap-4 min-w-0 animate-fadeIn">
                  {m.role === 'assistant' && (
                    <div className="mt-2 shrink-0">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'flex-1 px-4 py-3 rounded-lg break-words',
                      m.role === 'assistant' ? 'bg-muted' : 'bg-primary/10'
                    )}
                  >
                    {m.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, ...props }) {
                            const match = /language-(\w+)/.exec(props.className || '');
                            return !(props as any).inline ? (
                              <div className="relative">
                                <pre className="my-4 p-4 bg-muted-foreground/10 rounded-lg overflow-x-auto">
                                  <code
                                    className={cn('font-mono text-sm', match?.[1] && `language-${match[1]}`)}
                                    {...props}
                                  >
                                    {String(props.children).replace(/\n$/, '')}
                                  </code>
                                </pre>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="absolute right-2 top-2 h-7 opacity-70 hover:opacity-100"
                                  onClick={() => navigator.clipboard.writeText(String(props.children))}
                                >
                                  Copy
                                </Button>
                              </div>
                            ) : (
                              <code
                                className="bg-muted-foreground/20 px-1.5 py-0.5 rounded-md font-mono text-sm"
                                {...props}
                              >
                                {props.children}
                              </code>
                            );
                          },
                          ul({ children }) {
                            return <ul className="list-disc pl-6 my-3">{children}</ul>;
                          },
                          ol({ children }) {
                            return <ol className="list-decimal pl-6 my-3">{children}</ol>;
                          },
                          li({ children }) {
                            return <li className="mb-1">{children}</li>;
                          },
                          p({ children }) {
                            return <p className="mb-3 last:mb-0">{children}</p>;
                          },
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 min-w-0">
                  <div className="mt-2 shrink-0">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 px-4 py-4 rounded-lg break-words bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Generating response...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="border-t border-border mt-auto">
          <form onSubmit={handleSubmit} className="p-4 space-y-3 bg-background">
            <div className="flex flex-wrap gap-2">
              {presetMessages.map((preset, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => handleInputChange({ target: { value: preset.value } } as any)}
                >
                  {preset.label}
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              ))}
            </div>

            {/* Textarea and send button */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                onKeyDown={handleKeyDown}
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about content operations..."
                className="pr-12 min-h-[80px] max-h-[200px] resize-none"
                disabled={isLoading || !selectedInstance}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="sm"
                      className="absolute right-2 bottom-2 h-8 w-8 p-0"
                      disabled={isLoading || !selectedInstance || !input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Footer with action buttons */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" onClick={handleClearChat}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Clear chat
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Start a new conversation</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-xs text-muted-foreground">Press Enter to send, Shift+Enter for new line</div>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
