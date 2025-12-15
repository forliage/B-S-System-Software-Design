import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Key } from 'lucide-react';
import { Link } from 'react-router-dom';

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]); // { role, text, results }
    const [loading, setLoading] = useState(false);

    const [apiKey, setApiKey] = useState(localStorage.getItem('ai_api_key') || '');
    const [showKeyInput, setShowKeyInput] = useState(false);

    const handleKeySave = () => {
        localStorage.setItem('ai_api_key', apiKey);
        setShowKeyInput(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg = { role: 'user', text: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setLoading(true);

        try {
            const res = await axios.post('/api/ai/chat', {
                query: userMsg.text,
                apiKey: apiKey
            });

            const aiMsg = {
                role: 'ai',
                text: res.data.answer || 'Found some results:',
                results: res.data.results
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please check your API Key.' }]);
        }
        setLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                >
                    <MessageSquare className="w-6 h-6" />
                    <span className="font-semibold hidden md:inline">AI Search</span>
                </button>
            )}

            {isOpen && (
                <div className="bg-white dark:bg-gray-800 w-80 md:w-96 h-[500px] rounded-lg shadow-2xl flex flex-col border dark:border-gray-700">
                    {/* Header */}
                    <div className="bg-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5" /> AI Assistant</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setShowKeyInput(!showKeyInput)} title="Set API Key" className="hover:text-purple-200">
                                <Key className="w-5 h-5" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="hover:text-purple-200"><X className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Key Input */}
                    {showKeyInput && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 border-b">
                            <input
                                type="password"
                                placeholder="Enter OpenAI API Key"
                                className="w-full p-2 rounded border mb-2 text-sm dark:text-black"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <button onClick={handleKeySave} className="w-full bg-green-500 text-white text-xs py-1 rounded">Save Key</button>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                        {messages.length === 0 && <p className="text-gray-400 text-center text-sm mt-10">Ask me to find specific photos! <br /> e.g., "Find photos of beaches"</p>}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-purple-100 text-purple-900' : 'bg-white border text-gray-800'}`}>
                                    <p>{msg.text}</p>
                                </div>
                                {msg.results && msg.results.length > 0 && (
                                    <div className="flex gap-2 mt-2 overflow-x-auto w-full pb-2">
                                        {msg.results.map(photo => (
                                            <Link to={`/photos/${photo.photo_id}`} key={photo.photo_id} className="flex-shrink-0">
                                                <img src={photo.thumbnail_path || photo.filepath} alt={photo.title} className="w-16 h-16 object-cover rounded border hover:opacity-80" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && <div className="text-gray-400 text-xs ml-2">Thinking...</div>}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg flex gap-2">
                        <input
                            type="text"
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="Type a message..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" disabled={loading} className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50">
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIChat;
