import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION } from '../config';
import type { Artifact } from '../types';

// IndexedDB schema
interface BoopBlurDB extends DBSchema {
  artifacts: {
    key: string;
    value: Artifact;
    indexes: {
      'by-date': string;
      'by-week': string;
      'by-timestamp': number;
    };
  };
}

class ArtifactRepository {
  private db: IDBPDatabase<BoopBlurDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<BoopBlurDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create artifacts store
        if (!db.objectStoreNames.contains('artifacts')) {
          const artifactStore = db.createObjectStore('artifacts', {
            keyPath: 'id'
          });
          
          // Create indexes
          artifactStore.createIndex('by-date', 'isoDate');
          artifactStore.createIndex('by-week', 'weekKey');
          artifactStore.createIndex('by-timestamp', 'ts');
        }
      }
    });
  }

  async saveArtifact(artifact: Artifact): Promise<void> {
    await this.init();
    await this.db!.put('artifacts', artifact);
  }

  async getArtifact(id: string): Promise<Artifact | undefined> {
    await this.init();
    return this.db!.get('artifacts', id);
  }

  async getAllArtifacts(): Promise<Artifact[]> {
    await this.init();
    return this.db!.getAll('artifacts');
  }

  async getArtifactsByWeek(weekKey: string): Promise<Artifact[]> {
    await this.init();
    return this.db!.getAllFromIndex('artifacts', 'by-week', weekKey);
  }

  async getArtifactsByDate(isoDate: string): Promise<Artifact[]> {
    await this.init();
    return this.db!.getAllFromIndex('artifacts', 'by-date', isoDate);
  }

  async deleteArtifact(id: string): Promise<void> {
    await this.init();
    await this.db!.delete('artifacts', id);
  }

  async deleteArtifactsByIds(ids: string[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('artifacts', 'readwrite');
    await Promise.all([
      ...ids.map(id => tx.store.delete(id)),
      tx.done
    ]);
  }

  async clearAllArtifacts(): Promise<void> {
    await this.init();
    await this.db!.clear('artifacts');
  }
}

// Singleton instance
export const artifactRepo = new ArtifactRepository();
