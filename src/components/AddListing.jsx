import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, Camera, X, UploadCloud, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Makar / Singhasan', 
  'Mandap / Temple', 
  'Backdrop / Background', 
  'Lighting & Electronics', 
  'Floral & Torans', 
  'Complete Setup', 
  'Pooja Accessories', 
  'Other'
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const CITIES = ['Pune', 'Mumbai', 'Pimpri-Chinchwad', 'Thane', 'Nashik', 'Nagpur', 'Navi Mumbai', 'Kalyan-Dombivli', 'Other'];

const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })), 'image/jpeg', quality);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function AddListing({ user, onClose, onComplete, onListingAdded }) {
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: CATEGORIES[0], condition: CONDITIONS[0],
    city: user?.user_metadata?.city || CITIES[0], location: user?.user_metadata?.area || '',
    delivery_available: false, dimensions: '', max_idol_size: ''
  });

  const [customCategory, setCustomCategory] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 2) return alert("Maximum of 2 images allowed.");
    for (const file of files) {
      try {
        const compressedFile = await compressImage(file);
        setImages(prev => prev.length >= 2 ? prev : [...prev, { file: compressedFile, preview: URL.createObjectURL(compressedFile) }]);
      } catch (err) {
        console.error("Compression error:", err);
      }
    }
  };

  const removeImage = (index) => setImages(images.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return setError("Please add at least 1 image.");

    setIsSubmitting(true);
    setError(null);
    const finalCategory = formData.category === 'Other' ? (customCategory || 'Other') : formData.category;

    try {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert([{ ...formData, category: finalCategory, seller_id: user.id, status: 'active' }])
        .select()
        .single();
        
      if (listingError) throw listingError;
      onListingAdded();

      for (let i = 0; i < images.length; i++) {
        const { file } = images[i];
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${listing.id}_${i}_${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('decorations').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('decorations').getPublicUrl(filePath);
        await supabase.from('listing_images').insert([{ listing_id: listing.id, image_url: publicUrl, is_primary: i === 0 }]);
      }
      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
        <h2 className="text-xl font-extrabold text-gray-900">Sell Decoration</h2>
        <button type="button" onClick={onClose} className="p-2 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full transition-colors"><X className="h-5 w-5" /></button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm font-semibold"><AlertCircle className="h-4 w-4" />{error}</div>}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Photos (Max 2) <span className="text-orange-500">*</span></label>
          <div className="flex flex-wrap gap-4">
            {images.map((img, i) => (
              <div key={i} className="relative h-28 w-28 rounded-xl border border-gray-200 overflow-hidden group">
                <img src={img.preview} alt="Preview" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-4 w-4" /></button>
              </div>
            ))}
            {images.length < 2 && (
              <label className="h-28 w-28 border-2 border-dashed border-orange-200 rounded-xl flex flex-col items-center justify-center text-orange-500 hover:bg-orange-50 cursor-pointer">
                <Camera className="h-6 w-6 mb-1" />
                <span className="text-xs font-bold">Add Photo</span>
                <input type="file" multiple accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {formData.category === 'Other' && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <input type="text" required placeholder="Please specify..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-orange-300 bg-orange-50 text-sm" />
              </div>
            )}
          </div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Condition</label><select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm">{CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Title <span className="text-orange-500">*</span></label><input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm" /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Price (₹) <span className="text-orange-500">*</span></label><input type="number" required min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm" /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">City</label><select value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm">{CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Area / Location</label><input type="text" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm" /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Setup Dimensions</label><input type="text" value={formData.dimensions} onChange={e => setFormData({ ...formData, dimensions: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm" /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Fits Idol Size</label><input type="text" value={formData.max_idol_size} onChange={e => setFormData({ ...formData, max_idol_size: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm" /></div>
        </div>

        <div><label className="block text-sm font-bold text-gray-700 mb-1">Description</label><textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none" /></div>

        <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-orange-50"><input type="checkbox" checked={formData.delivery_available} onChange={e => setFormData({ ...formData, delivery_available: e.target.checked })} className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4" /><span className="text-sm font-bold text-gray-700">I can arrange shipping/delivery (Buyer pays)</span></label>

        <button type="submit" disabled={isSubmitting} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 mt-4">{isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><UploadCloud className="h-5 w-5" /> Publish Listing</>}</button>
      </form>
    </div>
  );
}