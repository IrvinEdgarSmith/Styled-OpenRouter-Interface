import React, { useState } from 'react';
import { FiSearch, FiPlus, FiTrash } from 'react-icons/fi';

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

interface ChatSidebarProps {
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  selectedChat, 
  onSelectChat,
  onDeleteChat 
}) => {
  const [chats, setChats] = useState<Chat[]>([
    { id: '1', title: 'Project Discussion', lastMessage: 'Sounds good!', timestamp: '10:30 AM' },
    { id: '2', title: 'AI Research', lastMessage: 'Here are the findings...', timestamp: 'Yesterday' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `New Chat ${chats.length + 1}`,
      lastMessage: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChats([newChat, ...chats]);
    onSelectChat(newChat.id);
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    onDeleteChat(chatId);
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-1/4 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Chats</h2>
          <button
            onClick={handleCreateChat}
            className="p-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors"
            aria-label="Create new chat"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-100 placeholder-gray-400"
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>
      <div className="overflow-y-auto scrollbar-hide flex-1">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`group p-4 hover:bg-gray-900/20 cursor-pointer transition-colors ${
              selectedChat === chat.id ? 'bg-gray-900/20' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-100">{chat.title}</div>
                {chat.lastMessage && (
                  <div className="text-sm text-gray-400 truncate">{chat.lastMessage}</div>
                )}
              </div>
              <button
                onClick={(e) => handleDeleteChat(chat.id, e)}
                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                aria-label={`Delete ${chat.title}`}
              >
                <FiTrash className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">{chat.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
