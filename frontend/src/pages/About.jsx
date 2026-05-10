import React from 'react';
import { Shield, Leaf, Globe, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-cream-50 min-h-screen py-20 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif text-bark-900 mb-6">About AgriTrace</h1>
          <p className="text-xl text-earth-600 leading-relaxed">
            Revolutionizing the agricultural supply chain with radical transparency and blockchain security.
          </p>
        </div>

        <div className="glass-card p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-serif text-bark-800 mb-6">Our Mission</h2>
          <p className="text-earth-600 mb-6 leading-relaxed">
            At AgriTrace, we believe that trust is the foundation of a sustainable food system. For too long, agricultural supply chains have been opaque, leading to inefficiencies, fraud, and compromised quality. Our mission is to illuminate every step of the journey from seed to harvest.
          </p>
          <p className="text-earth-600 leading-relaxed">
            By leveraging Hyperledger Fabric blockchain technology, we provide an immutable, transparent ledger that guarantees the authenticity and quality of agricultural inputs, empowering farmers and protecting consumers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-warm p-8">
            <Shield className="w-10 h-10 text-brand-600 mb-4" />
            <h3 className="text-xl font-bold text-bark-800 mb-3">Uncompromising Security</h3>
            <p className="text-earth-600 text-sm">Our decentralized architecture ensures that once a quality report or location update is logged, it can never be altered or deleted. Truth is embedded in the code.</p>
          </div>
          <div className="card-warm p-8">
            <Globe className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-bark-800 mb-3">Global Traceability</h3>
            <p className="text-earth-600 text-sm">Whether across the state or across the globe, track the precise location and status of shipments in real-time with our intuitive dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
