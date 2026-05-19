FROM oven/bun:1.2

WORKDIR /app

# Install deps first for better layer caching
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY . .

# Render injects PORT; default to 10000 for local docker run
ENV PORT=10000
EXPOSE 10000

CMD ["bun", "index.ts"]
