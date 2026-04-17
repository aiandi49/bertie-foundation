import React from 'react';
import { Helmet } from 'react-helmet';

interface Props {
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  url?: string;
  siteName?: string;
  type?: 'website' | 'article' | 'profile' | 'book';
}

/**
 * SEO Meta component for better image sharing and performance
 * 
 * @param props Component properties
 * @returns JSX element
 */
export function MetaImage({ 
  title = 'Bertie Foundation',
  description = 'The Bertie Foundation, formed by a dedicated group of expats in Pattaya, Thailand, is committed to helping those in need.',
  imageUrl,
  imageAlt = 'Bertie Foundation',
  url,
  siteName = 'Bertie Foundation',
  type = 'website'
}: Props) {
  // Don't render anything if no image URL is provided
  if (!imageUrl) {
    return null;
  }
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Preload the image */}
      <link rel="preload" as="image" href={imageUrl} />
    </Helmet>
  );
}