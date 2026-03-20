import CompletionButton from './CompletionButton';

interface Props {
  title: string;
  onBack: () => void;
}

export default function StepComplete({ title, onBack }: Props) {
  return (
    <main className="cms-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
      <h1 style={{ fontSize: '2.5rem' }}>Du er færdig!</h1>
      <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: '0.5rem', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
        Du har gennemført <strong style={{ color: '#ecd573' }}>{title}</strong>.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <CompletionButton done={true} />
        <button
          onClick={onBack}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          ← Tilbage til forsiden
        </button>
      </div>
    </main>
  );
}
