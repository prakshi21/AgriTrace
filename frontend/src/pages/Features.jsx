import React from 'react';
import { ShieldCheck, Package, MapPin, CheckCircle, FileText, Smartphone } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-brand-600" />,
      title: "Blockchain Immutability",
      desc: "Powered by Hyperledger Fabric, every batch created, evaluated, and transported is permanently recorded. Data tampering is cryptographically impossible."
    },
    {
      icon: <Package className="w-8 h-8 text-blue-600" />,
      title: "End-to-End Batch Tracking",
      desc: "Assign a unique QR code to every physical batch. Follow its lifecycle from production at the farm, through quality labs, transport, and final warehouse delivery."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-purple-600" />,
      title: "Integrated Quality Control",
      desc: "Quality labs can evaluate batches, grade them, and securely upload verification PDFs. The PDF hash is stored directly on the blockchain for indisputable proof."
    },
    {
      icon: <MapPin className="w-8 h-8 text-orange-600" />,
      title: "Real-time Location Updates",
      desc: "Transporters can log GPS locations or checkpoints during transit, providing stakeholders with real-time visibility into the physical location of their assets."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-teal-600" />,
      title: "Mobile-ready QR Scanning",
      desc: "Built-in camera scanner allows staff to instantly verify or update batches using a smartphone or tablet right on the warehouse floor."
    },
    {
      icon: <FileText className="w-8 h-8 text-red-600" />,
      title: "Role-Based Access Control",
      desc: "Strict cryptographic permissions ensure that only certified Labs can grade quality, and only assigned Transporters can update locations."
    }
  ];

  return (
    <div className="bg-cream-50 min-h-screen py-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif text-bark-900 mb-6">Platform Features</h1>
          <p className="text-xl text-earth-600 max-w-3xl mx-auto">
            Everything you need to manage a secure, transparent, and efficient agricultural supply chain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-cream-50 flex items-center justify-center mb-6 shadow-inner border border-earth-100">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-bark-800 mb-3">{f.title}</h3>
              <p className="text-earth-500 leading-relaxed text-sm">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
