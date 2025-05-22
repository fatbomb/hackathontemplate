"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaMicrophone, 
  FaStop, 
  FaPaperPlane, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaSignOutAlt, 
  FaSearch,
  FaTrash 
} from 'react-icons/fa';
import { IoReload, IoChevronBack } from 'react-icons/io5';
import { HiOutlineChatAlt } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { 
  createChat, 
  saveMessage, 
  getUserChats, 
  getChat,
  deleteChat,
  isAuthenticated,
  getCurrentUser,
  logoutUser,
  updateChatTitle
} from '@/lib/pocketbase';

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
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    bengaliTTSAudios?: HTMLAudioElement[];
  }
}

// Format date utility function
const formatUpdatedAt = (dateInput: string | Date): string => {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    if (isNaN(date.getTime())) {
      console.warn("Invalid date received:", dateInput);
      return "N/A";
    }
    
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toISOString().split('T')[1].split('.')[0] + " UTC";
    
    return `${dateStr}\n${timeStr}`;
  } catch (error) {
    console.error("Error formatting date:", error, dateInput);
    return "N/A";
  }
};

// ChatMessageComponent
const ChatMessageComponent = ({ 
  message, 
  handleSpeakMessage, 
  isSpeaking,
  currentSpeakingId
}: { 
  message: ChatMessage, 
  handleSpeakMessage: (content: string, messageId: number) => void,
  isSpeaking: boolean,
  currentSpeakingId: number | null
}) => {
  const isThisMessageSpeaking = isSpeaking && currentSpeakingId === message.id;
  const isLongMessage = message.content.length > 500;
  const [expanded, setExpanded] = useState(!isLongMessage);
  
  const components = {
    code({node, inline, className, children, ...props}: any) {
      const match = /language-(\w+)/.exec(className || '');
      
      if (inline) {
        return (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
            {children}
          </code>
        );
      }
      
      return (
        <div className="rounded-lg overflow-hidden my-2">
          <SyntaxHighlighter
            style={oneDark}
            language={match?.[1] || 'text'}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    },
    h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold my-2" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-xl font-bold my-2" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-lg font-bold my-1.5" {...props} />,
    p: ({node, ...props}: any) => <p className="my-2 leading-relaxed" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 my-2" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 my-2" {...props} />,
    li: ({node, ...props}: any) => <li className="my-1" {...props} />,
    blockquote: ({node, ...props}: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
    ),
    a: ({node, ...props}: any) => (
      <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    table: ({node, ...props}: any) => (
      <div className="overflow-x-auto">
        <table className="border-collapse border border-gray-300 my-2" {...props} />
      </div>
    ),
    th: ({node, ...props}: any) => (
      <th className="border border-gray-300 px-3 py-1 bg-gray-100" {...props} />
    ),
    td: ({node, ...props}: any) => (
      <td className="border border-gray-300 px-3 py-1" {...props} />
    ),
  };
  
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] p-3 rounded-lg shadow ${
        message.role === 'user' 
          ? 'bg-green-600 text-white rounded-tr-none' 
          : 'bg-white text-gray-800 rounded-tl-none'
      }`}>
        <div className="whitespace-pre-wrap leading-relaxed text-base font-medium">
          {expanded ? (
            <ReactMarkdown
              components={components}
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <>
              <ReactMarkdown
                components={components}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {message.content.substring(0, 300) + (message.content.length > 300 ? '...' : '')}
              </ReactMarkdown>
              {isLongMessage && (
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className={`block text-sm mt-2 ${message.role === 'user' ? 'text-white underline' : 'text-green-600 underline'}`}
                >
                  {expanded ? 'সংক্ষিপ্ত দেখুন' : 'সম্পূর্ণ দেখুন'}
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className={`text-xs opacity-70 ${
            message.role === 'user' ? 'text-white' : 'text-gray-500'
          }`}>
            {formatUpdatedAt(message.timestamp)}
          </p>
          
          {message.role === 'bot' && (
            <button
              onClick={() => handleSpeakMessage(message.content, message.id || 0)}
              className={`ml-2 p-1 rounded ${
                isThisMessageSpeaking ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-blue-500'
              } hover:bg-gray-200`}
              title={isThisMessageSpeaking ? 'আবৃত্তি বন্ধ করুন' : 'উত্তর আবৃত্তি করুন'}
            >
              {isThisMessageSpeaking ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<number | null>(null);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        const user = getCurrentUser();
        setCurrentUser(user);
        await loadUserChats();
      } else {
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Filter chats based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);
 
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
      
      const formattedChats: Chat[] = result.map((item: any) => ({
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
      setFilteredChats(formattedChats);
      setError(null);
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
      console.error('Error creating chat:', err);
      setError(err.message || 'নতুন চ্যাট তৈরি করতে সমস্যা হয়েছে।');
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
    } catch (err: any) {
      console.error('Error deleting chat:', err);
      setError('চ্যাট মুছতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel delete confirmation
  const cancelDeleteConfirmation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirmation(null);
  };
  
  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'bn-BD';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setQuestion(prev => prev + ' ' + transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (listening) {
          recognitionRef.current.start();
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
    logoutUser();
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
      const chunks= [];
      
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
          window.bengaliTTSAudios.push(audio);
          
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
      } catch (err: any) {
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
      
    } catch (err: any) {
      setError(err.message || 'কিছু সমস্যা হয়েছে।');
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
  const renderChatList = () => {
    return (
      <div className="bg-white/90 p-4 rounded-lg shadow-md w-full md:w-80 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-green-800">আপনার আলোচনাসমূহ</h2>
          <button
            onClick={() => setShowChatsList(false)}
            className="md:hidden text-gray-600 hover:text-gray-800"
          >
            <IoChevronBack size={24} />
          </button>
        </div>
        
        <button
          onClick={startNewChat}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg mb-4 flex items-center justify-center"
        >
          <HiOutlineChatAlt className="mr-2" /> নতুন আলোচনা শুরু করুন
        </button>
        
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="আলোচনা খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        
        {filteredChats.length === 0 ? (
          <p className="text-black text-center">
            {searchQuery ? "কোন ফলাফল পাওয়া যায়নি" : "কোন আলোচনা নেই"}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => loadChat(chat.id)}
                className={`p-3 rounded-lg cursor-pointer flex justify-between items-start ${
                  currentChatId === chat.id
                    ? 'bg-green-100 border-l-4 border-green-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className="truncate flex-1">
                  <p className="font-medium text-black">{chat.title}</p>
                  <p className="text-xs text-black">
                    {formatUpdatedAt(chat.updated)}
                  </p>
                </div>
                {showDeleteConfirmation === chat.id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => handleDeleteChat(chat.id)}
                      className="text-red-600 hover:text-red-800"
                      title="মুছুন"
                    >
                      <FaTrash size={14} />
                    </button>
                    <button
                      onClick={cancelDeleteConfirmation}
                      className="text-gray-600 hover:text-gray-800"
                      title="বাতিল"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="text-red-500 hover:text-red-700 ml-2"
                    title="আলোচনা মুছুন"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black">{currentUser?.name || 'ব্যবহারকারী'}</p>
              <p className="text-xs text-black">{currentUser?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700"
              title="লগ আউট করুন"
            >
              <FaSignOutAlt size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setShowChatsList(!showChatsList)}
              className="mr-3 md:hidden"
            >
              <HiOutlineChatAlt size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">🔬 বিজ্ঞান বাংলাবট</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearChat}
              className="bg-green-600 hover:bg-green-800 p-2 rounded-full"
              title="আলোচনা পরিষ্কার করুন"
            >
              <IoReload className="text-white" />
            </button>
            <button
              onClick={handleLogout}
              className="bg-green-600 hover:bg-green-800 p-2 rounded-full"
              title="লগ আউট করুন"
            >
              <FaSignOutAlt className="text-white" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto p-4 flex md:space-x-4">
        {/* Chat list for desktop */}
        <div className="hidden md:block">
          {renderChatList()}
        </div>
        
        {/* Mobile chat list */}
        {showChatsList && (
          <div className="fixed inset-0 z-10 bg-white md:hidden p-4">
            {renderChatList()}
          </div>
        )}
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          {/* Chat messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto mb-4 p-4 bg-white/70 rounded-lg shadow-md"
            style={{ minHeight: '60vh', maxHeight: '60vh' }}
          >
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-center text-lg mb-2">বাংলায় বিজ্ঞান সম্পর্কে আপনার প্রশ্ন জিজ্ঞাসা করুন</p>
                <p className="text-center text-sm">উদাহরণ: পানির আণবিক গঠন কি? | সৌরজগতের গ্রহগুলো কি কি?</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((msg, index) => (
                  <ChatMessageComponent
                    key={index}
                    message={{...msg, id: index}} 
                    handleSpeakMessage={handleSpeakMessage}
                    isSpeaking={isSpeaking}
                    currentSpeakingId={currentSpeakingId}
                  />
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-lg shadow rounded-tl-none">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
              <p>{error}</p>
            </div>
          )}
          
          {/* Input area */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <textarea
              ref={textareaRef}
              className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="আপনার বিজ্ঞান প্রশ্ন লিখুন..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={3}
            />
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2">
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-full ${
                    listening ? 'bg-red-500' : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                  title={listening ? 'ভয়েস ইনপুট বন্ধ করুন' : 'ভয়েস ইনপুট চালু করুন'}
                >
                  {listening ? <FaStop /> : <FaMicrophone />}
                </button>
                
                {chatHistory.length > 0 && (
                  <button
                    onClick={() => {
                      const lastBotMessage = [...chatHistory]
                        .reverse()
                        .find(msg => msg.role === 'bot');
                      
                      if (lastBotMessage) {
                        const messageIndex = chatHistory.findIndex(
                          msg => msg === lastBotMessage
                        );
                        
                        if (messageIndex !== -1) {
                          handleSpeakMessage(lastBotMessage.content, messageIndex);
                        }
                      }
                    }}
                    className={`p-2 rounded-full ${
                      isSpeaking ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                    title={isSpeaking ? 'আবৃত্তি বন্ধ করুন' : 'শেষ উত্তর আবৃত্তি করুন'}
                    disabled={!chatHistory.some(msg => msg.role === 'bot')}
                  >
                    {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                )}
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading || !question.trim()}
                className={`flex items-center px-4 py-2 rounded ${
                  loading || !question.trim() 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                <span className="mr-2">জিজ্ঞাসা করুন</span>
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="text-center p-4 text-gray-600 bg-white/50">
        <p>© ২০২৫ বিজ্ঞান বাংলাবট - আপনার বিজ্ঞান প্রশ্নের বাংলা উত্তর</p>
      </footer>
    </div>
  );
}