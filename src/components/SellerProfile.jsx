import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2, ArrowLeft, MapPin, Calendar, Package, MessageCircle, Eye } from 'lucide-react';

import ListingCard from './ListingCard';

export default function SellerProfile({ user, favorites, onToggleFavorite, onRequireAuth, onOpenChat }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [sellerListings, setSellerListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);

        if (!id) throw new Error("No ID provided in the URL!");

        // STEP 1: FETCH THE PROFILE ONLY
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;
        setSeller(profileData);

        // STEP 2: FETCH THE LISTINGS
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select(`
            id, title, description, price, category, condition, status, city, location, 
            delivery_available, dimensions, max_idol_size, created_at, seller_id,
            profiles (id, full_name, avatar_url, city, area),
            listing_images (image_url, is_primary)
          `)
          .eq('seller_id', id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (listingsError) {
          console.error("LISTINGS FETCH FAILED:", listingsError);
          setSellerListings([]);
        } else {
          setSellerListings(listingsData || []);
        }

      } catch (err) {
        setError("We couldn't find this seller's profile. They may have deactivated their account.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSellerData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-4" />
        <p className="font-medium">Loading seller profile...</p>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-orange-600 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const joinDate = seller.created_at ? new Date(seller.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently';
  const isOwnProfile = user?.id === seller.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 md:mb-0">
      {/* Top Navigation */}
      <button
        onClick={() => {
          if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }}
        className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-semibold mb-6 transition-colors w-fit text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Seller Identity Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-10">
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-orange-50 overflow-hidden border-4 border-orange-100 flex-shrink-0 shadow-sm">
            <img
              src={seller.avatar_url || '/ganesha-avatar.png'}
              alt={seller.full_name}
              className="h-full w-full object-cover p-1 rounded-full"
              onError={(e) => { e.target.src = '/ganesha-avatar.png'; }}
            />
          </div>

          <div className="flex-1 flex flex-col justify-center pt-1">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{seller.full_name || 'GanSetu Member'}</h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm font-medium text-gray-600 mb-4">
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar className="h-4 w-4 text-orange-500" /> Joined {joinDate}
              </span>
              {(seller.city || seller.location) && (
                <div className="flex items-center gap-1.5 text-gray-500 mt-1.5 bg-gray-100 px-3 py-1 rounded-full w-fit">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold">
                    {seller?.area ? `${seller.area}, ` : ''}
                    {seller?.city || 'Location not specified'}
                  </span>
                </div>
              )}
            </div>

            {/* FIXED: Cleaned up conditional logic for the header button */}
            <div className="mt-2 flex justify-center sm:justify-start">
              {isOwnProfile ? (
                <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-5 py-2.5 rounded-xl border border-orange-100 font-bold text-sm shadow-sm">
                  <Eye className="h-5 w-5" /> This is how buyers see your profile
                </div>
              ) : (
                <button
                  onClick={() => onOpenChat(seller)}
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold text-base px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-200 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat in GanSetu
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seller's Catalog */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          {isOwnProfile ? 'Your Active Listings' : 'Active Listings'}
          <span className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">{sellerListings.length}</span>
        </h2>

        {sellerListings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center shadow-sm">
            <div className="bg-orange-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No active listings</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {isOwnProfile
                ? "You don't have any decorations currently available for sale. Head to your dashboard to add one!"
                : "This seller doesn't have any decorations currently available for sale. Check back later!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {sellerListings.map(item => (
              <ListingCard
                key={item.id}
                item={item}
                user={user}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
                onRequireAuth={onRequireAuth}
                onOpenChat={onOpenChat} /* <- IMPORTANT: Passing the chat function down! */
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}