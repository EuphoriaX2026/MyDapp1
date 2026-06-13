import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  searchOutline, 
  logoInstagram,
  logoYoutube,
  logoTwitter,
  diamond,
  star,
  menuOutline
} from 'ionicons/icons';
import { Sidebar } from '../components/Sidebar';
import { useRftIncome } from '../hooks/useRftIncome';
import { useTeamReport } from '../hooks/useTeamReport';
import { formatUnits } from 'viem';
import avatar1 from '../assets/img/sample/avatar/avatar1.jpg';

// Basic styles directly to avoid creating extra CSS files right now
const styles = `
  .my-profile-page {
    color: #1a1a1a;
  }
  .banner-card {
    background: #8a2be2; /* Solid Purple */
    height: 180px;
    position: relative;
    overflow: hidden;
  }
  .profile-avatar-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .profile-avatar-circle img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .date-pill {
    width: 45px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .plan-card-left {
    background: linear-gradient(to right, #FFD700, #FFA500);
    min-height: 220px;
  }
  .plan-card-right-top {
    background: linear-gradient(to right, #1e3a8a, #2563eb);
  }
  .plan-card-right-bottom {
    background: linear-gradient(to right, #F020A0, #A020F0);
    min-height: 60px;
  }
  .social-icon-box {
    width: 30px;
    height: 30px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
  }

`;
interface MyProfileProps {
  isEmbedded?: boolean;
}

export default function MyProfile({ isEmbedded = false }: MyProfileProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const { totalIncomeUSD, lastWeekIncomeUSD } = useRftIncome();
  const { partnersLeft, partnersRight, totalRftShares, totalPendingPoints } = useTeamReport();

  // VIP and Groups Status Data
  const isVipActive = false; // Enabled for Queen, Royal, and power package buyers
  const activeStars = 0; // Number of active groups from g1 to g7 (0 to 7)
  const userId = "789"; // Replace with dynamic user ID
  const oldestPackageRemaining = "365D 06H 45M Remaining"; // Replace with dynamic calculation

  // Format the E1 (18 decimals) into standard numbers, assuming 1 E1 = 1 USD
  const formatE1ToCurrency = (value: bigint) => {
    const num = Number(formatUnits(value, 18));
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const formattedTotal = formatE1ToCurrency(totalIncomeUSD);
  const formattedLastWeek = formatE1ToCurrency(lastWeekIncomeUSD);

  const today = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedToday = `Today ${today.getDate()} ${monthNames[today.getMonth()]}.`;

  const currentDayOfWeek = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - currentDayOfWeek);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + idx);
    return {
      day: weekDays[d.getDay()],
      date: d.getDate().toString(),
      active: d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    };
  });

  return (
    <div className="my-profile-page position-relative" style={{ minHeight: isEmbedded ? 'auto' : '100vh', paddingBottom: '20px', overflowX: 'hidden', background: isEmbedded ? 'transparent' : 'white' }}>
      {!isEmbedded && <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <style>{styles}</style>
      
      {/* Header (Menu on Left, Search on Right) */}
      {!isEmbedded && (
        <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-1">
          <div 
            className="bg-light rounded-circle d-flex justify-content-center align-items-center shadow-sm cursor-pointer" 
            style={{ width: '40px', height: '40px', cursor: 'pointer' }}
            onClick={() => setSidebarOpen(true)}
          >
            <IonIcon icon={menuOutline} style={{ fontSize: '24px', color: '#1a1a1a' }} />
          </div>
          <div className="bg-light rounded-circle d-flex justify-content-center align-items-center shadow-sm" style={{ width: '40px', height: '40px' }}>
            <IonIcon icon={searchOutline} style={{ fontSize: '20px', color: '#1a1a1a' }} />
          </div>
        </div>
      )}

      {/* Banner */}
      <div className={`section ${isEmbedded ? 'mt-2' : 'mt-1'}`}>
        <div className="banner-card rounded-4 p-4 shadow-sm position-relative">
          
          {/* VIP Area (Top Right) */}
          <div className="position-absolute end-0 p-3 text-end" style={{ top: '0', zIndex: 10 }}>
            <div className="d-flex align-items-center justify-content-end mb-1" style={{ opacity: isVipActive ? 1 : 0.5 }}>
              <IonIcon icon={diamond} style={{ fontSize: '36px', color: isVipActive ? '#FFD700' : '#ffffff' }} />
              <span className="ms-2 fw-bold" style={{ fontSize: '26px', color: isVipActive ? '#FFD700' : '#ffffff', textShadow: isVipActive ? '0 0 5px rgba(255,215,0,0.5)' : 'none' }}>VIP</span>
            </div>
          </div>

          {/* Avatar and Greeting (Top Left - Aligned with VIP) */}
          <div className="d-flex align-items-center" style={{ position: 'relative', zIndex: 10, marginTop: '-5px' }}>
            <div className="profile-avatar-circle" style={{ margin: 0 }}>
              <img src={avatar1} alt="Avatar" />
            </div>
            <div className="ms-3 text-start">
              <h5 className="m-0 fw-bold" style={{ fontSize: '18px', color: '#ffffff' }}>Hello, Sandra</h5>
              <span className="fw-medium" style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>User ID: {userId}</span>
            </div>
          </div>
          <div className="text-white mb-3 fw-medium" style={{ fontSize: '13px', opacity: 0.9 }}>
            {oldestPackageRemaining}
          </div>
          <div className="d-flex flex-wrap align-items-center justify-content-between mt-2">
            <div className="d-flex align-items-center">
              <img src="https://i.pravatar.cc/150?img=1" className="rounded-circle border border-2 border-white" style={{ width: '32px', height: '32px', zIndex: 4 }} />
              <img src="https://i.pravatar.cc/150?img=2" className="rounded-circle border border-2 border-white" style={{ width: '32px', height: '32px', marginLeft: '-12px', zIndex: 3 }} />
              <img src="https://i.pravatar.cc/150?img=3" className="rounded-circle border border-2 border-white" style={{ width: '32px', height: '32px', marginLeft: '-12px', zIndex: 2 }} />
              <div className="rounded-circle border border-2 border-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', marginLeft: '-12px', fontSize: '11px', background: '#8467d7', color: 'white', zIndex: 1 }}>+4</div>
            </div>
            {/* Stars Status Area (Bottom Right or next to avatars) */}
            <div className="d-flex gap-1 align-items-center ms-auto" style={{ zIndex: 10 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((starIndex) => (
                <IonIcon 
                  key={starIndex} 
                  icon={star} 
                  style={{ 
                    fontSize: '22px', 
                    color: starIndex <= activeStars ? '#FFD700' : '#ffffff',
                    opacity: starIndex <= activeStars ? 1 : 0.4
                  }} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Calendar */}
      <div className="px-3 mt-4">
        <div className="d-flex justify-content-between">
          {calendarDays.map((item, idx) => (
            <div key={idx} className={`date-pill text-center rounded-pill py-2 px-1 ${item.active ? 'bg-dark text-white shadow' : 'border border-light text-muted'}`}>
              <div className="fw-medium" style={{ fontSize: '11px' }}>{item.day}</div>
              <div className="fw-bold mt-1" style={{ fontSize: '15px' }}>{item.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Your plan */}
      <div className="px-3 mt-4 text-start">
        <h4 className="fw-bold mb-3 text-dark" style={{ fontSize: '20px' }}>Your plan</h4>
        <div className="row g-3">
          {/* Left Large Card (Team Report) */}
          <div className="col-6">
            <div className="plan-card-left rounded-4 p-3 position-relative overflow-hidden shadow-sm d-flex flex-column h-100">
              <div className="d-flex flex-column h-100 justify-content-between position-relative" style={{ zIndex: 10 }}>
                <div>
                  <h5 className="fw-bold mb-3 text-white" style={{ fontSize: '18px' }}>Team Report</h5>
                  <div className="fw-medium text-white" style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.8' }}>
                    Partners: <strong className="text-dark bg-light px-1 rounded">{partnersLeft.toString()} - {partnersRight.toString()}</strong><br/>
                    This week RFT: <strong className="text-dark bg-light px-1 rounded">{totalRftShares.toString()}</strong><br/>
                    Points pending: <strong className="text-dark bg-light px-1 rounded">{totalPendingPoints.toString()}</strong>
                  </div>
                </div>
                
                <div className="d-flex justify-content-start mt-2">
                   <span className="badge bg-white text-dark rounded-pill px-3 py-2 fw-bold shadow-sm cursor-pointer" style={{ fontSize: '11px' }}>View</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="col-6 d-flex flex-column gap-3">
            {/* Top Right Card */}
            <div className="plan-card-right-top rounded-4 p-3 position-relative overflow-hidden shadow-sm d-flex flex-column h-100" style={{ flex: 1 }}>
              <div className="d-flex flex-column h-100 justify-content-between position-relative" style={{ zIndex: 10 }}>
                <div>
                  <h5 className="fw-bold mb-3 text-white" style={{ fontSize: '18px' }}>Income</h5>
                  <div className="fw-medium text-white" style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.8' }}>
                    Total: <strong className="text-dark bg-light px-1 rounded">{formattedTotal}</strong><br/>
                    Last week: <strong className="text-dark bg-light px-1 rounded">{formattedLastWeek}</strong>
                  </div>
                  <div className="mt-2 text-start">
                     <span className="badge bg-white text-dark rounded-pill px-3 py-2 fw-bold shadow-sm cursor-pointer" style={{ fontSize: '11px' }}>View</span>
                  </div>
                </div>
              </div>

              {/* Decorative circles */}
              <div className="position-absolute shadow-sm" style={{ width: '60px', height: '60px', background: '#eab8a2', borderRadius: '50%', right: '-10px', bottom: '-10px', zIndex: 1 }}></div>
              <div className="position-absolute" style={{ width: '30px', height: '30px', background: '#a1b1b3', borderRadius: '50%', right: '35px', bottom: '15px', zIndex: 2 }}></div>
            </div>
            
            {/* Bottom Right Card (Socials) */}
            <div className="plan-card-right-bottom rounded-4 p-2 d-flex justify-content-around align-items-center shadow-sm">
              <div className="social-icon-box shadow-sm"><IonIcon icon={logoInstagram} /></div>
              <div className="social-icon-box shadow-sm"><IonIcon icon={logoYoutube} /></div>
              <div className="social-icon-box shadow-sm"><IonIcon icon={logoTwitter} /></div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
