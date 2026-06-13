import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { useAccount, useReadContract } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import RegisterABI from '../abis/Register-titan.json';
import { useWallet } from '../hooks/useWallet';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-[#020208] text-white relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- Visual Effects (The Eclipse Engine) --- */}
      <style>{`
        @keyframes swing {
          0%, 100% { transform: translateX(-50%) rotate(-12deg) scaleY(0.9); }
          50% { transform: translateX(-50%) rotate(12deg) scaleY(1.1); }
        }
        @keyframes intense-pulse {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(0.95); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(1.05); }
        }
      `}</style>
      
      {/* Background Glows Optimized for Mobile */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[200vw] md:w-[150vw] h-[600px] md:h-[800px] bg-blue-600/20 blur-[100px] md:blur-[150px] rounded-[100%] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] md:w-[80vw] h-[400px] md:h-[500px] bg-indigo-500/20 blur-[80px] md:blur-[120px] rounded-[100%] pointer-events-none" />

      {/* The Eclipse Ring - Scalable for Pocket Universe */}
      <div className="absolute top-[-400px] md:top-[-500px] left-1/2 -translate-x-1/2 w-[150vw] md:w-[120vw] min-w-[800px] md:min-w-[1200px] h-[800px] md:h-[1000px] rounded-[100%] border-b-[4px] md:border-b-[6px] border-white/90 pointer-events-none shadow-[0_30px_100px_40px_rgba(37,99,235,0.6),inset_0_-10px_60px_rgba(59,130,246,0.8)] md:shadow-[0_50px_150px_60px_rgba(37,99,235,0.6),inset_0_-20px_100px_rgba(59,130,246,0.8)]" />

      {/* Glowing Sphere beneath the ring */}
      <div className="absolute top-[300px] md:top-[350px] left-1/2 -translate-x-1/2 w-[100vw] md:w-[600px] h-[200px] md:h-[300px] rounded-t-full bg-gradient-to-t from-transparent via-blue-900/40 to-blue-400/30 blur-[30px] md:blur-[40px] border-t border-blue-400/50 pointer-events-none opacity-60" />
      
    </div>
  );
};
