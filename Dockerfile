FROM node:23-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=dev

COPY tsconfig.json .prettierrc eslint.config.mjs ./
COPY src ./src

RUN npm run lint && npm run build


FROM node:23-alpine AS runner

ENV NODE_ENV=production

RUN wget -qO- https://github.com/artem-russkikh/wireproxy-awg/releases/download/v1.0.11/wireproxy_linux_amd64.tar.gz | tar xz -O wireproxy > /usr/local/bin/wireproxy \
    && chmod +x /usr/local/bin/wireproxy

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY --from=builder /app/dist ./dist

# Create directory for WireGuard configs
RUN mkdir -p /app/configs

# Run the application
CMD ["node", "dist/index.js"]
