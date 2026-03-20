import CompletionButton from './CompletionButton';

interface InfoCard {
  id: number;
  title: string;
  variant: 'normal' | 'accent';
  sort: number;
  content?: string | null;
}

interface Props {
  card: InfoCard;
  stepIndex: number;    // 1-based card index
  totalCards: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function StepCard({ card, stepIndex, totalCards, onPrev, onNext }: Props) {
  const isLast = stepIndex === totalCards;

  return (
    <main className="cms-page">
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Trin {stepIndex} af {totalCards}
      </p>

      <div className={`info-card${card.variant === 'accent' ? ' accent' : ''}`}>
        <p className="card-title">{card.title}</p>
        <div className="card-body">
          {card.content && (
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: card.content }} />
          )}
        </div>
      </div>

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
