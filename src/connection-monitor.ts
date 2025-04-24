import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { Logger } from './logger';
import { inject, injectable } from 'tsyringe';
import { ConfigService } from './config.service';

interface IpApiResponse {
  countryCode: string;
}

@injectable()
export class ConnectionMonitor {
  private static readonly maxRetries: number = 1;
  private static readonly baseDelay: number = 3000;

  private readonly configService: ConfigService;
  private readonly httpsProxyAgent: HttpsProxyAgent<'http://127.0.0.1:{number}'>;
  private retryCount: number = 0;

  constructor(@inject(ConfigService) configService: ConfigService) {
    this.configService = configService;

    this.httpsProxyAgent = new HttpsProxyAgent(this.getProxyUrl());
  }

  private getBackoffDelay(): number {
    return Math.min(ConnectionMonitor.baseDelay * Math.pow(2, this.retryCount), 30000);
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get<IpApiResponse>('https://freeipapi.com/api/json', {
        httpsAgent: this.httpsProxyAgent,
      });

      const actualCountry = response.data.countryCode.toUpperCase();

      const isCountryUnexpected: boolean = actualCountry === this.configService.unexpectedCountry;

      if (isCountryUnexpected) {
        Logger.error(`Unexpected proxy country: "${actualCountry}"`);
      }

      return !isCountryUnexpected;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      Logger.error('Connection check failed:', error);

      const isTooManyRequests: boolean = error?.response?.status === 429;

      if (!isTooManyRequests) {
        this.retryCount++;

        if (this.retryCount >= ConnectionMonitor.maxRetries) {
          this.retryCount = 0;
          return false;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, this.getBackoffDelay()));
      return await this.checkConnection();
    }
  }

  private getProxyUrl(): URL {
    const proxyUrl: URL = new URL(`http://127.0.0.1:${this.configService.httpProxyPort}`);

    if (this.configService.proxyUsername) {
      proxyUrl.username = encodeURIComponent(this.configService.proxyUsername);
    }

    if (this.configService.proxyPassword) {
      proxyUrl.password = encodeURIComponent(this.configService.proxyPassword);
    }

    return proxyUrl;
  }
}
