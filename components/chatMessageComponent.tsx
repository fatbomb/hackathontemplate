// ChatMessageComponent.tsx
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import formatUpdatedAt from './formatUpdatedAt';

interface ChatMessage {
  id?: number;
  role: 'user' | 'bot';
  content: string;
  timestamp: string | Date;
}

interface ChatMessageComponentProps {
  message: ChatMessage;
  handleSpeakMessage: (content: string, messageId: number) => void;
  isSpeaking: boolean;
  currentSpeakingId: number | null;
}

const ChatMessageComponent: React.FC<ChatMessageComponentProps> = ({ 
  message, 
  handleSpeakMessage, 
  isSpeaking,
  currentSpeakingId
}) => {
  const isThisMessageSpeaking = isSpeaking && currentSpeakingId === message.id;
  const isLongMessage = message.content.length > 500;
  const [expanded, setExpanded] = useState(!isLongMessage);
  
  const components = {
    code({node, inline, className, children, ...props}: any) {
      const match = /language-(\w+)/.exec(className || '');
      
      if (inline) {
        return (
          <code className="px-1 py-0.5 rounded text-sm">
            {children}
          </code>
        );
      }
      
      return (
        <div className="my-2 rounded-lg overflow-hidden">
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
    h1: ({node, ...props}: any) => <h1 className="my-2 font-bold text-2xl" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="my-2 font-bold text-xl" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="my-1.5 font-bold text-lg" {...props} />,
    p: ({node, ...props}: any) => <p className="my-2 leading-relaxed" {...props} />,
    ul: ({node, ...props}: any) => <ul className="my-2 pl-5 list-disc" {...props} />,
    ol: ({node, ...props}: any) => <ol className="my-2 pl-5 list-decimal" {...props} />,
    li: ({node, ...props}: any) => <li className="my-1" {...props} />,
    blockquote: ({node, ...props}: any) => (
      <blockquote className="my-2 pl-4 border-l-4 italic" {...props} />
    ),
    a: ({node, ...props}: any) => (
      <a className="hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    table: ({node, ...props}: any) => (
      <div className="overflow-x-auto">
        <table className="my-2 border border-collapse" {...props} />
      </div>
    ),
    th: ({node, ...props}: any) => (
      <th className="px-3 py-1 border" {...props} />
    ),
    td: ({node, ...props}: any) => (
      <td className="px-3 py-1 border" {...props} />
    ),
  };
  
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] p-3 rounded-lg shadow ${
          message.role === 'user' 
            ? 'rounded-tr-none' 
            : 'rounded-tl-none'
        }`}
      >
        <div className="font-medium text-base leading-relaxed whitespace-pre-wrap">
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
                  className="block mt-2 text-sm underline"
                >
                  {expanded ? 'সংক্ষিপ্ত দেখুন' : 'সম্পূর্ণ দেখুন'}
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className="opacity-70 text-xs">
            {formatUpdatedAt(message.timestamp)}
          </p>
          
          {message.role === 'bot' && (
            <button
              onClick={() => handleSpeakMessage(message.content, message.id || 0)}
              className={`ml-2 p-1 rounded ${isThisMessageSpeaking ? 'opacity-75' : ''}`}
              title={isThisMessageSpeaking ? 'আবৃত্তি বন্ধ করুন' : 'উত্তর আবৃত্তি করুন'}
              aria-label={isThisMessageSpeaking ? 'Stop speaking' : 'Speak response'}
            >
              {isThisMessageSpeaking ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageComponent;