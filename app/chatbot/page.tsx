'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

import { useRouter } from 'next/navigation';
import 'katex/dist/katex.min.css';

import { 
  createChat, 
  saveMessage, 
  getUserChats, 
  getChat,
  deleteChat,
  isAuthenticated,
  getCurrentUser,
  logout,
  updateChatTitle
} from '@/lib/pocketbase-client';

import ChatInterface from '@/components/ChatInterface';

// Types
interface ChatMessage {
  id?: number;
  role: 'user' | 'bot';
  content: string;
  timestamp: string | Date;
}

interface Chat {
  id: string;
  collectionId?: string;
  collectionName?: string;
  title: string;
  user: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  updated: string;
  expand?: {
    user?: {
      id: string;
      email: string;
      name: string;
    };
  };
}

interface User {
  id: string;
  email: string;
  name: string;
}

// Web Speech API declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    bengaliTTSAudios?: HTMLAudioElement[];
  }
}

// Format date utility function


// ChatMessageComponent

// Main component
export default function Chatbot() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [showChatsList, setShowChatsList] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<number | null>(null);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated =await isAuthenticated();
      setIsLoggedIn( authenticated);
      
      if (authenticated) {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser({
            id: user.id,
            email: user.email,
            name: user.name,
          });
        } else {
          console.error("User is null");
        }
        await loadUserChats();
      } else {
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Filter chats based on search query
  
 
  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Load user chats
  const loadUserChats = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUserChats();
      
      if (!result) {
        throw new Error('কোন ডাটা পাওয়া যায়নি');
      }
      
      const formattedChats: Chat[] = result.map((item:Chat) => ({
        id: item.id,
        collectionId: item.collectionId,
        collectionName: item.collectionName,
        title: item.title || 'নতুন আলোচনা',
        user: item.user,
        messages: item.messages || [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        expand: item.expand,
        updated: item.updated,
      }));
      
      formattedChats.sort((a, b) => 
        new Date(b.updated).getTime() - new Date(a.updated).getTime()
      );
      
      setChats(formattedChats);
      // setFilteredChats(formattedChats);
      setError(null);
    } catch (err) {
      console.error('Error loading chats:', err);
      setError('চ্যাট লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load a specific chat
  const loadChat = async (chatId: string) => {
    setLoading(true);
    try {
      const chat = await getChat(chatId);
      setCurrentChatId(chatId);
      setChatHistory(chat.messages || []);
      
      if (chat.messages?.length > 0 && (chat.title === 'নতুন আলোচনা' || chat.title.startsWith('নতুন বিজ্ঞান আলোচনা'))) {
        const firstMessage = chat.messages[0].content;
        const newTitle = firstMessage.length > 50 
          ? firstMessage.substring(0, 50) + '...'
          : firstMessage;
        
        await updateChatTitle(chatId, newTitle);
        await loadUserChats();
      }
      
      setShowChatsList(false);
      setError(null);
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('চ্যাট লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new chat
  const startNewChat = async () => {
    if (!isLoggedIn) {
      setError('আপনাকে আগে লগইন করতে হবে।');
      return;
    }
    
    setLoading(true);
    try {
      const timestamp = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const defaultTitle = `নতুন বিজ্ঞান আলোচনা (${timestamp})`;
      const chat = await createChat(defaultTitle);
      
      if (!chat || !chat.id) {
        throw new Error('চ্যাট তৈরি করা যায়নি।');
      }
      
      setCurrentChatId(chat.id);
      setChatHistory([]);
      await loadUserChats();
      setShowChatsList(false);
      setError(null);
      
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error('Error creating chat:', err);
      setError( 'নতুন চ্যাট তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a chat with confirmation
  const handleDeleteChat = async (chatId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (showDeleteConfirmation !== chatId) {
      setShowDeleteConfirmation(chatId);
      return;
    }
    
    setShowDeleteConfirmation(null);
    
    setLoading(true);
    try {
      await deleteChat(chatId);
      await loadUserChats();
      
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setChatHistory([]);
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('চ্যাট মুছতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel delete confirmation
  // const cancelDeleteConfirmation = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setShowDeleteConfirmation(null);
  // };
  
  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'bn-BD';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = function (event) {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setQuestion(function (prev) {
          return prev + ' ' + transcript;
        });
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (listening) {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [listening]);
  
  // Handle speech recognition toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('আপনার ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়।');
      return;
    }
    
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
      setError(null);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    stopSpeaking();
    logout();
    setIsLoggedIn(false);
    setCurrentChatId(null);
    setChatHistory([]);
    setChats([]);
    setCurrentUser(null);
    router.push('/login');
  };
  
  // Check if text contains Bangla
  const containsBangla = (text: string) => {
    const banglaRegex = /[\u0980-\u09FF]/;
    return banglaRegex.test(text);
  };

  // Setup global audio array for tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.bengaliTTSAudios = window.bengaliTTSAudios || [];
    }
    
    return () => {
      stopSpeaking();
    };
  }, []);

  // Handle text-to-speech
  const speak = async (text: string, messageId?: number) => {
    try {
      stopSpeaking();
      
      setIsSpeaking(true);
      if (messageId !== undefined) {
        setCurrentSpeakingId(messageId);
      }
      
      if (!window.bengaliTTSAudios) {
        window.bengaliTTSAudios = [];
      }
      
      const maxLength = 3000;
      const chunks: string[] = [];
      
      for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.substring(i, i + maxLength));
      }
      
      const processChunk = async (index = 0) => {
        if (index >= chunks.length) {
          setIsSpeaking(false);
          setCurrentSpeakingId(null);
          return;
        }
        
        try {
          const chunk = chunks[index];
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: chunk }),
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const audioBlob = await response.blob();
          const audio = new Audio(URL.createObjectURL(audioBlob));
          (window.bengaliTTSAudios ??= []).push(audio);
          
          audio.onended = () => processChunk(index + 1);
          audio.onerror = (e) => {
            console.error(`Audio playback error for chunk ${index}:`, e);
            processChunk(index + 1);
          };
          
          await audio.play();
        } catch (error) {
          console.error(`Error processing chunk ${index}:`, error);
          processChunk(index + 1);
        }
      };
      
      await processChunk();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      alert('Failed to convert text to speech. Please try again.');
    }
  };

  // Stop all speaking
  const stopSpeaking = () => {
    if (typeof window !== 'undefined') {
      if (!window.bengaliTTSAudios) {
        window.bengaliTTSAudios = [];
      }
      
      window.bengaliTTSAudios.forEach(audio => {
        try {
          audio.pause();
          audio.src = '';
        } catch (e) {
          console.error('Error stopping audio:', e);
        }
      });
      
      window.bengaliTTSAudios = [];
    }
    
    setIsSpeaking(false);
    setCurrentSpeakingId(null);
  };

  // Handle speaking message
  const handleSpeakMessage = async (text: string, messageId: number) => {
    if (isSpeaking && currentSpeakingId === messageId) {
      stopSpeaking();
    } else {
      await speak(text, messageId);
    }
  };

  // Submit question to API
  const handleSubmit = async () => {
    if (!question.trim()) return;
    if (!isLoggedIn) {
      setError('আপনাকে আগে লগইন করতে হবে।');
      return;
    }
    
    if (!currentChatId) {
      try {
        const timestamp = new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const title = question.length > 30 
          ? question.substring(0, 30) + '... (' + timestamp + ')'
          : question + ' (' + timestamp + ')';
        
        const chat = await createChat(title);
        setCurrentChatId(chat.id);
        await loadUserChats();
      } catch (err) {
        console.error('Error creating chat:', err);
        setError('নতুন চ্যাট তৈরি করতে সমস্যা হয়েছে।');
        return;
      }
    }
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      await saveMessage(currentChatId!, question, 'user');
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'কিছু সমস্যা হয়েছে।');
      }
      
      const data = await res.json();
      
      const botMessage: ChatMessage = {
        role: 'bot',
        content: data.answer,
        timestamp: new Date(),
      };
      
      setChatHistory(prev => [...prev, botMessage]);
      await saveMessage(currentChatId!, data.answer, 'bot');
      await loadUserChats();
      
      if (containsBangla(data.answer)) {
        speak(data.answer);
      }
      
    } catch (err) {
      console.error('Error submitting question:', err);
      setError( 'কিছু সমস্যা হয়েছে।');
    } finally {
      setQuestion('');
      setLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Clear current chat history
  const clearChat = () => {
    setChatHistory([]);
    stopSpeaking();
    setCurrentChatId(null);
  };

  // Render chat list sidebar

  return (
    <ChatInterface
      // Pass all your existing methods and state
      chatHistory={chatHistory}
      setChatHistory={setChatHistory}
      question={question}
      setQuestion={setQuestion}
      loading={loading}
      error={error}
      chats={chats}
      currentChatId={currentChatId}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      listening={listening}
      isSpeaking={isSpeaking}
      currentSpeakingId={currentSpeakingId}
      handleSubmit={handleSubmit}
      handleKeyPress={handleKeyPress}
      clearChat={clearChat}
      startNewChat={startNewChat}
      loadChat={loadChat}
      handleDeleteChat={handleDeleteChat}
      toggleListening={toggleListening}
      handleSpeakMessage={handleSpeakMessage}
      currentUser={currentUser}
      handleLogout={handleLogout}
      showChatsList={showChatsList}
      setShowChatsList={setShowChatsList}
    />
  );
}