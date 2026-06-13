import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { media } from '../assets/media';

const BannerSlider: React.FC = () => {
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const dragDistance = useRef(0);

  const banners = [
    { id: 1, src: media.banners.homeKitchen, link: '/target-page-3', alt: 'Home Kitchen' },
    { id: 2, src: media.banners.digital, link: '/target-page-1', alt: 'Digital Financing' },
    { id: 3, src: media.banners.goldAccessories, link: '/target-page-2', alt: 'Gold Accessories' },
    { id: 4, src: media.banners.financingKitchen, link: '/target-page-3', alt: 'Home Kitchen' },
  ];

  const infiniteBanners = [...banners, ...banners, ...banners];

  const scrollLeft = () => {
    if (!sliderRef.current) return;
    sliderRef.current.style.scrollBehavior = 'smooth';
    sliderRef.current.scrollBy({ left: -sliderRef.current.offsetWidth / 3 });
  };

  const scrollRight = () => {
    if (!sliderRef.current) return;
    sliderRef.current.style.scrollBehavior = 'smooth';
    sliderRef.current.scrollBy({ left: sliderRef.current.offsetWidth / 3 });
  };

  useEffect(() => {
    if (!sliderRef.current) return;
    const singleSetWidth = sliderRef.current.scrollWidth / 3;
    sliderRef.current.scrollLeft = singleSetWidth;
  }, [banners.length]);

  const handleInfiniteScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const slider = e.currentTarget;
    const singleSetWidth = slider.scrollWidth / 3;

    if (slider.scrollLeft >= singleSetWidth * 2) {
      slider.style.scrollBehavior = 'auto';
      slider.scrollLeft -= singleSetWidth;
    } else if (slider.scrollLeft <= 0) {
      slider.style.scrollBehavior = 'auto';
      slider.scrollLeft += singleSetWidth;
    }

    const scrollPos = slider.scrollLeft;
    const slideWidth = slider.clientWidth;
    const relativeScroll = scrollPos % singleSetWidth;
    const newSlide = Math.round(relativeScroll / slideWidth);
    setCurrentSlide(Math.min(newSlide, banners.length - 1));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDragging.current = true;
    dragDistance.current = 0;
    startX.current = e.pageX;
    startScrollLeft.current = sliderRef.current.scrollLeft;
    sliderRef.current.style.scrollBehavior = 'auto';
    sliderRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const walk = e.pageX - startX.current;
    dragDistance.current = Math.abs(walk);
    sliderRef.current.scrollLeft = startScrollLeft.current - walk;
  };

  const endDrag = () => {
    if (!sliderRef.current) return;
    isDragging.current = false;
    sliderRef.current.style.cursor = 'grab';
    sliderRef.current.style.scrollBehavior = 'smooth';
  };

  const handleBannerClick = (link: string) => {
    if (dragDistance.current > 5) return;
    navigate(link);
  };

  return (
    <div className="relative w-full px-1">
      <button
        type="button"
        className="absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white md:flex"
        onClick={scrollLeft}
        aria-label="Previous banner"
      >
        ‹
      </button>
      <button
        type="button"
        className="absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white md:flex"
        onClick={scrollRight}
        aria-label="Next banner"
      >
        ›
      </button>

      <div
        ref={sliderRef}
        className="flex w-full cursor-grab gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleInfiniteScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {infiniteBanners.map((banner, index) => (
          <button
            key={`${banner.id}-${index}`}
            type="button"
            className="min-w-[calc(100%-8px)] flex-shrink-0 snap-center overflow-hidden rounded-2xl border-0 p-0 md:min-w-[calc(33.333%-8px)]"
            onClick={() => handleBannerClick(banner.link)}
          >
            <img
              src={banner.src}
              alt={banner.alt}
              className="h-28 w-full object-cover md:h-32"
              draggable={false}
            />
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {banners.map((banner, index) => (
          <span
            key={banner.id}
            className={`h-1.5 rounded-full transition-all ${
              currentSlide === index ? 'w-4 bg-[#6236ff]' : 'w-1.5 bg-gray-300'
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
