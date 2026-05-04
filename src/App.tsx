import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import { PRODUCTS } from './constants';
import { CartItem, Product } from './types';
import { motion } from 'motion/react';
import { supabase } from './lib/supabase';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback to constants if DB is empty or not configured
        setProducts(PRODUCTS);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts(PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

      if (error) throw error;
      if (data) fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      // Optimistic update for demo if Supabase fails
      const product: Product = { ...newProduct, id: Math.random().toString(36).substr(2, 9) };
      setProducts(prev => [product, ...prev]);
    }
  };

  const handleEditProduct = async (editedProduct: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(editedProduct)
        .eq('id', editedProduct.id);

      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error('Error editing product:', err);
      setProducts(prev => prev.map(p => p.id === editedProduct.id ? editedProduct : p));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="min-h-screen">
      <Header 
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      <main>
        <Hero />
        
        <section className="max-w-7xl mx-auto px-12 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-4xl font-light tracking-tight mb-4 italic">Objects of desire.</h2>
              <p className="text-gray-500 uppercase text-[10px] tracking-[0.3em] font-medium">
                Refined selection of essentials
              </p>
            </div>
            <div className="flex flex-wrap gap-8">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-bold uppercase tracking-widest transition-all ${
                    cat === activeCategory 
                    ? 'text-brand-dark border-b border-black pb-1' 
                    : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-ambient-gray mb-4" />
                  <div className="h-4 bg-ambient-gray w-3/4 mb-2" />
                  <div className="h-4 bg-ambient-gray w-1/4" />
                </div>
              ))
            ) : (
              filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart} 
                />
              ))
            )}
          </div>
        </section>

        <section className="border-t border-gray-100 py-24">
          <div className="max-w-7xl mx-auto px-12 text-center">
            <h3 className="text-2xl font-light italic mb-6">Join the Registry</h3>
            <p className="text-gray-500 mb-10 max-w-md mx-auto text-[10px] uppercase tracking-[0.2em] leading-relaxed">
              New arrivals and curated journals delivered to your inbox.
            </p>
            <form className="max-w-sm mx-auto flex flex-col gap-4">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full h-12 bg-transparent border-b border-gray-200 text-center text-[10px] tracking-widest focus:border-black transition-all outline-none"
              />
              <button 
                type="submit"
                className="h-12 w-full text-[10px] font-bold tracking-[0.3em] uppercase border border-black hover:bg-black hover:text-white transition-all"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-gray-100 py-12 px-12 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-[0.3em] text-gray-400 font-medium">
        <div className="flex space-x-8 uppercase mb-4 md:mb-0">
          <a href="#" className="hover:text-black transition-colors">Instagram</a>
          <a href="#" className="hover:text-black transition-colors">Pinterest</a>
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="hover:text-black transition-colors uppercase tracking-[0.3em]"
          >
            Admin Panel
          </button>
        </div>
        <div className="uppercase">
          ©2024 MODURA / ALL RIGHTS RESERVED
        </div>
      </footer>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />

      {isAdminOpen && (
        <AdminPanel 
          products={products}
          onAdd={handleAddProduct}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
