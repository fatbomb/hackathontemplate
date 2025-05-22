import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

// Custom MDX components
const components = {
  // You can add custom components here to enhance your MDX content
  // For example, a component to display chemistry molecules or physics diagrams
  Equation: (props) => (
    <div className="py-2 flex justify-center">
      <div>{props.children}</div>
    </div>
  ),
  // Add more custom science components as needed
};

interface ChatMessageProps {
  message: {
    id: number;
    role: 'user' | 'bot';
    content: string;
  };
  handleSpeakMessage: (content: string, id: number) => void;
  isSpeaking: boolean;
  currentSpeakingId: number | null;
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ 
  message,
  handleSpeakMessage,
  isSpeaking,
  currentSpeakingId
}) => {
  const [mdxSource, setMdxSource] = React.useState<any>(null);
  
  React.useEffect(() => {
    // Process MDX content when the message is from the bot
    if (message.role === 'bot') {
      const processMdx = async () => {
        try {
          const mdxProcessed = await serialize(message.content, {
            mdxOptions: {
              remarkPlugins: [remarkMath],
              rehypePlugins: [rehypeKatex],
            }
          });
          setMdxSource(mdxProcessed);
        } catch (error) {
          console.error('Error processing MDX:', error);
          // Fallback to plain text if MDX processing fails
          setMdxSource(null);
        }
      };
      
      processMdx();
    }
  }, [message.content, message.role]);

  const isBeingSpoken = isSpeaking && currentSpeakingId === message.id;

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] p-3 rounded-lg shadow ${
          message.role === 'user' 
            ? 'bg-green-100 rounded-br-none' 
            : 'bg-white rounded-tl-none'
        }`}
      >
        {message.role === 'user' ? (
          // User messages are displayed as regular text
          <p className="text-gray-800">{message.content}</p>
        ) : (
          // Bot messages are rendered with MDX for rich content
          <div className="text-gray-800 science-content">
            {mdxSource ? (
              <MDXRemote {...mdxSource} components={components} />
            ) : (
              // Fallback to plain text if MDX is not processed yet or failed
              <p>{message.content}</p>
            )}
            
            {/* Text-to-speech button for bot messages */}
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleSpeakMessage(message.content, message.id)}
                className={`p-1.5 rounded-full ${
                  isBeingSpoken ? 'bg-red-500' : 'bg-blue-500 hover:bg-blue-600'
                } text-white text-xs`}
                title={isBeingSpoken ? 'আবৃত্তি বন্ধ করুন' : 'এই উত্তর আবৃত্তি করুন'}
              >
                {isBeingSpoken ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageComponent;