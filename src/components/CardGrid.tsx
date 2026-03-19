import { useState } from 'react';

interface CardItem {
  href: string;
  title: string;
  body: string;
  image?: string;
  section: 'dev' | 'media';
}

interface Props {
  cards: CardItem[];
}

const imgStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '16 / 7',
  objectFit: 'cover',
  display: 'block',
};

const placeholderStyle: React.CSSProperties = {
  ...imgStyle,
  background: '#2a4e52',
  borderRadius: '12px 12px 0 0',
};

const cardBodyStyle: React.CSSProperties = {
  padding: '1.1rem 1.2rem 1.2rem',
  flex: 1,
  borderRadius: '0 0 12px 12px',
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
  borderLeft: '2px solid rgba(255, 255, 255, 0.22)',
  paddingLeft: '0.65rem',
  color: 'rgb(255 255 255 / 62%)',
};

export default function CardGrid({ cards }: Props) {
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'dev' | 'media'>('all');

  const visible = cards.filter(c => {
    const matchSection = activeSection === 'all' || c.section === activeSection;
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
        <div className="flex gap-2">
          <button className={activeSection === 'all' ? btnActive : btnInactive} onClick={() => setActiveSection('all')}>Alle</button>
          <button className={activeSection === 'dev' ? btnActive : btnInactive} onClick={() => setActiveSection('dev')}>Dev</button>
          <button className={activeSection === 'media' ? btnActive : btnInactive} onClick={() => setActiveSection('media')}>Media</button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-white/50 py-12">Ingen forløb matcher din søgning.</p>
      ) : (
        <ul role="list" className="link-card-grid">
          {visible.map(card => (
            <li key={card.href} className="link-card">
              <a href={card.href}>
                {card.image
                  ? <img src={card.image} alt="" style={imgStyle} />
                  : <div style={placeholderStyle} />
                }
                <div style={cardBodyStyle}>
                  <h2 style={h2Style}>{card.title}</h2>
                  <p style={pStyle}>{card.body}</p>
                  <span className={card.section === 'media' ? 'badge-media' : 'badge-dev'}>
                    {card.section === 'media' ? 'Media' : 'Dev'}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
