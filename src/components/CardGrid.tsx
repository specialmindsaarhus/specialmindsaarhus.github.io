import { useState, useEffect } from 'react';
import { getStoredUser } from '../lib/auth';
import { getCardProgress } from '../lib/progress';

interface CardItem {
  href: string;
  title: string;
  body: string;
  image?: string;
  section: string[];
}

interface Props {
  cards: CardItem[];
}

const imgStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '3 / 1',
  objectFit: 'cover',
  display: 'block',
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
};

const placeholderStyle: React.CSSProperties = {
  ...imgStyle,
  background: '#2a4e52',
  borderRadius: '12px 12px 0 0',
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
};

const cardBodyStyle: React.CSSProperties = {
  padding: '1.1rem 1.2rem 1.2rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  flex: 1,
  borderRadius: '0 0 12px 12px',
  gap:'0.8rem',
};

const h2Style: React.CSSProperties = {
  margin: 0,
  fontWeight: 400,
  fontSize: '1.2rem',
  textAlign: 'left',
  transition: 'color 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
};

const pStyle: React.CSSProperties = {
  marginTop: '0.6rem',
  marginBottom: '0.5rem',
  fontSize: '0.8rem',
  textAlign: 'left',
  //borderLeft: '2px solid rgba(255, 255, 255, 0.22)',
  paddingLeft: '0.65rem',
  color: 'rgb(255 255 255 / 62%)',
};

const SECTION_LABELS: Record<string, string> = {
  'dev': 'Dev',
  'kode': 'Kode',
  'game-dev': 'Game Dev',
  'bygge': 'Bygge',
  'grafisk': 'Grafisk',
  'media': 'Media',
};
function sectionLabel(value: string) {
  return SECTION_LABELS[value] ?? value;
}

export default function CardGrid({ cards }: Props) {
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('all');
  const [progressMap, setProgressMap] = useState<Record<string, { done: boolean; stepsCompleted: number; total: number } | null>>({});

  useEffect(() => {
    const username = getStoredUser();
    if (!username) return;
    const map: Record<string, { done: boolean; stepsCompleted: number; total: number } | null> = {};
    for (const card of cards) {
      const slug = card.href.replace(/^\//, '');
      map[slug] = getCardProgress(username, slug);
    }
    setProgressMap(map);
  }, [cards]);

  const visible = cards.filter(c => {
    const matchSection = activeSection === 'all' || c.section.includes(activeSection);
    const needle = query.toLowerCase();
    const matchText = !needle ||
      c.title.toLowerCase().includes(needle) ||
      c.body.toLowerCase().includes(needle);
    return matchSection && matchText;
  });

  const btnBase = 'px-3 py-1 border-base text-xs font-medium transition-all cursor-pointer';
  const btnActive = `${btnBase} bg-[#4ba59d]/25 text-[#4ba59d] border border-[#4ba59d]/30`;
  const btnInactive = `${btnBase} bg-white/5 text-white/25 border border-white/10 hover:text-white/50`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Søg i forløb..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/40 outline-none opacity-80 focus:opacity-100 border border-transparent focus:border-white/30"
        />
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Alle' },
            { value: 'dev', label: 'Dev' },
            { value: 'kode', label: 'Kode' },
            { value: 'game-dev', label: 'Game Dev' },
            { value: 'bygge', label: 'Bygge' },
            { value: 'grafisk', label: 'Grafisk' },
            { value: 'media', label: 'Media' },
          ].map(s => (
            <button key={s.value} className={activeSection === s.value ? btnActive : btnInactive} onClick={() => setActiveSection(s.value)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-white/50 py-12">Ingen forløb matcher din søgning.</p>
      ) : (
        <ul role="list" className="link-card-grid">
          {visible.map(card => (
            <li key={card.href} className="link-card">
              <a href={card.href}>
                <div style={{ position: 'relative' }}>
                  {card.image
                    ? <img src={card.image} alt="" style={imgStyle} />
                    : <div style={placeholderStyle} />
                  }
                  {(() => {
                    const slug = card.href.replace(/^\//, '');
                    const prog = progressMap[slug];
                    if (!prog) return null;
                    if (prog.done) return (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '10px',
                        background: 'rgb(69 114 118)',
                        color: '#ffffff',
                        border: '1px solid rgba(75,165,157,0.35)',
                        borderRadius: '50%',
                        width: '1.4rem',
                        height: '1.4rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        pointerEvents: 'none',
                      }}>✓</span>
                    );
                    const pct = Math.round((prog.stepsCompleted / prog.total) * 100);
                    return (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '12px 12px 0 0',
                        pointerEvents: 'none',
                      }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: '#eab308',
                          borderRadius: '12px 12px 0 0',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    );
                  })()}
                </div>
                <div style={cardBodyStyle}>
                  <div>

                  <h2 style={h2Style}>{card.title}</h2>
                  <p style={pStyle} className="pstyle-dev">{card.body}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {card.section.map(s => (
                      <span key={s} className={`badge-${s} badge-tip`} data-label={sectionLabel(s)}>
                        {sectionLabel(s)[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
