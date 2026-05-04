import { motion } from 'motion/react';
import { Product } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer flex flex-col"
    >
      <div className="aspect-[3/4] bg-ambient-gray mb-4 relative flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-gray-300 uppercase text-[10px] tracking-widest font-bold">No Image</div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white px-6 py-3 rounded-full text-xs font-bold tracking-widest uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-brand-dark">{product.name}</h3>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-semibold">
            {product.category}
          </p>
        </div>
        <span className="text-sm font-medium text-brand-dark">${product.price}</span>
      </div>
    </motion.div>
  );
}
