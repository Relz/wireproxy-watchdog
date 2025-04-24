import 'reflect-metadata';
import { container } from 'tsyringe';
import { WireproxyWatchdog } from './watchdog';
import { Logger } from './logger';

const watchdog = container.resolve(WireproxyWatchdog);

watchdog.start().catch((error) => {
  Logger.error('Fatal error:', error);
  process.exit(1);
});
