import path from 'path';
import fs from 'fs/promises';
import { BadRequestError } from './exceptions/bad-request-error';

// Regular expression to match file extensions that can be read
export const READABLE_FILES_REGEX = new RegExp(
  '.+\\.(json|txt|properties|yml)'
);

export class FileExplorer {
  private _rootDir: string;

  constructor(rootDir: string) {
    this._rootDir = rootDir; // Path to server directory
  }

  // Method to list files and folders in a directory
  async listFilesAndFolders(directoryPath: string = '') {
    try {
      if (directoryPath.includes('..'))
        throw new BadRequestError('Cannot access parent directory');

      const fullPath = path.join(this._rootDir, directoryPath);

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
    } catch (err) {
      console.error('Error listing files and folders:', err);
      throw new BadRequestError('Error listing files and folders');
    }
  }

  // Method to read the content of a file
  async readFile(filePath: string): Promise<string> {
    try {
      if (filePath.includes('..'))
        throw new BadRequestError('Cannot access parent directory');

      const fullPath = path.join(this._rootDir, filePath);

      const isReadable = READABLE_FILES_REGEX.test(filePath);

      if (!isReadable) throw new BadRequestError('Cannot read file');

      return await fs.readFile(fullPath, 'utf-8');
    } catch (err) {
      console.log('Error reading file:', err);
      throw new BadRequestError('Error reading file');
    }
  }

  // Method to update the content of a file
  async updateFile(filePath: string, newContent: string) {
    try {
      if (filePath.includes('..'))
        throw new BadRequestError('Cannot access parent directory');

      const fullPath = path.join(this._rootDir, filePath);
      const isReadable = READABLE_FILES_REGEX.test(filePath);

      if (!isReadable) throw new BadRequestError('Cannot read file');

      const stat = await fs.lstat(fullPath);

      // Check if full path belongs to a file
      if (stat.isDirectory())
        throw new BadRequestError('Cannot update a directory');

      // Write the new content to the specified file
      await fs.writeFile(fullPath, newContent, 'utf-8');

      return newContent;
    } catch (err) {
      console.error('Error updating file:', err);
      throw new BadRequestError('Error updating file');
    }
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
}
