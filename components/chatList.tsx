import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  X, 
  ChevronLeft, 
  MessageCircle, 
  LogOut,
  User,
  Mail,
  Calendar
} from 'lucide-react';
interface User {
  id: string;
  email: string;
  name: string;
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
interface ChatMessage {
  id?: number;
  role: 'user' | 'bot';
  content: string;
  timestamp: string | Date;
}

type ChatListProps = {
  chats:Chat[];
  currentChatId: string| null;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onStartNewChat?: () => void;
  onLoadChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onClose?: () => void;
  currentUser: User| null;
  onLogout?: () => void;
  showMobile?: boolean;
};
import formatUpdatedAt from './formatUpdatedAt';

const ChatListComponent: React.FC<ChatListProps> = ({
  chats = [],
  currentChatId,
  searchQuery = '',
  setSearchQuery,
  onStartNewChat,
  onLoadChat,
  onDeleteChat,
  onClose,
  currentUser,
  onLogout,
  showMobile = false
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  // Mock data for demonstration
  const mockChats = chats.length > 0 ? chats : [
    
  ];

  const mockUser = currentUser || {
    name: 'আহমেদ হাসান',
    email: 'ahmed.hasan@example.com',
    avatar: null
  };

  const filteredChats = mockChats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  

  const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirmation(chatId);
  };

  const handleDeleteConfirm = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteChat?.(chatId);
    setShowDeleteConfirmation(null);
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirmation(null);
  };

  return (
    <div className="flex flex-col bg-background shadow-lg border-border h-full">
      {/* Header */}
      <div className="flex justify-between items-center bg-card p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="flex justify-center items-center bg-primary shadow-lg rounded-xl w-10 h-10">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-xl">আপনার আলোচনাসমূহ</h2>
            <p className="text-muted-foreground text-sm">{filteredChats.length}টি আলোচনা</p>
          </div>
        </div>
        {showMobile && (
          <button
            onClick={onClose}
            className="md:hidden hover:bg-accent p-2 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onStartNewChat}
          className="flex justify-center items-center space-x-2 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl px-4 py-3 rounded-xl w-full font-medium text-primary-foreground hover:scale-105 active:scale-95 transition-all duration-200 transform"
        >
          <Plus className="w-5 h-5" />
          <span>নতুন আলোচনা শুরু করুন</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2 transform" />
          <input
            type="text"
            placeholder="আলোচনা খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            className="bg-background py-3 pr-10 pl-10 border focus:border-transparent border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring w-full text-foreground transition-all duration-200 placeholder-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery?.('')}
              className="top-1/2 right-3 absolute text-muted-foreground hover:text-foreground transition-colors -translate-y-1/2 duration-200 transform"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 space-y-2 px-4 pb-4 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="py-12 text-center">
            <MessageCircle className="mx-auto mb-4 w-16 h-16 text-muted-foreground" />
            <p className="font-medium text-foreground">
              {searchQuery ? "কোন ফলাফল পাওয়া যায়নি" : "কোন আলোচনা নেই"}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {!searchQuery && "নতুন আলোচনা শুরু করুন"}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onLoadChat?.(chat.id)}
              onMouseEnter={() => setHoveredChat(chat.id)}
              onMouseLeave={() => setHoveredChat(null)}
              className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                currentChatId === chat.id
                  ? 'bg-accent border-2 border-primary shadow-md'
                  : 'bg-card hover:bg-accent border border-border hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {chat.title}
                    </h3>
                    {currentChatId === chat.id && (
                      <div className="bg-primary rounded-full w-2 h-2 animate-pulse"></div>
                    )}
                  </div>
                  
                  
                  
                  <div className="flex justify-between items-center text-muted-foreground text-xs">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatUpdatedAt(chat.updated)}</span>
                    </div>
                    
                  </div>
                </div>

                {/* Delete Button */}
                <div className="flex items-center space-x-1 ml-3">
                  {showDeleteConfirmation === chat.id ? (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleDeleteConfirm(chat.id, e)}
                        className="hover:bg-destructive/10 p-2 rounded-lg text-destructive transition-colors duration-200"
                        title="নিশ্চিত করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDeleteCancel}
                        className="hover:bg-accent p-2 rounded-lg text-muted-foreground transition-colors duration-200"
                        title="বাতিল"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleDeleteClick(chat.id, e)}
                      className={`p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 ${
                        hoveredChat === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="আলোচনা মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Profile & Logout */}
      <div className="bg-card p-4 border-t border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex justify-center items-center bg-primary shadow-lg rounded-full w-12 h-12">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">
                {mockUser.name}
              </h4>
              <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                <Mail className="w-3 h-3" />
                <span className="truncate">{mockUser.email}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="hover:bg-destructive/10 p-3 rounded-xl text-destructive hover:scale-105 active:scale-95 transition-all duration-200"
            title="লগ আউট করুন"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatListComponent;