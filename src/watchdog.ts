import { ConfigManager } from './config-loader';
import { ConnectionMonitor } from './connection-monitor';
import { ProcessController } from './proxy-manager';
import { Logger } from './logger';
import { injectable, inject } from 'tsyringe';
import { ConfigService } from './config.service';

@injectable()
export class WireproxyWatchdog {
  private readonly configService: ConfigService;
  private readonly configManager: ConfigManager;
  private readonly connectionMonitor: ConnectionMonitor;
  private readonly processController: ProcessController;

  private isRunning = false;

  constructor(
    @inject(ConfigService) configService: ConfigService,
    @inject(ConfigManager) configManager: ConfigManager,
    @inject(ConnectionMonitor) connectionMonitor: ConnectionMonitor,
    @inject(ProcessController) processController: ProcessController
  ) {
    this.configService = configService;
    this.configManager = configManager;
    this.connectionMonitor = connectionMonitor;
    this.processController = processController;
  }

  async start(): Promise<void> {
    this.isRunning = true;
    Logger.log(
      `Starting Wireproxy Watchdog (HTTP proxy port: ${this.configService.httpProxyPort})`
    );

    await this.rotateConfig();
    this.scheduleNextCheck();
  }

  private async rotateConfig(): Promise<void> {
    const configPath = await this.configManager.getNextConfig();
    if (!configPath) {
      Logger.error('No valid configs found');
      process.exit(1);
    }

    const success = await this.processController.startProxy(configPath);
    if (!success) {
      Logger.error('Failed to start wireproxy');
      await this.rotateConfig();
    }
  }

  private async checkStatus(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    const isConnectionValid = await this.connectionMonitor.checkConnection();
    if (!isConnectionValid) {
      await this.rotateConfig();
    }

    this.scheduleNextCheck();
  }

  private scheduleNextCheck(): void {
    setTimeout(() => this.checkStatus(), this.configService.checkIntervalSec * 1000);
  }
}
