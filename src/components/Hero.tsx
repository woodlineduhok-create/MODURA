import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-48 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <h2 className="text-6xl lg:text-7xl font-light tracking-tight mb-6 italic text-brand-dark">
            Essential Objects.
          </h2>
          <p className="text-gray-500 max-w-sm leading-relaxed uppercase text-[10px] tracking-[0.3em] font-medium">
            Curated high-quality pieces designed for the modern home. Focused on materiality and form.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative aspect-[21/9] overflow-hidden"
        >
          <img 
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1500" 
            alt="Hero Interior" 
            className="w-full h-full object-cover filter grayscale-[0.2]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/5" />
        </motion.div>
      </div>
    </section>
  );
}
