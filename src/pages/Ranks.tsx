import { AppIcon } from '../components/icons/AppIcon';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { media } from '../assets/media';
import '../styles/ranks-page.css';

interface RanksProps {
  characterImage?: string;
}

const Ranks: React.FC<RanksProps> = ({
  characterImage = 'https://cdn.pixabay.com/photo/2021/08/11/11/15/woman-6538202_1280.png',
}) => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  const [timeLeft, setTimeLeft] = useState({
    days: 365,
    hours: 10,
    minutes: 21,
    seconds: 7,
  });

  const multipliers = [1, 3, 5, 10, 30, 50, 100];

  const levels = Array.from({ length: 7 }, (_, i) => ({
    level: i + 1,
    isUnlocked: i === 0,
    boosters: 0,
    maxStars: 5,
    gemsCount: 0.0,
    powerMultiplier: `${multipliers[i]}x`,
    e1Tokens: (i + 1) * 10,
    remainingDays: 365,
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentBannerImage = selectedLevel === 1 ? media.ranks.bannerLevel1 : characterImage;
  const selectedLevelData = levels.find((l) => l.level === selectedLevel) || levels[0];
  const activeHeaderStars = selectedLevelData.isUnlocked ? 1 + selectedLevelData.boosters : 0;

  const timerUnits = [
    {
      value: timeLeft.days >= 1000 ? `${Math.floor(timeLeft.days / 1000)}k` : String(timeLeft.days).padStart(2, '0'),
      label: 'DAYS',
    },
    { value: String(timeLeft.hours).padStart(2, '0'), label: 'HOURS' },
    { value: String(timeLeft.minutes).padStart(2, '0'), label: 'MIN' },
    { value: String(timeLeft.seconds).padStart(2, '0'), label: 'SEC' },
  ];

  return (
    <>
      <div className="appHeader">
        <div className="left">
          <button
            type="button"
            className="headerButton goBack"
            onClick={() => navigate('/')}
            aria-label="Back to dashboard"
          >
            <AppIcon icon="lucide:chevron-left" />
          </button>
        </div>
        <div className="pageTitle">Ranks</div>
        <div className="right" />
      </div>

      <div id="appCapsule" className="full-height ranks-page finapp-secondary-page">
        <div className="section mt-2 finapp-aligned-block">
          <div className="ranks-hero-card">
            <div className="ranks-hero-card__inner">
              <div>
                <div className="ranks-hero-card__stars">
                  {Array.from({ length: selectedLevelData.maxStars }).map((_, i) => (
                    <AppIcon
                      icon="lucide:star"
                      key={i}
                      size={14}
                      className={i < activeHeaderStars ? 'fill-[#ffb400] text-[#ffb400]' : 'text-white/35'}
                    />
                  ))}
                </div>

                <h1 className="ranks-hero-card__title">{selectedLevel} Level</h1>

                <div className="ranks-hero-card__stats">
                  <div className="ranks-hero-card__stat">
                    <img src={media.logos.my} alt="E1" />
                    <span>${selectedLevelData.e1Tokens}</span>
                  </div>
                  <div className="ranks-hero-card__stat">
                    <img src={media.ranks.flashGold} alt="Power" />
                    <span>{selectedLevelData.powerMultiplier}</span>
                  </div>
                </div>

                <div className="ranks-hero-card__segments">
                  {[1, 2, 3].map((i) => (
                    <div key={`filled-${i}`} className="ranks-hero-card__segment ranks-hero-card__segment--active" />
                  ))}
                  {[4, 5, 6].map((i) => (
                    <div key={`empty-${i}`} className="ranks-hero-card__segment" />
                  ))}
                </div>
              </div>
            </div>

            <div className="ranks-hero-card__character">
              <img
                key={currentBannerImage}
                src={currentBannerImage}
                alt={`Level ${selectedLevel}`}
                className="ranks-hero-fade-in"
              />
            </div>
          </div>

          <div className="ranks-hero-actions">
            <div className="ranks-hero-timer">
              {timerUnits.map((time) => (
                <div key={time.label} className="ranks-hero-timer__unit">
                  <span className="ranks-hero-timer__value">{time.value}</span>
                  <span className="ranks-hero-timer__label">{time.label}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg btn-block finapp-action-btn ranks-hero-upgrade"
              onClick={() => {
                console.log(`Upgrade Level ${selectedLevel}`);
              }}
            >
              Upgrade
            </button>
          </div>

          <svg width="0" height="0" aria-hidden className="ranks-level-defs">
            <defs>
              <linearGradient id="ranks-grad-selected" x1="10%" y1="0%" x2="0%" y2="100%">
                <stop offset="8%" stopColor="#7b5cff" stopOpacity="1" />
                <stop offset="45%" stopColor="#6236ff" />
                <stop offset="100%" stopColor="#2a1566" />
              </linearGradient>
              <linearGradient id="ranks-grad-normal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--ranks-shield-top, #ffffff)" stopOpacity="0.95" />
                <stop offset="100%" stopColor="var(--ranks-shield-bottom, #ededf5)" stopOpacity="0.98" />
              </linearGradient>
            </defs>
          </svg>

          <div className="ranks-level-grid">
            {levels.map((lvl) => {
              const isSelected = selectedLevel === lvl.level;
              const activeCardStars = lvl.isUnlocked ? 1 + lvl.boosters : 0;

              return (
                <div
                  key={lvl.level}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedLevel(lvl.level)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedLevel(lvl.level);
                    }
                  }}
                  className={`ranks-level-card${isSelected ? ' ranks-level-card--selected' : ''}`}
                >
                  <svg
                    viewBox="0 0 100 120"
                    preserveAspectRatio="none"
                    className="ranks-level-card__shield"
                    aria-hidden
                  >
                    <path
                      d="M 50 5
                         C 75 8, 95 15, 95 20
                         L 95 75
                         C 95 95, 70 110, 50 113
                         C 30 110, 5 95, 5 75
                         L 5 20
                         C 5 15, 25 8, 50 5 Z"
                      fill={isSelected ? 'url(#ranks-grad-selected)' : 'url(#ranks-grad-normal)'}
                      stroke={isSelected ? '#6236ff' : 'var(--ranks-shield-stroke, #dcdce9)'}
                      strokeWidth={isSelected ? '0.9' : '0.5'}
                    />
                  </svg>

                  <div className="ranks-level-card__content">
                    <h2 className="ranks-level-card__title">{lvl.level} Level</h2>

                    <div className="ranks-level-card__stars">
                      {Array.from({ length: lvl.maxStars }).map((_, i) => (
                        <AppIcon
                          icon="lucide:star"
                          key={i}
                          size={16}
                          className={
                            i < activeCardStars
                              ? 'fill-[#ffb400] text-[#ffb400]'
                              : isSelected
                                ? 'text-transparent stroke-white/35 stroke-[1.5]'
                                : 'text-transparent stroke-[#c4bdd4] stroke-[1.5]'
                          }
                        />
                      ))}
                    </div>

                    <div className="ranks-level-card__rows">
                      <div className="ranks-level-card__row">
                        <div className="ranks-level-card__row-label">
                          <img src={media.ranks.diamondRed} alt="" />
                          <span>GEM</span>
                        </div>
                        <span className="ranks-level-card__row-value">{lvl.gemsCount.toFixed(1)}</span>
                      </div>

                      <div className="ranks-level-card__row">
                        <div className="ranks-level-card__row-label">
                          <img src={media.ranks.flashGold} alt="" />
                          <span>Power</span>
                        </div>
                        <span className="ranks-level-card__row-value">{lvl.powerMultiplier}</span>
                      </div>

                      <div className="ranks-level-card__row">
                        <div className="ranks-level-card__row-label">
                          <img src={media.logos.my} alt="" />
                          <span>Value</span>
                        </div>
                        <span className="ranks-level-card__row-value">${lvl.e1Tokens}</span>
                      </div>
                    </div>

                    <div className="ranks-level-card__days">
                      <span className="ranks-level-card__days-value">{lvl.remainingDays}</span>
                      <span className="ranks-level-card__days-label">DAY</span>
                    </div>
                  </div>

                  <div className="ranks-level-card__badge">
                    {lvl.isUnlocked ? (
                      <div className="ranks-level-card__badge-inner ranks-level-card__badge-inner--ok">
                        <AppIcon icon="lucide:check" size={18} className="text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="ranks-level-card__badge-inner ranks-level-card__badge-inner--lock">
                        <AppIcon icon="lucide:lock" size={14} className="text-[#958d9e]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Ranks;
