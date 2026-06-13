import { AppIcon } from '../../components/icons/AppIcon';
import React from 'react';
import { useProfile } from '../../context/ProfileContext';

/** Mirrored from MyWallet2 — unified 52px controls */
const CTRL_SIZE = 'h-[52px] w-[52px]';
const CTRL_ICON_SIZE = 22;
const CTRL_LABEL = 'text-[12px] font-medium uppercase tracking-wider text-gray-500';

const MW2_GLASS_BTN = [
  CTRL_SIZE,
  '!rounded-full',
  'shrink-0',
  'bg-[var(--finapp-content-bg)]',
  'border',
  'border-white/10',
  'text-[var(--finapp-heading)]',
  'shadow-[0_2px_10px_rgba(0,0,0,0.25)]',
  'hover:bg-white/5',
  'transition-colors',
].join(' ');

const PROFILE_AVATAR = `${CTRL_SIZE} shrink-0 rounded-full bg-gradient-to-br from-[#bae6fd] to-[#99f6e4] p-[2px] shadow-[0_4px_16px_rgba(0,0,0,0.06)]`;
const PROFILE_NAME = 'text-[18px] font-bold leading-tight tracking-tight text-[var(--finapp-heading)]';
const PROFILE_SUB = 'text-[13px] font-medium text-[var(--finapp-text)]';

const QUICK_ACTIONS = [
  { icon: 'lucide:download', label: 'Withdraw', offset: '-translate-y-2' },
  { icon: 'lucide:arrow-up', label: 'Send', offset: 'translate-y-4' },
  { icon: 'lucide:plus', label: 'Add Funds', offset: 'translate-y-4' },
  { icon: 'lucide:layout-grid', label: 'More', offset: '-translate-y-2' },
] as const;

// Helper for Laser Edge Effects
const LaserEdge = ({ position, color = "from-white/0 via-white/80 to-white/0", glow = "shadow-[0_0_15px_2px_rgba(255,255,255,0.9)]" }: { position: string, color?: string, glow?: string }) => (
  <div className={`absolute pointer-events-none ${position}`}>
    <div className={`w-full h-full bg-gradient-to-r ${color} ${glow}`} />
  </div>
);

export function FinalizedProposalTab() {
  const { username, avatar } = useProfile();

  return (
    // Outer Container (Forces Finapp Dark Mode environment locally if needed, but relies on global body class in UI test)
    <div className="min-h-screen flex flex-col items-center justify-start gap-10 p-4 py-12 font-sans selection:bg-purple-500/30">
      
      {/* ==================================================== */}
      {/* MOBILE FRAME (NATIVE FINAPP DARK BACKGROUND)         */}
      {/* ==================================================== */}
      <div 
        className="relative w-full max-w-[420px] h-[950px] rounded-[48px] overflow-y-auto overflow-x-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)] border border-white/10 scrollbar-hide"
        style={{ backgroundColor: 'var(--finapp-body-bg, #030108)' }}
      >
        
        {/* Subtle Ambient Glows (enhancing Finapp Dark) */}
        <div className="absolute -top-[10%] -left-[10%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(98,54,255,0.25)_0%,transparent_70%)] rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(219,44,245,0.15)_0%,transparent_70%)] rounded-full blur-3xl z-0 pointer-events-none"></div>
        
        <div className="relative z-10 w-full flex flex-col gap-10 px-6 py-10 pb-32">
          
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--finapp-heading, #ffffff)' }}>
              Finapp Dark Base
            </h2>
            <p className="text-[13px] font-normal" style={{ color: 'var(--finapp-text, #8f82a5)' }}>
              The Official Baseline + E.ONE Atoms
            </p>
          </div>

          {/* ==================================================== */}
          {/* 1. NATIVE FINAPP CARDS (NEW)                         */}
          {/* ==================================================== */}
          <div className="w-full">
            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-1" style={{ color: 'var(--finapp-text-light, #69587f)' }}>
              Native Finapp Behavior
            </h3>
            
            <div className="card mb-4 border-0 shadow-lg">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
                    <AppIcon icon="lucide:zap" className="text-white w-4 h-4"/>
                  </div>
                  <h5 className="card-title mb-0">Standard Card (.card)</h5>
                </div>
                <p className="card-text text-sm">
                  In Finapp Dark, this naturally turns into <span className="font-mono text-white">#161129</span> (Deep Purple/Navy) with icy text.
                </p>
              </div>
            </div>

            <div className="card bg-primary border-0 shadow-lg shadow-primary/30">
              <div className="card-body">
                <h5 className="card-title text-white">Primary Card (.bg-primary)</h5>
                <p className="text-white/80 text-sm">
                  Uses the primary brand token. Perfectly complements our custom glass atoms.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 2. 3D BUTTON MATRIX                                  */}
          {/* ==================================================== */}
          <div className="w-full">
            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-1" style={{ color: 'var(--finapp-text-light, #69587f)' }}>
              3D Action Buttons
            </h3>
            <div className="grid grid-cols-2 gap-4">
              
              <div className="flex flex-col gap-4">
                <button className="relative w-full py-3.5 rounded-full bg-gradient-to-b from-[#2A2D3C] to-[#12141D] border border-white/10 text-white font-bold text-[14px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),_0_8px_20px_rgba(0,0,0,0.4)] hover:brightness-110 active:scale-95 transition-all group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/0 via-brand-blue/20 to-brand-blue/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  Active Pill
                </button>
                <button className="w-full py-3.5 rounded-full border text-white/30 font-bold text-[14px] cursor-not-allowed" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'var(--finapp-line)' }}>
                  Inactive Pill
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <button className="relative w-full py-3.5 rounded-xl bg-gradient-to-b from-[#2A2D3C] to-[#12141D] border border-white/10 text-white font-bold text-[14px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),_0_8px_20px_rgba(0,0,0,0.4)] hover:brightness-110 active:scale-95 transition-all group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-pink/0 via-brand-pink/20 to-brand-pink/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  Active Curve
                </button>
                <button className="w-full py-3.5 rounded-xl border text-white/30 font-bold text-[14px] cursor-not-allowed" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'var(--finapp-line)' }}>
                  Inactive Curve
                </button>
              </div>

            </div>

            <div className="mt-5">
              <button 
                className="relative w-full rounded-full py-4 text-[16px] font-bold text-white transition-all duration-300 hover:brightness-110 active:scale-[0.97] overflow-hidden"
                style={{
                  // 60% Top Halo (#6236FF) fading into 40% Bottom Halo (#3F1FCC)
                  background: 'linear-gradient(180deg, #6236FF 0%, rgba(98, 54, 255, 0.9) 45%, rgba(63, 31, 204, 0.9) 60%, #3F1FCC 100%)',
                  // Volume Physics: 
                  // 1. Top white micro-reflection
                  // 2. Deep bottom anchor shadow
                  // 3. Outer ambient brand glow
                  boxShadow: `
                    inset 0px 2px 4px rgba(255, 255, 255, 0.25), 
                    inset 0px -8px 12px rgba(30, 15, 100, 0.5),
                    0px 10px 25px -5px rgba(98, 54, 255, 0.5)
                  `,
                  textShadow: '0px 1px 3px rgba(0,0,0,0.4)'
                }}
              >
                Login
              </button>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 3. LASER EDGE CARDS                                  */}
          {/* ==================================================== */}
          <div className="w-full">
            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-1" style={{ color: 'var(--finapp-text-light, #69587f)' }}>
              Laser Edge Cards
            </h3>
            
            <div className="relative w-full h-[160px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#3B2C7A]/80 to-[#181434]/80 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-2xl p-5 flex flex-col justify-between">
              <LaserEdge color="from-transparent via-white to-transparent" glow="shadow-[0_2px_20px_rgba(255,255,255,1)]" position="top-0 left-[20%] right-[20%] h-[1px]"/>
              <LaserEdge color="from-white/80 to-transparent" glow="shadow-[0_-2px_15px_rgba(255,255,255,0.6)]" position="bottom-0 left-6 w-[40%] h-[1.5px]"/>
              <LaserEdge color="from-transparent via-[var(--finapp-primary)]/80 to-transparent bg-gradient-to-b" glow="shadow-[-2px_0_20px_var(--finapp-primary)]" position="top-[10%] bottom-[10%] right-0 w-[1.5px]"/>

              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shadow-inner">
                    <AppIcon icon="lucide:bitcoin" className="text-white w-5 h-5"/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">Bitcoin</span>
                    <span className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--finapp-text)' }}>BTC</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex justify-between items-end">
                <span className="text-white font-black text-2xl tracking-tight">$55,250.00</span>
                <div className="bg-white/5 px-2 py-1 rounded-md text-[9px] font-bold text-white border border-white/5 flex items-center gap-1">
                   <span style={{ color: 'var(--finapp-primary)' }}>↑</span> +0.250
                </div>
              </div>
            </div>

            <div className="relative w-full rounded-2xl overflow-hidden backdrop-blur-xl p-4 mt-4 flex items-center justify-between shadow-lg" style={{ backgroundColor: 'var(--finapp-content-bg)' }}>
              <LaserEdge color="from-transparent via-white/80 to-transparent" glow="shadow-[0_2px_15px_rgba(255,255,255,0.6)]" position="top-0 left-[10%] w-[35%] h-[1.5px]"/>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black/40 border border-white/5 flex items-center justify-center shadow-inner">
                  <AppIcon icon="lucide:shield-alert" className="text-red-500 w-5 h-5"/>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm">Apple</span>
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--finapp-text-light)' }}>NTF INC</span>
                </div>
              </div>
              <div className="flex flex-col items-end text-right z-10">
                <span className="text-white font-bold text-[15px]">$250.00</span>
                <span className="text-green-500 text-[10px] font-bold mt-0.5 tracking-wider">+00.50%</span>
              </div>
            </div>
          </div>

        </div>

        {/* ==================================================== */}
        {/* 4. FLASHLIGHT BOTTOM NAV                             */}
        {/* ==================================================== */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50">
          <div className="relative w-full h-[72px] rounded-[2rem] backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] flex items-center justify-around px-2" style={{ backgroundColor: 'rgba(18, 16, 42, 0.95)' }}>
            
            <div className="relative flex items-center justify-center w-16 h-full cursor-pointer">
              <div className="absolute top-0 w-8 h-[3px] bg-white rounded-b-full shadow-[0_2px_15px_3px_rgba(255,255,255,1),0_5px_30px_8px_var(--finapp-primary)] z-10" />
              <div className="absolute top-0 w-16 h-[60px] bg-gradient-to-b from-white/30 to-transparent blur-[8px] rounded-t-md opacity-80" />
              <div className="relative z-20 w-10 h-10 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center shadow-[0_0_20px_var(--finapp-primary)]">
                <AppIcon icon="lucide:home" className="text-white w-5 h-5" strokeWidth={2.5}/>
              </div>
            </div>

            <div className="w-16 h-full flex items-center justify-center cursor-pointer transition-colors hover:text-white" style={{ color: 'var(--finapp-text-light)' }}><AppIcon icon="lucide:wallet" className="w-6 h-6" strokeWidth={1.5}/></div>
            <div className="w-16 h-full flex items-center justify-center cursor-pointer transition-colors hover:text-white" style={{ color: 'var(--finapp-text-light)' }}><AppIcon icon="lucide:repeat" className="w-6 h-6" strokeWidth={1.5}/></div>
            <div className="w-16 h-full flex items-center justify-center cursor-pointer transition-colors hover:text-white" style={{ color: 'var(--finapp-text-light)' }}><AppIcon icon="lucide:user" className="w-6 h-6" strokeWidth={1.5}/></div>
          </div>
        </div>

      </div>

      {/* ==================================================== */}
      {/* MYWALLET2 REFERENCE — Avatar + Quick Actions (More)    */}
      {/* Sample from #/MyWallet2, placed below mobile frame   */}
      {/* ==================================================== */}
      <div className="w-full max-w-[420px]">
        <h3
          className="text-[11px] font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-1 text-center"
          style={{ color: 'var(--finapp-text-light, #69587f)' }}
        >
          MyWallet2 Reference — Avatar &amp; More
        </h3>

        <div
          className="rounded-[32px] border border-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          style={{ backgroundColor: 'var(--finapp-body-bg, #030108)' }}
        >
          {/* Profile header — avatar + search + bell */}
          <div className="mb-8 flex min-h-[52px] items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`${PROFILE_AVATAR} overflow-hidden`}>
                <div className="h-full w-full overflow-hidden rounded-full border border-white/50 bg-white">
                  <img src={avatar} alt={username} className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="flex min-w-0 flex-col justify-center gap-1">
                <span className={`${PROFILE_NAME} truncate`}>{username}</span>
                <span className={`${PROFILE_SUB} truncate`}>0x1234...5678</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button type="button" aria-label="Search" className={`${MW2_GLASS_BTN} relative`}>
                <AppIcon icon="lucide:search" size={CTRL_ICON_SIZE} className="relative z-10" strokeWidth={2} />
              </button>
              <button type="button" aria-label="Notifications" className={`${MW2_GLASS_BTN} relative`}>
                <AppIcon icon="lucide:bell" size={CTRL_ICON_SIZE} className="relative z-10" strokeWidth={2} />
                <span className="absolute top-2 right-2 z-10 h-2 w-2 rounded-full bg-[var(--finapp-primary)]" />
              </button>
            </div>
          </div>

          {/* Orbital quick actions — Withdraw / Send / Add Funds / More */}
          <div className="flex items-end justify-between px-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`group flex cursor-pointer flex-col items-center gap-2 transform ${action.offset}`}
              >
                <div className={`${MW2_GLASS_BTN} group-hover:bg-white/5`}>
                  <AppIcon
                    icon={action.icon}
                    width={CTRL_ICON_SIZE}
                    height={CTRL_ICON_SIZE}
                    className="relative z-10 text-[var(--finapp-heading)] group-hover:text-[var(--finapp-primary)]"
                  />
                </div>
                <span className={`${CTRL_LABEL} text-center`}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
