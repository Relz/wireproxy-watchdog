export class Logger {
  static log(message: string): void {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  static error(message: string, error?: unknown): void {
    const errorMessage = error instanceof Error ? error.message : error;
    console.error(`[${new Date().toISOString()}] ${message}`, errorMessage || '');
  }
}
