export function CyberBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-background">
      {/* Heavy Industrial Grid with Conveyor Animation */}
      <div 
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: 'linear-gradient(var(--color-border) 4px, transparent 4px), linear-gradient(90deg, var(--color-border) 4px, transparent 4px)',
          backgroundSize: '100px 100px',
          animation: 'conveyorBelt 4s linear infinite'
        }}
      />
      
      {/* Animated Hazard Stripes */}
      <div className="absolute top-0 left-0 w-full h-8 hazard-stripes hazard-stripes-animated border-b-4 border-border shadow-brutal-sm z-10" />
      <div className="absolute bottom-0 left-0 w-full h-8 hazard-stripes hazard-stripes-animated border-t-4 border-border shadow-brutal-sm z-10" style={{ animationDirection: 'reverse' }} />
      
      {/* Giant Typography */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] whitespace-nowrap font-display text-[22vw] font-black leading-none text-black select-none pointer-events-none mix-blend-overlay">
        YANI.SYS
      </div>
    </div>
  );
}
