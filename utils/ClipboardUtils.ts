import { Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

/**
 * Copies text to the system clipboard across Web and Native platforms.
 * @param content The text to copy
 */
export const copyToClipboard = async (content: string): Promise<void> => {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(content);
    } else {
      await Clipboard.setStringAsync(content);
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    throw err;
  }
};
