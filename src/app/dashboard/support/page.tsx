"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Loader2, Send, AlertTriangle } from "lucide-react";
import { aiCustomerSupportChatbot } from "@/ai/flows/ai-customer-support-chatbot";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  isEscalated?: boolean;
}

export default function SupportPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I assist you today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const result = await aiCustomerSupportChatbot({ query: input });
    const aiMessage: Message = {
      id: Date.now() + 1,
      text: result.response,
      sender: 'ai',
      isEscalated: result.escalateToAdmin,
    };
    setMessages(prev => [...prev, aiMessage]);

    setIsLoading(false);
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) return `${names[0][0]}${names[1][0]}`;
    return names[0][0];
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.28))] flex-col">
       <header className="mb-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">Get instant answers to your questions, 24/7.</p>
      </header>
      <div className="flex-grow overflow-hidden rounded-lg border bg-card">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === 'ai' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                )}
                <div className="max-w-xs md:max-w-md">
                    <div className={cn(
                        "rounded-lg px-4 py-2",
                        message.sender === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                        <p className="text-sm">{message.text}</p>
                    </div>
                    {message.isEscalated && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 border border-amber-200 bg-amber-50 p-2 rounded-md">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0"/>
                            <span>This issue has been escalated to a support agent. They will get back to you soon.</span>
                        </div>
                    )}
                </div>
                 {message.sender === 'user' && user && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about orders, products, or returns..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
