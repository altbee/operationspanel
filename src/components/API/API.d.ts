import { AxiosStatic, AxiosInstance } from "axios";

declare interface ApiInstance extends AxiosInstance {
  cancelAllRequests(): void;
}

declare const API: () => ApiInstance;

export default API;
