FROM node:24.22.0-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS build

WORKDIR /app
COPY ["package.json", "package-lock.json", "tsconfig.json", "tsdown.config.ts", "./"]
COPY ["src", "./src"]
RUN npm ci && npm run build

FROM node:24.22.0-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS runtime

WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist

USER node
CMD ["node", "dist/index.mjs"]
