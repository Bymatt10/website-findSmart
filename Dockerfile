FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
ENV PORT=8000
EXPOSE 8000
CMD ["npm", "run", "start"]
