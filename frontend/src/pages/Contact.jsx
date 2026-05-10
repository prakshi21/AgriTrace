import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  return (
    <div className="bg-cream-50 min-h-screen py-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif text-bark-900 mb-6">Get in Touch</h1>
          <p className="text-xl text-earth-600 max-w-2xl mx-auto">
            Have questions about integrating AgriTrace into your supply chain? Our team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="glass-card p-8 flex items-start gap-6">
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-bark-800 mb-2">Our Headquarters</h3>
                <p className="text-earth-600">123 Innovation Drive<br/>Tech District, San Francisco<br/>CA 94105</p>
              </div>
            </div>
            
            <div className="glass-card p-8 flex items-start gap-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-bark-800 mb-2">Email Us</h3>
                <p className="text-earth-600 mb-1">Support: support@agritrace.io</p>
                <p className="text-earth-600">Sales: sales@agritrace.io</p>
              </div>
            </div>

            <div className="glass-card p-8 flex items-start gap-6">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-bark-800 mb-2">Call Us</h3>
                <p className="text-earth-600">Mon-Fri from 8am to 5pm (PST)</p>
                <p className="text-earth-600 font-semibold text-lg mt-1">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card p-8 md:p-10">
            <h2 className="text-2xl font-serif text-bark-800 mb-6">Send us a message</h2>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Form submitted successfully! We'll get back to you soon."); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="input-label">First Name</label>
                  <input type="text" className="input-field bg-cream-50" placeholder="John" required />
                </div>
                <div>
                  <label className="input-label">Last Name</label>
                  <input type="text" className="input-field bg-cream-50" placeholder="Doe" required />
                </div>
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input type="email" className="input-field bg-cream-50" placeholder="john@company.com" required />
              </div>
              <div>
                <label className="input-label">Subject</label>
                <input type="text" className="input-field bg-cream-50" placeholder="How can we help?" required />
              </div>
              <div>
                <label className="input-label">Message</label>
                <textarea className="input-field bg-cream-50 min-h-[150px] resize-y" placeholder="Tell us about your supply chain needs..." required></textarea>
              </div>
              <button type="submit" className="btn-primary w-full py-4 text-lg">
                Send Message <Send className="w-5 h-5 ml-2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
