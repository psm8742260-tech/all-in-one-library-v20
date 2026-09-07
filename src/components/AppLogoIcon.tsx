import React from 'react';
import { motion } from 'motion/react';
// @ts-ignore
import appLogoImg from '../assets/images/app_logo_icon_1787974156637.jpg';

interface AppLogoIconProps {
  className?: string;
}

export const AppLogoIcon: React.FC<AppLogoIconProps> = ({ className = 'w-64 h-64' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* High Definition App Logo Photo matching uploaded reference with Black Border */}
      <div className="w-full h-full rounded-[48px] overflow-hidden border-2 border-black shadow-[0_12px_35px_rgba(0,0,0,0.4)] relative flex items-center justify-center">
        <img
          src={appLogoImg}
          alt="All in One Library App Logo"
          className="w-full h-full object-cover scale-[1.37] rounded-[48px]"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
