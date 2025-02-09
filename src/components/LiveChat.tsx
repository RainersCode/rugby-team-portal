import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_image?: string;
}

export default function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!user) return; // Only fetch messages if user is authenticated

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data, error: supabaseError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (supabaseError) throw supabaseError;
        if (data) {
          setMessages(data);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const messageData = {
        content: newMessage.trim(),
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        user_image: user.user_metadata?.avatar_url,
      };

      // Add message to local state immediately
      const optimisticMessage: ChatMessage = {
        ...messageData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage(''); // Clear input immediately

      const { data, error: sendError } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (sendError) {
        // Remove optimistic message if there was an error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        throw sendError;
      }

      // Update the optimistic message with the real one
      if (data) {
        setMessages(prev => 
          prev.map(msg => msg.id === optimisticMessage.id ? data : msg)
        );
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  if (isAuthChecking) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-rugby-teal" />
        <span className="ml-2">Checking authentication...</span>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="h-full p-4 flex items-center justify-center">
        <Button onClick={handleSignIn} variant="primary">
          Sign in to participate in chat
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-rugby-teal" />
        <span className="ml-2">Loading chat...</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full p-4 flex items-center justify-center">
        <p className="text-rugby-red">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Live Chat</h3>
        <p className="text-sm text-muted-foreground">
          Logged in as {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </p>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={message.user_image} />
                <AvatarFallback>{message.user_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{message.user_name}</p>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.created_at), 'HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={isSending}
        />
        <Button type="submit" disabled={isSending}>
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Sending
            </>
          ) : (
            'Send'
          )}
        </Button>
      </form>
    </Card>
  );
} 