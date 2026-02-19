import { useEffect, useState } from 'react';

// --- Types matching the Directus content model ---

interface CardItem {
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
  items: CardItem[];
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
  info_cards: InfoCard[];
}

interface DirectusResponse {
  data: CmsPageData[];
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
    const base = import.meta.env.PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055';
    const url =
      `${base}/items/pages` +
      `?filter[slug][_eq]=${encodeURIComponent(slug)}` +
      `&filter[status][_eq]=published` +
      `&fields=slug,title,subtitle,video_url,intro_label,intro_text,body_label,body_text,` +
      `info_cards.id,info_cards.title,info_cards.variant,info_cards.sort,` +
      `info_cards.items.id,info_cards.items.type,info_cards.items.text,info_cards.items.href,info_cards.items.sort` +
      `&deep[info_cards][_sort]=sort` +
      `&deep[info_cards][items][_sort]=sort`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DirectusResponse>;
      })
      .then((json) => {
        if (!json.data || json.data.length === 0) {
          setError('Siden blev ikke fundet.');
        } else {
          setPage(json.data[0]);
        }
      })
      .catch(() => {
        setError('Kunne ikke hente indhold. Prøv at genindlæse siden.');
      })
      .finally(() => setLoading(false));
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
        {page.video_url && (
          <div className="video-wrapper">
            <iframe
              src={page.video_url}
              title="Video"
              frameBorder="0"
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

        {page.info_cards.map((card) => (
          <div key={card.id} className={`info-card${card.variant === 'accent' ? ' accent' : ''}`}>
            <p className="card-title">{card.title}</p>
            <div className="card-body">
              {card.items.map((item) => renderItem(item))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function renderItem(item: CardItem) {
  switch (item.type) {
    case 'step-link':
      return (
        <a key={item.id} className="step-link" href={item.href ?? '#'}>
          {item.text}
        </a>
      );
    case 'hint':
      return (
        <span key={item.id} className="hint">
          {item.text}
        </span>
      );
    case 'list-item':
      return (
        <span key={item.id} className="list-item">
          {item.text}
        </span>
      );
    case 'step':
    default:
      return (
        <p key={item.id} className="step">
          {item.text}
        </p>
      );
  }
}
