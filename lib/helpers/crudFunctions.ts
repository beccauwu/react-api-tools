import { useMemo } from "react";
import ApiClient from "../apiClient";
import type {
    StoreState,
    StoreAction,
    StoreCache,
    BaseApiObject,
    ApiQuery,
} from "react-api-tools"

export default function crudFucntions<T extends BaseApiObject, C extends ApiClient<T> = ApiClient<T>>(
    dispatch: React.Dispatch<StoreAction<T>>,
    api: C | ApiClient<T>,
    state: StoreState<T>,
    cache: React.MutableRefObject<StoreCache<T>>, q: ApiQuery<T>
): {
    deleteObject: () => Promise<void>;
    createObject: () => Promise<void>;
    editObject: () => Promise<void>;
    getObject: () => Promise<void>;
} {
    const deleteObjectAsync = async () => {
        dispatch({ type: "loading" });
        const response = await api.delete();
        if (!response.ok) {
            return dispatch({
                type: "error",
                payload: {
                    error: response.error,
                },
            });
        }
        let newState: T[] = (state.data || []).filter((d: T) => d.id !== response.data.id);
        cache.current[q.endpoint] = newState;
        return dispatch({
            type: "data",
            payload: {
                data: newState,
            },
        });
    };
    const createObjectAsync = async () => {
        dispatch({
            type: "loading",
        });
        const response = await api.post();
        if (!response.ok) {
            return dispatch({
                type: "error",
                payload: {
                    error: response.error,
                },
            });
        }
        const newState = [...(state.data || []), response.data as T];
        cache.current[q.endpoint] = newState;
        return dispatch({
            type: "data",
            payload: {
                data: newState,
            },
        });

    };
    const editObjectAsync = async () => {
        dispatch({
            type: "loading",
        });
        const response = await api.put();
        if (!response.ok) {
            return dispatch({
                type: "error",
                payload: {
                    error: response.error,
                },
            });
        }
        let newState: T[] = (state.data || []).map((d: T) => {
            if (d.id === response.data.id)
                return response.data; return d;
        });
        cache.current[q.endpoint] = newState;
        return dispatch({
            type: "data",
            payload: {
                data: newState,
            },
        });
    };
    const getObjectAsync = async () => {
        dispatch({
            type: "loading",
        });
        const response = await api.get();
        if (!response.ok) {
            return dispatch({
                type: "error",
                payload: {
                    error: response.error,
                },
            });
        }
        let newState: T[] = (state.data || []).map((d: T) => {
            if (d.id === response.data.id)
                return response.data; return d;
        });
        cache.current[q.endpoint] = newState;
        return dispatch({
            type: "data",
            payload: {
                data: newState,
            },
        });
    };
    const getObject = useMemo(() => getObjectAsync, [api, dispatch, q.endpoint]);
    const deleteObject = useMemo(() => deleteObjectAsync, [api, dispatch, q.endpoint]);
    const createObject = useMemo(() => createObjectAsync, [api, dispatch, q.endpoint]);
    const editObject = useMemo(() => editObjectAsync, [api, dispatch, q.endpoint]);
    return { deleteObject, createObject, editObject, getObject };
}