import fs from 'fs/promises';
import path from 'path';
import { Logger } from './logger';
import { inject, injectable } from 'tsyringe';
import { ConfigService } from './config.service';

@injectable()
export class ConfigManager {
  private readonly configPath: string;
  private currentConfig: string | null = null;
  private configs: string[] = [];

  constructor(@inject(ConfigService) configService: ConfigService) {
    this.configPath = configService.configPath;
  }

  async loadConfigs(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.configPath);
      this.configs = files.filter((file) => file.endsWith('.conf'));
      return this.configs;
    } catch (error) {
      Logger.error('Error loading configs:', error);
      return [];
    }
  }

  async getNextConfig(): Promise<string | null> {
    await this.loadConfigs();
    if (this.configs.length === 0) {
      return null;
    }

    const currentIndex = this.currentConfig ? this.configs.indexOf(this.currentConfig) : -1;
    const nextIndex = (currentIndex + 1) % this.configs.length;
    this.currentConfig = this.configs[nextIndex];

    return path.join(this.configPath, this.currentConfig);
  }

  getCurrentConfig(): string | null {
    return this.currentConfig;
  }
}
