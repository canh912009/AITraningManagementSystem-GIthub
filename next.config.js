/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        serverComponentsExternalPackages: ["prisma"]
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.plugins.push()
        }
        return config
    }
}

module.exports = nextConfig