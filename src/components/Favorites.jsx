import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Heart, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ListingCard from './ListingCard'; // Reusing your beautiful feed card!

export default function Favorites({ 
  user, 
  favorites, 
  onToggleFavorite, 
  onRequireAuth, 
  onOpenChat 
}) {
  const [favoriteListings, setFavoriteListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteDetails = async () => {
      // If no user is logged in, or they have no favorites, stop loading immediately
      if (!user || favorites.length === 0) {
        setFavoriteListings([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // THE MAGIC QUERY: "Fetch listings where the ID is IN my favorites array"
        const { data, error } = await supabase
          .from('listings')
          .select(`
            id, title, description, price, category, condition, status, city, location, delivery_available, dimensions, max_idol_size, created_at,
            profiles (id, full_name, city),
            listing_images (image_url, is_primary)
          `)
          .in('id', favorites)
          .eq('status', 'active'); // Only show them if they haven't been deleted/sold

        if (error) throw error;
        
        setFavoriteListings(data || []);
      } catch (err) {
        console.error("Error fetching favorite listings:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteDetails();
  }, [favorites, user]); // Re-run this if their favorites array changes

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Save your favorites</h2>
        <p className="text-gray-500 mb-6">Log in to save decorations you love and view them later.</p>
        <button 
          onClick={onRequireAuth}
          className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-orange-700 transition-colors"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
        <div className="bg-red-50 p-3 rounded-full text-red-500">
          <Heart className="h-6 w-6 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Your Saved Decorations</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Keep track of the items you love.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-4" />
          <p className="font-medium">Loading your favorites...</p>
        </div>
      ) : favoriteListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 p-8 text-center shadow-sm">
          <Heart className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-xl font-bold text-gray-900">No favorites yet</p>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto mb-6">
            When you see a decoration you like, click the heart icon to save it here!
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-sm">
            Explore Marketplace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {favoriteListings.map(item => (
            <ListingCard 
              key={item.id} 
              item={item} 
              user={user}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              onRequireAuth={onRequireAuth}
              onOpenChat={() => onOpenChat({ id: item.profiles.id, name: item.profiles.full_name })}
            />
          ))}
        </div>
      )}
    </div>
  );
}