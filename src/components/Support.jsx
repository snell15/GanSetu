import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Tag, HelpCircle, AlertTriangle, Send, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Support({ user }) {
    // 1. URL IS THE SOURCE OF TRUTH
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'faq';

    // Report Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Grab the data directly from the form inputs
        const formData = new FormData(e.target);

        try {
            const { error } = await supabase.from('reports').insert([{
                issue_type: formData.get('issue_type'),
                email: formData.get('email'),
                description: formData.get('description')
            }]);

            if (error) throw error;

            setIsSubmitted(true);
            e.target.reset(); // Clears the form inputs after success

            setTimeout(() => setIsSubmitted(false), 4000);
        } catch (err) {
            alert("Failed to send report: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        { id: 'faq', label: 'FAQs', icon: HelpCircle },
        { id: 'safety', label: 'Safety Guidelines', icon: ShieldCheck },
        { id: 'selling', label: 'How to Sell', icon: Tag },
        { id: 'report', label: 'Report an Issue', icon: AlertTriangle },
    ];

    return (
        <div className="min-h-screen bg-stone-50 py-8 sm:py-12 pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Header */}
                <div className="mb-8 md:mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                        GanSetu <span className="text-orange-600">Help Center</span>
                    </h1>
                    <p className="text-gray-600 font-medium">How can we help you with your Ganeshotsav preparations today?</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                    {/* Mobile Tabs (Horizontal Scroll) */}
                    <div className="md:hidden flex overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                // 2. UPDATE URL INSTEAD OF STATE
                                onClick={() => setSearchParams({ tab: tab.id })}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Desktop Sidebar */}
                    <div className="hidden md:flex flex-col gap-2 w-64 shrink-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                // 3. UPDATE URL INSTEAD OF STATE
                                onClick={() => setSearchParams({ tab: tab.id })}
                                className={`flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-white text-orange-600 shadow-sm border border-orange-100 ring-1 ring-orange-500/20'
                                    : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'}`} />
                                    {tab.label}
                                </div>
                                {activeTab === tab.id && <ChevronRight className="h-4 w-4" />}
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:p-10 min-h-[500px]">

                        {/* CONTENT: FAQs */}
                        {activeTab === 'faq' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <HelpCircle className="h-6 w-6 text-orange-500" /> Frequently Asked Questions
                                </h2>
                                <div className="space-y-6">
                                    <FaqItem
                                        question="Does GanSetu charge a commission on sales?"
                                        answer="No! GanSetu is a 100% free community platform built to promote eco-friendly and sustainable Ganeshotsav practices. We do not take any cut from your sales."
                                    />
                                    <FaqItem
                                        question="How does delivery work?"
                                        answer="GanSetu is a peer-to-peer platform. Buyers and sellers coordinate delivery or pickup directly via WhatsApp. Some sellers may offer local delivery, which will be indicated on their listing."
                                    />
                                    <FaqItem
                                        question="How do I pay for a decoration?"
                                        answer="Payments are handled directly between the buyer and seller. We recommend meeting in person, verifying the item's condition, and paying via UPI or cash upon exchange."
                                    />
                                    <FaqItem
                                        question="Can I rent out my makhar instead of selling it?"
                                        answer="Currently, GanSetu is focused on buying and selling used decorations. However, you can mention in your description if you are open to renting it out for the festival duration!"
                                    />
                                </div>
                            </div>
                        )}

                        {/* CONTENT: Safety Guidelines */}
                        {activeTab === 'safety' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <ShieldCheck className="h-6 w-6 text-green-500" /> Safety Guidelines
                                </h2>
                                <div className="prose prose-orange max-w-none text-gray-600">
                                    <p className="mb-6 font-medium text-lg">Your safety is our top priority. Please follow these community guidelines when interacting with buyers or sellers.</p>

                                    <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6">
                                        <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="h-5 w-5" /> The Golden Rule
                                        </h3>
                                        <p className="text-sm text-green-700 m-0">Always inspect the item in person before making any payment. Never transfer money in advance to reserve an item.</p>
                                    </div>

                                    <ul className="space-y-4 list-disc pl-5">
                                        <li><strong className="text-gray-900">Meet in safe locations:</strong> If possible, meet in public, well-lit areas during daytime to exchange items.</li>
                                        <li><strong className="text-gray-900">Beware of phishing:</strong> GanSetu will NEVER ask for your bank details, OTP, or UPI PIN. Do not share these with anyone claiming to be from our team.</li>
                                        <li><strong className="text-gray-900">Verify item dimensions:</strong> Always double-check the dimensions with the seller to ensure your Ganpati idol will safely fit inside the makhar before traveling to pick it up.</li>
                                        <li><strong className="text-gray-900">Report suspicious behavior:</strong> If a user is acting aggressively, asking for advanced deposits, or seems fraudulent, please use the "Report an Issue" tab immediately.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* CONTENT: How to Sell */}
                        {activeTab === 'selling' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Tag className="h-6 w-6 text-orange-500" /> How to Sell Successfully
                                </h2>
                                <p className="text-gray-600 mb-8">Follow these tips to sell your decorations faster and help others celebrate sustainably.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                                        <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-black text-orange-600 shadow-sm mb-3">1</div>
                                        <h3 className="font-bold text-gray-900 mb-2">Take Great Photos</h3>
                                        <p className="text-sm text-gray-600">Clean the decoration and take photos in natural light. Show it fully assembled if possible, so buyers can visualize the setup.</p>
                                    </div>
                                    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                                        <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-black text-orange-600 shadow-sm mb-3">2</div>
                                        <h3 className="font-bold text-gray-900 mb-2">Provide Exact Dimensions</h3>
                                        <p className="text-sm text-gray-600">This is crucial! Always mention the maximum height and width of the idol that can comfortably fit inside your makhar.</p>
                                    </div>
                                    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                                        <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-black text-orange-600 shadow-sm mb-3">3</div>
                                        <h3 className="font-bold text-gray-900 mb-2">Price it Fairly</h3>
                                        <p className="text-sm text-gray-600">Remember, the goal is sustainability. Pricing your used items at 40-60% of their original retail price usually results in the fastest sales.</p>
                                    </div>
                                    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                                        <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-black text-orange-600 shadow-sm mb-3">4</div>
                                        <h3 className="font-bold text-gray-900 mb-2">Be Responsive</h3>
                                        <p className="text-sm text-gray-600">Since communication happens on WhatsApp, try to reply promptly. Mark your item as "Sold Out" on your dashboard once it's gone!</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONTENT: Report an Issue */}
                        {activeTab === 'report' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <AlertTriangle className="h-6 w-6 text-red-500" /> Report an Issue
                                </h2>

                                {isSubmitted ? (
                                    <div className="bg-green-50 border border-green-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center h-64">
                                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent</h3>
                                        <p className="text-gray-600">Our community moderation team will review your report shortly. Thank you for keeping GanSetu safe!</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReportSubmit} className="space-y-5 max-w-xl">
                                        <p className="text-gray-600 mb-6">Found a bug, encountered a fraudulent user, or need technical help? Send us a message below.</p>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Type of Issue</label>
                                            <select name="issue_type" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm font-medium">
                                                <option>Suspicious/Fraudulent User</option>
                                                <option>App Bug / Technical Issue</option>
                                                <option>Inappropriate Content</option>
                                                <option>Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Your Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                defaultValue={user?.email || ''}
                                                placeholder="So we can follow up with you..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                            <textarea
                                                name="description"
                                                required
                                                placeholder="Please provide details (listing titles, user names, or what went wrong)..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50 min-h-[120px] text-sm"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                                        >
                                            {isSubmitting ? 'Sending...' : <><Send className="h-4 w-4" /> Submit Report</>}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

// Quick helper component for FAQs
function FaqItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-gray-50 transition-colors"
            >
                <span className="font-bold text-gray-900">{question}</span>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3 bg-gray-50/50">
                    {answer}
                </div>
            )}
        </div>
    );
}