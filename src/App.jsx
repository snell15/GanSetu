import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { MessageCircle, UserCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';

// Import Pages & Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import AddListing from './components/AddListing';
import Dashboard from './components/Dashboard';
import SellerProfile from './components/SellerProfile';
import ListingDetails from './components/ListingDetails';
import Favorites from './components/Favorites';
import Abhipray from './components/Abhipray';
import Footer from './components/Footer';
import Support from './components/Support';
import Legal from './components/Legal';
import GanSetuAuth from './components/GanSetuAuth';
import ChatBox from './components/ChatBox';
import MessageInbox from './components/MessageInbox';
import EditProfileModal from './components/EditProfileModal';

const PREDEFINED_AVATARS = [
  '/avatars/ganesha-avatar.jpg', '/avatars/ganesha-1.jpg', '/avatars/ganesha-2.jpg',
  '/avatars/ganesha-3.jpg', '/avatars/ganesha-4.jpg', '/avatars/ganesha-5.jpg',
  '/avatars/ganesha-6.jpg', '/avatars/ganesha-7.jpg',
];

function App() {
  const navigate = useNavigate();

  // Global Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // Global Data
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Chat State
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [showInbox, setShowInbox] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    const fetchUserFavorites = async (userId) => {
      const { data, error } = await supabase.from('user_favorites').select('listing_id').eq('user_id', userId);
      if (data && !error) setFavorites(data.map(f => f.listing_id));
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserFavorites(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowAuthModal(false);
        fetchUserFavorites(session.user.id);
      } else {
        setFavorites([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkInitialUnread = async () => {
      const { data } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('is_read', false)
        .limit(1);
      if (data && data.length > 0) setHasUnreadMessages(true);
    };
    checkInitialUnread();

    const messageListener = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => setHasUnreadMessages(true))
      .subscribe();

    return () => supabase.removeChannel(messageListener);
  }, [user]);

  // 🚨 BULLETPROOF TRIGGER: Bypasses the Race Condition
  useEffect(() => {
    if (!user) return;

    // We add a tiny 200ms delay to ensure Supabase and React are completely synced
    const executeIntents = setTimeout(() => {
      
      // 1. Did they want to chat?
      const savedChat = localStorage.getItem('gansetu_pending_chat');
      if (savedChat) {
        try {
          const seller = JSON.parse(savedChat);
          if (seller && seller.id) {
            setShowInbox(false);
            setActiveChatUser({
              id: seller.id,
              name: seller.name,
              avatar_url: seller.avatar_url
            });
          }
        } catch (e) {
          console.error("Error parsing pending chat:", e);
        }
        localStorage.removeItem('gansetu_pending_chat');
      }

      // 2. Did they want to favorite an item?
      const savedFav = localStorage.getItem('gansetu_pending_favorite');
      if (savedFav) {
        setFavorites(prev => {
          if (!prev.includes(savedFav)) return [...prev, savedFav];
          return prev;
        });
        supabase.from('user_favorites').insert([{ user_id: user.id, listing_id: savedFav }])
          .then(({ error }) => { if (error && error.code !== '23505') console.error(error); });
        localStorage.removeItem('gansetu_pending_favorite');
      }

      // 3. Did they want to sell an item?
      if (localStorage.getItem('gansetu_pending_sell')) {
        setShowAddListingModal(true);
        localStorage.removeItem('gansetu_pending_sell');
      }
      
    }, 200);

    return () => clearTimeout(executeIntents);
  }, [user]);

  const handleToggleFavorite = async (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      localStorage.setItem('gansetu_pending_favorite', listingId);
      setShowAuthModal(true);
      return;
    }

    const isFavorited = favorites.includes(listingId);
    try {
      if (isFavorited) {
        setFavorites(favorites.filter(id => id !== listingId));
        await supabase.from('user_favorites').delete().match({ user_id: user.id, listing_id: listingId });
      } else {
        setFavorites([...favorites, listingId]);
        await supabase.from('user_favorites').insert([{ user_id: user.id, listing_id: listingId }]);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err.message);
      setFavorites(isFavorited ? [...favorites, listingId] : favorites.filter(id => id !== listingId));
    }
  };

  // 🚨 SMART NORMALIZER: Forces perfect data no matter where Chat is clicked
  const handleOpenChat = (data) => {
    if (!data) return;

    // This guarantees we find the ID, whether it comes from a listing, a profile, or a raw object
    const sellerId = data.id || data.profiles?.id || data.seller_id;
    const sellerName = data.name || data.full_name || data.profiles?.full_name || 'GanSetu Member';
    const sellerAvatar = data.avatar_url || data.profiles?.avatar_url;

    if (!sellerId) return; // Failsafe

    const normalizedSeller = {
      id: sellerId,
      name: sellerName,
      avatar_url: sellerAvatar
    };

    if (!user) {
      localStorage.setItem('gansetu_pending_chat', JSON.stringify(normalizedSeller));
      setShowAuthModal(true);
      return;
    }

    setShowInbox(false);
    setActiveChatUser(normalizedSeller);
  };

  const handleUpdateAvatar = async (avatarUrl) => {
    setIsUpdatingAvatar(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
      if (error) throw error;
      const { error: profileError } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
      if (profileError) throw profileError;
      setUser(data.user);
      setShowAvatarModal(false);
      window.location.reload();
    } catch (err) {
      alert('Failed to update avatar: ' + err.message);
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const currentAvatar = user?.user_metadata?.avatar_url || '/ganesha-avatar.png';

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-800 relative">
      <Navbar
        user={user}
        currentAvatar={currentAvatar}
        onLoginClick={() => setShowAuthModal(true)}
        
        onSellClick={() => {
          if (user) {
            setShowAddListingModal(true);
          } else {
            localStorage.setItem('gansetu_pending_sell', 'true');
            setShowAuthModal(true);
          }
        }}

        onChangeAvatar={() => setShowAvatarModal(true)}
        onLogout={async () => {
          navigate('/');
          await supabase.auth.signOut();
          window.location.reload();
        }}
        onRequireAuth={() => setShowAuthModal(true)}
        onEditProfile={() => setShowEditProfile(true)}
      />

      <Routes>
        <Route path="/" element={<Home user={user} favorites={favorites} onToggleFavorite={handleToggleFavorite} onRequireAuth={() => setShowAuthModal(true)} onOpenChat={handleOpenChat} />} />
        <Route path="/dashboard" element={<Dashboard user={user} onSellClick={() => user ? setShowAddListingModal(true) : setShowAuthModal(true)} />} />
        <Route path="/seller/:id" element={<SellerProfile user={user} favorites={favorites} onToggleFavorite={handleToggleFavorite} onRequireAuth={() => setShowAuthModal(true)} onOpenChat={handleOpenChat} />} />
        <Route path="/listing/:id" element={<ListingDetails user={user} onRequireAuth={() => setShowAuthModal(true)} onOpenChat={handleOpenChat} />} />
        <Route path="/favorites" element={<Favorites user={user} favorites={favorites} onToggleFavorite={handleToggleFavorite} onRequireAuth={() => setShowAuthModal(true)} onOpenChat={handleOpenChat} />} />
        <Route path="/abhipray" element={<Abhipray user={user} onRequireAuth={() => setShowAuthModal(true)} />} />
        <Route path="/support" element={<Support user={user} />} />
        <Route path="/legal" element={<Legal />} />
      </Routes>

      {/* MODALS */}
      {showAddListingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-2xl animate-in zoom-in-95 duration-200">
            <AddListing
              user={user}
              onClose={() => setShowAddListingModal(false)}
              onListingAdded={() => console.log("Listing text saved. Uploading images now...")}
              onComplete={() => { setShowAddListingModal(false); window.location.reload(); }}
            />
          </div>
        </div>
      )}

      {showAvatarModal && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-orange-50 px-6 py-5 border-b border-orange-100 flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2"><UserCircle className="h-6 w-6 text-orange-600" /> Choose Avatar</h2>
              <button onClick={() => !isUpdatingAvatar && setShowAvatarModal(false)} className="p-2 bg-white hover:bg-gray-100 text-gray-500 rounded-full"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-sm text-gray-500 mb-6 text-center font-medium">Pick a profile picture to represent you in the community.</p>
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {PREDEFINED_AVATARS.map((avatar, idx) => {
                  const isSelected = currentAvatar === avatar;
                  return (
                    <button key={idx} disabled={isUpdatingAvatar} onClick={() => handleUpdateAvatar(avatar)} className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-200 disabled:opacity-50 ${isSelected ? 'border-orange-500 shadow-md scale-105 z-10' : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'}`}>
                      <img src={avatar} alt={`Avatar option`} className="w-full h-full object-cover p-1" />
                      {isSelected && <div className="absolute inset-0 bg-black/10 flex items-center justify-center"><div className="bg-orange-500 rounded-full p-0.5 shadow-sm"><CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></div></div>}
                    </button>
                  );
                })}
              </div>
              {isUpdatingAvatar && <div className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-orange-600 bg-orange-50 py-3 rounded-xl animate-pulse"><Loader2 className="h-4 w-4 sm:h-5 w-5 animate-spin" /> Saving your avatar...</div>}
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setShowAuthModal(false);
                localStorage.removeItem('gansetu_pending_chat');
                localStorage.removeItem('gansetu_pending_favorite');
                localStorage.removeItem('gansetu_pending_sell');
              }} 
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>
            <GanSetuAuth onLoginSuccess={(loggedInUser) => { setUser(loggedInUser); setShowAuthModal(false); }} />
          </div>
        </div>
      )}

      {showEditProfile && (
        <EditProfileModal user={user} onClose={() => setShowEditProfile(false)} onProfileUpdated={() => window.location.reload()} />
      )}

      {/* CHAT WIDGETS */}
      {user && !showInbox && !activeChatUser && (
        <button
          onClick={async () => {
            setShowInbox(true);
            setHasUnreadMessages(false);
            await supabase.from('messages').update({ is_read: true }).eq('receiver_id', user.id);
          }}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 bg-orange-600 text-white p-4 sm:p-5 rounded-full shadow-2xl hover:bg-orange-700 hover:-translate-y-1 transition-all group animate-in fade-in slide-in-from-bottom-10 duration-500"
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform" />
          {hasUnreadMessages && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-orange-600"></span>
            </span>
          )}
        </button>
      )}

      {activeChatUser && user && (
        <ChatBox
          currentUser={user}
          otherUser={activeChatUser}
          onClose={() => setActiveChatUser(null)}
        />
      )}
      {showInbox && user && <MessageInbox user={user} onClose={() => setShowInbox(false)} onOpenChat={(partner) => { setShowInbox(false); setActiveChatUser(partner); }} />}

      <Footer />
    </div>
  );
}

export default App;