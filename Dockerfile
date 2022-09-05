# Build stage
FROM node:16-alpine as builder
WORKDIR /etc/logto
ENV CI=true
COPY . .

# Install toolchain
RUN npm add --location=global pnpm@^7.2.1
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#node-gyp-alpine
RUN apk add --no-cache python3 make g++

# Install dependencies and build
RUN pnpm i
RUN pnpm -- lerna run build --stream

# Add official connectors
WORKDIR /etc/logto/packages/core
RUN pnpm add-official-connectors
WORKDIR /etc/logto

# Prune dependencies for production
RUN rm -rf node_modules packages/*/node_modules
RUN NODE_ENV=production pnpm i

# Clean up
RUN rm -rf .parcel-cache pnpm-*.yaml

# Seal stage
FROM node:16-alpine as app
WORKDIR /etc/logto
COPY --from=builder /etc/logto .
EXPOSE 3001
ENV NO_INQUIRY true
ENTRYPOINT ["npm", "start"]
