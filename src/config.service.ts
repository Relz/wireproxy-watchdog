import { singleton } from 'tsyringe';
import dotenv from 'dotenv';

@singleton()
export class ConfigService {
  private readonly config: NodeJS.ProcessEnv;

  constructor() {
    dotenv.config();
    this.config = process.env;
  }

  get httpProxyPort(): number {
    return parseInt(this.config.HTTP_PROXY_PORT || '8080', 10);
  }

  get socks5ProxyPort(): number {
    return parseInt(this.config.SOCKS5_PROXY_PORT || '8081', 10);
  }

  get proxyUsername(): string | undefined {
    return this.config.PROXY_USERNAME === '' ? undefined : this.config.PROXY_USERNAME;
  }

  get proxyPassword(): string | undefined {
    return this.config.PROXY_PASSWORD === '' ? undefined : this.config.PROXY_PASSWORD;
  }

  get unexpectedCountry(): string {
    return this.config.UNEXPECTED_COUNTRY ?? 'RU';
  }

  get checkIntervalSec(): number {
    return parseInt(this.config.CHECK_INTERVAL_SEC || '10', 10);
  }

  get configPath(): string {
    return this.config.CONFIG_PATH || './configs';
  }
}
