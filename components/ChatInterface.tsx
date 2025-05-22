// ChatInterface.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { HiOutlineChatAlt } from 'react-icons/hi';
import { IoReload } from 'react-icons/io5';
import { FaPaperPlane, FaMicrophone, FaStop, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import ChatMessageComponent from './chatMessageComponent';
import ChatListComponent from './chatList';

interface ChatMessage {
  id?: number;
  role: 'user' | 'bot';
  content: string;
  timestamp: string | Date;
}

interface User {
  id: string;
  name: string;
  email: string;
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

interface ChatInterfaceProps {
  // State
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  question: string;
  setQuestion: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  error: string | null;
  chats: Chat[];
  currentChatId: string | null;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  listening: boolean;
  isSpeaking: boolean;
  currentSpeakingId: number | null;
  showChatsList: boolean;
  setShowChatsList: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Methods
  handleSubmit: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  clearChat: () => void;
  startNewChat: () => void;
  loadChat: (chatId: string) => void;
  handleDeleteChat: (chatId: string) => void;
  toggleListening: () => void;
  handleSpeakMessage: (text: string, messageId: number) => void;
  currentUser: User|null;
  handleLogout: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatHistory,
  question,
  setQuestion,
  loading,
  error,
  chats,
  currentChatId,
  searchQuery,
  setSearchQuery,
  listening,
  isSpeaking,
  currentSpeakingId,
  showChatsList,
  setShowChatsList,
  handleSubmit,
  handleKeyPress,
  clearChat,
  startNewChat,
  loadChat,
  handleDeleteChat,
  toggleListening,
  handleSpeakMessage,
  currentUser,
  handleLogout
}) => {
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  // Resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [question]);

  // Render chat list component
  const renderChatList = () => {
    return (
      <div className="border border-primary rounded-lg w-full md:w-80 h-full overflow-y-auto">
        <ChatListComponent
          chats={chats}
          currentChatId={currentChatId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onStartNewChat={startNewChat}
          onLoadChat={loadChat}
          onDeleteChat={handleDeleteChat}
          onClose={() => setShowChatsList(false)}
          currentUser={currentUser}
          onLogout={handleLogout}
          showMobile={showChatsList}
        />
      </div>
    );
  };

  // Render chat list component
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-4">
        <div className="flex justify-between items-center mx-auto container">
          <div className="flex items-center">
            <button
              onClick={() => setShowChatsList(!showChatsList)}
              className="md:hidden mr-3"
              aria-label="Toggle chat list"
            >
              <HiOutlineChatAlt size={24} />
            </button>
            <h1 className="font-bold text-xl md:text-2xl">🔬 Sci-Baba bot</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearChat}
              className="p-2 rounded-full"
              title="আলোচনা পরিষ্কার করুন"
              aria-label="Clear chat"
            >
              <IoReload />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex flex-1 md:space-x-4 mx-auto p-4 container">
        {/* Chat list for desktop */}
        <div className="hidden md:block">
          {renderChatList()}
        </div>
        
        {/* Mobile chat list */}
        {showChatsList && (
          <div className="md:hidden z-10 fixed inset-0 p-4">
            {renderChatList()}
          </div>
        )}
        
        {/* Chat area */}
        <div className="flex flex-col flex-1 mx-auto w-full max-w-3xl">
          {/* Chat messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 shadow-md mb-4 p-4 border rounded-lg overflow-y-auto"
            style={{ minHeight: '60vh', maxHeight: '60vh' }}
          >
            {chatHistory.length === 0 ? (
              <div className="flex flex-col justify-center items-center border border-accent h-full text-gray-500">
                <p className="mb-2 text-lg text-center">বাংলায় বিজ্ঞান সম্পর্কে আপনার প্রশ্ন জিজ্ঞাসা করুন</p>
                <p className="text-sm text-center">উদাহরণ: পানির আণবিক গঠন কি? | সৌরজগতের গ্রহগুলো কি কি?</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((msg, index) => (
                  <ChatMessageComponent
                    key={index}
                    message={{
                      ...msg,
                      id: index,
                      timestamp: (msg as ChatMessage).timestamp ?? new Date()
                    }}
                    handleSpeakMessage={handleSpeakMessage}
                    isSpeaking={isSpeaking}
                    currentSpeakingId={currentSpeakingId}
                  />
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="shadow p-3 rounded-lg rounded-tl-none">
                      <div className="flex space-x-2">
                        <div className="rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="rounded-full w-2 h-2 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 border-l-4 rounded">
              <p>{error}</p>
            </div>
          )}
          
          {/* Input area */}
          <div className="shadow-md p-3 rounded-lg">
            <textarea
              ref={textareaRef}
              className="p-3 border rounded focus:outline-none focus:ring-2 w-full"
              placeholder="আপনার বিজ্ঞান প্রশ্ন লিখুন..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
            />
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2">
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-full ${
                    listening ? 'opacity-75' : ''
                  }`}
                  title={listening ? 'ভয়েস ইনপুট বন্ধ করুন' : 'ভয়েস ইনপুট চালু করুন'}
                  aria-label={listening ? 'Stop voice input' : 'Start voice input'}
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
                      isSpeaking ? 'opacity-75' : ''
                    }`}
                    title={isSpeaking ? 'আবৃত্তি বন্ধ করুন' : 'শেষ উত্তর আবৃত্তি করুন'}
                    aria-label={isSpeaking ? 'Stop speaking' : 'Speak last response'}
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
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                aria-label="Submit question"
              >
                <span className="mr-2">জিজ্ঞাসা করুন</span>
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;