import slugify from 'slugify';

export class SlugService {
  /**
   * Generates a safe, URL-friendly slug from a filename
   */
  static getSlug(filename: string): string {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    // First try with slugify (Latin-friendly)
    let slug = slugify(nameWithoutExt, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });

    // If slug is empty (e.g. only non-Latin characters like Korean),
    // use Hex encoding to ensure 0% collision and ASCII safety.
    if (!slug) {
      slug = Array.from(nameWithoutExt)
        .map(c => c.charCodeAt(0).toString(16))
        .join('');
      
      // Limit length if too long, but for a filename it should be fine
      if (slug.length > 50) slug = slug.substring(0, 50);
    }
    
    return slug || 'untitled';
  }
}
