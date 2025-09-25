import { MulterFile } from '@/upload/strategies/index.strategy';

/**
 * Determines the appropriate upload folder based on the file's MIME type.
 *
 * @param file - The Multer file object containing file metadata
 * @returns The folder name where the file should be uploaded:
 *   - 'images' for image files (image/*)
 *   - 'documents' for PDF, Word, and Excel files
 *   - 'other' for all other file types
 *
 * @example
 * ```typescript
 * const imageFile = { mimetype: 'image/jpeg' } as MulterFile;
 * const folder = getUploadFolder(imageFile); // Returns 'images'
 *
 * const pdfFile = { mimetype: 'application/pdf' } as MulterFile;
 * const folder = getUploadFolder(pdfFile); // Returns 'documents'
 * ```
 */
export function getUploadFolder(file: MulterFile): string {
  if (file.mimetype.startsWith('image/')) {
    return 'images';
  }

  // For documents (pdf, word, excel, etc.)
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'documents';
  }

  return 'other';
}
