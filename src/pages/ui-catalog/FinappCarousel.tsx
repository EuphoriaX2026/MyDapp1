import { AppIcon } from '../../components/icons/AppIcon';
import { useState } from 'react';

type CarouselVariant = 'carousel-full' | 'carousel-single' | 'carousel-multiple' | 'carousel-small';

export function FinappSplideCarousel({
  variant,
  slides,
  slideWidthPercent = 100,
}: {
  variant: CarouselVariant;
  slides: React.ReactNode[];
  /** 100 = full width; ~72 for carousel-multiple */
  slideWidthPercent?: number;
}) {
  const [index, setIndex] = useState(0);
  const maxIndex = slides.length - 1;

  const go = (dir: -1 | 1) => {
    setIndex((i) => Math.min(maxIndex, Math.max(0, i + dir)));
  };

  return (
    <div>
      <div className={`${variant} splide`}>
        <div className="splide__track overflow-hidden">
          <ul
            className="splide__list flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${index * slideWidthPercent}%)` }}
          >
            {slides.map((slide, i) => (
              <li
                key={i}
                className="splide__slide shrink-0"
                style={{ width: `${slideWidthPercent}%` }}
              >
                {slide}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => go(-1)} disabled={index === 0}>
          <AppIcon icon="lucide:chevron-left" className="h-4 w-4" />
        </button>
        <span className="text-xs opacity-60">
          {index + 1} / {slides.length}
        </span>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => go(1)} disabled={index === maxIndex}>
          <AppIcon icon="lucide:chevron-right" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
