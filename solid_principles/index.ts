interface ReadableStorage {
  readFile(fileName: string): string;
}

interface WritableStorage extends ReadableStorage {
  saveFile(fileName: string, data: string): void;
}

class LocalStorage implements WritableStorage {
  saveFile(fileName: string, data: string): void {
    console.log(`Saving file to local disk...`);
  }
  readFile(fileName: string): string {
    return "Reading from local disk";
  }
}

class S3Storage implements WritableStorage {
  saveFile(fileName: string, data: string): void {
    console.log(`Uploading file to AWS S3...`);
  }
  readFile(fileName: string): string {
    return "Reading data from S3";
  }
}

class ReadOnlyStorage implements ReadableStorage {
  readFile(fileName: string): string {
    return "data from read-only storage";
  }
}
