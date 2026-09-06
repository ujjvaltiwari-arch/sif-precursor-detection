interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  size?: 'sm' | 'md';
}

const levelClass: Record<string, string> = {
  HIGH: 'risk-high',
  MEDIUM: 'risk-medium',
  LOW: 'risk-low',
};

const dotClass: Record<string, string> = {
  HIGH: 'risk-dot risk-dot-high',
  MEDIUM: 'risk-dot risk-dot-medium',
  LOW: 'risk-dot risk-dot-low',
};

export default function RiskBadge({ level, size = 'sm' }: RiskBadgeProps) {
  const sz = size === 'md' ? 'risk-badge-md' : 'risk-badge-sm';
  return (
    <span className={`risk-badge ${levelClass[level]} ${sz}`}>
      {level === 'HIGH' && <span className={dotClass[level]} />}
      {level}
    </span>
  );
}
