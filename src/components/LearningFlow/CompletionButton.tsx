interface Props {
  done: boolean;
  onClick?: () => void;
}

export default function CompletionButton({ done, onClick }: Props) {
  if (done) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.65rem 1.5rem',
        borderRadius: '8px',
        background: 'rgba(75,165,157,0.12)',
        border: '1px solid rgba(75,165,157,0.35)',
        color: '#4ba59d',
        fontWeight: 700,
        fontSize: '1rem',
      }}>
        ✓ Færdig
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.65rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        background: '#ecd573',
        color: '#0e1621',
        fontWeight: 700,
        fontSize: '1rem',
        cursor: 'pointer',
      }}
    >
      Marker som færdig ✓
    </button>
  );
}
