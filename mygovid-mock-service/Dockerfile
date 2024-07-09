FROM node:20-alpine as builder

WORKDIR /app

COPY ./mygovid-mock-service/package*.json ./

RUN npm i

COPY ./mygovid-mock-service ./

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app /app/

ENV NODE_ENV=development
ENV LOG_LEVEL=trace

RUN npm prune --omit=dev

EXPOSE 4005

CMD [ "node", "dist/", "index.js" ]
