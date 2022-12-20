import dataContext from "./DataContext";
import type {
    DataProviderProps,
    ApiQuery,
    BaseApiObject
} from "react-api-tools"
import useDataStore from "../useDataStore";
import { useState } from "react";

export default function DataProvider<T extends BaseApiObject>({
    children,
    endpoint,
    ...props
}: DataProviderProps) {
    const [query, setQuery] = useState<ApiQuery<T>>({
        endpoint,
    });
    const store = useDataStore<T>(query);
    const DataContext = dataContext(store);
    return (
    <DataContext.Provider value={{ store, query, setQuery }}>
        {children}
    </DataContext.Provider>
    )
}
