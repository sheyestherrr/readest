import { isWebAppPlatform, hasCli } from '@/services/environment';
import { getCurrent } from '@tauri-apps/plugin-deep-link';

declare global {
  interface Window {
    OPEN_WITH_FILES?: string[] | null;
  }
}

interface CliArgument {
  value: string;
  occurrences: number;
}

const parseWindowOpenWithFiles = () => {
  return window.OPEN_WITH_FILES;
};

const parseCLIOpenWithFiles = async () => {
  const { getMatches } = await import('@tauri-apps/plugin-cli');
  const matches = await getMatches();
  const args = matches?.args;
  const files: string[] = [];
  if (args) {
    for (const name of ['file1', 'file2', 'file3', 'file4']) {
      const arg = args[name] as CliArgument;
      if (arg && arg.occurrences > 0) {
        files.push(arg.value);
      }
    }
  }

  return files;
};

const parseIntentOpenWithFiles = async () => {
  const urls = await getCurrent();
  if (urls && urls.length > 0) {
    console.log('Intent Open with URL:', urls);
    return urls
      .map((url) => {
        if (url.startsWith('file://')) {
          return decodeURI(url.replace('file://', ''));
        } else if (url.startsWith('content://')) {
          return url;
        } else {
          console.info('Skip non-file URL:', url);
          return null;
        }
      })
      .filter((url) => url !== null) as string[];
  }
  return null;
};

export const parseOpenWithFiles = async () => {
  if (isWebAppPlatform()) return [];

  let files = parseWindowOpenWithFiles();
  if ((!files || files.length === 0) && hasCli()) {
    files = await parseCLIOpenWithFiles();
  }
  if (!files || files.length === 0) {
    files = await parseIntentOpenWithFiles();
  }
  return files;
};
