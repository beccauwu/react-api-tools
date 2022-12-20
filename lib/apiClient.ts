const baseUrl = "http://localhost:3000/api/";

import axios, { AxiosResponse } from "axios";
import type {
  BaseApiObject,
  BaseApiClient,
  ApiDataArray,
  ApiDataObject,
  ApiQuery,
} from "react-api-tools"


export default class ApiClient<T extends BaseApiObject> implements BaseApiClient<T>{
  q: ApiQuery<T>;
  constructor(query: ApiQuery<T>) {
    this.q = query;
  }
  private _axios() {
    return axios.create({
      baseURL: baseUrl,
      headers: this.q.headers || { "Content-Type": "application/json" },
    });
  }
  private async _handleResponse<U extends ApiDataObject<T> | ApiDataArray<T>>(
    response: Promise<AxiosResponse>
  ): Promise<U> {
    const data = await response;
    if (data.status >= 200 && data.status < 300) {
      const resp = {
        ok: true,
        data: data.data,
      } as U;
      return resp;
    } else {
      const resp = {
        error: {
          message: data.statusText,
          status: data.status,
          body: data.data,
        },
        ok: false,
      } as U;
      return resp;
    }
  }
  async get() {
    const req = this._axios().get(this.q.endpoint, { params: this.q.params });
    return await this._handleResponse<ApiDataObject<T>>(req);
  }
  async getAll() {
    const req = this._axios().get(this.q.endpoint, { params: this.q.params });
    return await this._handleResponse<ApiDataArray<T>>(req);
  }
  async post() {
    const req = this._axios().post(this.q.endpoint, this.q.data, { params: this.q.params });
    return await this._handleResponse<ApiDataObject<T>>(req);
  }
  async postMany() {
    const req = this._axios().post(`${this.q.endpoint}/bulk`, this.q.data);
    return await this._handleResponse<ApiDataArray<T>>(req);
  }
  async delete() {
    const req = this._axios().delete(this.q.endpoint, { data: this.q.data });
    return await this._handleResponse<ApiDataObject<T>>(req);
  }
  async deleteMany() {
    const req = this._axios().delete(`${this.q.endpoint}/bulk`, { data: this.q.data });
    return await this._handleResponse<ApiDataArray<T>>(req);
  }
  async put() {
    const req = this._axios().put(this.q.endpoint, this.q.data, { params: this.q.params });
    return await this._handleResponse<ApiDataObject<T>>(req);
  }
  async putMany() {
    const req = this._axios().put(`${this.q.endpoint}/bulk`, this.q.data)
    return await this._handleResponse<ApiDataArray<T>>(req);
  }
}
