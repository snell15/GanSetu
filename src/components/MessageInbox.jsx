import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MessageCircle, X, Loader2, ChevronRight } from 'lucide-react';

export default function MessageInbox({ user, onClose, onOpenChat }) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      try {
        // 1. Fetch all messages involving the current user
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (msgError) throw msgError;

        // 2. Extract unique conversation partners and the latest message
        const convoMap = new Map();
        messages.forEach(msg => {
          const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          if (!convoMap.has(otherId)) {
            convoMap.set(otherId, msg); // Maps the ID to the most recent message
          }
        });

        const uniquePartnerIds = Array.from(convoMap.keys());

        if (uniquePartnerIds.length === 0) {
          setConversations([]);
          setIsLoading(false);
          return;
        }

        // 3. Fetch the profile details (names) for those partners
        const { data: profiles, error: profError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', uniquePartnerIds);

        if (profError) throw profError;

        // 4. Combine the profiles with their latest message
        const formattedConvos = profiles.map(profile => ({
          partner: profile,
          latestMessage: convoMap.get(profile.id)
        })).sort((a, b) => new Date(b.latestMessage.created_at) - new Date(a.latestMessage.created_at));

        setConversations(formattedConvos);
      } catch (error) {
        console.error("Error fetching inbox:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  const handleConversationClick = (partner) => {
    onClose(); // Close the inbox
    onOpenChat({ id: partner.id, name: partner.full_name }); // Open the chat box
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-start pt-10 sm:pt-20 px-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-extrabold text-gray-900">Your Messages</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conversation List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center items-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-10 text-gray-500">
              <MessageCircle className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p className="font-bold">No messages yet</p>
              <p className="text-sm">When buyers contact you, their messages will appear here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((convo) => {
                const isMe = convo.latestMessage.sender_id === user.id;
                
                return (
                  <button
                    key={convo.partner.id}
                    onClick={() => handleConversationClick(convo.partner)}
                    className="w-full text-left p-4 hover:bg-orange-50 rounded-2xl transition-colors flex items-center gap-4 group"
                  >
                    <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-black text-lg shrink-0">
                      {convo.partner.full_name?.charAt(0) || 'U'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-gray-900 truncate">
                        {convo.partner.full_name || 'GanSetu Member'}
                      </p>
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                        {isMe && <span className="font-medium text-gray-400">You: </span>}
                        {convo.latestMessage.content}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}