import CmsPage from './CmsPage';

export default function CmsPageFallback() {
  const slug = window.location.pathname.replace(/^\/|\/$/g, '');
  if (!slug) return null;
  return <CmsPage slug={slug} />;
}
