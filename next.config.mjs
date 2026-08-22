/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Originals stay in the 2011 S3 bucket. next/image fetches each one once and
    // serves cached derivatives from the edge, so S3 is a cold origin - which is
    // why its missing Cache-Control and lack of a CDN don't matter.
    remotePatterns: [{ protocol: 'https', hostname: '50states.s3.amazonaws.com' }],
    // The archive is closed; these bytes will never change.
    minimumCacheTTL: 31536000,
  },
  async redirects() {
    return [
      // The old site had no /places/:id route at all - it 500'd. Canonical now.
      { source: '/places/view/:id', destination: '/places/:id', permanent: true },
      // The CMS is gone.
      { source: '/articles/:id/edit', destination: '/', permanent: true },
      { source: '/photos/:id/edit', destination: '/', permanent: true },
      { source: '/photos/add', destination: '/', permanent: true },
      { source: '/articles/add', destination: '/', permanent: true },
      { source: '/login', destination: '/', permanent: true },
    ];
  },
};
export default nextConfig;
