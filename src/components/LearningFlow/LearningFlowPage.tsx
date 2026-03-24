import { useEffect, useState } from 'react';
import UserIdentityGate from './UserIdentityGate';
import StepIntro from './StepIntro';
import StepCard from './StepCard';
import StepComplete from './StepComplete';
import { getProgress, saveStep } from '../../lib/progress';

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
  info_cards: InfoCard[] | null;
}

interface DirectusResponse {
  data: CmsPageData[];
}

interface Props {
  slug: string;
}

export default function LearningFlowPage({ slug }: Props) {
  const [page, setPage] = useState<CmsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const base = import.meta.env.DEV
      ? '/directus'
      : (import.meta.env.PUBLIC_DIRECTUS_URL ?? 'https://cms.spmi.dk').replace(/\/$/, '');
    const url =
      `${base}/items/pages` +
      `?filter[slug][_eq]=${encodeURIComponent(slug)}` +
      `&filter[status][_eq]=published` +
      `&fields=slug,title,subtitle,video_url,intro_label,intro_text,` +
      `info_cards.id,info_cards.title,info_cards.variant,info_cards.sort,info_cards.content,info_cards.image` +
      `&deep[info_cards][_sort]=sort`;

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DirectusResponse>;
      })
      .then(json => {
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
    <UserIdentityGate>
      {username => <Flow page={page} username={username} />}
    </UserIdentityGate>
  );
}

// --- Inner flow component (knows both username and page data) ---

interface FlowProps {
  page: CmsPageData;
  username: string;
}

function Flow({ page, username }: FlowProps) {
  const cards = page.info_cards ?? [];
  const totalCards = cards.length;

  // Restore saved step on mount, default to 0 (intro)
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = getProgress(username, page.slug);
    // If already completed, restart from intro so they can review
    if (saved?.completedAt) return 0;
    return saved?.currentStep ?? 0;
  });

  function goToStep(step: number) {
    setCurrentStep(step);
    saveStep(username, page.slug, step, totalCards);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // step 0 = intro
  // steps 1..N = card[step-1]
  // step N+1 = completion
  if (currentStep === 0) {
    return (
      <StepIntro
        title={page.title}
        subtitle={page.subtitle}
        videoUrl={page.video_url}
        introLabel={page.intro_label}
        introText={page.intro_text}
        totalCards={totalCards}
        onStart={() => goToStep(1)}
      />
    );
  }

  if (currentStep > totalCards) {
    return (
      <StepComplete
        title={page.title}
        onBack={() => { window.location.href = '/'; }}
      />
    );
  }

  const card = cards[currentStep - 1];
  return (
    <StepCard
      card={card}
      stepIndex={currentStep}
      totalCards={totalCards}
      onPrev={() => goToStep(currentStep - 1)}
      onNext={() => goToStep(currentStep + 1)}
    />
  );
}
