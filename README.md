# Wireproxy Watchdog

A Node.js service that monitors and manages wireproxy connections, automatically rotating WireGuard configurations when issues are detected.

## Features

- Monitors connection status via IP geolocation checks
- Automatically rotates WireGuard configurations when issues are detected
- Exponential backoff retry mechanism
- Docker support
- Graceful shutdown handling
- Configurable check intervals
- HTTP proxy support with configurable port
- Real-time logging with timestamps
- AmneziaWG support

## Environment Variables

Copy `.env.example` to `.env` and configure.

## Docker Usage

1. Build the image:

```bash
docker build -t wireproxy-watchdog .
```

2. Run the container:

```bash
docker run -d \
  --name wireproxy-watchdog \
  -v /path/to/your/wireguard/configs:/app/configs \
  -p 8080:25345 \
  --env-file .env \
  wireproxy-watchdog
```

## WireGuard Configuration Files

Place your WireGuard configuration files (`.conf` extension) in the mounted `/app/configs` directory. The watchdog will automatically detect and use these configurations.

## Development

1. Install dependencies:

```bash
npm install
```

2. Run in development mode:

```bash
npm run dev
```

3. Build the project:

```bash
npm run build
```

4. Run the built version:

```bash
npm start
```

## Using the HTTP Proxy

The service exposes an HTTP proxy on the configured port (default: 8080). You can use this proxy in your applications or browser:

```bash
export http_proxy="http://localhost:8080"
export https_proxy="http://localhost:8080"
```
