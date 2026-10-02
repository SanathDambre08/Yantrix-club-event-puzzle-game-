import { Link } from 'react-router-dom';
import { Trophy, Zap, Target, Clock, Users } from 'lucide-react';
import { Button } from '../components/ui';
import { Card } from '../components/ui';

export function Home() {
  return (
    <div className="min-h-[calc(100dvh-120px)] flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-4 pb-12 sm:py-24">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center flex flex-col items-center">
          {/* Top Logos */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-6 sm:mb-8 fade-in">
             <img 
                src="/dypiu-logo.jpg" 
                alt="DYPIU Logo" 
                className="h-14 sm:h-16 object-contain bg-white p-1.5 border-2 border-primary/20 shadow-brutal rounded-sm" 
             />
             <div className="w-px h-10 bg-border"></div>
             <img 
                src="/yantrix-logo.jpg" 
                alt="Yantrix Logo" 
                className="h-14 sm:h-16 object-contain rounded-full border-2 border-accent/20 shadow-brutal" 
             />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-2 sm:mb-4 slide-up hover-glitch cursor-default leading-tight">
            <span className="text-gradient">YANI</span>
            <br />
            <span className="text-text">Puzzle Challenge</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-xl text-text-muted max-w-xl mx-auto mb-4 sm:mb-8 slide-up text-balance px-2" style={{ animationDelay: '0.1s' }}>
            Solve the sliding puzzle, race the clock, and climb the leaderboard.
            Can you reassemble YANI?
          </p>

          {/* Hero Mechanical Image Logo */}
          <div className="w-40 h-40 sm:w-56 sm:h-56 mx-auto mb-5 sm:mb-8 bg-surface border-brutal shadow-brutal flex items-center justify-center scale-in relative group bolted-corners hazard-stripes overflow-hidden">
            <div className="absolute inset-0 bg-background/50 m-2 border-2 border-black flex flex-col items-center justify-center overflow-hidden">
              <img 
                src="/robot-logo.png" 
                alt="YANI Robot" 
                className="w-24 sm:w-40 object-contain animate-float drop-shadow-brutal grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 mix-blend-luminosity relative z-10" 
              />
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none mix-blend-overlay z-20" />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto slide-up px-2" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="w-full sm:w-auto block">
              <Button size="xl" variant="primary" icon={<Zap size={18} />} fullWidth>
                PLAY YANI PUZZLE
              </Button>
            </Link>
            <Link to="/leaderboard" className="w-full sm:w-auto block mt-2 sm:mt-0">
              <Button size="xl" variant="secondary" icon={<Trophy size={18} />} fullWidth>
                LEADERBOARD
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-display font-bold text-center text-text mb-10 text-gradient">
            System Protocol
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <Users size={24} />, step: '01', title: 'Init', desc: 'Secure registration' },
              { icon: <Target size={24} />, step: '02', title: 'Solve', desc: 'Assemble the core' },
              { icon: <Clock size={24} />, step: '03', title: 'Score', desc: 'Time × Moves metrics' },
              { icon: <Trophy size={24} />, step: '04', title: 'Rank', desc: 'Global leaderboard' },
            ].map((item) => (
              <Card key={item.step} className="text-center group" hoverable tilt>
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors text-primary group-hover:text-accent duration-300">
                  {item.icon}
                </div>
                <p className="text-xs text-accent font-mono mb-1">{item.step}</p>
                <h3 className="text-base font-bold text-text mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Event Info & Privacy Notice */}
      <section className="py-8 sm:py-12 relative z-10">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center" tilt>
            <h3 className="text-lg font-bold text-text mb-3 text-gradient">🎮 Event Directives</h3>
            <ul className="text-sm text-text-muted space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">►</span>
                One official attempt per student
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">►</span>
                Timer locks when you engage "Start Game"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">►</span>
                Every tile movement deducts from maximum score
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">►</span>
                Score = 1000 − (time × 2) − (moves × 5)
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-accent/20">
              <p className="text-xs text-text-dim">
                <strong className="text-accent">ENCRYPTION NOTICE:</strong> We collect your name, course, year,
                and questionnaire answers for event tracking. Your data is stored
                securely within the Yantrix mainframe. Contact data is hidden from public view.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
