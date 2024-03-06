FROM oven/bun

RUN apt-get update -y && apt-get install -y chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy the lock and package file
COPY bun.lockb .
COPY package.json .

# Install dependencies
RUN bun install --frozen-lockfile

# Copy your source code
# If only files in the src folder changed, this is the only step that gets executed!
COPY src ./src

CMD ["bun", "src/index.ts"]