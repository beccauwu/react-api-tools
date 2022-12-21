declare module 'react-api-tools' {
    export type StoreAction<T> = {
        type: "loading" | "data" | "error" | "initial";
        payload?: {
            data?: T[];
            error?: ApiError;
            delete?: () => Promise<void>;
            create?: () => Promise<void>;
            edit?: () => Promise<void>;
            get?: () => Promise<void>;
        };
    };
    export class CacheBase<T extends BaseApiObject> {
        constructor(session?: SessionBase<T>)
        get: (key: string) => T[] | undefined;
        set: (key: string, data: T[]) => void;
        clear: () => void;
        clearKey: (key: string) => void;
    }
    export class SessionBase<T extends BaseApiObject> {
        constructor(parseSaved: boolean, storageType: "session" | "local");
        items: { [key: string]: T[] };
        getItem(key: string): T[] | undefined;
        setItem(key: string, data: T[]): void;
        setItems(objs:{ [key: string]: T[] }, overrideExisting: boolean): void;
    }
    export class CacheContainerBase {
        constructor(caches: { [key: string]: CacheBase<BaseApiObject> });
        getCache<T extends BaseApiObject>(key: string): CacheBase<T>;
        clearCache(key: string): void;
        clearAll(): void;
    }

    export type StoreState<T> = {
        loading: boolean;
        data?: T[];
        errors?: ApiError[];
        delete?: () => Promise<void>;
        create?: () => Promise<void>;
        edit?: () => Promise<void>;
        get?: () => Promise<void>;
    };
    export type InitialStoreState<T> = {
        loading: false;
        data?: T[];
        errors?: ApiError[];
        delete?: () => Promise<void>;
        create?: () => Promise<void>;
        edit?: () => Promise<void>;
        get?: () => Promise<void>;
    };
    export class BaseApiObject {
        id: string;
    }
    export type ApiObjectConfig<T extends BaseApiObject> = {
        [key: string]: T;
    };
    export function extendsBaseApiObject<T extends BaseApiObject>(obj: T): T;
    export class BaseApiObjectArray<T extends BaseApiObject> extends Array<T> {
        constructor(...items: T[]);
    }
    export interface ApiQuery<T extends BaseApiObject> {
        endpoint: string;
        params?: string
        data?: T | T[] | { id: string } | { id: string }[];
        bulk?: boolean;
        many?: boolean;
        headers?: { [key: string]: string };
    }
    export interface ApiError {
        message: string;
        status: number;
        body?: any;
    }
    export interface ApiData<T extends BaseApiObject> {
        data?: T[] | T;
        error?: ApiError;
        ok: boolean;
    }
    export interface ApiDataArray<T extends BaseApiObject> extends ApiData<T> {
        data: T[];
    }
    export interface ApiDataObject<T extends BaseApiObject> extends ApiData<T> {
        data: T;
    }
    export type ApiObjectResponse<T extends BaseApiObject> = Promise<ApiDataObject<T>>;
    export type ApiArrayResponse<T extends BaseApiObject> = Promise<ApiDataArray<T>>;
    export type BaseApiResponse<T extends BaseApiObject> = Promise<ApiData<T>>;
    export class BaseApiClient<T extends BaseApiObject, U extends ApiQuery<T> = ApiQuery<T>> {
        constructor(query: U | ApiQuery<T>);
        get?: () => ApiObjectResponse<T>;
        getAll?: () => ApiArrayResponse<T>;
        post?: () => ApiObjectResponse<T>;
        postMany?: () => ApiArrayResponse<T>;
        put?: () => ApiObjectResponse<T>;
        putMany?: () => ApiArrayResponse<T>;
        delete?: () => ApiObjectResponse<T>;
        deleteMany?: () => ApiArrayResponse<T>;
    }
    export type DataContextBase<T extends BaseApiObject> = {
        store: StoreState<T>;
        query: ApiQuery<T>;
        setQuery: (query: ApiQuery<T>) => void;
    }
    export interface DataProviderProps extends React.ReactPropTypes {
        children: React.ReactNode | React.ReactNode[];
        endpoint: string;
    }
    export class DataStore<T extends BaseApiObject> {
        cacheContainer: CacheBase<T>;
    }
}