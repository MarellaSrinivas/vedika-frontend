
import { Helmet } from "react-helmet-async";

const SITE_NAME = "The Vedika";
const SITE_URL = "https://thevedika.com";

export default function SEO({
  title,
  description,
  image,
  url,
  keywords = [],
}) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Farmhouse Stays Near Hyderabad`;

  const pageUrl = url
    ? `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`
    : SITE_URL;

  const seoImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`
    : `${SITE_URL}/og-image.jpg`;

  return (
    <Helmet>
      <title>{fullTitle}</title>

      <meta name="description" content={description} />

      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}

      <link rel="canonical" href={pageUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={seoImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={seoImage} />
    </Helmet>
  );
}
