'use client';
import React from 'react';

interface AchievementBadgeProps {
  key?: React.Key;
  badgeName: string;
  iconUrl: string;
  description: string;
  earnedAt?: string;
}

export default function AchievementBadge({ badgeName, iconUrl, description, earnedAt }: AchievementBadgeProps) {
  return (
    <div className="glass p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center transition-all hover:bg-white/10 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]">
      {iconUrl ? (
        <img src={iconUrl} alt={badgeName} className="w-16 h-16 rounded-full object-cover mb-4 border-2 border-cyan-500/50" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500/50 mb-4 flex items-center justify-center text-2xl font-black text-cyan-500">
          {badgeName.charAt(0)}
        </div>
      )}
      <h3 className="text-lg font-black text-white mb-2">{badgeName}</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      {earnedAt && (
        <div className="text-xs text-cyan-500 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
          Earned: {new Date(earnedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
