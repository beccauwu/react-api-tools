import ApiClient from "./apiClient";
import { useEffect, useReducer, useRef } from "react";
import crudFucntions from "./helpers/crudFunctions";
import type {
  InitialStoreState,
  StoreState,
  StoreAction,
  StoreCache,
  BaseApiObject,
  ApiQuery,
  ApiError
} from "react-api-tools"
/**
 * hook for storing data, loading, errors and crud functions
 *
 * Type parameters
 * -----------
 * T: extends BaseApiObject
 *  - the type of the object that is being stored. This must extend BaseApiObject (which only has an id)
 *
 * Parameters
 * -----------
 * q: ApiQuery<T>
 *  - the query to be used to fetch the data
 *
 * Returns
 * -----------
 * StoreState<T>
 *  - the state of the data store. This includes the data, loading, errors and crud functions
 *
 * Examples
 * -----------
 * ```tsx
 * const { data, loading, errors, delete, create, edit, get } = useDataStore<Api.User>({
 *  endpoint: "users",
 *  params: {
 *  id: "1",
 *  },
 * });
 * const users = data?.map((user) => (
 *  <div key={user.id}>
 *  <p>{user.name}</p>
 *  <p>{user.email}</p>
 *  </div>
 * ));
 * ```
 * you can also use this in a context provider
 * ```tsx
 * const UserContext = React.createContext<StoreState<Api.User>>({
 *  data: undefined,
 *  loading: false,
 *  errors: undefined,
 * });
 * const UserProvider = ({ children }: { children: React.ReactNode }) => {
 *  const { data, loading, errors, delete, create, edit, get } = useDataStore<Api.User>({
 *   endpoint: "users",
 *   params: {
 *   id: "1",
 *   },
 *  });
 *  return (
 *   <UserContext.Provider value={{ data, loading, errors, delete, create, edit, get }}>
 *   {children}
 *   </UserContext.Provider>
 *  );
 * };
 * ```
 * then just define the methods you need on a component, hanlding the errors and loading states in specific components
 * ```tsx
 * const UserCreate = () => {
 *  const { create } = React.useContext(UserContext);
 *  const [name, setName] = React.useState<string>("");
 *  const [email, setEmail] = React.useState<string>("");
 *  const [password, setPassword] = React.useState<string>("");
 *  const [passwordConfirmation, setPasswordConfirmation] = React.useState<string>("");
 *  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 *    e.preventDefault();
 *    await create({
 *      name,
 *      email,
 *      password,
 *      password_confirmation: passwordConfirmation,
 *    });
 *  };
 *  return (
 *   <form onSubmit={handleSubmit}>
 *    <input
 *    type="text"
 *    value={name}
 *    onChange={(e) => setName(e.target.value)}
 *    placeholder="name"
 *    />
 *    ...
 *   </form>
 *  );
 * };
 * ```
 */
export default function useDataStore<T extends BaseApiObject>(q: ApiQuery<T>): StoreState<T> {
  const initialState: InitialStoreState<T> = {
    data: undefined,
    loading: false,
    errors: undefined,
  };
  const cache = useRef<StoreCache<T>>({});
  const cancelRequest = useRef<boolean>(false);
  const api = new ApiClient<T>(q);
  const dataReducer = (state: StoreState<T>, action: StoreAction<T>): StoreState<T> => {
    const actionHandlers = {
      loading: () => ({
        ...state,
        loading: true,
      }),
      data: () => ({
        ...state,
        data: action.payload?.data,
        loading: false,
      }),
      error: () => ({
        ...state,
        errors: [
          ...(state.errors || []),
          action.payload?.error as ApiError,
        ],
        loading: false,
      }),
      initial: () => ({
        ...state,
        delete: action.payload?.delete,
        create: action.payload?.create,
        edit: action.payload?.edit,
        get: action.payload?.get,
      }),
    };
    const handler = actionHandlers[action.type];
    return handler ? handler() : state;
  };
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { deleteObject, createObject, editObject, getObject } = crudFucntions<T>(dispatch, api, state, cache, q);
  useEffect(() => {
    // push delete/create methods to state
    dispatch({
      type: "initial",
      payload: {
        delete: deleteObject,
        create: createObject,
        edit: editObject,
        get: getObject,
      },
    });
  }, [deleteObject, createObject, editObject, getObject]);
  useEffect(() => {
    cancelRequest.current = false;
    const api = new ApiClient<T>(q);
    const fetchData = async () => {
      dispatch({
        type: "loading",
      });
      const response = await api.getAll();
      if (!response.ok) {
        return dispatch({
          type: "error",
          payload: {
            error: response.error,
          },
        });
      }
      cache.current[q.endpoint] = response.data;
      if (!cancelRequest.current) {
        return dispatch({
          type: "data",
          payload: {
            data: response.data,
          },
        });
      }
    };
    if (cache.current[q.endpoint]) {
      dispatch({
        type: "data",
        payload: {
          data: cache.current[q.endpoint],
        },
      });
    } else {
      fetchData();
    }
    return () => {
      cancelRequest.current = true;
    };
  }, [q.endpoint, state.data]);
  return state;
}


