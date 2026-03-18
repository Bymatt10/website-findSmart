FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/build/client ./build/client
RUN npm install -g serve
ENV PORT=8000
EXPOSE 8000
CMD ["serve", "-s", "build/client", "-l", "8000"]
