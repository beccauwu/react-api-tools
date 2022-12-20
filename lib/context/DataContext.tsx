import { createContext } from "react";
import type {
    DataContextBase,
    StoreState,
    BaseApiObject,
} from "react-api-tools";

function dataContext<T extends BaseApiObject>(
    store: StoreState<T>
) {
    return createContext<DataContextBase<T>>({ store, query: { endpoint: '' }, setQuery: () => { } });
}

export default dataContext;