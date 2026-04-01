###### [STAGE] Build ######
FROM node:22-alpine as builder
WORKDIR /etc/logto
ENV CI=true

# No need for Docker build
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV NODE_OPTIONS=--max-old-space-size=4096

ARG build_concurrency=2
ENV BUILD_CONCURRENCY=${build_concurrency}

### Install toolchain ###
RUN npm add --location=global pnpm@^10.0.0
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#node-gyp-alpine
RUN apk add --no-cache python3 make g++ rsync

COPY . .

### Install dependencies and build ###
RUN pnpm i --frozen-lockfile --child-concurrency=${BUILD_CONCURRENCY}

### Set if dev features enabled ###
ARG dev_features_enabled
ENV DEV_FEATURES_ENABLED=${dev_features_enabled}

ARG applicationinsights_connection_string
ENV APPLICATIONINSIGHTS_CONNECTION_STRING=${applicationinsights_connection_string}

RUN pnpm -r --workspace-concurrency=${BUILD_CONCURRENCY} build

### Add official connectors ###
ARG additional_connector_args
ENV ADDITIONAL_CONNECTOR_ARGS=${additional_connector_args}
RUN pnpm cli connector link $ADDITIONAL_CONNECTOR_ARGS -p .

### Prune dependencies for production ###
RUN rm -rf node_modules packages/**/node_modules
RUN NODE_ENV=production pnpm i --frozen-lockfile --child-concurrency=${BUILD_CONCURRENCY}

### Clean up ###
RUN rm -rf .scripts pnpm-*.yaml packages/cloud

###### [STAGE] Seal ######
FROM node:22-alpine as app
WORKDIR /etc/logto
COPY --from=builder /etc/logto .
RUN mkdir -p /etc/logto/packages/cli/alteration-scripts && chmod g+w /etc/logto/packages/cli/alteration-scripts
EXPOSE 3001
ENTRYPOINT ["npm", "run"]
CMD ["start"]
