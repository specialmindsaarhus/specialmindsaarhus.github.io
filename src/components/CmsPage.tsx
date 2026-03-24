import { useEffect, useState } from 'react';
import CompletionButton from './LearningFlow/CompletionButton';
import { getStoredUser, setStoredUser } from '../lib/auth';
import { getProgress, saveStep } from '../lib/progress';

// --- Types matching the Directus content model ---

interface InfoCard {
  id: number;
  title: string;
  variant: 'normal' | 'accent';
  sort: number;
  content?: string | null;
  image?: string | null;
}

interface CmsPageData {
  slug: string;
  title: string;
  subtitle?: string | null;
  video_url?: string | null;
  intro_label?: string | null;
  intro_text?: string | null;
  vis_ekstra?: boolean | null;
  ekstra?: string | null;
  info_cards: InfoCard[] | null;
}

interface DirectusResponse {
  data: CmsPageData[];
}

// --- Security helpers ---

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

// --- Component ---

interface Props {
  slug: string;
}

const cmsBase = import.meta.env.DEV
  ? '/directus'
  : (import.meta.env.PUBLIC_DIRECTUS_URL ?? 'https://cms.spmi.dk').replace(/\/$/, '');

export default function CmsPage({ slug }: Props) {
  const [page, setPage] = useState<CmsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const base = cmsBase;
    const url =
      `${base}/items/pages` +
      `?filter[slug][_eq]=${encodeURIComponent(slug)}` +
      `&filter[status][_eq]=published` +
      `&fields=slug,title,subtitle,video_url,intro_label,intro_text,vis_ekstra,ekstra,` +
      `info_cards.id,info_cards.title,info_cards.variant,info_cards.sort,info_cards.content,info_cards.image` +
      `&deep[info_cards][_sort]=sort`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DirectusResponse>;
      })
      .then((json) => {
        if (!json.data || json.data.length === 0) {
          setError('Siden blev ikke fundet.');
        } else {
          const pageData = json.data[0];
          setPage(pageData);
          document.title = `${pageData.title} — Special Minds Aarhus`;
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError('Kunne ikke hente indhold. Prøv at genindlæse siden.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <main className="cms-page">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.4)' }}>
          Henter indhold…
        </div>
      </main>
    );
  }

  if (error || !page) {
    return (
      <main className="cms-page">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.5)' }}>
          {error ?? 'Siden blev ikke fundet.'}
        </div>
      </main>
    );
  }

  return (
    <main className="cms-page">
      <h1>{page.title}</h1>
      {page.subtitle && <h2>{page.subtitle}</h2>}

      <div className="content">
        {page.video_url && isSafeEmbedUrl(page.video_url) && (
          <div className="video-wrapper">
            <iframe
              src={page.video_url}
              title="Video"
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video"
            />
          </div>
        )}

        {page.intro_text && (
          <>
            {page.intro_label && (
              <p className="intro-text">
                <FirstWord text={page.intro_label} />
              </p>
            )}
            <p className="body-text">
              <FirstWord text={page.intro_text} />
            </p>
          </>
        )}

        {page.vis_ekstra && page.ekstra && (
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: page.ekstra }} />
        )}

        {(page.info_cards ?? []).map((card) => {
const imageUrl = card.image ? `${cmsBase}/assets/${card.image}` : null;
          return (
            <div key={card.id} className={`info-card${card.variant === 'accent' ? ' accent' : ''}`} style={{ position: 'relative' }}>
              {imageUrl && (
                <button
                  onClick={() => setOverlayImage(imageUrl)}
                  aria-label="Vis billede"
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: 'rgb(255, 255, 255)',
                    border: '1px solid rgb(255, 255, 255)',
                    borderRadius: '6px',
                    width: '2rem',
                    height: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#4ba59d',
                    padding: 0,
                    flexShrink: 0,
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
          );
        })}
      </div>

      <NormalPageCompletion slug={slug} />

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
              lineHeight: 1,
              padding: 0,
            }}
          >✕</button>
        </div>
      )}
    </main>
  );
}

function FirstWord({ text }: { text: string }) {
  const space = text.indexOf(' ');
  if (space === -1) return <span className="first-word">{text}</span>;
  return <><span className="first-word">{text.slice(0, space)}</span>{text.slice(space)}</>;
}

function NormalPageCompletion({ slug }: { slug: string }) {
  const [username, setUsername] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      setUsername(u);
      const p = getProgress(u, slug);
      setDone(!!p?.completedAt);
    }
  }, [slug]);

  function handleComplete() {
    if (!username) return;
    saveStep(username, slug, 1, 0);
    setDone(true);
  }

  function confirmUsername() {
    const u = inputVal.trim();
    if (!u) return;
    setStoredUser(u);
    setUsername(u);
    const p = getProgress(u, slug);
    setDone(!!p?.completedAt);
  }

  return (
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', fontSize: '0.95rem' }}>
        Marker dette projekt som færdig:
      </p>

      {username ? (
        <CompletionButton done={done} onClick={handleComplete} />
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Dit Windows-brugernavn"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmUsername(); }}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '7px',
              border: '1px solid rgba(75,165,157,0.3)',
              background: 'rgba(255,255,255,0.06)',
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none',
              width: '220px',
            }}
          />
          <button
            onClick={confirmUsername}
            disabled={!inputVal.trim()}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '7px',
              border: 'none',
              background: inputVal.trim() ? '#4ba59d' : 'rgba(75,165,157,0.2)',
              color: inputVal.trim() ? 'white' : 'rgba(255,255,255,0.3)',
              cursor: inputVal.trim() ? 'pointer' : 'default',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}

