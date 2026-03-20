interface InfoCard {
  id: number;
  title: string;
  variant: 'normal' | 'accent';
  sort: number;
  content?: string | null;
}

interface Props {
  title: string;
  subtitle?: string | null;
  videoUrl?: string | null;
  introLabel?: string | null;
  introText?: string | null;
  totalCards: number;
  onStart: () => void;
}

const ALLOWED_EMBED_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'player.vimeo.com',
  'www.canva.com',
]);

function isSafeEmbedUrl(url: string): boolean {
  try {
    return ALLOWED_EMBED_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

export default function StepIntro({ title, subtitle, videoUrl, introLabel, introText, totalCards, onStart }: Props) {
  return (
    <main className="cms-page">
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
        Trin 0 af {totalCards}
      </p>

      <h1>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}

      <div className="content">
        {videoUrl && isSafeEmbedUrl(videoUrl) && (
          <div className="video-wrapper">
            <iframe
              src={videoUrl}
              title="Video"
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video"
            />
          </div>
        )}

        {introLabel && (
          <p className="intro-text">{introLabel}</p>
        )}
        {introText && (
          <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{introText}</p>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
        <button
          onClick={onStart}
          style={{
            padding: '0.8rem 2.5rem',
            borderRadius: '10px',
            border: 'none',
            background: '#4ba59d',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          Start →
        </button>
      </div>
    </main>
  );
}
