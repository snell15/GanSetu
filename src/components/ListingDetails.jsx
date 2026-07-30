import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
// ADDED the 'Maximize' icon for the Idol Size badge
import { MessageCircle, MapPin, Ruler, Truck, Info, ArrowLeft, Image as ImageIcon, Maximize } from 'lucide-react';

export default function ListingDetails({ user, onOpenChat }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            profiles (id, full_name, avatar_url, city, area),
            listing_images (image_url, is_primary)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        setListing(data);
        const primary = data.listing_images?.find(img => img.is_primary)?.image_url;
        setActiveImage(primary || data.listing_images?.[0]?.image_url);
      } catch (err) {
        console.error("Error fetching listing:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center px-4">
        <h2 className="text-xl font-bold text-gray-800">Decoration Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-orange-600 font-bold hover:underline">
          &larr; Back to Home
        </button>
      </div>
    );
  }

  // LOGIC CHECK: Is the person viewing this page the owner of the listing?
  const isOwner = user?.id === listing.seller_id;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        <button
          onClick={() => {
            // Check if there is a previous page in the React Router history
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate('/'); // Failsafe: Send them to the marketplace!
            }
          }}
          className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-4 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">

          {/* ========================================== */}
          {/* LEFT COLUMN: IMAGE GALLERY                 */}
          {/* ========================================== */}
          <div className="w-full md:w-1/2 p-4 md:border-r border-gray-100 flex flex-col">
            <div className="h-[300px] sm:h-[400px] w-full rounded-xl bg-gray-100 overflow-hidden relative shrink-0">
              {activeImage ? (
                <img src={activeImage} alt={listing.title} className="w-full h-full object-contain bg-black/5" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                </div>
              )}
            </div>

            {listing.listing_images?.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 custom-scrollbar">
                {listing.listing_images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img.image_url)}
                    className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img.image_url ? 'border-orange-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={img.image_url} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN: ACTION & DETAILS             */}
          {/* ========================================== */}
          <div className="w-full md:w-1/2 p-5 sm:p-6 flex flex-col">

            <div className="mb-5">
              <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                {listing.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight mb-1">
                {listing.title}
              </h1>
              <p className="text-2xl font-black text-orange-600">
                ₹{listing.price.toLocaleString('en-IN')}
              </p>
            </div>

            {/* EXPANDED SPECS GRID: Now accommodates 5 items neatly */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-0.5">
                <Info className="h-4 w-4 text-gray-400 mb-0.5" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Condition</span>
                <span className="font-semibold text-gray-900 text-sm capitalize">{listing.condition}</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-0.5">
                <Ruler className="h-4 w-4 text-gray-400 mb-0.5" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Decor Size</span>
                <span className="font-semibold text-gray-900 text-sm truncate">{listing.dimensions || 'N/A'}</span>
              </div>

              {/* NEW: Max Idol Size Badge */}
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-0.5">
                <Maximize className="h-4 w-4 text-gray-400 mb-0.5" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Idol Fit</span>
                <span className="font-semibold text-gray-900 text-sm truncate">{listing.max_idol_size || 'N/A'}</span>
              </div>

              {/* UPDATED: Location Badge now includes Area */}
              <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-0.5 md:col-span-2">
                <MapPin className="h-4 w-4 text-gray-400 mb-0.5" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Location</span>
                <span className="font-semibold text-gray-900 text-sm truncate">
                  {listing.profiles?.area ? `${listing.profiles.area}, ` : ''}
                  {listing.profiles?.city || listing.profiles.city || 'Location not specified'}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl flex flex-col gap-0.5">
                <Truck className="h-4 w-4 text-gray-400 mb-0.5" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Delivery</span>
                <span className="font-semibold text-gray-900 text-sm">{listing.delivery_available ? 'Yes' : 'Pickup'}</span>
              </div>
            </div>

            <div className="mb-auto">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap line-clamp-4 hover:line-clamp-none transition-all">
                {listing.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-4 cursor-pointer group" onClick={() => navigate(`/seller/${listing.seller_id}`)}>
                <img
                  src={listing.profiles?.avatar_url || '/ganesha-avatar.png'}
                  alt="Seller"
                  className="h-10 w-10 rounded-full object-cover border border-gray-200 group-hover:border-orange-500 transition-colors"
                  onError={(e) => { e.target.src = '/ganesha-avatar.png'; }}
                />
                <div>
                  <p className="text-xs text-gray-500 font-medium leading-none mb-1">Sold by</p>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-none">
                    {listing.profiles?.full_name || 'GanSetu Member'}
                  </p>
                </div>
              </div>

              {/* NEW SMART BUTTON LOGIC */}
              {isOwner ? (
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-500 font-bold text-base py-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200"
                >
                  This is your listing
                </button>
              ) : (
                <button
                  onClick={() => onOpenChat(listing.profiles)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-base py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-200 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat with Seller
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}