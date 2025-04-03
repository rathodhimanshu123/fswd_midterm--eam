/**
 * Generates a srcset attribute value for responsive images
 * @param baseUrl The base URL of the image
 * @param widths Array of widths to generate sources for
 * @returns Formatted srcset string
 */
export const generateSrcSet = (baseUrl: string, widths: number[]): string => {
  const url = new URL(baseUrl);
  const path = url.pathname;
  const extension = path.split('.').pop() || '';
  const basePath = path.replace(`.${extension}`, '');

  return widths
    .map(width => {
      const newPath = `${basePath}-${width}.${extension}`;
      const newUrl = new URL(newPath, url.origin);
      return `${newUrl.toString()} ${width}w`;
    })
    .join(', ');
};

/**
 * Calculates aspect ratio for an image
 * @param width Image width
 * @param height Image height
 * @returns Formatted aspect ratio (e.g., "4/3")
 */
export const calculateAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
};

/**
 * Gets appropriate size attribute for responsive images
 * @param breakpoints Breakpoint configuration
 * @returns Formatted sizes attribute
 */
export const getResponsiveSizes = (
  breakpoints: { [key: string]: number }
): string => {
  const entries = Object.entries(breakpoints)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .filter(([key]) => key !== 'default');

  const sizes = entries.map(([breakpoint, columns]) => {
    return `(min-width: ${breakpoint}px) ${100 / columns}vw`;
  });

  // Default size
  const defaultColumns = breakpoints.default || 1;
  sizes.push(`${100 / defaultColumns}vw`);

  return sizes.join(', ');
}; 