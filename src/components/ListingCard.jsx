import { Link } from 'react-router-dom';
import { MapPin, Heart, MessageCircle } from 'lucide-react';

export default function ListingCard({ item, user, favorites, onToggleFavorite, onRequireAuth, onOpenChat }) {
  const isFavorited = favorites?.includes(item.id);
  const primaryImage = item.listing_images?.find(img => img.is_primary)?.image_url
    || item.listing_images?.[0]?.image_url
    || '/placeholder-image.jpg'; // Fallback image

  // Check if the logged-in user is the owner of this specific item
  const isOwner = user?.id === item.seller_id;

  // The gatekeeper for the chat button
  const handleChatClick = (e) => {
    e.preventDefault(); // Stop the link from navigating to the details page!
    
    if (!user) {
      onRequireAuth();
    } else if (!isOwner) {
      // IMPORTANT: Pass the seller's profile data to the chat function!
      if (onOpenChat && item.profiles) {
        onOpenChat(item.profiles);
      }
    }
  };
  
  return (
    <Link to={`/listing/${item.id}`} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative h-full">

      {/* Favorite Button */}
      <button
        onClick={(e) => onToggleFavorite(e, item.id)}
        className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/80 backdrop-blur-md hover:bg-white transition-colors shadow-sm"
      >
        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
      </button>

      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50 relative">
        <img
          src={primaryImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
          <span className="text-orange-600">₹</span> {item.price.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-orange-600 transition-colors">
            {item.title}
          </h3>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          
          {/* Location Badge - Now prioritizes the Profile's true city! */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate max-w-[50%]">
            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="truncate">
              {item.profiles?.area ? `${item.profiles.area}, ` : ''}
              {item.profiles?.city || item.city || 'Location not specified'}
            </span>
          </div>

          {/* SMART BUTTON LOGIC */}
          {isOwner ? (
            <button
              onClick={(e) => e.preventDefault()} // Stops link navigation if they click the disabled button
              disabled
              className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-400 rounded-full text-[11px] font-bold cursor-not-allowed border border-gray-200"
            >
              Your Listing
            </button>
          ) : (
            <button
              onClick={handleChatClick}
              className="flex items-center gap-1.5 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm shrink-0"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat with Seller
            </button>
          )}
          
        </div>
      </div>
    </Link>
  );
}