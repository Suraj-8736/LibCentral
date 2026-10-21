import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'brand',
  onClick,
}) => {
  const colorMap = {
    brand: 'from-brand-500/20 to-indigo-500/5 text-brand-600 dark:text-brand-400 border-brand-500/20',
    emerald: 'from-emerald-500/20 to-teal-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-yellow-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-pink-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20',
    blue: 'from-blue-500/20 to-cyan-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20',
    purple: 'from-purple-500/20 to-fuchsia-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  const iconBgMap = {
    brand: 'bg-brand-500 text-white shadow-md shadow-brand-500/30',
    emerald: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30',
    amber: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
    rose: 'bg-rose-500 text-white shadow-md shadow-rose-500/30',
    blue: 'bg-blue-500 text-white shadow-md shadow-blue-500/30',
    purple: 'bg-purple-500 text-white shadow-md shadow-purple-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm card-hover ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Subtle top gradient glow */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorMap[color] || colorMap.brand}`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 font-heading">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBgMap[color] || iconBgMap.brand}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {subtitle && (
          <p className="text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
        )}

        {trend !== undefined && (
          <div
            className={`flex items-center gap-0.5 font-medium ml-auto ${
              trend >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(trend)}%</span>
            {trendLabel && <span className="text-slate-400 ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
