"use client";

import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { enUS, lv } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_image?: string;
}

const getAvatarColor = (userId: string) => {
  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
    'bg-orange-100 text-orange-600',
    'bg-cyan-100 text-cyan-600',
    'bg-rose-100 text-rose-600',
    'bg-violet-100 text-violet-600',
  ];
  
  // Use the user ID to consistently pick a color
  const colorIndex = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[colorIndex];
};

export default function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, refreshAuth } = useAuth();
  const supabase = createClientComponentClient();
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const { language, translations } = useLanguage();
  const locales = { en: enUS, lv };
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      if (data) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up real-time listener
    const channel = supabase
      .channel("live_chat_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const messageData = {
        content: newMessage.trim(),
        user_id: user.id,
        user_name: user.email?.split('@')[0] || 'Anonymous',
      };

      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert([messageData]);

      if (insertError) throw insertError;
      
      setNewMessage("");
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/signin?redirect=/live');
  };

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-rugby-teal" />
        <span className="ml-2">Loading chat...</span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <div className="p-4 text-center">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={fetchMessages}
            className="mt-2 bg-rugby-teal hover:bg-rugby-teal/90 text-white"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-6 text-center bg-white">
        <h3 className="text-xl font-bold mb-2">Join the Conversation</h3>
        <p className="text-gray-600 mb-4">
          Sign in to participate in the live chat with other fans during matches.
        </p>
        <Button
          onClick={handleSignIn}
          className="bg-rugby-teal hover:bg-rugby-teal/90 text-white flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-white">
      <div className="p-3 bg-rugby-teal/5 border-b border-gray-100">
        <h3 className="font-semibold text-rugby-teal">Live Chat</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={messagesRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.user_id === user.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-md ${
                  message.user_id === user.id
                    ? 'bg-rugby-teal text-white'
                    : 'bg-white border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor:
                        message.user_id === user.id
                          ? 'rgba(255, 255, 255, 0.2)'
                          : getAvatarColor(message.user_id),
                      color:
                        message.user_id === user.id ? 'white' : 'white',
                    }}
                  >
                    {message.user_name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-xs font-medium ${
                    message.user_id === user.id ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {message.user_name}
                  </span>
                  <span className={`text-xs ${
                    message.user_id === user.id ? 'text-white/60' : 'text-gray-400'
                  }`}>
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: locales[language as keyof typeof locales]
                    })}
                  </span>
                </div>
                <p className={message.user_id === user.id ? 'text-white' : 'text-gray-800'}>
                  {message.content}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div ref={chatEndRef} />
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white border border-rugby-teal/20 focus:border-rugby-teal focus:ring-rugby-teal"
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-rugby-teal hover:bg-rugby-teal/90 text-white px-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </Card>
  );
} 