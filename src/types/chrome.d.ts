export {};

declare global {
  interface Window {
    chrome?: {
      bookmarks?: {
        search: (
          query: string,
          callback: (results: Array<{ id: string; title?: string; url?: string; parentId?: string }>) => void,
        ) => void;
        get: (
          idOrIdList: string | string[],
          callback: (results: Array<{ id: string; title?: string; url?: string; parentId?: string }>) => void,
        ) => void;
      };
      history?: {
        search: (
          query: { text: string; startTime?: number; maxResults?: number },
          callback: (results: Array<{ id: string; title?: string; url?: string; visitCount?: number; lastVisitTime?: number }>) => void,
        ) => void;
        getVisits: (
          details: { url: string },
          callback: (results: Array<{ id: string; visitId: string; visitTime?: number; referringVisitId: string; transition: string }>) => void,
        ) => void;
      };
      topSites?: {
        get: (callback: (results: Array<{ title: string; url: string }>) => void) => void;
      };
      storage?: {
        local?: {
          get: (keys: string | string[] | Record<string, unknown> | null, callback: (items: Record<string, unknown>) => void) => void;
          set: (items: Record<string, unknown>, callback?: () => void) => void;
        };
        onChanged?: {
          addListener: (callback: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>, areaName: string) => void) => void;
          removeListener: (callback: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>, areaName: string) => void) => void;
        };
      };
      runtime?: {
        lastError?: { message?: string };
      };
    };
  }
}
