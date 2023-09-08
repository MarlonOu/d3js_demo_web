/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        DB_HOST: 'localhost:8000',
        // DB_HOST: 'fastapi:8000',
    },
}

module.exports = nextConfig
