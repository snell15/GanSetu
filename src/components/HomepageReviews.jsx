import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Quote, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomepageReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchRecentReviews = async () => {
      const { data, error } = await supabase
        .from('abhipray')
        .select(`
          id, rating, message, created_at,
          profiles (full_name, city)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setReviews(data);
      }
    };
    fetchRecentReviews();
  }, []);

  return (
    <section className="bg-gradient-to-b from-white to-orange-50 py-12 sm:py-16 border-t border-gray-100 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            समुदायाचे <span className="text-orange-600">प्रेम</span>
          </h2>
          <p className="text-gray-600 font-medium max-w-xl mx-auto">
            See what the GanSetu family is saying about their sustainable Ganeshotsav experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {reviews.length > 0 ? (
            reviews.map((review, index) => {
              const reviewerName = review.profiles?.full_name || 'GanSetu Member';
              const reviewerCity = review.profiles?.city || 'Maharashtra';

              return (
                <div key={review.id} className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative hover:shadow-md transition-shadow ${index === 1 ? 'hidden sm:block' : index === 2 ? 'hidden lg:block' : ''}`}>
                  <Quote className="absolute top-4 right-4 h-10 w-10 text-orange-50" />
                  <div className="flex text-orange-400 mb-3 relative z-10">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm mb-5 relative z-10 leading-relaxed italic line-clamp-4">
                    "{review.message}"
                  </p>
                  <div className="flex items-center gap-3 border-t border-gray-50 pt-4 mt-auto">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs uppercase">
                      {reviewerName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs">{reviewerName}</div>
                      <div className="text-[10px] text-gray-500">{reviewerCity}</div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>No community reviews yet. Be the first to leave an Abhipray!</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link to="/abhipray" className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-800 px-6 py-3 rounded-full font-bold hover:border-orange-500 hover:text-orange-600 transition-colors shadow-sm text-sm">
            Read All Abhipray <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}