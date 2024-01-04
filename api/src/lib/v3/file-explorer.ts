import path from "path";
import fs from "fs/promises";
import { BadRequestError } from "../exceptions/bad-request-error";

export interface IFileExplorer {
  listFilesAndFolders(directoryPath?: string): Promise<unknown[]>;
  readFile(filePath: string): Promise<string>;
  updateFile(filePath: string, newContent: string): Promise<string>;
  deleteFileOrFolder(targetPath: string): Promise<void>;
  uploadFileOrFolder(
    sourcePath: string,
    targetDirectory: string
  ): Promise<void>;
  moveFileOrFolder(sourcePath: string, targetDirectory: string): Promise<void>;
  copyFileOrFolder(sourcePath: string, targetDirectory: string): Promise<void>;
  downloadFileOrFolder(filePath: string): Promise<void>;
  getFileOrFolderMetadata(targetPath: string): Promise<void>;
  delete(): Promise<void>;
}

export class FileExplorer implements IFileExplorer {
  public readonly rootDir: string;
  private readableFileExtensions: string[] | undefined;
  private readableFileRegex: RegExp | undefined;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  public setReadableFileExtensions(fileExtensions: string[]) {
    this.readableFileExtensions = fileExtensions;
    this.readableFileRegex = this.parseFileExtensionsToRegex(fileExtensions);
  }

  public async delete(): Promise<void> {
    await fs.rm(this.rootDir, { recursive: true, force: true });
  }

  // Method to list files and folders in a directory
  async listFilesAndFolders(directoryPath: string = "") {
    if (directoryPath.includes(".."))
      throw new BadRequestError("Cannot access parent directory");

    const fullPath = path.join(this.rootDir, directoryPath);

    // Read the contents of the specified directory
    const filesAndFolders = await fs.readdir(fullPath);

    const result = [];

    for (const item of filesAndFolders) {
      const itemPath = path.join(fullPath, item);

      // Get file/folder stats to distinguish between them
      const stats = await fs.stat(itemPath);

      result.push({
        name: item,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        lastModified: stats.mtime.toISOString(), // Convert to ISO date string
      });
    }

    return result;
  }

  // Method to read the content of a file
  async readFile(filePath: string): Promise<string> {
    if (filePath.includes(".."))
      throw new BadRequestError("Cannot access parent directory");

    const fullPath = path.join(this.rootDir, filePath);

    const isReadable = this.readableFileRegex?.test(filePath);

    if (!isReadable) throw new BadRequestError("Cannot read file");

    return await fs.readFile(fullPath, "utf-8");
  }

  // Method to update the content of a file
  async updateFile(filePath: string, newContent: string) {
    if (filePath.includes(".."))
      throw new BadRequestError("Cannot access parent directory");

    const fullPath = path.join(this.rootDir, filePath);
    const isReadable = this.readableFileRegex?.test(filePath);

    if (!isReadable) throw new BadRequestError("Cannot read file");

    const stat = await fs.lstat(fullPath);

    // Check if full path belongs to a file
    if (stat.isDirectory())
      throw new BadRequestError("Cannot update a directory");

    // Write the new content to the specified file
    await fs.writeFile(fullPath, newContent, "utf-8");

    return newContent;
  }

  // Method to delete a file or folder
  async deleteFileOrFolder(targetPath: string) {
    // Implement logic to delete the specified file or folder
  }

  // Method to upload a file or folder
  async uploadFileOrFolder(sourcePath: string, targetDirectory: string) {
    // Implement logic to upload a file or folder to the specified directory
  }

  // Method to move a file or folder
  async moveFileOrFolder(sourcePath: string, targetDirectory: string) {
    // Implement logic to move the specified file or folder to a new location
  }

  // Method to copy a file or folder
  async copyFileOrFolder(sourcePath: string, targetDirectory: string) {
    // Implement logic to create a copy of the specified file or folder
  }

  // Method to download a file or folder
  async downloadFileOrFolder(filePath: string) {
    // Implement logic to generate a download link for the specified file or folder
  }

  // Method to retrieve metadata for a file or folder
  async getFileOrFolderMetadata(targetPath: string) {
    // Implement logic to retrieve metadata for the specified file or folder
  }

  private parseFileExtensionsToRegex(fileExtensions: string[]): RegExp {
    return new RegExp(`.+\\.(${fileExtensions.join("|").replace(/\./g, "")})`);
  }
}
