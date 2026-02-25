/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oqci4tqwvp.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "tlax0dehi8.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
    ],
  },
}

module.exports = nextConfig