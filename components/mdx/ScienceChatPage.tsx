import React, { useState, useRef, useEffect } from 'react';
import { 
  FaPaperPlane, 
  FaMicrophone, 
  FaStop, 
  FaSignOutAlt, 
  FaVolumeUp, 
  FaVolumeMute 
} from 'react-icons/fa';
import { IoReload } from 'react-icons/io5';
import { HiOutlineChatAlt } from 'react-icons/hi';
import ChatMessageComponent from './ChatMessageWithMDX';
import 'katex/dist/katex.min.css';

// Types
interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

export default function ScienceChatPage() {
  // State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<number | null>(null);
  const [showChatsList, setShowChatsList] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    
    // Load chats
    fetchChats();
    
    return () => {
      // Cancel any ongoing speech when component unmounts
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Scroll to bottom when chat history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Mock function to fetch chats
  const fetchChats = async () => {
    try {
      // This would be an API call in a real app
      const mockChats: Chat[] = [
        { id: '1', title: 'পানির আণবিক গঠন', updatedAt: new Date().toISOString() },
        { id: '2', title: 'সৌরজগতের গ্রহগুলো', updatedAt: new Date().toISOString() },
        { id: '3', title: 'কোয়ান্টাম মেকানিক্স', updatedAt: new Date().toISOString() },
      ];
      setChats(mockChats);
      
      // Set current chat to the first one if none selected
      if (!currentChatId && mockChats.length > 0) {
        setCurrentChatId(mockChats[0].id);
        loadChat(mockChats[0].id);
      }
    } catch (error) {
      setError('চ্যাট লোড করতে সমস্যা হয়েছে');
    }
  };

  // Mock function to load a chat
  const loadChat = async (chatId: string) => {
    try {
      setLoading(true);
      // This would be an API call in a real app
      
      // Mock data
      let mockChatHistory: ChatMessage[] = [];
      
      if (chatId === '1') {
        mockChatHistory = [
          { role: 'user', content: 'পানির আণবিক গঠন কি?' },
          { 
            role: 'bot', 
            content: `# পানির আণবিক গঠন

পানি (H₂O) একটি অণু যা দুটি হাইড্রোজেন পরমাণু এবং একটি অক্সিজেন পরমাণু নিয়ে গঠিত।

## মূল বৈশিষ্ট্য

- **আণবিক সূত্র**: H₂O
- **বন্ধন কোণ**: 104.5°
- **গঠন**: বেঁকানো ত্রিভুজাকার

## কেন এই গঠন?

অক্সিজেন পরমাণুতে দুটি অযুগ্ম ইলেকট্রন জোড়া রয়েছে, যা অণুটিকে একটি বেঁকানো আকৃতি দেয়:

$\\ce{H-O-H}$

পানির মিথস্ক্রিয়াগুলির জন্য এই গঠন অত্যন্ত গুরুত্বপূর্ণ।

## হাইড্রোজেন বন্ধন

পানির অণুগুলি একে অপরের সাথে হাইড্রোজেন বন্ধন তৈরি করে:

\`\`\`
    H
    |
H---O···H—O
        |
        H
\`\`\`

এই হাইড্রোজেন বন্ধনগুলি পানির অনেক অনন্য বৈশিষ্ট্যের জন্য দায়ী, যেমন:

- উচ্চ সিদ্ধ বিন্দু
- উচ্চ পৃষ্ঠ টানটান
- ঘনত্বের অস্বাভাবিক আচরণ (বরফ পানির চেয়ে হালকা)

## গণিতীক প্রকাশ

বন্ধন দৈর্ঘ্য (O-H): 0.96Å

$$E = \\sum_{ij} \\frac{q_i q_j}{4\\pi\\epsilon_0 r_{ij}}$$` 
          },
        ];
      } else if (chatId === '2') {
        mockChatHistory = [
          { role: 'user', content: 'সৌরজগতের গ্রহগুলো কি কি?' },
          { 
            role: 'bot', 
            content: `# সৌরজগতের গ্রহগুলো

আমাদের সৌরজগতে মোট **আটটি** গ্রহ রয়েছে।

## গ্রহদের তালিকা

1. **বুধ** (Mercury) - সূর্যের সবচেয়ে কাছের গ্রহ
2. **শুক্র** (Venus) - সবচেয়ে উষ্ণ গ্রহ
3. **পৃথিবী** (Earth) - আমাদের বাসস্থান
4. **মঙ্গল** (Mars) - লাল গ্রহ
5. **বৃহস্পতি** (Jupiter) - সৌরজগতের বৃহত্তম গ্রহ
6. **শনি** (Saturn) - বলয়যুক্ত গ্রহ
7. **ইউরেনাস** (Uranus) - পার্শ্বভাবে ঘুরন্ত গ্রহ
8. **নেপচুন** (Neptune) - নীল গ্রহ

## গ্রহদের শ্রেণীবিভাগ

গ্রহগুলিকে দুই ভাগে ভাগ করা হয়:

### পার্থিব গ্রহ (Terrestrial)
- বুধ, শুক্র, পৃথিবী, মঙ্গল
- বৈশিষ্ট্য: পাথুরে, ছোট, ঘন, ধাতব

### বৃহৎ গ্রহ (Jovian/Gas Giants)
- বৃহস্পতি, শনি, ইউরেনাস, নেপচুন
- বৈশিষ্ট্য: গ্যাসীয়, বড়, কম ঘন

## গ্রহদের কক্ষপথ

সূর্যের চারপাশে গ্রহদের কক্ষপথ উপবৃত্তাকার:

$$r = \\frac{a(1-e^2)}{1 + e\\cos\\theta}$$

যেখানে:
- $r$ = সূর্য থেকে দূরত্ব
- $a$ = অর্ধ-প্রধান অক্ষ
- $e$ = উৎকেন্দ্রতা
- $\\theta$ = কৌণিক অবস্থান` 
          },
        ];
      } else {
        mockChatHistory = [];
      }
      
      setChatHistory(mockChatHistory);
      setShowChatsList(false); // Hide the chats list after selection on mobile
      setLoading(false);
    } catch (error) {
      setError('চ্যাট লোড করতে সমস্যা হয়েছে');
      setLoading(false);
    }
  };

  // Create a new chat
  const createNewChat = () => {
    const newChatId = `new-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      title: 'নতুন আলোচনা',
      updatedAt: new Date().toISOString()
    };
    
    setChats([newChat, ...chats]);
    setCurrentChatId(newChatId);
    setChatHistory([]);
    setShowChatsList(false); // Hide the chats list after selection on mobile
  };

  // Clear current chat
  const clearChat = () => {
    setChatHistory([]);
  };

  // Handle logout
  const handleLogout = () => {
    // This would handle logout in a real app
    console.log('Logging out...');
  };

  // Handle key press (send on Enter without Shift)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!question.trim() || loading) return;
    
    setError('');
    setLoading(true);
    
    // Add user message to chat
    const userMessage: ChatMessage = { role: 'user', content: question };
    const updatedChat = [...chatHistory, userMessage];
    setChatHistory(updatedChat);
    setQuestion('');
    
    try {
      // This would be an API call to your backend in a real app
      // For this example, we'll simulate a response with a timeout
      
      setTimeout(() => {
        // Example response with MDX content including math
        let botResponse: ChatMessage;
        
        if (question.toLowerCase().includes('পানি') || question.toLowerCase().includes('water')) {
          botResponse = {
            role: 'bot',
            content: `# পানির সম্পর্কে তথ্য

পানি (H₂O) পৃথিবীতে সবচেয়ে গুরুত্বপূর্ণ পদার্থগুলির মধ্যে একটি।

## আণবিক গঠন

পানির আণবিক গঠন:

$$\\ce{H2O}$$

পানির অণুতে দুটি হাইড্রোজেন এবং একটি অক্সিজেন পরমাণু থাকে, যা একটি বেঁকানো ত্রিভুজাকার গঠন তৈরি করে।

## বৈশিষ্ট্য

- **বন্ধন কোণ**: 104.5°
- **মোলার ভর**: 18.01528 g/mol
- **ঘনত্ব**: 1000 kg/m³ (4°C তাপমাত্রায়)

## তিন অবস্থা

পানি তিনটি ভৌত অবস্থায় পাওয়া যায়:

1. **কঠিন** (বরফ): 0°C এর নিচে
2. **তরল** (পানি): 0°C থেকে 100°C
3. **গ্যাসীয়** (বাষ্প): 100°C এর উপরে

## পানির চক্র

পানির চক্র হল প্রকৃতিতে পানির নিরন্তর চলাচল:

1. বাষ্পীভবন
2. ঘনীভবন
3. বৃষ্টিপাত
4. প্রবাহ

## তাপীয় সমীকরণ

পানিকে উত্তপ্ত করার জন্য প্রয়োজনীয় তাপ:

$$Q = mc\\Delta T$$

যেখানে:
- $Q$ = তাপের পরিমাণ (জুল)
- $m$ = ভর (kg)
- $c$ = আপেক্ষিক তাপ (4186 J/kg·K)
- $\\Delta T$ = তাপমাত্রার পরিবর্তন (K বা °C)`
          };
        } else if (question.toLowerCase().includes('গ্রহ') || question.toLowerCase().includes('planet')) {
          botResponse = {
            role: 'bot',
            content: `# সৌরজগতের গ্রহগুলো

আমাদের সৌরজগতে মোট **আটটি** গ্রহ রয়েছে।

## গ্রহদের তালিকা

1. **বুধ** (Mercury)
2. **শুক্র** (Venus)
3. **পৃথিবী** (Earth)
4. **মঙ্গল** (Mars)
5. **বৃহস্পতি** (Jupiter)
6. **শনি** (Saturn)
7. **ইউরেনাস** (Uranus)
8. **নেপচুন** (Neptune)

## গ্রহদের তুলনা

| গ্রহ | ব্যাস (km) | সূর্য থেকে দূরত্ব (AU) | একটি বছর | উপগ্রহ সংখ্যা |
|------|------------|-------------------------|----------|--------------|
| বুধ | 4,879 | 0.39 | 88 দিন | 0 |
| শুক্র | 12,104 | 0.72 | 225 দিন | 0 |
| পৃথিবী | 12,756 | 1.00 | 365.25 দিন | 1 |
| মঙ্গল | 6,792 | 1.52 | 687 দিন | 2 |
| বৃহস্পতি | 142,984 | 5.20 | 11.86 বছর | 79+ |
| শনি | 120,536 | 9.58 | 29.46 বছর | 82+ |
| ইউরেনাস | 51,118 | 19.18 | 84.01 বছর | 27 |
| নেপচুন | 49,528 | 30.07 | 164.79 বছর | 14 |

## কেপলারের তৃতীয় সূত্র

গ্রহদের কক্ষপথের সূত্র:

$$\\frac{T^2}{a^3} = \\frac{4\\pi^2}{GM}$$

যেখানে:
- $T$ = কক্ষীয় সময়কাল
- $a$ = অর্ধ-প্রধান অক্ষ
- $G$ = মহাকর্ষীয় ধ্রুবক
- $M$ = সূর্যের ভর`
          };
        } else {
          botResponse = {
            role: 'bot',
            content: `# আপনার প্রশ্নের উত্তর

আপনি "${question}" সম্পর্কে জানতে চেয়েছেন।

আমি আপনার প্রশ্নটি বুঝতে পারছি না। অনুগ্রহ করে বিজ্ঞান সম্পর্কিত আরও নির্দিষ্ট একটি প্রশ্ন জিজ্ঞাসা করুন।

উদাহরণস্বরূপ:
- "পদার্থবিজ্ঞানের মৌলিক বলগুলো কি কি?"
- "DNA এর গঠন কেমন?"
- "মহাকর্ষ কী?"
- "রাসায়নিক বন্ধন কাকে বলে?"`
          };
        }
        
        // Add bot response to chat
        setChatHistory([...updatedChat, botResponse]);
        setLoading(false);
        
        // Update the chat title if it's a new chat
        if (currentChatId && currentChatId.startsWith('new-')) {
          const newTitle = question.substring(0, 30) + (question.length > 30 ? '...' : '');
          const updatedChats = chats.map(chat => 
            chat.id === currentChatId 
              ? { ...chat, title: newTitle, updatedAt: new Date().toISOString() } 
              : chat
          );
          setChats(updatedChats);
        }
      }, 1500);
      
    } catch (error) {
      setError('উত্তর পেতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      setLoading(false);
    }
  };

  // Toggle voice input
  const toggleListening = () => {
    if (!listening) {
      startListening();
    } else {
      stopListening();
    }
  };

  // Start voice recognition
  const startListening = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // This would be a real implementation in a production app
      setListening(true);
      // Mock implementation for demo
      setTimeout(() => {
        setQuestion(question + ' আমি ভয়েস দিয়ে বলছি');
        stopListening();
      }, 2000);
    } else {
      setError('আপনার ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়।');
    }
  };

  // Stop voice recognition
  const stopListening = () => {
    setListening(false);
  };

  // Handle text-to-speech
  const handleSpeakMessage = (content: string, id: number) => {
    if (!speechSynthesisRef.current) return;
    
    // If already speaking the same message, stop it
    if (isSpeaking && currentSpeakingId === id) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      return;
    }
    
    // If speaking a different message, stop that first
    if (isSpeaking) {
      speechSynthesisRef.current.cancel();
    }
    
    // Extract plain text from MDX/markdown content
    // This is a simple implementation - a more robust solution would parse the markdown properly
    const plainText = content
      .replace(/# (.*)/g, '$1. ') // Headers
      .replace(/## (.*)/g, '$1. ') // Subheaders
      .replace(/\*\*(.*)\*\*/g, '$1') // Bold
      .replace(/\*(.*)\*/g, '$1') // Italic
      .replace(/\$\$(.*)\$\$/g, '') // Math equations
      .replace(/\$(.*)\$/g, '') // Inline math
      .replace(/```([\s\S]*?)```/g, '') // Code blocks
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Links
      .replace(/\n/g, ' '); // Newlines
    
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'bn-BD'; // Bengali language
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };
    
    speechSynthesisRef.current.speak(utterance);
    setIsSpeaking(true);
    setCurrentSpeakingId(id);
  };

  // Render chat list
  const renderChatList = () => {
    return (
      <div className="w-64 bg-white/70 p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-green-800">আলোচনাসমূহ</h2>
          <button
            onClick={createNewChat}
            className="bg-green-600 text-white p-1 rounded-full hover:bg-green-700"
            title="নতুন আলোচনা শুরু করুন"
          >
            <span className="text-lg">+</span>
          </button>
        </div>
        
        {/* Mobile only close button */}
        <div className="flex justify-end mb-4 md:hidden">
          <button
            onClick={() => setShowChatsList(false)}
            className="bg-gray-200 text-gray-600 p-1 rounded hover:bg-gray-300"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {chats.map(chat => (
            <div 
              key={chat.id}
              className={`p-2 rounded cursor-pointer ${
                currentChatId === chat.id ? 'bg-green-100 border-l-4 border-green-600' : 'hover:bg-gray-100'
              }`}
              onClick={() => loadChat(chat.id)}
            >
              <p className="font-medium truncate">{chat.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(chat.updatedAt).toLocaleDateString('bn-BD')}
              </p>
            </div>
          ))}
          
          {chats.length === 0 && (
            <p className="text-gray-500 text-center py-4">কোন আলোচনা নেই</p>
          )}
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
                        // Find the index of this message
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