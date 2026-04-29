// services/magazineService.js
import { openDB } from '../utils/db';

export class MagazineService {
  // ─── Store / Retrieve ─────────────────────────────────────────────────────

  /**
   * Persist a magazine PDF blob in IndexedDB for offline reading.
   * @param {string|number} magazineId
   * @param {Blob} pdfBlob
   * @returns {Promise<boolean>}
   */
  static async storeMagazineForOffline(magazineId, pdfBlob) {
    try {
      const db      = await openDB();
      const base64  = await this.blobToBase64(pdfBlob);
      await db.put('magazines', {
        id:       magazineId,
        pdfData:  base64,
        storedAt: new Date().toISOString(),
        isOffline: true,
      });
      return true;
    } catch (error) {
      console.error('storeMagazineForOffline failed:', error);
      return false;
    }
  }

  /**
   * Retrieve an offline magazine and return it as a Blob.
   * @param {string|number} magazineId
   * @returns {Promise<{ id, pdfBlob: Blob, storedAt: string } | null>}
   */
  static async getOfflineMagazine(magazineId) {
    try {
      const db     = await openDB();
      const result = await db.get('magazines', magazineId);
      if (result?.pdfData) {
        return {
          id:       result.id,
          pdfBlob:  this.base64ToBlob(result.pdfData),
          storedAt: result.storedAt,
        };
      }
      return null;
    } catch (error) {
      console.error('getOfflineMagazine failed:', error);
      return null;
    }
  }

  /**
   * Check whether an offline copy exists for the given magazine.
   * @param {string|number} magazineId
   * @returns {Promise<boolean>}
   */
  static async isOfflineAvailable(magazineId) {
    try {
      const db     = await openDB();
      const result = await db.get('magazines', magazineId);
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Return every magazine record currently stored offline.
   * @returns {Promise<object[]>}
   */
  static async getAllOfflineMagazines() {
    try {
      const db = await openDB();
      return await db.getAll('magazines');
    } catch (error) {
      console.error('getAllOfflineMagazines failed:', error);
      return [];
    }
  }

  /**
   * Remove a single offline magazine.
   * @param {string|number} magazineId
   * @returns {Promise<boolean>}
   */
  static async removeOfflineMagazine(magazineId) {
    try {
      const db = await openDB();
      await db.delete('magazines', magazineId);
      return true;
    } catch (error) {
      console.error('removeOfflineMagazine failed:', error);
      return false;
    }
  }

  /**
   * Remove every offline magazine.
   * @returns {Promise<boolean>}
   */
  static async clearAllOfflineMagazines() {
    try {
      const db = await openDB();
      await db.clear('magazines');
      return true;
    } catch (error) {
      console.error('clearAllOfflineMagazines failed:', error);
      return false;
    }
  }

  // ─── Storage Quota ────────────────────────────────────────────────────────

  /**
   * Estimate browser storage usage.
   * @returns {Promise<{ usage: number, quota: number, percentage: number } | null>}
   */
  static async getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { usage, quota } = await navigator.storage.estimate();
      return { usage, quota, percentage: (usage / quota) * 100 };
    }
    return null;
  }

  // ─── Blob / Base64 Helpers ────────────────────────────────────────────────

  static blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader      = new FileReader();
      reader.onloadend  = () => resolve(reader.result);
      reader.onerror    = reject;
      reader.readAsDataURL(blob);
    });
  }

  static base64ToBlob(base64) {
    const [meta, data]  = base64.split(';base64,');
    const contentType   = meta.split(':')[1];
    const raw           = window.atob(data);
    const bytes         = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return new Blob([bytes], { type: contentType });
  }
}