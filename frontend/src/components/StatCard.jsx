import React from 'react';

const StatCard = ({ title, value, unit = '', icon: Icon, trend, trendLabel, color = 'cyan', subtitle }) => {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
    blue: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30',
    purple: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
  };

  const selectedColor = colorMap[color] || colorMap.cyan;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {value}
            </span>
            {unit && <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl bg-gradient-to-tr border ${selectedColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {trend && (
            <span className={`font-semibold flex items-center gap-1 ${trend > 0 ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
              {trend > 0 ? `+${trend}` : trend} {trendLabel}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 ml-auto font-medium">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
