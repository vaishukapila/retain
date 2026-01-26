'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Loader2, Send, Lightbulb } from 'lucide-react';
import { aiCustomerSupportChatbot } from '@/ai/flows/ai-customer-support-chatbot';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { FAQ } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export default function SupportPage() {
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Hello! How can I assist you today?', sender: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const faqsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'faqs') : null),
    [firestore]
  );
  const { data: faqs, isLoading: isLoadingFaqs } = useCollection<FAQ>(faqsQuery);

  const handleSendMessage = async (e: React.FormEvent, query?: string) => {
    e.preventDefault();
    const currentQuery = query || input;
    if (!currentQuery.trim() || isLoading || !user) return;

    const userMessage: Message = { id: Date.now(), text: currentQuery, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setErrorOccurred(false);

    try {
      const result = await aiCustomerSupportChatbot({
        query: currentQuery,
        userName: user.displayName || undefined,
        userId: user.uid,
        faqs: faqs || [],
      });

      let responseText: string;

      if (result.error) {
        setErrorOccurred(true);
        responseText = result.message;
        toast({
          variant: 'destructive',
          title: 'AI Assistant Error',
          description: result.message,
        });
      } else {
        responseText = result.answer;
      }
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'ai',
      };
  
      setMessages(prev => [...prev, aiMessage]);

    } catch (e: any) {
      setErrorOccurred(true);
      const fallbackMessage = "An unexpected error occurred. Please check your connection and try again.";
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: fallbackMessage,
      });
      const errorMessage: Message = {
          id: Date.now() + 1,
          text: fallbackMessage,
          sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) return `${names[0][0]}${names[1][0]}`;
    return names[0][0];
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.28))] flex-col">
      <header className="mb-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Get instant answers to your questions, 24/7.
        </p>
      </header>
      <div className="flex-grow overflow-hidden rounded-lg border bg-card">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex items-end gap-2',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'ai' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="max-w-xs md:max-w-md">
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2',
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
                {message.sender === 'user' && user && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
             {errorOccurred && !isLoadingFaqs && faqs && faqs.length > 0 && (
              <Card className="bg-background/50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-yellow-400" />
                        <h3 className="font-semibold">Having trouble? Maybe these can help:</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {faqs.slice(0, 3).map((faq) => (
                        <Button
                        key={faq.id}
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleSendMessage(e, faq.question)}
                        >
                        {faq.question}
                        </Button>
                    ))}
                    </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
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
