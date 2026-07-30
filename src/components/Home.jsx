import { useState, useEffect } from 'react';
import { Loader2, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import ListingCard from '../components/ListingCard';
import HomepageReviews from '../components/HomepageReviews';

const CATEGORIES = [
  'All', 
  'Makar / Singhasan', 
  'Mandap / Temple', 
  'Backdrop / Background', 
  'Lighting & Electronics', 
  'Floral & Torans', 
  'Complete Setup', 
  'Pooja Accessories', 
  'Other'
];
const ITEMS_PER_PAGE = 9;

export default function Home({ user, favorites, onToggleFavorite, onRequireAuth, onOpenChat }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const fetchListings = async (pageNumber = 1) => {
    setLoadingListings(true);
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          profiles (id, full_name, city, area),
          listing_images (image_url, is_primary)
        `, { count: 'exact' })
        .eq('status', 'active');

      if (activeCategory === 'Other') {
        // 1. Define all our standard categories
        const mainCategories = [
          'Makar / Singhasan', 
          'Mandap / Temple', 
          'Backdrop / Background', 
          'Lighting & Electronics', 
          'Floral & Torans', 
          'Complete Setup', 
          'Pooja Accessories'
        ];
        
        // 2. Format them so Supabase understands the list
        const formattedList = `(${mainCategories.map(cat => `"${cat}"`).join(',')})`;
        
        // 3. Ask Supabase for anything that is NOT in that list!
        query = query.not('category', 'in', formattedList);
        
      } else if (activeCategory !== 'All') {
        // Normal behavior for standard categories
        query = query.ilike('category', activeCategory);
      }

      const from = (pageNumber - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      setListings(data || []);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error('Error fetching listings:', err.message);
      setListings([]);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchListings(1);
  }, [activeCategory]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchListings(newPage);
    
    const feedElement = document.getElementById('marketplace-feed');
    if (feedElement) {
      const y = feedElement.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-orange-50 to-amber-100 pt-8 sm:pt-12 pb-6 px-4 border-b border-orange-100 relative z-30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4 leading-tight tracking-tight">
            उत्सव भक्तीचा, <span className="text-orange-600">सन्मान निसर्गाचा.</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-2xl mx-auto font-medium px-2">
            India's sustainable marketplace for pre-loved Ganeshotsav makhars, lighting, and decor.
          </p>
        </div>
      </div>

      <main id="marketplace-feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* LEFT SIDEBAR: CATEGORIES */}
          <div className="w-full md:w-64 shrink-0">
            <div className="md:sticky md:top-24">
              <h3 className="text-lg font-extrabold text-gray-900 mb-4 hidden md:block">Categories</h3>
              <div className="flex overflow-x-auto md:flex-col gap-2 md:gap-1.5 pb-2 md:pb-0 hide-scrollbar pr-4 md:pr-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap md:whitespace-normal text-left px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border md:border-none ${
                      activeCategory === category 
                        ? 'bg-gray-900 md:bg-orange-50 text-white md:text-orange-700 border-gray-900 shadow-md md:shadow-none' 
                        : 'bg-white md:bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50 md:hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
                <div className="w-1 shrink-0 md:hidden"></div>
              </div>
            </div>
          </div>

          {/* RIGHT AREA: MARKETPLACE FEED */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-gray-100 gap-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeCategory === 'All' ? 'All Decorations' : activeCategory}
              </h2>
              {!loadingListings && totalItems > 0 && (
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Showing {listings.length} of {totalItems} items
                </div>
              )}
            </div>

            {loadingListings ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-4" />
                <p className="font-medium">Loading divine decorations...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 p-8 text-center shadow-sm">
                <Inbox className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-xl font-bold text-gray-900">No decorations found</p>
                <p className="text-gray-500 mt-2 max-w-sm mx-auto">Try selecting a different category to find a match.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {listings.map(item => (
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

                {totalPages > 1 && (
                  <div className="mt-12 sm:mt-16 flex items-center justify-center gap-2 sm:gap-3">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-50 transition-colors shadow-sm"><ChevronLeft className="h-5 w-5" /></button>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-1 sm:px-2">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl font-bold text-sm sm:text-base transition-all shadow-sm ${currentPage === pageNum ? 'bg-orange-600 text-white border-orange-600 ring-2 ring-orange-200 scale-110' : 'bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'}`}>
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-50 transition-colors shadow-sm"><ChevronRight className="h-5 w-5" /></button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <HomepageReviews />
      </main>
    </>
  );
}