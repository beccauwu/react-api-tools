import ApiClient from "./lib/apiClient"
import useDataStore from "./lib/useDataStore"
import crudFucntions from "./lib/helpers/crudFunctions"
const apiTools = {
    ApiClient,
    useDataStore,
    crudFucntions,
}

export default apiTools

export { ApiClient, useDataStore, crudFucntions }
