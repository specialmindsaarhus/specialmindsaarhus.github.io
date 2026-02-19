import CmsPage from './CmsPage';

export default function CmsPageFallback() {
  const slug = window.location.pathname.replace(/^\/|\/$/g, '');
  return <CmsPage slug={slug} />;
}
