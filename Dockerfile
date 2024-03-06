FROM node:18-bullseye
RUN apt-get update -y && apt-get install -y chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
RUN npm install -g bun
COPY bun.lockb .
COPY package.json .

# Install dependencies
RUN bun install --frozen-lockfile
COPY src ./src
CMD ["bun", "src/index.ts"]