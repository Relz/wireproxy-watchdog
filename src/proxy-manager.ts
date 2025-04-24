import path from 'path';
import os from 'os';
import { type ChildProcess, spawn } from 'child_process';
import treeKill from 'tree-kill';
import { inject, injectable } from 'tsyringe';
import { Logger } from './logger';
import { WireproxyConfigBuilder } from './wireproxy-config-builder';

@injectable()
export class ProcessController {
  private readonly wireproxyConfigBuilder: WireproxyConfigBuilder;

  private process: ChildProcess | null = null;
  private isShuttingDown = false;

  constructor(@inject(WireproxyConfigBuilder) wireproxyConfigBuilder: WireproxyConfigBuilder) {
    this.wireproxyConfigBuilder = wireproxyConfigBuilder;

    process.on('SIGTERM', () => this.handleShutdown());
    process.on('SIGINT', () => this.handleShutdown());
  }

  async startProxy(configPath: string): Promise<boolean> {
    if (this.process) {
      await this.stopProxy();
    }

    Logger.log(`Starting wireproxy with config: ${configPath}`);

    const wireproxyConfigPath: string = path.join(os.tmpdir(), 'wireproxy.conf');
    await this.wireproxyConfigBuilder.build(wireproxyConfigPath, configPath);

    return new Promise((resolve) => {
      this.process = spawn('wireproxy', ['-c', wireproxyConfigPath], {
        stdio: 'pipe',
      });

      this.process.stdout?.on('data', (data) => {
        Logger.log(`wireproxy: ${data.toString().trim()}`);
      });

      this.process.stderr?.on('data', (data) => {
        Logger.error(`wireproxy error: ${data.toString().trim()}`);
      });

      this.process.on('error', (error) => {
        Logger.error('Failed to start wireproxy:', error);
        resolve(false);
      });

      // Give the process some time to start and potentially fail
      setTimeout(() => {
        if (this.process?.killed) {
          resolve(false);
        } else {
          resolve(true);
        }
      }, 2000);
    });
  }

  async stopProxy(): Promise<void> {
    if (!this.process) {
      return;
    }

    return new Promise((resolve) => {
      if (this.process?.pid) {
        treeKill(this.process.pid, 'SIGTERM', (err) => {
          if (err) {
            Logger.error('Error killing wireproxy:', err);
          }
          this.process = null;
          resolve();
        });
      } else {
        this.process = null;
        resolve();
      }
    });
  }

  private async handleShutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    Logger.log('Shutting down gracefully...');

    await this.stopProxy();
    process.exit(0);
  }
}
