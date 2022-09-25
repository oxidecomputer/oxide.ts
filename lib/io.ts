import path from "path";
import fs from "fs";
import { Writable } from "stream";

let _out: string;
export function outDir() {
  if (_out) {
    return _out;
  }

  const out = process.argv[3];
  if (!out) throw Error("Missing outDir argument");
  _out = path.resolve(process.cwd(), out);
  return _out;
}

/**
 * A test stream that stores a buffer internally
 */
export class TestWritable extends Writable {
  private buffer: Buffer = Buffer.from("");

  _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    callback();
  }

  value(): string {
    return this.buffer.toString();
  }

  clear(): void {
    this.buffer = Buffer.from("");
  }
}

export type Out<T> = T extends true ? TestWritable : Writable;

export interface IO<T extends boolean = false> {
  w: (str: string) => void;
  w0: (str: string) => void;
  out: Out<T>;
}

export function initIO<T extends boolean = false>(
  destDir: T extends false ? string : never
): IO<T> {
  let out: Writable;
  if (process.env.NODE_ENV === "test") {
    out = new TestWritable();
  } else {
    out = fs.createWriteStream(path.resolve(destDir, "Api.ts"), {
      flags: "w",
    });
  }

  return {
    /** write to file with newline */
    w(s: string) {
      out.write(s + "\n");
    },

    /** same as w() but no newline */
    w0(s: string) {
      out.write(s);
    },

    out: out as Out<T>,
  };
}
