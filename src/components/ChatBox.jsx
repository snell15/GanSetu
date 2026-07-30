import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Send, X, Loader2 } from 'lucide-react';

export default function ChatBox({ currentUser, otherUser, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Auto-scroll to the bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        let isMounted = true; // Prevents memory leaks if the user closes the box quickly

        const fetchHistoricalMessages = async () => {
            try {
                // 1. Force the spinner on
                setIsLoading(true);
                console.log(`Attempting to fetch messages between ${currentUser.id} and ${otherUser.id}`);

                // 2. The optimized query
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser.id})`)
                    .order('created_at', { ascending: false })
                    .limit(50);

                // 3. Catch database errors immediately
                if (error) {
                    console.error("Supabase Database Error:", error);
                    throw error;
                }

                // 4. Update the UI if successful
                if (isMounted && data) {
                    console.log(`Successfully fetched ${data.length} messages.`);
                    setMessages(data.reverse());
                }

            } catch (err) {
                // 5. Catch network or syntax errors
                console.error("Chat fetch failed entirely:", err.message);
            } finally {
                // 6. THE SAFETY NET: ALWAYS turn off the spinner, even if it crashed!
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchHistoricalMessages();

        // --- REALTIME WEBSOCKET LISTENER ---
        const messageSubscription = supabase
            .channel(`chat_${currentUser.id}_${otherUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${currentUser.id}`
                },
                (payload) => {
                    console.log("New message arrived in real-time!", payload);
                    if (isMounted) {
                        setMessages((current) => [...current, payload.new]);
                    }
                }
            )
            .subscribe();

        // Cleanup function when the chat box is closed
        return () => {
            isMounted = false;
            supabase.removeChannel(messageSubscription);
        };
    }, [currentUser.id, otherUser.id]);

    // The function that fires when you click the "Send" button
    const handleSendMessage = async (e) => {
        e.preventDefault(); // Prevents the page from refreshing if this is inside a <form>

        if (!newMessage.trim()) return; // Don't send empty messages

        const messageText = newMessage.trim();

        // 1. Instantly clear the input box for a fast, snappy UX
        setNewMessage("");

        try {
            // 2. Send the message to Supabase
            const { data, error } = await supabase
                .from('messages')
                .insert([
                    {
                        sender_id: currentUser.id,
                        receiver_id: otherUser.id,
                        content: messageText
                    }
                ])
                .select() // CRITICAL: You must chain .select() to get the newly generated timestamp back!
                .single();

            if (error) throw error;

            // 3. Append your outgoing message instantly to your own screen
            setMessages((currentMessages) => [...currentMessages, data]);

        } catch (err) {
            console.error("Failed to send message:", err.message);
            // If it fails, put the text back in the box so the user doesn't lose what they typed
            setNewMessage(messageText);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden sm:bottom-6 sm:right-6 animate-in slide-in-from-bottom-5">

            {/* Chat Header */}
            <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm">
                        {otherUser.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="font-bold text-sm">{otherUser.name || 'GanSetu Member'}</p>
                        <p className="text-[10px] text-gray-300">Secure In-App Chat</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-4 bg-stone-50 h-80 overflow-y-auto flex flex-col gap-3">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <p className="text-sm">No messages yet.</p>
                        <p className="text-xs mt-1">Say hello to ask about their decoration!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-4 py-2 text-sm rounded-2xl ${isMe
                                    ? 'bg-orange-600 text-white rounded-tr-sm'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* THE BOTTOM INPUT AREA */}
            <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />

                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2.5 bg-orange-600 text-white rounded-full hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center shrink-0"
                >
                    {/* Assuming you are using the Send icon from lucide-react */}
                    <Send className="h-4 w-4 ml-0.5" />
                </button>
            </form>

        </div>
    );
}