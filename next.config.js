/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  reactStrictMode: true,
  // Enable the "hydrate" option for emotion
  "allowJs": true,
  // This should be set to "true" by default
  emotion: {
    ssr: true,
    // Enable client-side rendering of styles
    // This should be set to "true" by default
    hydratable: true,
  },
};

