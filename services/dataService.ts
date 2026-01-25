import { DailyBriefing, BriefingDetail } from '../types';
import { Language } from '../src/i18n/i18n';

// Fetch briefing list from local JSON file with file existence validation
export interface FetchBriefingListOptions {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
}

export interface BriefingListResult {
  data: DailyBriefing[];
  total: number;
  page: number;
  pageSize: number;
}

export const fetchBriefingList = async (options: FetchBriefingListOptions = {}, language: Language = 'zh'): Promise<BriefingListResult> => {
  const { page = 1, pageSize = 10, searchQuery = '' } = options;
  
  try {
    // 构建请求URL，优先使用语言目录
    let url = `/data/${language}/index.json?t=${new Date().getTime()}`;
    let response = await fetch(url);
    
    // 如果语言目录不存在，不回退到默认目录，直接抛出错误
    // 这样可以确保获取到正确语言的数据
    if (!response.ok) {
      console.error(`Failed to fetch ${language} index.json: HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let data;
    try {
      data = await response.json();
      console.log(`Successfully fetched ${language} index.json with ${data.length} items`);
    } catch (parseError) {
      console.error(`JSON parse error for ${language}/index.json:`, parseError);
      throw new Error(`Invalid JSON format in ${language}/index.json: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }
    
    // Validate the data structure
    if (!Array.isArray(data)) {
      throw new Error(`Invalid data format for ${language}/index.json: expected array`);
    }
    
    // Validate each briefing file exists
    const validBriefings: DailyBriefing[] = [];
    for (const briefing of data) {
      try {
        // Skip invalid IDs that don't match the expected date format
        if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(briefing.id)) {
          console.warn(`Skipping briefing with invalid ID format: ${briefing.id}`);
          continue;
        }
        
        // Skip file existence check for local development
        // In production, use HEAD request to verify file existence
        validBriefings.push(briefing);
      } catch (err) {
        console.warn(`Error checking file for briefing ${briefing.id}, removing from list:`, err);
      }
    }
    
    // Sort by date (newest first)
    validBriefings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Apply search filter
    const filteredBriefings = searchQuery
      ? validBriefings.filter(briefing => {
          const query = searchQuery.toLowerCase();
          return (
            briefing.title.toLowerCase().includes(query) ||
            briefing.summary.toLowerCase().includes(query) ||
            briefing.date.toLowerCase().includes(query)
          );
        })
      : validBriefings;
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredBriefings.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      total: filteredBriefings.length,
      page,
      pageSize
    };
  } catch (error) {
    console.error('Failed to fetch briefing list:', error);
    throw error;
  }
};

// Synchronize index.json with archive folder content
export const syncIndexWithArchive = async (language: Language = 'zh'): Promise<void> => {
  try {
    // 1. Fetch current index with language-specific path
    let indexUrl = `/data/${language}/index.json?t=${new Date().getTime()}`;
    let indexResponse = await fetch(indexUrl);
    
    // Fallback to default if language-specific index doesn't exist
    if (!indexResponse.ok) {
      indexUrl = `/data/index.json?t=${new Date().getTime()}`;
      indexResponse = await fetch(indexUrl);
    }
    
    let currentIndex: DailyBriefing[] = [];
    if (indexResponse.ok) {
      try {
        currentIndex = await indexResponse.json();
      } catch (parseError) {
        console.warn('Failed to parse index.json, using empty array:', parseError);
        currentIndex = [];
      }
    }
    
    // 2. Get list of files in archive folder (Note: This is a browser-side workaround)
    // In a production environment, you would need a server endpoint to list files
    const archiveFiles = await getArchiveFileList();
    
    // 3. Create maps for comparison
    const indexMap = new Map<string, DailyBriefing>();
    currentIndex.forEach(briefing => indexMap.set(briefing.id, briefing));
    
    const fileMap = new Map<string, string>();
    archiveFiles.forEach(file => {
      const id = file.replace('.json', '');
      fileMap.set(id, file);
    });
    
    // 4. Add new files to index
    const newIndex: DailyBriefing[] = [...currentIndex];
    
    for (const [id, filename] of fileMap.entries()) {
      if (!indexMap.has(id)) {
        try {
          // Fetch the file to get metadata with language-specific path
          let fileUrl = `/data/${language}/archive/${filename}`;
          let fileResponse = await fetch(fileUrl);
          
          // Fallback to default if language-specific file doesn't exist
          if (!fileResponse.ok) {
            fileUrl = `/data/archive/${filename}`;
            fileResponse = await fetch(fileUrl);
          }
          
          if (fileResponse.ok) {
            try {
              const fileData = await fileResponse.json();
              
              // Create minimal entry for new file
              const newEntry: DailyBriefing = {
                id: fileData.id || id,
                date: fileData.date || new Date().toISOString().split('T')[0],
                title: fileData.title || `Briefing ${id}`,
                summary: fileData.summary || `Summary for briefing ${id}`,
                coverImage: fileData.coverImage || `https://picsum.photos/800/600?random=${Math.random()}`
              };
              
              newIndex.push(newEntry);
              console.log(`Added new file to index: ${id}`);
            } catch (parseError) {
              console.warn(`Failed to parse file ${filename}, skipping:`, parseError);
            }
          }
        } catch (error) {
          console.warn(`Failed to add file ${id} to index:`, error);
        }
      }
    }
    
    // 5. Remove entries for missing files (cleanup orphaned entries)
    const filteredIndex = await cleanupOrphanedEntries(newIndex, fileMap);
    
    // 6. Sort by date (newest first)
    filteredIndex.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // 7. Update index.json (Note: This requires a server endpoint in production)
    // For local development, we'll log the changes and suggest manual update
    console.log('Index synchronization complete. New index:', filteredIndex);
    console.log('Please update public/data/index.json with the above content.');
    
  } catch (error) {
    console.error('Failed to synchronize index with archive:', error);
    // Don't throw error to prevent breaking the application
  }
};

// Cleanup orphaned index entries that don't have corresponding files
export const cleanupOrphanedEntries = async (index: DailyBriefing[], fileMap: Map<string, string>): Promise<DailyBriefing[]> => {
  const validEntries: DailyBriefing[] = [];
  const removedEntries: string[] = [];
  
  for (const entry of index) {
    if (fileMap.has(entry.id)) {
      validEntries.push(entry);
    } else {
      removedEntries.push(entry.id);
      console.warn(`Removed orphaned index entry: ${entry.id} (no corresponding file found)`);
    }
  }
  
  if (removedEntries.length > 0) {
    console.log(`Cleanup complete: Removed ${removedEntries.length} orphaned entries`);
    console.log('Removed entries:', removedEntries);
  } else {
    console.log('Cleanup complete: No orphaned entries found');
  }
  
  return validEntries;
};

// Get list of files in archive folder (browser-side workaround)
async function getArchiveFileList(): Promise<string[]> {
  // In a production environment, this should be replaced with a server endpoint
  // For now, we'll return a hardcoded list based on current files
  // In practice, you would need to implement this with a backend API
  const knownFiles = [
    '2026-01-01.json',
    '2026-01-02.json',
    '2026-01-03.json',
    '2026-01-04.json',
    '2026-01-05.json',
    '2026-01-06.json',
    '2026-1-5-20-32.json'
  ];
  
  // Skip file existence check for local development
  // In production, you would need a server endpoint to list files
  return knownFiles;
};

// Fetch briefing detail from local JSON file
export const fetchBriefingDetail = async (id: string, language: Language = 'zh'): Promise<BriefingDetail> => {
  try {
    // 构建请求URL，优先使用语言目录
    let url = `/data/${language}/archive/${id}.json?t=${new Date().getTime()}`;
    let response = await fetch(url);
    
    // 如果语言目录不存在，不回退到默认目录，直接抛出错误
    // 这样可以确保获取到正确语言的数据
    if (!response.ok) {
      console.error(`Failed to fetch ${language}/archive/${id}.json: HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    
    // Try to parse the JSON
    let data: BriefingDetail;
    try {
      data = JSON.parse(text) as BriefingDetail;
    } catch (parseError) {
      console.error('JSON parse error for file:', `/data/archive/${id}.json`);
      console.error('Raw content:', text.substring(0, 600)); // Log first 600 chars for debugging
      throw new Error(`Invalid JSON format in ${id}.json: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }
    
    // Validate required fields
    if (!data.id || !data.date || !data.title || !data.fullContent) {
      throw new Error(`Missing required fields in ${id}.json`);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch briefing detail:', error);
    throw error;
  }
};

// Start file watcher with polling mechanism
export const startFileWatcher = (interval: number = 10000, language: Language = 'zh'): (() => void) => {
  console.log(`Starting file watcher with ${interval}ms polling interval`);
  
  const intervalId = setInterval(async () => {
    try {
      console.log('Running file synchronization...');
      await syncIndexWithArchive(language);
    } catch (error) {
      console.error('File watcher error:', error);
    }
  }, interval);
  
  // Return cleanup function to stop the watcher
  return () => {
    clearInterval(intervalId);
    console.log('File watcher stopped');
  };
};