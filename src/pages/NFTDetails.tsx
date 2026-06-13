import { AppIcon } from '../components/icons/AppIcon';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useReadContract } from 'wagmi';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import StoreABI from '../abis/Store-titan.json';
import { GlassCard } from '../components/ui/glass';
import { STORE_REALM_PRODUCTS } from '../data/storeRealmProducts';
import { media } from '../assets/media';

// ─── Product Data ─────────────────────────────────────────────────────────────
type LocalProduct = {
  id: number;
  hash: string;
  name: string;
  level: string;
  price: number;
  img: string;
  themeHex: string;
  creator?: string;
  avatar?: string;
  remaining?: number;
  cashback?: number;
};

const products: LocalProduct[] = STORE_REALM_PRODUCTS;

export default function NFTDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Find the product by ID or fallback to the first one if no id/invalid id
  const product = products.find(p => p.id === Number(id)) || products[0];
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [dragging,setDragging]=useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(0);

  // فراخوانی اطلاعات کاتالوگ از شبکه
  const { data: catalogData } = useReadContract({
    address: TITAN_CONTRACTS.Store as `0x${string}`,
    abi: StoreABI.abi,
    functionName: 'catalog',
    args: [product.hash as `0x${string}`],
  });

  let remainder: string | number = product.name.includes('Realm') ? 'Available' : (product.remaining || 1500);
  let cashbackPercent = product.name.includes('Realm') ? 100 : (product.cashback || 5);

  if (catalogData && !product.name.includes('Realm')) {
    const data = catalogData as any;
    const maxSupply = Number(data.maxSupply !== undefined ? data.maxSupply : data[8] || 0);
    const mintedCount = Number(data.mintedCount !== undefined ? data.mintedCount : data[9] || 0);
    if (maxSupply > 0) {
      remainder = maxSupply - mintedCount;
    }
    const mintingRate = Number(data.mintingRate !== undefined ? data.mintingRate : data[6] || 500);
    if (mintingRate > 0) {
      cashbackPercent = mintingRate / 100;
    }
  }

  // مقادیر سازنده (Creator)
  const creatorName = product.creator || '@e.one';
  const creatorAvatar = product.avatar || media.logos.my;

  // معادل قیمت بر اساس ERX
  const erxPriceUsd = 0.0111;
  const equivalentErx = (product.price / erxPriceUsd).toFixed(0);

  const [maxSwipeWidth, setMaxSwipeWidth] = useState(200);

  useEffect(() => {
    const updateWidth = () => {
      // App padding: 24*2=48, ActionBar padding: 8*2=16, Button width: ~140
      setMaxSwipeWidth(window.innerWidth - 48 - 16 - 140);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    const startX = e.clientX;

    const move = (ev: MouseEvent) => {
      const diff = ev.clientX - startX;
      if (diff > 0 && diff <= maxSwipeWidth) {
        setSwipeProgress(diff);
      } else if (diff > maxSwipeWidth) {
        setSwipeProgress(maxSwipeWidth);
      }
    };

    const up = () => {
      setSwipeProgress((prev) => {
        if (prev >= maxSwipeWidth * 0.9) {
          setQuantity(q => q + 1);
          return maxSwipeWidth;
        }
        return 0;
      });
      setDragging(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setDragging(true);
    const startX = e.touches[0].clientX;

    const move = (ev: TouchEvent) => {
      const diff = ev.touches[0].clientX - startX;
      if (diff > 0 && diff <= maxSwipeWidth) {
        setSwipeProgress(diff);
      } else if (diff > maxSwipeWidth) {
        setSwipeProgress(maxSwipeWidth);
      }
    };

    const up = () => {
      setSwipeProgress((prev) => {
        if (prev >= maxSwipeWidth * 0.9) {
          setQuantity(q => q + 1);
          return maxSwipeWidth;
        }
        return 0;
      });
      setDragging(false);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };

    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);
  };




  // State برای تایمر شمارش معکوس
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 52,
    seconds: 22
  });

  // افکت برای کم کردن زمان تایمر به صورت واقعی
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime.seconds > 0) {
          return { ...prevTime, seconds: prevTime.seconds - 1 };
        } else if (prevTime.minutes > 0) {
          return { ...prevTime, minutes: prevTime.minutes - 1, seconds: 59 };
        } else if (prevTime.hours > 0) {
          return { hours: prevTime.hours - 1, minutes: 59, seconds: 59 };
        }
        return prevTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // فرمت کردن زمان برای نمایش دو رقمی
  const formatTime = (time: number) => time.toString().padStart(2, '0');

  // استایل‌های اختصاصی این صفحه (مشابه ساختار نمونه شما)
  const nftStyles = `
    .nft-app-bg {
      background-color: var(--finapp-body-bg, #ededf5);
      min-height: 100vh;
      width: 100vw;
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 24px 24px 40px 24px;
    }

    /* هاله‌های نوری پس‌زمینه */
    .bg-glow-purple {
      position: absolute;
      top: -10%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(155, 81, 224, 0.4) 0%, rgba(0,0,0,0) 70%);
      filter: blur(40px);
      z-index: 0;
    }
    
    .bg-glow-blue {
      position: absolute;
      bottom: 10%;
      left: -10%;
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(45, 156, 219, 0.3) 0%, rgba(0,0,0,0) 70%);
      filter: blur(50px);
      z-index: 0;
    }

    /* هدر */
    .nft-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
      margin-bottom: 24px;
    }

    .nft-hero-section {
      width: 100%;
      position: relative;
    }

    .back-btn {
      position: absolute;
      top: 16px;
      left: 16px;
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #FFF;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      cursor: pointer;
      z-index: 20;
      transition: all 0.3s ease;
    }
    
    .back-btn:hover { 
      background: rgba(255, 255, 255, 0.35); 
    }

    .bookmark-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #FFF;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      cursor: pointer;
      z-index: 20;
      transition: all 0.3s ease;
    }

    /* تصویر اصلی NFT */
    .nft-image-container {
      position: relative;
      width: 100%;
      height: 480px;
      margin: 0 auto;
      border-radius: 40px;
      overflow: hidden;
      z-index: 10;
      box-shadow: 0 16px 40px -8px ${product.themeHex}55;
    }

    .nft-image-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, ${product.themeHex}EE 0%, ${product.themeHex}BB 25%, ${product.themeHex}44 55%, transparent 100%);
      z-index: 5;
    }

    .nft-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }

    /* تگ سازنده روی تصویر */
    .creator-badge {
      position: absolute;
      bottom: 16px;
      left: 16px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 6px 16px 6px 6px;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .creator-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
    }

    .creator-name {
      font-size: 13px;
      font-weight: 700;
      color: #FFF;
      letter-spacing: 0.5px;
    }

    /* کارت پیشنهاد فعلی (Bid) */
    .glass-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 0, 0, 0.04);
      border-radius: 20px;
      padding: 20px;
      position: relative;
      z-index: 10;
      margin-top: 24px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
    }

    .bid-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .bid-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6B7280;
      font-size: 14px;
      font-weight: 500;
    }

    .eth-icon {
      width: 12px;
      fill: #A0A5BA;
    }

    .bid-amount {
      font-size: 18px;
      font-weight: 700;
      color: #1A1A1A;
    }

    /* باکس اطلاعات سفید */
    .info-box {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 20px;
      margin-top: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      position: relative;
      z-index: 10;
    }

    /* جزئیات NFT */
    .nft-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .detail-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .detail-title {
      font-size: 12px;
      color: #6B7280;
    }

    .detail-value {
      font-size: 16px;
      font-weight: 700;
      color: #1A1A1A;
      letter-spacing: 0.5px;
    }

    /* جداکننده زیبا */
    .fade-divider {
      height: 1px;
      background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%);
      margin: 16px 0;
      width: 100%;
    }

    /* استایل‌های مربوط به تب‌ها */
    .nft-tabs-container {
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50px;
      padding: 6px;
      display: flex;
      margin: 24px 0 16px 0;
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    
    .nft-tab {
      flex: 1;
      text-align: center;
      padding: 8px 0;
      border-radius: 40px;
      font-size: 13px;
      font-weight: 700;
      color: #8E8E93;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .nft-tab.active {
      background: #FFFFFF;
      color: #1A1A2E;
      box-shadow: 0px 4px 12px rgba(0,0,0,0.06);
    }

    .nft-description {
      color: #4F4F4F;
      font-size: 13px;
      line-height: 1.6;
    }

    .read-more {
      color: #1A1A1A;
      font-weight: 700;
      cursor: pointer;
    }

    /* نوار اکشن پایین */
.action-bar {
  margin-top: 24px; /* کمی کمتر برای کاهش فضای کلی */
  background: rgba(255, 255, 255, 0.7); /* از تم تیره 25,30,40 به سفید شیشه‌ای روشن */
  border-radius: 100px;
  padding: 8px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 10;
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}


    .place-bid-btn {
      background: linear-gradient(90deg, #6C38FF 0%, #D936FF 100%);
      border: none;
      border-radius: 100px;
      padding: 16px 32px;
      color: white;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0px 8px 20px rgba(217, 54, 255, 0.3);
      transition: transform 0.2s ease;
    }

    .place-bid-btn:hover{
  box-shadow:
    0 0 10px rgba(217,54,255,0.5),
    0 0 25px rgba(217,54,255,0.4),
    0 0 40px rgba(217,54,255,0.3);
}


    .place-bid-btn:active {
      transform: scale(0.96);
    }

    .swipe-arrows {
      display: flex;
      gap: 4px;
      margin-left: auto;
      margin-right: 24px;
      color: #4A5065;
      font-size: 20px;
    }
  `;

  return (
    <div className="dapp-page nft-app-bg finapp-secondary-page pb-28">
      <style>{nftStyles}</style>

      {/* افکت‌های نوری پس زمینه */}
      <div className="bg-glow-purple"></div>
      <div className="bg-glow-blue"></div>


      {/* تصویر اصلی و نشان سازنده */}
      <div className="nft-hero-section">
        <div className="nft-image-container">
          <div className="back-btn" onClick={() => navigate('/store')}>
            <AppIcon icon="lucide:arrow-left" />
          </div>

          <div className="bookmark-btn" onClick={() => navigate('/store', { state: { openCart: true, cartItems: [{ ...product, quantity: quantity > 0 ? quantity : 1 }] } })}>
            <AppIcon icon="lucide:shopping-cart" />
            {quantity > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DB2CF5] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#F8F9FE]">
                {quantity}
              </span>
            )}
          </div>

          <img 
            src={product.img} 
            alt={product.name} 
            className="nft-image" 
            onError={(e: any) => {
              e.target.src = `https://placehold.co/400x600/${product.themeHex.replace('#', '')}/FFF?text=${product.level}`;
            }}
          />
          
          <div className="nft-image-gradient"></div>

          <div className="creator-badge" style={{ zIndex: 20 }}>
            <img 
              src={creatorAvatar} 
              alt="Creator" 
              className="creator-avatar" 
              style={creatorAvatar === media.logos.my ? { transform: 'scale(0.7)', filter: 'brightness(0) invert(1)' } : {}}
            />
            <span className="creator-name">{creatorName}</span>
          </div>
        </div>
      </div>

      {/* بخش نمایش پیشنهاد (Bid) فعلی */}
      <GlassCard glowColor="blue" className="glass-card">
        <div className="bid-row">
          <div className="bid-label">
            Price
          </div>
          <div className="bid-amount">{product.price} USD</div>
        </div>
      </GlassCard>

      {/* باکس اطلاعات سفید */}
      <div className="info-box">
        {/* اطلاعات NFT */}
        <div className="nft-details">
          <div className="detail-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <span className="detail-title">Name</span>
            <span className="detail-value" style={{ fontSize: '18px' }}>{product.name}</span>
          </div>
          
          {/* خط جداکننده عمودی */}
          <div style={{ width: '1px', backgroundColor: 'rgba(0,0,0,0.06)' }}></div>

          <div className="detail-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <img 
              src={media.logos.erx} 
              alt="ERX" 
              style={{width: '24px', height: '24px', objectFit: 'contain', filter: 'invert(50%) sepia(0) saturate(0) hue-rotate(0deg) brightness(1)'}} 
            />
            <span className="detail-value" style={{ fontSize: '18px', marginTop: '4px' }}>
              {Number(equivalentErx).toLocaleString('en-US')} ERX
            </span>
          </div>
        </div>

        <div className="fade-divider"></div>

        {/* مشخصات محصول */}
        <div className="product-specs mt-2 mb-2">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.04)'}}>
            <span style={{fontSize: '13px', color: '#6B7280'}}>Remainder :</span>
            <span style={{fontSize: '14px', fontWeight: 700, color: '#1A1A1A'}}>{remainder}</span>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: '13px', color: '#6B7280'}}>Cashback :</span>
            <div>
              <span style={{fontSize: '14px', fontWeight: 700, color: '#1A1A1A'}}>{cashbackPercent}%</span>
              <span style={{fontSize: '12px', color: '#10B981', fontWeight: 600, marginLeft: '6px'}}>
                = +{Math.floor(product.price * cashbackPercent / 100)} E1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* منوی تب ها */}
      <div className="nft-tabs-container">
        <div 
          className={`nft-tab ${activeTab === 'description' ? 'active shadow-sm' : ''}`}
          onClick={() => setActiveTab('description')}
        >Description</div>
        <div 
          className={`nft-tab ${activeTab === 'details' ? 'active shadow-sm' : ''}`}
          onClick={() => setActiveTab('details')}
        >Details</div>
        <div 
          className={`nft-tab ${activeTab === 'reviews' ? 'active shadow-sm' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >Reviews</div>
        <div 
          className={`nft-tab ${activeTab === 'faqs' ? 'active shadow-sm' : ''}`}
          onClick={() => setActiveTab('faqs')}
        >FAQs</div>
      </div>

      <div className="tab-content" style={{ padding: '0 8px', marginBottom: '100px' }}>
        {activeTab === 'description' && (
          <p className="nft-description">
            Dive into a world of animated wonders. Experience playful and unique cartoon <span className="read-more">Read More..</span>
          </p>
        )}
        {activeTab === 'details' && (
          <p className="nft-description text-center mt-4">Details content coming soon</p>
        )}
        {activeTab === 'reviews' && (
          <p className="nft-description text-center mt-4">No reviews yet</p>
        )}
        {activeTab === 'faqs' && (
          <p className="nft-description text-center mt-4">Frequently Asked Questions</p>
        )}
      </div>

      {/* دکمه اکشن (Place Bid) */}
<div className="action-bar">
  <div
    className="place-bid-btn"
    style={{
      transform: `translateX(${swipeProgress}px)`
    }}
    onMouseDown={handleMouseDown}
    onTouchStart={handleTouchStart}
  >
    Add to cart
  </div>

  <div className="swipe-arrows">
    <AppIcon icon="lucide:chevron-right" />
    <AppIcon icon="lucide:chevron-right" style={{ opacity: 0.6 }} />
    <AppIcon icon="lucide:chevron-right" style={{ opacity: 0.3 }} />
  </div>
</div>
    </div>

  );
}
