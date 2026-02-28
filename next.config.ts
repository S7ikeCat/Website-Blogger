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
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
}

module.exports = nextConfig