import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 group mb-4 w-fit">
                            <div className="bg-orange-600 text-white p-1.5 rounded-lg group-hover:bg-orange-700 transition-colors shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            </div>
                            <span className="font-black text-xl tracking-tight text-gray-900">GanSetu</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Empowering communities to celebrate Ganeshotsav sustainably. Buy, sell, and reuse beautiful decorations.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-orange-600 transition-colors">
                                <InstagramIcon className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-600 transition-colors">
                                <FacebookIcon className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-600 transition-colors">
                                <TwitterIcon className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-500 hover:text-orange-600 transition-colors text-sm">Marketplace</Link></li>
                            <li><Link to="/abhipray" className="text-gray-500 hover:text-orange-600 transition-colors text-sm">Community Abhipray</Link></li>
                            <li><Link to="/dashboard" className="text-gray-500 hover:text-orange-600 transition-colors text-sm">My Dashboard</Link></li>
                            <li><Link to="/favorites" className="text-gray-500 hover:text-orange-600 transition-colors text-sm">Saved Items</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Support</h3>
                        <ul className="space-y-3">
                            <li><Link to="/support?tab=safety" className="text-gray-500 hover:text-orange-600 transition-colors text-sm">Safety Guidelines</Link></li>
                            <li><Link to="/support?tab=selling" className="text-gray-500 hover:text-orange-600 transition-colors text-sm">How to Sell</Link></li>
                            <li><Link to="/support?tab=faq" className="text-gray-500 hover:text-orange-600 transition-colors text-sm">FAQs</Link></li>
                            <li><Link to="/support?tab=report" className="text-gray-500 hover:text-orange-600 transition-colors text-sm">Report an Issue</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-500 text-sm">
                                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-orange-500" />
                                <a href="mailto:gansetu.support@gmail.com" className="hover:text-orange-600 transition-colors">gansetu.support@gmail.com</a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Copyright */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm text-center md:text-left">
                        © {currentYear} GanSetu. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-400">
                        {/* UPDATED LINKS HERE */}
                        <Link to="/legal?page=privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
                        <Link to="/legal?page=terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}

/* --- Native SVGs to replace the removed Lucide Brand Icons --- */

function FacebookIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    );
}

function InstagramIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}

function TwitterIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
    );
}