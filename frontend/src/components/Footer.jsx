import React from 'react';
import { Leaf, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-bark-900 text-earth-100 py-12 mt-auto border-t border-bark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group mb-4">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="font-serif text-2xl text-white tracking-tight">AgriTrace</span>
              </div>
            </Link>
            <p className="text-earth-400 text-sm max-w-sm mb-6 leading-relaxed">
              Securing the agricultural supply chain from farm to fork using immutable blockchain technology.
              Transparency, quality, and trust in every seed.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-bark-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-bark-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-bark-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-2 text-sm text-earth-400">
              <li><Link to="/" className="hover:text-brand-300 transition-colors">Home</Link></li>
              <li><Link to="/features" className="hover:text-brand-300 transition-colors">Features</Link></li>
              <li><Link to="/about" className="hover:text-brand-300 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-300 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide">System Portal</h4>
            <ul className="space-y-2 text-sm text-earth-400">
              <li><Link to="/login" className="hover:text-brand-300 transition-colors">Staff Login</Link></li>
              <li><a href="#" className="hover:text-brand-300 transition-colors">Network Status</a></li>
              <li><a href="#" className="hover:text-brand-300 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-brand-300 transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-bark-800 text-center md:text-left text-sm text-earth-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} AgriTrace. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
