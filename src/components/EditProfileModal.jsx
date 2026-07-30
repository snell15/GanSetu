import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, Save, User, MapPin, Map } from 'lucide-react';

// 1. ADDED THE UNIFIED CITIES ARRAY
const CITIES = [
  'Pune', 'Mumbai', 'Pimpri-Chinchwad', 'Thane', 'Nashik', 
  'Nagpur', 'Navi Mumbai', 'Kalyan-Dombivli', 'Other'
];

export default function EditProfileModal({ user, onClose, onProfileUpdated }) {
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch their current info when the modal opens
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, city, area')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setFullName(data.full_name || '');
        setCity(data.city || '');
        setArea(data.area || '');
      }
      setFetching(false);
    };
    fetchCurrentProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        city: city,
        area: area 
      })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } else {
      onProfileUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {fetching ? (
          <div className="p-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            
            {/* FULL NAME */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow bg-gray-50 focus:bg-white text-gray-900"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* 2. UPDATED CITY DROPDOWN TO USE THE ARRAY */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">City</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow bg-gray-50 focus:bg-white text-gray-900 appearance-none"
                >
                  <option value="" disabled>Select your city</option>
                  
                  {/* Loop through our unified CITIES array */}
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* AREA INPUT */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Local Area</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Map className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow bg-gray-50 focus:bg-white text-gray-900"
                  placeholder="e.g., Ravet, Baner, Viman Nagar"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}