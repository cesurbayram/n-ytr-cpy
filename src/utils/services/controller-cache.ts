// src/utils/controller-cache.ts
interface ControllerCache {
  [ip: string]: {
    id: string;
    timestamp: number;
  };
}

class ControllerIdCache {
  private static instance: ControllerIdCache;
  private cache: ControllerCache = {};
  private readonly CACHE_TTL = 1000 * 60 * 60;

  private constructor() {}

  public static getInstance(): ControllerIdCache {
    if (!ControllerIdCache.instance) {
      ControllerIdCache.instance = new ControllerIdCache();
    }
    return ControllerIdCache.instance;
  }

  async getControllerId(ip: string, dbPool: any): Promise<string | null> {
    const cached = this.cache[ip];
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.id;
    }

    try {
      const controllerDbRes = await dbPool.query(
        `SELECT id FROM controller WHERE ip_address = $1`,
        [ip]
      );

      if (controllerDbRes.rowCount && controllerDbRes.rowCount > 0) {
        const controllerId = controllerDbRes.rows[0]?.id;

        this.cache[ip] = {
          id: controllerId,
          timestamp: Date.now(),
        };
        return controllerId;
      }
      return null;
    } catch (error) {
      console.error("Error fetching controller ID:", error);
      return null;
    }
  }

  clearCache(ip?: string) {
    if (ip) {
      delete this.cache[ip];
    } else {
      this.cache = {};
    }
  }
}

export default ControllerIdCache;
