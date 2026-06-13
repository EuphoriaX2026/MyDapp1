import { AppIcon } from '../icons/AppIcon';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatUsd } from '../../utils/formatNumber';
import { DEALS_PER_SLIDE, STORE_BEST_DEALS, STORE_RECOMMENDED } from '../../data/storeCatalog';

const DESC_MAX = 48;

function summarizeDesc(text: string) {
  if (text.length <= DESC_MAX) return { text, truncated: false };
  const slice = text.slice(0, DESC_MAX);
  const atWord = slice.slice(0, slice.lastIndexOf(' ')) || slice;
  return { text: atWord + '… ', truncated: true };
}

export interface StoreMainContentProps {
  onAddToCart: (item: { name: string; price: number; img: string; specs?: string; id?: number; hash?: string }) => void;
  onShowRealms: () => void;
  wishlistOnly?: boolean;
}

export function StoreMainContent({ onAddToCart, onShowRealms, wishlistOnly = false }: StoreMainContentProps) {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [dealsPage, setDealsPage] = useState(0);

  const filteredDeals = STORE_BEST_DEALS;
  const filteredRecommended = STORE_RECOMMENDED.filter((p) => {
    if (wishlistOnly && !wishlist.includes(p.id)) return false;
    return true;
  });

  const dealSlides = useMemo(() => {
    const slides: (typeof STORE_BEST_DEALS)[] = [];
    for (let i = 0; i < filteredDeals.length; i += DEALS_PER_SLIDE) {
      slides.push(filteredDeals.slice(i, i + DEALS_PER_SLIDE));
    }
    return slides.length ? slides : [[]];
  }, [filteredDeals]);

  const dealPageCount = dealSlides.length;
  const nextDealsSlide = () => setDealsPage((p) => (p + 1) % dealPageCount);
  const prevDealsSlide = () => setDealsPage((p) => (p === 0 ? dealPageCount - 1 : p - 1));

  const toggleWishlist = (id: number) =>
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="px-8 pb-10 pt-8">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-6 px-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Explore the Ecosystem</h2>
            <p className="text-sm font-medium text-gray-500">Your journey to maximum yield starts here.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 h-auto">
          <button
            type="button"
            onClick={onShowRealms}
            className="group relative col-span-1 rounded-[2rem] overflow-hidden cursor-pointer bg-white/40 backdrop-blur-xl border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(99,71,249,0.12)] hover:bg-white/50 hover:-translate-y-1 transition-all duration-500 min-h-[350px] text-left"
          >
            <img
              src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply transition-transform duration-[2s] group-hover:scale-105"
              alt="The 7 Realms"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-white/20 to-transparent transition-opacity duration-500" />
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
              <div className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-md border-0 flex items-center justify-center shadow-sm">
                <AppIcon icon="lucide:sparkles" className="text-brand-pink w-6 h-6" />
              </div>
              <div>
                <h3 className="text-brand-pink text-xs font-bold tracking-[0.2em] uppercase mb-2">
                  Classic Packages
                </h3>
                <h2 className="text-gray-900 text-4xl font-thin mb-4 leading-[1.1] tracking-tighter">
                  The 7 Realms:
                  <br />
                  Awaken Your Deity
                </h2>
                <div className="flex items-end justify-between">
                  <p className="text-gray-600 text-sm font-medium max-w-md leading-relaxed">
                    Mint E1 vouchers, unlock the cyber portals, and evolve your network avatar to dominate the ecosystem.
                  </p>
                  <div className="w-12 h-12 shrink-0 rounded-full bg-black text-white flex items-center justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-xl">
                    <AppIcon icon="lucide:arrow-up-right" className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>
          </button>

          <div className="col-span-1 flex flex-col gap-6 h-full">
            <div className="group relative flex-1 rounded-[2rem] overflow-hidden cursor-pointer bg-white/40 backdrop-blur-xl border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(99,71,249,0.12)] hover:bg-white/50 hover:-translate-y-1 transition-all duration-500 min-h-[240px]">
              <img
                src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=600&auto=format&fit=crop"
                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply transition-transform duration-[2s] group-hover:scale-105"
                alt="Turbo Gear"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-white/20 to-transparent transition-opacity duration-500" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border-0 flex items-center justify-center shadow-sm">
                  <AppIcon icon="lucide:zap" className="text-emerald-500 w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase mb-1">Power Boosters</h3>
                  <h2 className="text-gray-900 text-2xl font-thin mb-2 leading-tight tracking-tighter">
                    Turbo Gear:
                    <br />
                    Maximize Yield
                  </h2>
                </div>
              </div>
            </div>

            <div className="group relative flex-1 rounded-[2rem] overflow-hidden cursor-pointer bg-white/40 backdrop-blur-xl border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(99,71,249,0.12)] hover:bg-white/50 hover:-translate-y-1 transition-all duration-500 min-h-[240px]">
              <img
                src="https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=600&auto=format&fit=crop"
                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply transition-transform duration-[2s] group-hover:scale-105"
                alt="VIP Tiers"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-white/20 to-transparent transition-opacity duration-500" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border-0 flex items-center justify-center shadow-sm">
                  <AppIcon icon="lucide:crown" className="text-brand-blue w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-brand-blue text-[10px] font-bold tracking-widest uppercase mb-1">Income Cap</h3>
                  <h2 className="text-gray-900 text-2xl font-thin mb-2 leading-tight tracking-tighter">
                    VIP Tiers:
                    <br />
                    Break The Limits
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-2 px-2">
          <h2 className="text-xl font-bold text-gray-900">Trending Artifacts</h2>
        </div>

        <div className="overflow-hidden px-2 pt-3">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${dealsPage * 100}%)` }}
          >
            {dealSlides.map((slideProducts, slideIdx) => (
              <div
                key={slideIdx}
                className="w-full shrink-0 min-w-full grid grid-cols-2 gap-4"
              >
                {slideProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="min-w-0 bg-white/55 backdrop-blur-xl border-0 rounded-xl p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] hover:bg-white/70 hover:-translate-y-1 group cursor-pointer flex flex-col"
                  >
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden shrink-0">
                      {product.tag && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="bg-black/20 backdrop-blur-md text-white/95 text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                            {product.tag}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                          <span className="font-thin text-[9px] tracking-tighter text-black">
                            {product.brand}
                          </span>
                        </div>
                      </div>
                      <img
                        src={product.img}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    </div>

                    <div className="px-2.5 pt-1.5 flex flex-col gap-1">
                      <h3 className="text-[15px] font-bold text-black leading-tight tracking-tight line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{product.subtitle}</p>
                      {(() => {
                        const d = summarizeDesc(product.desc);
                        return (
                          <p className="text-[11px] text-gray-400 font-medium leading-snug mt-0.5 line-clamp-2">
                            {d.text}
                            {d.truncated && (
                              <span className="text-[#6347F9] font-bold cursor-pointer hover:underline">more</span>
                            )}
                          </p>
                        );
                      })()}
                    </div>

                    <div className="relative z-30 mt-auto flex items-stretch justify-between gap-2 px-2.5 pt-2">
                      <div className="h-8 bg-[#F4F5F7]/80 backdrop-blur-sm rounded-full px-3 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-black tracking-tight leading-none">
                          {formatUsd(product.price)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart({ id: product.id, name: product.title, price: product.price, img: product.img });
                        }}
                        className="relative z-30 h-8 shrink-0 bg-black hover:bg-gray-800 transition-all duration-300 rounded-full pl-3.5 pr-1.5 flex items-center gap-1.5 active:scale-95 shadow-md hover:shadow-xl"
                      >
                        <span className="text-white text-xs font-bold tracking-wide leading-none whitespace-nowrap">
                          Buy Now
                        </span>
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-inner shrink-0">
                          <AppIcon icon="lucide:arrow-up-right" className="w-3 h-3 text-black" strokeWidth={2.5} />
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {dealPageCount > 1 && (
          <div className="hidden justify-end items-center gap-3 mt-4 pr-2">
            <button
              type="button"
              onClick={prevDealsSlide}
              aria-label="Previous deals"
              className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border-0 flex items-center justify-center text-gray-900 hover:bg-white/70 transition-colors shadow-sm"
            >
              <AppIcon icon="lucide:chevron-left" className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={nextDealsSlide}
              aria-label="Next deals"
              className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md border-0 flex items-center justify-center text-gray-900 hover:bg-white/70 transition-colors shadow-sm"
            >
              <AppIcon icon="lucide:chevron-right" className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-end mb-6 px-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
              Ecosystem Essentials
              {wishlistOnly && (
                <span className="text-sm font-bold text-brand-pink ml-2 px-2 py-0.5 bg-brand-pink/10 rounded-full">
                  · Watchlist
                </span>
              )}
            </h2>
            <p className="text-sm font-medium text-gray-500">Tailored synergies to boost your matrix.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredRecommended.map((product) => (
            <div
              key={product.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/product/${product.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/product/${product.id}`);
                }
              }}
              className="group bg-white/40 backdrop-blur-xl border-0 rounded-[1.5rem] p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(99,71,249,0.12)] hover:bg-white/50 transition-all duration-500 hover:-translate-y-1 flex flex-col h-full cursor-pointer relative overflow-hidden"
            >
              <div className="relative w-full aspect-square rounded-[1rem] mb-4 flex items-center justify-center overflow-hidden bg-white/25 shrink-0">
                {product.discount && (
                  <span className="absolute top-3 left-3 bg-brand-pink text-white text-[10px] font-black px-2.5 py-1 rounded-lg z-10 shadow-md">
                    {product.discount}
                  </span>
                )}
                {product.tag && !product.discount && (
                  <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-md z-10">
                    {product.tag}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  aria-label="Toggle watchlist"
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 backdrop-blur-md border-0 transition-all duration-300 ${
                    wishlist.includes(product.id)
                      ? 'bg-brand-pink text-white animate-pulse'
                      : 'bg-white/50 text-gray-400 hover:text-brand-pink hover:bg-white/70'
                  }`}
                >
                  <AppIcon icon="lucide:heart" className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-white' : ''}`} />
                </button>
                <img
                  src={product.img}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/25 to-transparent" />
              </div>

              <div className="px-2 flex flex-col flex-1">
                <h3 className="text-[15px] font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{product.name}</h3>
                <div className="mt-auto flex items-end gap-2 mb-4">
                  <span className="text-xl font-black text-gray-900 tracking-tight">{formatUsd(product.price)}</span>
                  {product.oldPrice != null && (
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider line-through mb-1">
                      {formatUsd(product.oldPrice)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart({ id: product.id, name: product.name, price: product.price, img: product.img });
                  }}
                  aria-label="Add to cart"
                  className="w-full py-2.5 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 text-gray-900 font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-black group-hover:text-white group-hover:border-transparent transition-colors duration-300 shadow-sm"
                >
                  <AppIcon icon="lucide:shopping-bag" className="w-4 h-4" /> Add to Matrix
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col flex-wrap justify-between items-start gap-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-brand-pink/5 via-emerald-500/5 to-brand-blue/5 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 min-w-[140px] flex-1 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-sm shrink-0">
            <AppIcon icon="lucide:shield-check" className="w-5 h-5 text-gray-800" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Cryptographic Security</p>
            <p className="text-[11px] font-medium text-gray-600 leading-tight mt-0.5">Military-grade smart contracts</p>
          </div>
        </div>
        <div className="hidden w-px h-10 bg-gray-300/50 shrink-0 relative z-10" />
        <div className="flex items-center gap-3 min-w-[140px] flex-1 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-sm shrink-0">
            <AppIcon icon="lucide:fingerprint" className="w-5 h-5 text-gray-800" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Immutable Assets</p>
            <p className="text-[11px] font-medium text-gray-600 leading-tight mt-0.5">Non-custodial on-chain ownership</p>
          </div>
        </div>
        <div className="hidden w-px h-10 bg-gray-300/50 shrink-0 relative z-10" />
        <div className="flex items-center gap-3 min-w-[140px] flex-1 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-sm shrink-0">
            <AppIcon icon="lucide:earth" className="w-5 h-5 text-gray-800" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Decentralized Network</p>
            <p className="text-[11px] font-medium text-gray-600 leading-tight mt-0.5">Powered by global node runners</p>
          </div>
        </div>
        <div className="hidden w-px h-10 bg-gray-300/50 shrink-0 relative z-10" />
        <div className="flex items-center gap-3 min-w-[140px] flex-1 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-sm shrink-0">
            <AppIcon icon="lucide:cpu" className="w-5 h-5 text-gray-800" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Algorithmic Yield</p>
            <p className="text-[11px] font-medium text-gray-600 leading-tight mt-0.5">Automated RFT generation engine</p>
          </div>
        </div>
      </div>
    </div>
  );
}
