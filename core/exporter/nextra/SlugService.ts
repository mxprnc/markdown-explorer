import slugify from 'slugify';

export class SlugService {
  /**
   * Generates a safe, URL-friendly slug from a filename
   */
  static getSlug(filename: string): string {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    return slugify(nameWithoutExt, {
      lower: true,      // Convert to lower case
      strict: true,     // Strip special characters except replacement
      remove: /[*+~.()'"!:@]/g // Additional characters to remove
    });
  }
}
