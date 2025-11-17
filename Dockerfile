FROM google/cloud-sdk:alpine AS fetch-data

WORKDIR /fetch

ARG GCS_BUCKET_NAME
ARG CATALOG_FILE_PATH=catalog.json

RUN apk add --no-cache jq

RUN --mount=type=secret,id=gcp-credentials,target=/tmp/gcp-key.json \
    gcloud auth activate-service-account --key-file=/tmp/gcp-key.json && \
    gsutil cp "gs://${GCS_BUCKET_NAME}/${CATALOG_FILE_PATH}" ./catalog.json

FROM node:lts AS build

WORKDIR /app

COPY site/package*.json ./

RUN npm install

COPY site/ ./

COPY --from=fetch-data /fetch/catalog.json ./catalog.json

RUN npm run build

FROM nginx:alpine AS runtime

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
