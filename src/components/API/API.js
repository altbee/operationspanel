import axios from "axios";
import createHistory from "history/createBrowserHistory";
import get from "get-value";
import { apiBaseUrl } from "../../variables/Variables";
import { AuthProvider } from "../Auth/AuthProvider";
import emitter from "../EventEmitter/EventEmitter";

const API = () => {
  const history = createHistory();
  const auth = new AuthProvider();
  const accessToken = auth.getAccessToken();
  const { CancelToken } = axios;

  /** @type {Function} */
  let cancel;

  const axiosConf = {
    baseURL: apiBaseUrl,
    cancelToken: new CancelToken(c => {
      cancel = c;
    })
  };

  if (accessToken) {
    axiosConf.headers = {
      Authorization: accessToken
    };
  }

  const axiosInstance = axios.create(axiosConf);

  axiosInstance.cancelAllRequests = cancel;

  axiosInstance.interceptors.request.use(
    config => {
      emitter.emit("ShowLoader", get(config, "showLoader", true));
      return config;
    },
    error => {
      emitter.emit("ShowLoader", false);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    response => {
      emitter.emit("ShowLoader", false);
      return response;
    },
    error => {
      emitter.emit("ShowLoader", false);

      if (
        get(error, "config.errorHandle", true) &&
        get(error, "response.status", false)
      ) {
        switch (error.response.status) {
          case 401:
            history.replace("/#/login");
            window.location.reload();
            break;
          default:
            emitter.emit(
              "ShowAlert",
              get(error, "response.data.error.message", "Error")
            );
            break;
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default API;
