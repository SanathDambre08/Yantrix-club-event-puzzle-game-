import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hoverable?: boolean;
  tilt?: boolean;
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  const content = (
    <div
      className={`bg-surface border-brutal p-6 shadow-brutal transition-all duration-100 bolted-corners
        ${hoverable ? 'hover:bg-surface-elevated cursor-pointer active:shadow-brutal-active active:translate-x-[8px] active:translate-y-[8px]' : ''}
        ${className}`}
    >
      {children}
    </div>
  );

  return content;
}
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 border-b-4 border-border pb-4 ${className}`}>
      <div>
        <h3 className="text-xl font-display font-black uppercase text-text">{title}</h3>
        {subtitle && <p className="text-sm font-display font-bold text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
}

export function StatCard({ label, value, icon, trend, trendValue, className = '' }: StatCardProps) {
  return (
    <Card className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-display font-bold uppercase text-text-muted">{label}</span>
        {icon && <span className="text-primary">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-display font-black text-text">{value}</span>
        {trend && trendValue && (
          <span
            className={`text-sm font-bold p-1 border-2 border-border ${
              trend === 'up' ? 'bg-success text-black' : 'bg-danger text-white'
            }`}
          >
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
    </Card>
  );
}
