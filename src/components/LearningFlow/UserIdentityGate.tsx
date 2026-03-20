import { useState, useEffect } from 'react';
import { getStoredUser, setStoredUser, clearStoredUser } from '../../lib/auth';

interface Props {
  children: (username: string) => React.ReactNode;
}

export default function UserIdentityGate({ children }: Props) {
  const [username, setUsername] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUsername(stored);
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!username) {
    return (
      <main className="cms-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Hvem er du?</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '400px' }}>
          Indtast dit Windows-brugernavn for at gemme din fremgang.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Windows-brugernavn"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && input.trim()) {
                const u = input.trim();
                setStoredUser(u);
                setUsername(u);
              }
            }}
            autoFocus
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(75,165,157,0.4)',
              background: 'rgba(255,255,255,0.07)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button
            disabled={!input.trim()}
            onClick={() => {
              const u = input.trim();
              setStoredUser(u);
              setUsername(u);
            }}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              background: input.trim() ? '#4ba59d' : 'rgba(75,165,157,0.2)',
              color: input.trim() ? 'white' : 'rgba(255,255,255,0.3)',
              cursor: input.trim() ? 'pointer' : 'default',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'background 0.2s',
            }}
          >
            Fortsæt
          </button>
        </div>
      </main>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => {
          clearStoredUser();
          setUsername(null);
          setInput('');
        }}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.4)',
          borderRadius: '6px',
          padding: '0.3rem 0.7rem',
          fontSize: '0.75rem',
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        Skift bruger ({username})
      </button>
      {children(username)}
    </div>
  );
}
