import path from 'path';
import { promises as fs } from 'fs';
import { inject, injectable } from 'tsyringe';
import { ConfigService } from './config.service';

@injectable()
export class WireproxyConfigBuilder {
  private readonly configService: ConfigService;

  constructor(@inject(ConfigService) configService: ConfigService) {
    this.configService = configService;
  }

  async build(wireproxyConfigPath: string, wireGuardProxyPath: string): Promise<void> {
    await fs.writeFile(
      wireproxyConfigPath,
      `WGConfig = ${path.resolve(wireGuardProxyPath)}

[http]
BindAddress = 0.0.0.0:${this.configService.httpProxyPort}
${this.configService.proxyUsername === undefined ? '' : `Username = ${this.configService.proxyUsername}`}
${this.configService.proxyPassword === undefined ? '' : `Password = ${this.configService.proxyPassword}`}

[Socks5]
BindAddress = 0.0.0.0:${this.configService.socks5ProxyPort}
${this.configService.proxyUsername === undefined ? '' : `Username = ${this.configService.proxyUsername}`}
${this.configService.proxyPassword === undefined ? '' : `Password = ${this.configService.proxyPassword}`}
`
    );
  }
}
