import { ConsoleLogger, type LogLevel } from '@nestjs/common';
import { mkdirSync, createWriteStream, type WriteStream } from 'node:fs';
import { join } from 'node:path';
import { inspect } from 'node:util';

export class FileLogger extends ConsoleLogger {
  private readonly applicationStream: WriteStream;
  private readonly errorStream: WriteStream;

  constructor(logDirectory = join(process.cwd(), 'logs')) {
    super({ timestamp: true });

    mkdirSync(logDirectory, { recursive: true });

    this.applicationStream = this.createLogStream(
      join(logDirectory, 'backend.log'),
    );
    this.errorStream = this.createLogStream(join(logDirectory, 'error.log'));
  }

  override log(message: unknown, ...optionalParams: unknown[]): void {
    super.log(message, ...optionalParams);
    this.write('log', message, optionalParams);
  }

  override error(message: unknown, ...optionalParams: unknown[]): void {
    super.error(message, ...optionalParams);
    this.write('error', message, optionalParams, true);
  }

  override warn(message: unknown, ...optionalParams: unknown[]): void {
    super.warn(message, ...optionalParams);
    this.write('warn', message, optionalParams);
  }

  override debug(message: unknown, ...optionalParams: unknown[]): void {
    super.debug(message, ...optionalParams);
    this.write('debug', message, optionalParams);
  }

  override verbose(message: unknown, ...optionalParams: unknown[]): void {
    super.verbose(message, ...optionalParams);
    this.write('verbose', message, optionalParams);
  }

  override fatal(message: unknown, ...optionalParams: unknown[]): void {
    super.fatal(message, ...optionalParams);
    this.write('fatal', message, optionalParams, true);
  }

  private createLogStream(path: string): WriteStream {
    const stream = createWriteStream(path, { flags: 'a' });

    stream.on('error', (error) => {
      process.stderr.write(`Cannot write log file ${path}: ${error.message}\n`);
    });

    return stream;
  }

  private write(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[],
    writeToErrorFile = false,
  ): void {
    const entry = `${JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message: this.serialize(message),
      details: optionalParams.map((value) => this.serialize(value)),
    })}\n`;

    this.applicationStream.write(entry);

    if (writeToErrorFile) {
      this.errorStream.write(entry);
    }
  }

  private serialize(value: unknown): unknown {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
        cause: value.cause ? this.serialize(value.cause) : undefined,
      };
    }

    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    return inspect(value, {
      colors: false,
      compact: true,
      depth: 5,
      maxArrayLength: 100,
      maxStringLength: 10_000,
    });
  }
}
