import { ShoppingBag, Search, Menu } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-12 h-24 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Menu className="w-6 h-6 lg:hidden" />
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold tracking-tighter text-brand-dark cursor-pointer"
          >
            MODURA
          </motion.h1>
          <nav className="hidden lg:flex items-center gap-10">
            <a href="#" className="text-xs font-medium text-brand-dark border-b border-black pb-0.5 tracking-widest">SHOP ALL</a>
            <a href="#" className="text-xs font-medium text-gray-400 hover:text-black transition-colors tracking-widest">COLLECTIONS</a>
            <a href="#" className="text-xs font-medium text-gray-400 hover:text-black transition-colors tracking-widest">ABOUT</a>
          </nav>
        </div>

        <div className="flex items-center gap-8">
          <button className="hidden sm:flex items-center gap-2 text-xs font-medium tracking-widest">
            <Search className="w-4 h-4" />
            SEARCH
          </button>
          <button 
            onClick={onCartClick}
            className="group relative flex items-center gap-2 text-xs font-medium tracking-widest"
          >
            CART ({cartCount})
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-black"></div>
              <div className="w-full h-0.5 bg-black"></div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
