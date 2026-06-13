import { AppIcon } from '../../components/icons/AppIcon';
import { useState } from 'react'
import { formatUsd } from '../../utils/formatNumber'

const PRODUCT_IMAGES = [
  { id: 1, type: 'image', src: 'https://images.unsplash.com/photo-1608228079968-c7681ea0ab4a?q=80&w=800&auto=format&fit=crop' },
  { id: 2, type: 'video', src: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?q=80&w=800&auto=format&fit=crop' },
  { id: 3, type: 'image', src: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=800&auto=format&fit=crop' },
  { id: 4, type: 'image', src: 'https://images.unsplash.com/photo-1571945227446-24ba0da284f4?q=80&w=800&auto=format&fit=crop' },
  { id: 5, type: 'image', src: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop' },
  { id: 6, type: 'image', src: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=800&auto=format&fit=crop' },
]

const COLORS = [
  { id: 'c1', src: 'https://placehold.co/100x100/A3C2B8/FFF', available: true },
  { id: 'c2', src: 'https://placehold.co/100x100/FF1493/FFF', available: true },
  { id: 'c3', src: 'https://placehold.co/100x100/8B7355/FFF', available: true },
  { id: 'c4', src: 'https://placehold.co/100x100/E6E6FA/FFF', available: true },
  { id: 'c5', src: 'https://placehold.co/100x100/FFFFFF/000', available: false },
  { id: 'c6', src: 'https://placehold.co/100x100/A3C2B8/FFF', available: true },
  { id: 'c7', src: 'https://placehold.co/100x100/2F4F4F/FFF', available: true },
  { id: 'c8', src: 'https://placehold.co/100x100/000000/FFF', available: true },
  { id: 'c9', src: 'https://placehold.co/100x100/FFFFFF/000', available: true },
]

const SIZES = [
  { label: 'XXS', available: false },
  { label: 'XS', available: true },
  { label: 'S', available: true },
  { label: 'M', available: true },
  { label: 'L', available: true },
  { label: 'XL', available: true },
  { label: 'XXL', available: true },
]

const ACCORDIONS = [
  { id: 'size', title: 'Size & Fit', content: 'Fits true to size. Order your usual size.' },
  { id: 'shipping', title: 'Shipping & Returns', content: 'Free standard shipping and 30-day free returns.' },
  { id: 'how', title: 'How This Was Made', content: 'Designed with sustainability in mind.' },
]

export default function ProductDetail() {
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [selectedColor, setSelectedColor] = useState('c1')
  const [selectedSize, setSelectedSize] = useState('M')
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  const nextImage = () => setActiveImageIdx((prev) => (prev + 1) % PRODUCT_IMAGES.length)
  const prevImage = () =>
    setActiveImageIdx((prev) => (prev === 0 ? PRODUCT_IMAGES.length - 1 : prev - 1))

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  return (
    <div className="w-full bg-white text-[#111111] font-sans antialiased selection:bg-black selection:text-white">
      <div className="w-full mx-auto px-4 pt-8 pb-24">
        <div className="flex flex-col gap-12 items-start">
          <div className="w-full flex gap-4">
            <div className="hidden flex-col gap-2 w-[60px] shrink-0">
              {PRODUCT_IMAGES.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onMouseEnter={() => setActiveImageIdx(idx)}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-full aspect-[4/5] rounded-md overflow-hidden bg-gray-100 transition-all ${
                    activeImageIdx === idx ? 'ring-1 ring-black opacity-100' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.src} alt="Thumbnail" className="w-full h-full object-cover" />
                  {img.type === 'video' && (
                    <div className="absolute bottom-1 left-1 bg-black/50 rounded-full p-0.5">
                      <AppIcon icon="lucide:play" className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="relative flex-1 bg-[#f6f6f6] rounded-xl overflow-hidden aspect-[4/5]">
              <div className="absolute top-4 left-4 z-10 bg-white rounded-full px-3.5 py-1.5 flex items-center gap-1.5 shadow-sm">
                <AppIcon icon="lucide:star" className="w-3.5 h-3.5 text-black fill-black" />
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Highly Rated</span>
              </div>

              <img
                src={PRODUCT_IMAGES[activeImageIdx].src}
                alt="Main Product"
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-6 right-6 flex gap-2 z-10">
                <button
                  type="button"
                  onClick={prevImage}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="Previous image"
                >
                  <AppIcon icon="lucide:chevron-left" className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="Next image"
                >
                  <AppIcon icon="lucide:chevron-right" className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col pt-2">
            <div className="mb-8">
              <p className="text-[#d24e16] font-medium text-[15px] mb-1">Recycled Materials</p>
              <h1 className="text-[28px] font-medium leading-tight tracking-tight text-[#111111]">
                Nike Indy Light Support
              </h1>
              <h2 className="text-[16px] text-[#707072] font-normal mt-1">
                Women&apos;s Padded Adjustable Sports Bra
              </h2>
              <p className="text-[20px] font-medium mt-4">{formatUsd(40)}</p>
            </div>

            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => color.available && setSelectedColor(color.id)}
                    disabled={!color.available}
                    className={`relative w-[70px] h-[70px] rounded-md overflow-hidden bg-gray-100 border-[1.5px] transition-all ${
                      selectedColor === color.id
                        ? 'border-[#111111]'
                        : 'border-transparent hover:border-gray-300'
                    } ${!color.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <img src={color.src} alt="Color Option" className="w-full h-full object-cover" />
                    {!color.available && (
                      <div
                        className="absolute inset-0 z-10"
                        style={{
                          background:
                            'linear-gradient(to bottom right, transparent 48%, rgba(0,0,0,0.4) 49%, rgba(0,0,0,0.4) 51%, transparent 52%)',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[16px] font-medium">Select Size</span>
                <button
                  type="button"
                  className="text-[15px] text-[#707072] font-medium flex items-center gap-1 hover:text-black"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 12h20M5 12V6h14v6m-4-6v12M9 6v12M5 18h14" />
                  </svg>
                  Size Guide
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size.label}
                    type="button"
                    onClick={() => size.available && setSelectedSize(size.label)}
                    disabled={!size.available}
                    className={`relative h-[48px] rounded-md text-[15px] font-medium flex items-center justify-center border transition-all ${
                      !size.available
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed overflow-hidden'
                        : selectedSize === size.label
                          ? 'border-black border-[1.5px] text-black'
                          : 'border-gray-300 text-[#111] hover:border-black'
                    }`}
                  >
                    {size.label}
                    {!size.available && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(to top left, transparent 48%, #d1d5db 49%, #d1d5db 51%, transparent 52%)',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10 text-center">
              <p className="text-[14px] text-[#111111] mb-1">
                4 payments of <strong className="font-bold">{formatUsd(10)}</strong> at 0% interest with{' '}
                <strong className="font-extrabold tracking-tight">Klarna</strong>
              </p>
              <button
                type="button"
                className="text-[14px] text-[#707072] underline hover:text-black transition-colors mb-6"
              >
                Check purchase power
              </button>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="w-full bg-[#111111] text-white rounded-full py-4 text-[16px] font-medium hover:bg-black/70 transition-colors"
                >
                  Add to Bag
                </button>
                <button
                  type="button"
                  className="w-full bg-white border border-gray-300 text-[#111111] rounded-full py-4 text-[16px] font-medium flex items-center justify-center gap-2 hover:border-black transition-colors"
                >
                  Favorite <AppIcon icon="lucide:heart" className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mb-8 flex flex-col gap-6">
              <div>
                <h3 className="text-[16px] font-medium mb-1">Shipping</h3>
                <p className="text-[16px] text-[#111111]">
                  You&apos;ll see our shipping options at checkout.
                </p>
              </div>

              <div>
                <h3 className="text-[16px] font-medium mb-1">Free Pickup</h3>
                <button
                  type="button"
                  className="text-[16px] font-medium underline hover:text-gray-600 transition-colors underline-offset-4"
                >
                  Find a Store
                </button>
              </div>

              <div className="bg-[#f5f5f5] p-6 flex items-center justify-center text-center">
                <p className="text-[16px] text-[#111111] leading-relaxed">
                  This product is made with at least 75%
                  <br />
                  recycled polyester fibers
                </p>
              </div>

              <div className="text-[16px] text-[#111111] leading-relaxed">
                <p className="mb-4">
                  Don&apos;t let anything get in the way of expressing yourself in this sleek,
                  low-profile sports bra. Its light support gives you a gentle hold with plenty of
                  freedom that&apos;s great for low-impact workouts or all-day comfort. Smooth,
                  quick-drying fabric gives the bra a clean finish so you can wear it your way.
                </p>
                <ul className="list-disc pl-5 flex flex-col gap-1.5 mb-6">
                  <li>Shown: Midnight Navy</li>
                  <li>Style: FD1062-410</li>
                </ul>
                <button
                  type="button"
                  className="font-medium underline underline-offset-4 hover:text-gray-600"
                >
                  View Product Details
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200">
              {ACCORDIONS.map((acc) => (
                <div key={acc.id} className="border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(acc.id)}
                    className="w-full py-6 flex items-center justify-between text-[20px] font-medium hover:text-gray-600 transition-colors"
                  >
                    {acc.title}
                    {openAccordion === acc.id ? (
                      <AppIcon icon="lucide:chevron-up" className="w-6 h-6" />
                    ) : (
                      <AppIcon icon="lucide:chevron-down" className="w-6 h-6" />
                    )}
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openAccordion === acc.id ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-[16px] text-gray-600">{acc.content}</p>
                  </div>
                </div>
              ))}

              <div className="border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => toggleAccordion('reviews')}
                  className="w-full py-6 flex items-center justify-between text-[20px] font-medium hover:text-gray-600 transition-colors"
                >
                  <span>Reviews (367)</span>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4].map((i) => (
                        <AppIcon icon="lucide:star" key={i} className="w-4 h-4 fill-black text-black" />
                      ))}
                      <div className="relative w-4 h-4">
                        <AppIcon icon="lucide:star" className="w-4 h-4 text-black absolute inset-0" />
                        <div className="w-1/2 overflow-hidden absolute inset-0">
                          <AppIcon icon="lucide:star" className="w-4 h-4 fill-black text-black" />
                        </div>
                      </div>
                    </div>
                    {openAccordion === 'reviews' ? (
                      <AppIcon icon="lucide:chevron-up" className="w-6 h-6" />
                    ) : (
                      <AppIcon icon="lucide:chevron-down" className="w-6 h-6" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-8 flex items-center gap-2 text-black cursor-pointer hover:text-gray-600 transition-colors w-fit">
              <AppIcon icon="lucide:message-square" className="w-6 h-6" strokeWidth={1.5} />
              <span className="text-[14px] font-bold underline underline-offset-4">Message</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
