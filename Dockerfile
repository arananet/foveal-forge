# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Enable pnpm via corepack (ships with Node 22)
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install deps before copying source so this layer is cached
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# ── Serve stage ──────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS server

# Remove default config; ours is a template so nginx-entrypoint handles envsubst
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx docker-entrypoint.sh processes /etc/nginx/templates/ via envsubst,
# then starts nginx. Railway injects $PORT at runtime.
EXPOSE 80
