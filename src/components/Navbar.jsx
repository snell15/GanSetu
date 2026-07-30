import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, PlusCircle, UserCircle, Eye, LogOut, Star, MapPin, LayoutDashboard, Menu, X, Home, HelpCircle, Shield } from 'lucide-react';

export default function Navbar({
  user,
  currentAvatar,
  onLoginClick,
  onSellClick,
  onChangeAvatar,
  onLogout,
  onEditProfile
}) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center">

          {/* LEFT SIDE: HAMBURGER MENU & LOGO */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-orange-600 transition-colors p-1 rounded-lg hover:bg-orange-50 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>

            <Link to="/" className="flex items-center transition-transform hover:scale-105 shrink-0" onClick={() => setIsMenuOpen(false)}>
              <img src="/gansetu-logo.png" alt="GanSetu Logo" className="h-14 sm:h-16 md:h-20 w-auto object-contain" />
            </Link>
          </div>

          {/* RIGHT SIDE: SELL BUTTON & PROFILE */}
          <div className="flex items-center gap-3 sm:gap-5">

            {/* MOBILE CTA: Icon only. Visible on phones, hidden on desktop */}
            <button
              onClick={onSellClick}
              className="sm:hidden flex items-center justify-center p-2 text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
              title="Sell Decoration"
            >
              <PlusCircle className="h-6 w-6" />
            </button>

            {/* DESKTOP CTA: Full text + Icon. Hidden on phones, visible on tablets/desktops */}
            <button
              onClick={onSellClick}
              className="hidden sm:flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-full font-bold shadow-sm hover:shadow hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Sell Decoration</span>
            </button>

            {user ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl border-2 border-orange-200 overflow-hidden hover:border-orange-500 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 bg-orange-50"
                >
                  <img
                    src={currentAvatar}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.src = '/ganesha-avatar.png'; }}
                  />
                </button>

                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                    <div className="absolute right-0 top-14 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1 bg-gray-50/50 rounded-t-2xl">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.user_metadata?.full_name || 'GanSetu Member'}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      </div>

                      <button onClick={() => { setShowProfileMenu(false); navigate(`/seller/${user.id}`); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-3">
                        <Eye className="h-4 w-4 text-gray-400" /> View Public Profile
                      </button>

                      <button onClick={() => { setShowProfileMenu(false); navigate('/dashboard'); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-3">
                        <LayoutDashboard className="h-4 w-4 text-gray-400" /> My Dashboard
                      </button>

                      {/* 🚨 NEW: Favorites moved to the Profile Menu */}
                      <button onClick={() => { setShowProfileMenu(false); navigate('/favorites'); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-3">
                        <Heart className="h-4 w-4 text-gray-400" /> My Favorites
                      </button>

                      <button onClick={() => { setShowProfileMenu(false); onEditProfile('/EditProfileModal'); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" /> Edit Profile Details
                      </button>
                      
                      <button onClick={() => { setShowProfileMenu(false); onChangeAvatar(); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center gap-3">
                        <UserCircle className="h-4 w-4 text-gray-400" /> Change Avatar
                      </button>

                      <button onClick={() => { setShowProfileMenu(false); onLogout(); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 mt-1 border-t border-gray-50">
                        <LogOut className="h-4 w-4 text-red-500" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button onClick={onLoginClick} className="text-gray-600 hover:text-orange-600 font-bold transition-colors text-sm sm:text-base px-2">
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* THE GLOBAL APP DRAWER (MOBILE NAV) */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 top-16 sm:top-20 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>

          <div className="absolute top-full left-0 w-[75vw] sm:w-64 bg-white border-t border-r border-gray-200 px-4 pt-4 pb-6 space-y-1 shadow-2xl rounded-br-3xl z-50 animate-in slide-in-from-left-8 fade-in duration-200">

            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-base font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors">
              <Home className="h-5 w-5 text-gray-400" /> Home
            </Link>

            <Link to="/abhipray" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-base font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors">
              <Star className="h-5 w-5 text-gray-400" /> Abhipray
            </Link>

            <div className="h-px bg-gray-100 my-4 mx-2"></div>

            {/* 🚨 NEW: Support and Legal added to the Hamburger Menu */}
            <Link to="/support" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-base font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors">
              <HelpCircle className="h-5 w-5 text-gray-400" /> Support & Help
            </Link>

            <Link to="/legal" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-base font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors">
              <Shield className="h-5 w-5 text-gray-400" /> About Us & Legal
            </Link>

          </div>
        </>
      )}
    </nav>
  );
}