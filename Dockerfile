FROM node:22 AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml tsconfig.json ./

RUN pnpm install --frozen-lockfile

COPY client ./client
COPY server ./server
COPY shared ./shared
COPY public ./public
COPY index.html tailwind.config.ts postcss.config.js components.json vite.config.ts vite.config.server.ts ./

RUN pnpm build

RUN pnpm prune --prod

FROM node:22-slim AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/server/node-build.mjs"]
