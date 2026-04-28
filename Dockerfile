# syntax=docker/dockerfile:1.7

###### [STAGE] Build ######
FROM node:22-alpine AS builder
WORKDIR /etc/logto
ENV CI=true

# No need for Docker build
ENV PUPPETEER_SKIP_DOWNLOAD=true

### Install toolchain ###
RUN npm add --location=global pnpm@^10.0.0
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#node-gyp-alpine
RUN apk add --no-cache python3 make g++ rsync

COPY . .

### Install dependencies and build ###
# Reuse the pnpm store between BuildKit runs to reduce duplicate downloads/writes.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store pnpm i

### Set if dev features enabled ###
ARG dev_features_enabled
ENV DEV_FEATURES_ENABLED=${dev_features_enabled}

ARG applicationinsights_connection_string
ENV APPLICATIONINSIGHTS_CONNECTION_STRING=${applicationinsights_connection_string}

ARG logto_oss_survey_endpoint=
ENV LOGTO_OSS_SURVEY_ENDPOINT=${logto_oss_survey_endpoint}

RUN pnpm -r build

### Add official connectors ###
ARG additional_connector_args
ENV ADDITIONAL_CONNECTOR_ARGS=${additional_connector_args}
RUN pnpm cli connector link $ADDITIONAL_CONNECTOR_ARGS -p .

### Prune dependencies for production ###
# Keep prune + production install in one layer to avoid extra transient disk usage.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  rm -rf node_modules packages/**/node_modules && NODE_ENV=production pnpm i

### Clean up ###
RUN rm -rf .scripts pnpm-*.yaml packages/cloud

###### [STAGE] Seal ######
FROM node:22-alpine AS app
WORKDIR /etc/logto
ARG logto_oss_survey_endpoint=
ARG private_key_rotation_grace_period=0
# Default to empty so external survey relaying stays opt-in for controlled builds/environments.
ENV LOGTO_OSS_SURVEY_ENDPOINT=${logto_oss_survey_endpoint}
ENV PRIVATE_KEY_ROTATION_GRACE_PERIOD=${private_key_rotation_grace_period}
COPY --from=builder /etc/logto .
RUN mkdir -p /etc/logto/packages/cli/alteration-scripts && chmod g+w /etc/logto/packages/cli/alteration-scripts
EXPOSE 3001
ENTRYPOINT ["npm", "run"]
CMD ["start"]
