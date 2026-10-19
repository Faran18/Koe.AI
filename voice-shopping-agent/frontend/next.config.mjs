/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [
    { protocol: "https", hostname: "picsum.photos" },
    { protocol: "https", hostname: "github.com" },
    { protocol: "https", hostname: "pazhanir.github.io", pathname: "/product-images/**" },
    { protocol: "https", hostname: "raw.githubusercontent.com" },
  ] },
  transpilePackages: ["three"],
};
export default nextConfig;
