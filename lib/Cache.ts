import type {
    CacheBase,
    BaseApiObject,
    CacheContainerBase,
    SessionBase,
} from "react-api-tools";

/**
 * A class that uses the Storage API to store data in the browser.
 *
 * Type Params
 * ------------
 * T
 *  - The type of data to store.
 *
 * Params
 * ------------
 * parseSaved (default: true)
 *  - Whether or not to parse the data stored in the browser. If you are using this class to store data in session storage. If set to false any data stored in the browser will be removed.
 *
 * storageType (default: "session")
 *  - The type of storage to use. Can be either "session" or "local". Session is used by default as it is cleared when the browser is closed.
 */
class Session<T extends BaseApiObject> implements SessionBase<T> {
    private storage: Storage;
    private _items: { [key: string]: T[] } = {};
    constructor(parseSaved: boolean = true, storageType: "session" | "local" = "session") {
        this.storage = storageType === "session" ? sessionStorage : localStorage;
        if (parseSaved) {
            const saved: { [key: string]: T[] } = JSON.parse(this.storage.getItem("reactApiToolsDataStore") || "{}");
            this.items = saved;
        } else if (this.storage.getItem("reactApiToolsDataStore")) {
            this.storage.removeItem("reactApiToolsDataStore");
        }
    }
    get items(): { [key: string]: T[] } {
        if (Object.keys(this._items).length > 0) {
            return this._items;
        }
        return JSON.parse(this.storage.getItem("reactApiToolsDataStore") || "{}");
    }
    set items(items: { [key: string]: T[] }) {
        this._items = items;
        this.storage.setItem("reactApiToolsDataStore", JSON.stringify(items));
    }

    /**
     * method to get an item from the cache
     *
     * Params
     * ------------
     * key (string)
     *  - The key of the item to get
     *
     * Returns
     * ------------
     * The array of items stored at the key or undefined if it does not exist
     */
    getItem(key: string): T[] | undefined {
        return this.items[key];
    }

    /**
     * method to set an item into storage
     *
     * Params
     * ------------
     * key (string)
     * - The key of the item to set
     *
     * data (T[])
     * - The data to store at the key
     */
    setItem(key: string, data: T[]): void {
        const items = this.items;
        items[key] = data;
        this.items = items;
    }

    /**
     * method to set multiple items into storage. Can be useful if you already have data elsewhere and want to store it in cache.
     * If you are using this method to store data in session storage, you should set overrideExisting to true to avoid data being removed when the browser is closed.
     *
     * Params
     * ------------
     * objs ({ [key: string]: T[] })
     * - An object containing the keys and data to store
     *
     * overrideExisting (boolean)
     * - Whether or not to override existing data. If set to false, any existing data will not be overwritten. Defaults to false.
     */
    setItems(objs:{ [key: string]: T[] }, overrideExisting: boolean = false): void {
        const items = this.items;
        for (const key in objs) {
            if (overrideExisting || !items[key]) {
                items[key] = objs[key];
            }
        }
        this.items = items;
    }

}

/**
 * A simple cache class that can be used to store data in memory or in session storage.
 * It is implemented in the useDataStore hook to store data in session storage but can be used by itself.
 *
 * Type Params
 * ------------
 * T - The type of the data to be stored (must extend BaseApiObject)
 *
 * Params
 * ------------
 * session - A session object that will be used to store the data in session storage if you have an existing session
 *
 * Notes
 * ------------
 * You can make your own cache class that implements the CacheBase interface if you want to use a different storage method.
 *
 *
 */
class Cache<T extends BaseApiObject> implements CacheBase<T> {
    private _session: Session<T> | undefined;
    private _cache: { [key: string]: T[] } = {};

    constructor(session?:Session<T>) {
        if (session) {
            this._session = session;
        }
    }
    private get cache(): { [key: string]: T[] } {
        if (this._session) {
            return this._session.items;
        }
        return this._cache;
    }
    private set cache(cache: { [key: string]: T[] }) {
        if (this._session) {
            this._session.items = cache;
        } else {
            this._cache = cache;
        }
    }
    get(key: string): T[] | undefined {
        return this.cache[key];
    }

    set(key: string, data: T[]): void {
        this.cache[key] = data;
    }

    clear(): void {
        this.cache = {};
    }

    clearKey(key: string): void {
        delete this.cache[key];
    }
    sortAsc(key: string, sortKey: keyof T): Cache<T> {
        if (this.cache[key]) {
            this.cache[key].sort((a, b) => {
                if (a[sortKey] > b[sortKey]) {
                    return 1;
                }
                if (a[sortKey] < b[sortKey]) {
                    return -1;
                }
                return 0;
            });
        }
        return this
    }
    sortDesc(key: string, sortKey: keyof T): Cache<T> {
        if (this.cache[key]) {
            this.cache[key].sort((a, b) => {
                if (a[sortKey] > b[sortKey]) {
                    return -1;
                }
                if (a[sortKey] < b[sortKey]) {
                    return 1;
                }
                return 0;
            });
        }
        return this
    }
    filter(key: string, filter: (item: T) => boolean): Cache<T> {
        if (this.cache[key]) {
            this.cache[key] = this.cache[key].filter(filter);
        }
        return this
    }
}

/**
 * A class that can be used to store multiple caches in one object for easy access.
 * It is implemented in the context that uses the useDataStore hook to store multiple caches in one object.
 * It can be used by itself.
 *
 * Methods
 * ------------
 * getCache
 *  - Returns a cache with the given key. If the cache does not exist, it will be created.
 *
 * clearCache
 *  - Clears the cache with the given key.
 *
 * clearAll
 *  - Clears all caches in the container.
 */
class CacheContainer implements CacheContainerBase {
    private caches: { [key: string]: Cache<BaseApiObject> } = {};
    constructor(caches: { [key: string]: Cache<BaseApiObject> } = {}) {
        this.caches = caches;
    }
    getCache<T extends BaseApiObject>(key: string) {
        if (!this.caches[key]) {
            this.caches[key] = new Cache<T>();
        }
        return this.caches[key] as Cache<T>;
    }
    clearCache(key: string) {
        this.caches[key].clear();
    }
    clearAll() {
        for (const key in this.caches) {
            this.caches[key].clear();
        }
    }
}

export default CacheContainer;

export {
    CacheContainer,
    Cache
}
