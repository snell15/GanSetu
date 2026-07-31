import { useSearchParams } from 'react-router-dom';
import { Shield, FileText, Info, Leaf, Heart, Recycle, Mail } from 'lucide-react';

export default function Legal() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Default to the 'about' page so users see the vision first!
  const activePage = searchParams.get('page') || 'about';

  const lastUpdated = "July 16, 2026";

  return (
    <div className="min-h-screen bg-stone-50 py-8 sm:py-12 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toggle Buttons */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 border-b border-gray-200 pb-6">
          <button
            onClick={() => setSearchParams({ page: 'about' })}
            className={`flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full font-bold text-sm transition-colors ${
              activePage === 'about' 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Info className="h-4 w-4" /> About Us
          </button>
          <button
            onClick={() => setSearchParams({ page: 'privacy' })}
            className={`flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full font-bold text-sm transition-colors ${
              activePage === 'privacy' 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Shield className="h-4 w-4" /> Privacy Policy
          </button>
          <button
            onClick={() => setSearchParams({ page: 'terms' })}
            className={`flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full font-bold text-sm transition-colors ${
              activePage === 'terms' 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-4 w-4" /> Terms of Service
          </button>
        </div>

        {/* ABOUT US CONTENT */}
        {activePage === 'about' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-8 sm:p-12 md:p-16 rounded-3xl border border-orange-100 relative overflow-hidden mb-8 shadow-sm">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-orange-200/50 blur-3xl"></div>
              <div className="relative z-10 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                  About <span className="text-orange-600">GanSetu</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-medium leading-relaxed">
                  उत्सव भक्तीचा, सन्मान निसर्गाचा. <br className="hidden sm:block" />
                  We are India's first dedicated circular economy for Ganeshotsav decorations.
                </p>
              </div>
            </div>

            {/* Mission Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Eco-Conscious</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Every year, thousands of beautiful makhars and decorations are discarded. We extend their lifecycle, keeping non-biodegradable waste out of landfills.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We connect local devotees. Sellers recover costs on premium setups, while buyers get access to stunning, affordable decor for their beloved Bappa.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div className="mx-auto bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Recycle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Circular Economy</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Why buy new when you can buy pre-loved? We are building a sustainable bridge (Setu) between generations of Ganesha festivals.
                </p>
              </div>
            </div>

            {/* The Story */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 mb-8">
              <h2 className="font-bold text-gray-900 text-lg sm:text-xl text-center py-4">Our Story</h2>
              <div className="prose prose-orange max-w-3xl mx-auto text-gray-600 space-y-6 leading-relaxed text-sm sm:text-base">
                <p>
                  The vibrant festival of Ganeshotsav brings immense joy, devotion, and creativity to millions of homes across Maharashtra and India. Families spend days conceptualizing and building breathtakingly beautiful makhars (shrines), lighting setups, and floral backgrounds to welcome Bappa.
                </p>
                <p>
                  However, once the ten days of festivities conclude, a heartbreaking reality sets in. Many of these expensive, labor-intensive decorations—often made of thermocol, plastic, and heavy electronics—are discarded. Not only is this a tremendous waste of resources, but it also takes a heavy toll on our environment.
                </p>
                <p className="font-bold text-gray-900 text-lg sm:text-xl text-center py-4">
                  GanSetu
                </p>
                <p>
                  GanSetu was born out of a simple idea: <strong>What if one family's decoration this year could be another family's blessing next year?</strong>
                </p>
                <p>
                  By creating a hyper-local, secure marketplace, we empower devotees to buy, sell, and pass on their pre-loved decorations. Whether it is a grand wooden singhasan, intricate backdrop drapes, or specialized lighting, GanSetu ensures these items are reused and cherished, rather than thrown away.
                </p>
              </div>
            </div>

            {/* Contact Banner */}
            <div className="bg-gray-900 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-lg">
              <div className="relative z-10 flex flex-col items-center">
                <Mail className="h-10 w-10 text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Have a question?</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm sm:text-base">
                  Whether you need help with a listing, want to report an issue, or just want to say hi, our team is here for you.
                </p>
                <a 
                  href="mailto:gansetu.support@gmail.com" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm sm:text-base font-bold rounded-full text-gray-900 bg-white hover:bg-orange-50 transition-colors shadow-sm hover:shadow"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY & TERMS CONTAINERS (Only visible when active) */}
        {(activePage === 'privacy' || activePage === 'terms') && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 max-w-4xl mx-auto">
            
            {/* PRIVACY POLICY */}
            {activePage === 'privacy' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 text-gray-600 space-y-6">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-sm text-gray-400 mb-8">Last Updated: {lastUpdated}</p>

                <h2 className="text-xl font-bold text-gray-900 mt-8">1. Information We Collect</h2>
                <p>When you use GanSetu, we collect the following information:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Account Information:</strong> Your name, email address, and profile picture (if provided) when you sign up.</li>
                  <li><strong>Listing Data:</strong> Information you provide when selling an item, including photos, descriptions, and your approximate location (e.g., City).</li>
                  <li><strong>Platform Activity:</strong> Your favorites, reviews (Abhipray), and support requests.</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mt-8">2. How We Use Your Information</h2>
                <p>We use your data strictly to provide and improve the GanSetu platform. This includes:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Connecting buyers and sellers within the community.</li>
                  <li>Displaying your verified reviews to build trust on the platform.</li>
                  <li>Responding to your support queries and keeping the platform safe.</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mt-8">3. Data Sharing & Security</h2>
                <p><strong>We do not sell your personal data to third parties.</strong> Your public profile (name, city, and avatar) and your active listings are visible to other users. We use industry-standard security (via Supabase) to protect your account credentials. Because GanSetu is a peer-to-peer platform, we recommend using caution and not sharing sensitive financial information in public spaces.</p>
                
                <h2 className="text-xl font-bold text-gray-900 mt-8">4. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us via the Support page or email us at gansetu.support@gmail.com</p>
              </div>
            )}

            {/* TERMS OF SERVICE */}
            {activePage === 'terms' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 text-gray-600 space-y-6">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
                <p className="text-sm text-gray-400 mb-8">Last Updated: {lastUpdated}</p>

                <p>Welcome to GanSetu. By accessing our platform, you agree to these Terms of Service. Our mission is to facilitate a sustainable, eco-friendly Ganeshotsav.</p>

                <h2 className="text-xl font-bold text-gray-900 mt-8">1. Platform Nature</h2>
                <p>GanSetu is a peer-to-peer marketplace. We provide the digital infrastructure for buyers and sellers to connect. <strong>GanSetu does not own, inspect, or guarantee any items listed on the platform.</strong> All transactions, negotiations, and physical exchanges are strictly between the buyer and the seller.</p>

                <h2 className="text-xl font-bold text-gray-900 mt-8">2. User Conduct</h2>
                <p>As a member of the GanSetu community, you agree to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Provide accurate descriptions and photos of the items you are selling.</li>
                  <li>Treat all members with respect and negotiate fairly.</li>
                  <li>Not list any prohibited, illegal, or hazardous items.</li>
                  <li>Ensure all items align with the spirit of the festival (e.g., respectful, clean).</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-900 mt-8">3. Safety and Liability</h2>
                <p>You assume all risks associated with dealing with other users. We strongly advise meeting in safe, public locations for the exchange of items and inspecting items thoroughly before payment. GanSetu is not liable for any damages, losses, or disputes arising from transactions made through the platform.</p>

                <h2 className="text-xl font-bold text-gray-900 mt-8">4. Account Termination</h2>
                <p>We reserve the right to suspend or terminate accounts that violate these terms, post fraudulent listings, or engage in abusive behavior toward other community members.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}