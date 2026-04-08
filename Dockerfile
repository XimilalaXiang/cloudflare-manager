FROM node:22-alpine AS frontend
WORKDIR /web
COPY web/package*.json ./
RUN npm ci --prefer-offline
COPY web/ .
RUN npm run build

FROM golang:1.25-alpine AS builder
ARG TARGETOS TARGETARCH
RUN apk add --no-cache gcc musl-dev
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build -ldflags="-s -w" -trimpath -o /app/server ./cmd/server

FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/server .
COPY --from=frontend /web/dist ./web/dist
RUN mkdir -p /app/data
ENV PORT=8080
ENV DATABASE_PATH=/app/data/cloudflare-manager.db
EXPOSE 8080
CMD ["./server"]
