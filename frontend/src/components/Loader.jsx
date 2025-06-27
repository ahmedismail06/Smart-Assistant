import React from "react";

export default function Loader() {
  return (
    <div className="flex justify-center items-center py-8">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-orb-spin">
        <defs>
          <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="60%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#f0abfc" />
          </radialGradient>
        </defs>
        <ellipse
          cx="24"
          cy="24"
          rx="18"
          ry="18"
          fill="url(#orbGradient)"
          className="animate-orb-pulse"
        />
        <ellipse
          cx="24"
          cy="24"
          rx="10"
          ry="10"
          fill="#fff"
          fillOpacity="0.15"
        />
      </svg>
      <style>{`
        .animate-orb-spin {
          animation: orb-spin 2.5s linear infinite;
        }
        @keyframes orb-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-orb-pulse {
          animation: orb-pulse 1.8s ease-in-out infinite alternate;
        }
        @keyframes orb-pulse {
          0% { rx: 18; ry: 18; filter: blur(0px); }
          100% { rx: 20; ry: 16; filter: blur(2px); }
        }
      `}</style>
    </div>
  );
} 