import archiver from 'archiver';
import { Writable } from 'stream';

export const createZipFromResponse = async (
  files: Record<string, string>,
  outputStream: Writable
): Promise<void> => {
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // Good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('Archiver warning:', err);
    } else {
      throw err;
    }
  });

  // Good practice to catch this error explicitly
  archive.on('error', (err) => {
    throw err;
  });

  // Pipe archive data to the output stream
  archive.pipe(outputStream);

  // Append each file to the archive
  for (const filePath in files) {
    if (Object.prototype.hasOwnProperty.call(files, filePath)) {
      const content = files[filePath];
      // Use Buffer.from to handle string content
      archive.append(Buffer.from(content, 'utf-8'), { name: filePath });
    }
  }

  // Finalize the archive (ie we are done appending files but streams have to finish yet)
  // 'close', 'end' or 'finish' may be used to signal that the upstream source is done sending data.
  await archive.finalize();
};