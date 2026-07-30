import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Star, Quote, Camera, MessageSquare, CheckCircle2, X, Loader2 } from 'lucide-react';

export default function ReadAbhipray({ user, onRequireAuth }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Fetch real reviews from Supabase
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id, rating, content, image_url, created_at,
          profiles (full_name, city, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleWriteReview = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setShowReviewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert([{
        user_id: user.id,
        rating: rating,
        content: reviewText.trim()
        // Note: Image upload logic would go here in the future
      }]);

      if (error) throw error;

      // Show success screen
      setReviewSubmitted(true);
      
      // Refresh the list to show the new review
      fetchReviews();

      // Reset and close after 2 seconds
      setTimeout(() => {
        setReviewSubmitted(false);
        setShowReviewModal(false);
        setReviewText('');
        setRating(5);
      }, 2000);

    } catch (err) {
      alert("Failed to submit review: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate Average Rating dynamically
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : '5.0';

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 to-amber-600 py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-yellow-300 blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Community <span className="text-yellow-300">Abhipray</span>
          </h1>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto font-medium mb-8">
            See how the GanSetu family is celebrating sustainably. Read stories from our buyers and sellers, and share your own eco-friendly Ganeshotsav experience!
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 bg-white/10 backdrop-blur-md rounded-3xl p-6 w-fit mx-auto border border-white/20">
            <div className="text-center">
              <p className="text-3xl font-black text-white">{avgRating}</p>
              <div className="flex items-center justify-center text-yellow-300 my-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-xs text-orange-100 uppercase tracking-wider font-bold">Average Rating</p>
            </div>
            <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
            <div className="text-center">
              <p className="text-3xl font-black text-white">{reviews.length > 0 ? `${reviews.length}+` : '0'}</p>
              <p className="text-xs text-orange-100 uppercase tracking-wider font-bold mt-2">Verified Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Recent Experiences</h2>
          <button 
            onClick={handleWriteReview}
            className="hidden sm:flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-sm"
          >
            <MessageSquare className="h-5 w-5" /> Write a Review
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-4" />
            <p className="font-medium">Loading community stories...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center shadow-sm">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Be the first to leave an Abhipray!</h3>
            <p className="text-gray-500 mb-6">Share your experience and help others shop sustainably.</p>
            <button onClick={handleWriteReview} className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-700 transition-colors">
              Write a Review
            </button>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {reviews.map((review) => {
              const reviewerName = review.profiles?.full_name || 'GanSetu Member';
              const reviewerCity = review.profiles?.city || 'Maharashtra';
              const reviewDate = new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

              return (
                <div key={review.id} className="break-inside-avoid bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {review.image_url && (
                    <div className="w-full h-48 sm:h-64 bg-gray-100 overflow-hidden">
                      <img src={review.image_url} alt="Setup" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-1 text-orange-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <Quote className="h-6 w-6 text-gray-200" />
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-6 italic">"{review.content}"</p>
                    
                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm overflow-hidden border border-orange-200">
                          {review.profiles?.avatar_url ? (
                            <img src={review.profiles.avatar_url} alt={reviewerName} className="h-full w-full object-cover" />
                          ) : (
                            reviewerName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{reviewerName}</p>
                          <p className="text-xs text-gray-500">{reviewerCity} • {reviewDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mobile Sticky Button */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-40">
        <button 
          onClick={handleWriteReview}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg"
        >
          <MessageSquare className="h-5 w-5" /> Share Your Experience
        </button>
      </div>

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {reviewSubmitted ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-500">Your Abhipray has been submitted and is now visible on the community board.</p>
              </div>
            ) : (
              <>
                <div className="bg-orange-50 px-6 py-5 border-b border-orange-100 flex justify-between items-center">
                  <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                    Write an Abhipray
                  </h2>
                  <button onClick={() => !isSubmitting && setShowReviewModal(false)} className="p-2 bg-white hover:bg-gray-100 text-gray-500 rounded-full transition-colors shadow-sm">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Rate your experience</label>
                    <div className="flex gap-2 text-gray-300">
                      {[1,2,3,4,5].map(i => (
                        <Star 
                          key={i} 
                          onClick={() => setRating(i)}
                          className={`h-8 w-8 cursor-pointer transition-colors ${rating >= i ? 'text-orange-400 fill-orange-400' : 'hover:text-orange-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Share your story</label>
                    <textarea 
                      required
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="How was the quality? Was the seller helpful? Let the community know..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50 min-h-[120px] text-sm"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Add a photo (Coming Soon)</label>
                    <button type="button" disabled className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-not-allowed opacity-70">
                      <Camera className="h-8 w-8 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Image uploads currently disabled</span>
                    </button>
                  </div>
                  <button type="submit" disabled={isSubmitting || !reviewText.trim()} className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm text-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                    {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</> : 'Submit Review'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}