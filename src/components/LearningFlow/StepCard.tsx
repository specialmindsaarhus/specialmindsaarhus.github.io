import { useState } from 'react';
import CompletionButton from './CompletionButton';

interface InfoCard {
  id: number;
  title: string;
  variant: 'normal' | 'accent';
  sort: number;
  content?: string | null;
  image?: string | null;
}

interface Props {
  card: InfoCard;
  stepIndex: number;    // 1-based card index
  totalCards: number;
  onPrev: () => void;
  onNext: () => void;
}

const cmsBase = import.meta.env.DEV
  ? '/directus'
  : (import.meta.env.PUBLIC_DIRECTUS_URL ?? 'https://cms.spmi.dk').replace(/\/$/, '');

export default function StepCard({ card, stepIndex, totalCards, onPrev, onNext }: Props) {
  const isLast = stepIndex === totalCards;
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const imageUrl = card.image ? `${cmsBase}/assets/${card.image}` : null;

  return (
    <main className="cms-page">
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Trin {stepIndex} af {totalCards}
      </p>

      <div className={`info-card${card.variant === 'accent' ? ' accent' : ''}`} style={{ position: 'relative' }}>
        {imageUrl && (
          <button
            onClick={() => setOverlayImage(imageUrl)}
            aria-label="Vis billede"
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              background: 'rgba(75,165,157,0.15)',
              border: '1px solid rgba(75,165,157,0.35)',
              borderRadius: '6px',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#4ba59d',
              padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
        )}
        <p className="card-title">{card.title}</p>
        <div className="card-body">
          {card.content && (
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: card.content }} />
          )}
        </div>
      </div>

      {overlayImage && (
        <div
          onClick={() => setOverlayImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out',
            padding: '1.5rem',
          }}
        >
          <img
            src={overlayImage}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              borderRadius: '8px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              cursor: 'default',
            }}
          />
          <button
            onClick={() => setOverlayImage(null)}
            aria-label="Luk billede"
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '2.2rem',
              height: '2.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.1rem',
              lineHeight: '1',
              padding: 0,
            }}
          >✕</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', gap: '1rem' }}>
        <button
          onClick={onPrev}
          style={{
            padding: '0.65rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          ← Forrige
        </button>

        <StepDots current={stepIndex} total={totalCards} />

        {isLast
          ? <CompletionButton done={false} onClick={onNext} />
          : (
            <button
              onClick={onNext}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: '#4ba59d',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Næste →
            </button>
          )
        }
      </div>
    </main>
  );
}

function StepDots({ current, total }: { current: number; total: number }) {
  const MAX_DOTS = 8;
  if (total > MAX_DOTS) {
    return (
      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
        {current} / {total}
      </span>
    );
  }
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: i + 1 === current ? '#4ba59d' : 'rgba(255,255,255,0.2)',
            display: 'inline-block',
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  );
}
