import Dexie, { type Table } from 'dexie';

export interface ZekrHistory {
  id?: number;
  text: string;
  style: string;
  videoUrl: string;
  imageUrl: string;
  timestamp: number;
  aspectRatio: '16:9' | '9:16';
  spiritualInsights?: string;
}

export class ZekrDatabase extends Dexie {
  history!: Table<ZekrHistory>;

  constructor() {
    super('ZekrMotionDB');
    this.version(2).stores({
      history: '++id, text, timestamp'
    });
  }
}

export const db = new ZekrDatabase();
