import { useEffect, useState } from 'react';

// --- Types matching the Directus content model ---

interface CardItemData {
  id: number;
  type: 'step' | 'step-link' | 'hint' | 'list-item';
  text: string;
  href?: string | null;
  sort: number;
}

interface InfoCard {
  id: number;
  title: string;
  variant: 'normal' | 'accent';
  sort: number;
  content?: string | null;
  items: CardItemData[];
}

interface CmsPageData {
  slug: string;
  title: string;
  subtitle?: string | null;
  video_url?: string | null;
  intro_label?: string | null;
  intro_text?: string | null;
  body_label?: string | null;
  body_text?: string | null;
  content?: string | null;
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

function sanitizeHref(href: string | null | undefined): string {
  if (!href) return '#';
  try {
    const parsed = new URL(href, window.location.href);
    return parsed.protocol === 'javascript:' ? '#' : href;
  } catch {
    return '#';
  }
}

// --- Component ---

interface Props {
  slug: string;
}

export default function CmsPage({ slug }: Props) {
  const [page, setPage] = useState<CmsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const base = (import.meta.env.PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055').replace(/\/$/, '');
    const url =
      `${base}/items/pages` +
      `?filter[slug][_eq]=${encodeURIComponent(slug)}` +
      `&filter[status][_eq]=published` +
      `&fields=slug,title,subtitle,video_url,intro_label,intro_text,body_label,body_text,content,` +
      `info_cards.id,info_cards.title,info_cards.variant,info_cards.sort,info_cards.content,` +
      `info_cards.items.id,info_cards.items.type,info_cards.items.text,info_cards.items.href,info_cards.items.sort` +
      `&deep[info_cards][_sort]=sort` +
      `&deep[info_cards][items][_sort]=sort`;

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
                <span className="highlight">{page.intro_label}</span>
              </p>
            )}
            <p className="body-text">{page.intro_text}</p>
          </>
        )}

        {page.body_text && (
          <>
            {page.body_label && (
              <p className="intro-text">
                <span className="highlight">{page.body_label}</span>
              </p>
            )}
            <p className="body-text">{page.body_text}</p>
          </>
        )}

        {page.content && (
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: page.content }} />
        )}

        {(page.info_cards ?? []).map((card) => (
          <div key={card.id} className={`info-card${card.variant === 'accent' ? ' accent' : ''}`}>
            <p className="card-title">{card.title}</p>
            <div className="card-body">
              {card.content
                ? <div className="rich-content" dangerouslySetInnerHTML={{ __html: card.content }} />
                : card.items.map((item) => <ItemView key={item.id} item={item} />)
              }
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function ItemView({ item }: { item: CardItemData }) {
  switch (item.type) {
    case 'step-link':
      return (
        <a className="step-link" href={sanitizeHref(item.href)}>
          {item.text}
        </a>
      );
    case 'hint':
      return <span className="hint">{item.text}</span>;
    case 'list-item':
      return <span className="list-item">{item.text}</span>;
    case 'step':
    default:
      return <p className="step">{item.text}</p>;
  }
}
