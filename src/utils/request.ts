import type { LoadingInstance } from 'element-plus';
import axiosModule from 'axios';
import { HttpStatus } from '@/enums/RespEnum';
import { getLanguage } from '@/lang';
import cache from '@/plugins/cache';
import router from '@/router';
import { useUserStore } from '@/store/modules/user';
import { getToken } from '@/utils/auth';
import { decryptBase64, decryptWithAes, encryptBase64, encryptWithAes, generateAesKey } from '@/utils/crypto';
import { errorCode } from '@/utils/errorCode';
import i18n from '@/lang';
import { decrypt, encrypt } from '@/utils/jsencrypt';
import { blobValidate, tansParams } from '@/utils/ruoyi';
import { saveBlob } from '@/utils/save';


const axios = axiosModule as any;

const encryptHeader = 'encrypt-key';
let downloadLoadingInstance: LoadingInstance | undefined;

export const isRelogin = { show: false };

const t = (key: string, named?: Record<string, unknown>) => i18n.global.t(key, named);

function createHandledError(message: string) {
  const error = new Error(message) as Error & { isHandled?: boolean };
  error.isHandled = true;
  return error;
}

export function isHandledRequestError(error: unknown) {
  return Boolean((error as { isHandled?: boolean } | undefined)?.isHandled);
}

function normalizeErrorMessage(message?: string) {
  if (!message) {
    return undefined;
  }
  if (message === 'Network Error') {
    return t('common.networkError');
  }
  if (message.includes('timeout')) {
    return t('common.requestTimeout');
  }
  if (message.includes('Request failed with status code')) {
    return t('common.requestStatusError', { status: message.slice(-3) });
  }
  return message;
}

async function parseResponseErrorData(data: unknown): Promise<string | undefined> {
  if (!data) {
    return undefined;
  }

  if (data instanceof Blob) {
    return parseResponseErrorData(await data.text());
  }

  if (data instanceof ArrayBuffer) {
    return parseResponseErrorData(new TextDecoder().decode(data));
  }

  if (typeof data === 'string') {
    const text = data.trim();
    if (!text) {
      return undefined;
    }
    try {
      return parseResponseErrorData(JSON.parse(text));
    } catch {
      return text;
    }
  }

  if (typeof data === 'object') {
    const payload = data as Record<string, any>;
    return payload.msg || payload.message || errorCode[payload.code] || errorCode['default'];
  }

  return undefined;
}

export async function extractErrorMessage(error: any): Promise<string | undefined> {
  const responseMessage = await parseResponseErrorData(error?.response?.data);
  if (responseMessage) {
    return responseMessage;
  }
  return normalizeErrorMessage(error?.message);
}

export const globalHeaders = () => {
  return {
    Authorization: 'Bearer ' + getToken(),
    clientid: import.meta.env.VITE_APP_CLIENT_ID
  };
};

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers['clientid'] = import.meta.env.VITE_APP_CLIENT_ID;

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  transitional: {

    clarifyTimeoutError: true
  }
});

service.interceptors.request.use(
  (config: any) => {

    config.headers['Content-Language'] = getLanguage();

    const isToken = config.headers?.isToken === false;

    const isRepeatSubmit = config.headers?.repeatSubmit === false;

    const isEncrypt = config.headers?.isEncrypt === 'true';

    if (getToken() && !isToken) {
      config.headers['Authorization'] = 'Bearer ' + getToken();
    }

    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }

    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime()
      };
      const sessionObj = cache.session.getJSON('sessionObj');
      if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
        cache.session.setJSON('sessionObj', requestObj);
      } else {
        const s_url = sessionObj.url;
        const s_data = sessionObj.data;
        const s_time = sessionObj.time;
        const interval = 500;
        if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
          const message = t('common.repeatSubmit');
          console.warn(`[${s_url}]: ` + message);
          return Promise.reject(new Error(message));
        } else {
          cache.session.setJSON('sessionObj', requestObj);
        }
      }
    }
    if (import.meta.env.VITE_APP_ENCRYPT === 'true') {

      if (isEncrypt && (config.method === 'post' || config.method === 'put')) {

        const aesKey = generateAesKey();
        config.headers[encryptHeader] = encrypt(encryptBase64(aesKey));
        config.data =
          typeof config.data === 'object'
            ? encryptWithAes(JSON.stringify(config.data), aesKey)
            : encryptWithAes(config.data, aesKey);
      }
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (res: any) => {
    if (import.meta.env.VITE_APP_ENCRYPT === 'true') {

      const keyStr = res.headers[encryptHeader];

      if (keyStr != null && keyStr != '') {
        const data = res.data;

        const base64Str = decrypt(keyStr);

        const aesKey = decryptBase64(base64Str.toString());

        const decryptData = decryptWithAes(data, aesKey);

        res.data = JSON.parse(decryptData);
      }
    }

    const code = res.data.code || HttpStatus.SUCCESS;

    const msg = res.data.msg || errorCode[code] || errorCode['default'];

    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data;
    }
    if (code === 401) {
      // prettier-ignore
      if (!isRelogin.show) {
				isRelogin.show = true;
				ElMessageBox.confirm(
					t("common.sessionExpired"),
					t("common.systemPrompt"),
					{
						confirmButtonText: t("common.relogin"),
						cancelButtonText: t("common.cancel"),
						type: "warning",
					},
				)
					.then(() => {
						isRelogin.show = false;
						useUserStore()
							.logout()
							.then(() => {
								router.replace({
									path: "/login",
									query: {
										redirect: encodeURIComponent(
											router.currentRoute.value.fullPath || "/",
										),
									},
								});
							});
					})
					.catch(() => {
						isRelogin.show = false;
					});
			}
      return Promise.reject(t('common.invalidSession'));
    } else if (code === HttpStatus.SERVER_ERROR) {
      ElMessage({ message: msg, type: 'error' });
      return Promise.reject(createHandledError(msg));
    } else if (code === HttpStatus.WARN) {
      ElMessage({ message: msg, type: 'warning' });
      return Promise.reject(createHandledError(msg));
    } else if (code !== HttpStatus.SUCCESS) {
      ElNotification.error({ title: msg });
      return Promise.reject(createHandledError(msg));
    } else {
      return Promise.resolve(res.data);
    }
  },
  async (error: any) => {
    const message = (await extractErrorMessage(error)) || errorCode['default'];
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 });
    error.isHandled = true;
    return Promise.reject(error);
  }
);

export function download(url: string, params: any, fileName: string) {
  downloadLoadingInstance = ElLoading.service({
    text: t('common.downloadLoading'),
    background: 'rgba(0, 0, 0, 0.7)'
  });
  // prettier-ignore
  return service
		.post(url, params, {
			transformRequest: [
				(params: any) => {
					return tansParams(params);
				},
			],
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			responseType: "blob",
		})
		.then(async (resp: any) => {
			const isLogin = blobValidate(resp);
			if (isLogin) {
				const blob = new Blob([resp]);
				saveBlob(blob, fileName);
			} else {
				const blob = new Blob([resp]);
				const resText = await blob.text();
				const rspObj = JSON.parse(resText);
				const errMsg =
					errorCode[rspObj.code] || rspObj.msg || errorCode["default"];
				ElMessage.error(errMsg);
			}
			downloadLoadingInstance?.close();
		})
		.catch((r: any) => {
			console.error(r);
			downloadLoadingInstance?.close();
		});
}

export default service;
