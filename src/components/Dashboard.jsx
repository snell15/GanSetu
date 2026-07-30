import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Package, PlusCircle, Trash2, Edit, ExternalLink, X, Save, Eye } from 'lucide-react';

export default function Dashboard({ user, onSellClick }) {
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the Edit Modal
  const [editingListing, setEditingListing] = useState(null);
  const [editFormData, setEditFormData] = useState({ price: '', status: 'active' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/');
      return;
    }

    const fetchMyListings = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            id, 
            title, 
            price, 
            status, 
            created_at,
            listing_images (image_url, is_primary)
          `)
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }
        
        setMyListings(data || []);
      } catch (err) {
        console.error("Error fetching dashboard listings:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [user, navigate]);

  const handleDelete = async (id, title) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`);
    
    if (!isConfirmed) {
      return;
    }

    try {
      // 1. Delete associated images from storage bucket
      const { data: images } = await supabase
        .from('listing_images')
        .select('image_url')
        .eq('listing_id', id);
        
      if (images && images.length > 0) {
        for (const img of images) {
          const filePath = img.image_url.split('/decorations/')[1];
          if (filePath) {
            await supabase.storage.from('decorations').remove([filePath]);
          }
        }
      }

      // 2. Delete the actual listing from the database
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }

      // 3. Remove the deleted item from the UI state
      setMyListings(prevListings => prevListings.filter(listing => listing.id !== id));
      
    } catch (err) {
      alert("Failed to delete listing: " + err.message);
    }
  };

  const openEditModal = (listing) => {
    setEditingListing(listing);
    setEditFormData({ price: listing.price, status: listing.status });
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('listings')
        .update({ price: editFormData.price, status: editFormData.status })
        .eq('id', editingListing.id)
        .eq('seller_id', user.id);

      if (error) throw error;

      setMyListings(prev => prev.map(item => 
        item.id === editingListing.id 
          ? { ...item, price: editFormData.price, status: editFormData.status } 
          : item
      ));
      
      setEditingListing(null);
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-4" />
        <p className="font-medium">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Dashboard Header with NEW View Profile Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            My Dashboard
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Manage your decorations and active listings
          </p>
        </div>
      </div>

      {/* Empty State vs Table View */}
      {myListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 flex flex-col items-center text-center shadow-sm">
          <div className="bg-orange-50 h-20 w-20 rounded-full flex items-center justify-center mb-4">
            <Package className="h-10 w-10 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No active listings
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm">
            You haven't listed any decorations for sale yet. Start selling to clear out space and earn money!
          </p>
          <button 
            onClick={onSellClick} 
            className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-700 transition shadow-md flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" /> 
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold">Item</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Listed On</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myListings.map(listing => {
                  const primaryImage = listing.listing_images?.find(img => img.is_primary)?.image_url 
                                    || listing.listing_images?.[0]?.image_url 
                                    || 'https://placehold.co/100x100/ea580c/white';
                  
                  const formattedDate = new Date(listing.created_at).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  });
                  
                  const isActive = listing.status === 'active';

                  return (
                    <tr key={listing.id} className={`hover:bg-gray-50/50 transition-colors group ${!isActive ? 'opacity-60' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            <img 
                              src={primaryImage} 
                              alt={listing.title} 
                              className="h-full w-full object-cover" 
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">
                              {listing.title}
                            </p>
                            <Link 
                              to={`/listing/${listing.id}`} 
                              className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 mt-0.5"
                            >
                              View Listing <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">
                        ₹{listing.price}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500 font-medium">
                        {formattedDate}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(listing)}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit Listing"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(listing.id, listing.title)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Listing"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK EDIT MODAL */}
      {editingListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-gray-900">Quick Edit</h2>
              <button onClick={() => setEditingListing(null)} className="p-1 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateListing} className="p-6 space-y-5">
              <div>
                <p className="text-sm font-bold text-gray-500 mb-1 truncate">{editingListing.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="0" 
                  value={editFormData.price} 
                  onChange={e => setEditFormData({...editFormData, price: e.target.value})} 
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm font-semibold" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select 
                  value={editFormData.status} 
                  onChange={e => setEditFormData({...editFormData, status: e.target.value})} 
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm font-semibold"
                >
                  <option value="active">Active (For Sale)</option>
                  <option value="sold">Sold</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}