
const o2fd = obj => {
    const fd = new FormData();
    Object.keys(obj).forEach(k => fd.append(k, obj[k]));
    return fd;
}

// 狀態 "0" 是處理本地檔案 (例如 Cordova / Phonegap 等等)
const processStatus = response => (response.status === 200 || response.status === 0) ? Promise.resolve(response) : Promise.reject(new Error(response.statusText));

/**
 *
 * @param {string} url api 連結
 * @param {(string|FormDate)} form 可接受 form id 或 FormDate
 * @param {Function} cb 接受到 url 回傳的結果的 function
 * @param {string} type 接收到的數據型態
 * @returns {Promise<any>} fetch
 */
export const mPost = async (url = "", form = "", cb = (d => d), type = "json") => {
    const prefix = "[mPost] "
	if (!url || !form) throw new Error(`${prefix}錯誤 參數 ${(!url) ? "url" : "form"} 不得為空`)
	// fetch 有相容性的問題
    if ("fetch" in window) {
		let formData
		switch (form.constructor) {
			case FormData:
				formData = form;
				break;
			case HTMLFormElement:
				formData = new FormData(form);
				break;
			case String:
				formData = new FormData(document.getElementById(form));
				break;
			case Object:
				formData = o2fd(form)
				break;
			default:
				throw new Error(prefix + "form 例外屬性")
		}
		return await fetch(url, {
				method: "POST",
				body: formData,
				credentials: 'same-origin',
			})
			.then( processStatus )
			.then(res => {
				if (!res.ok) throw new Error(prefix +'Network response was not ok.');
				switch (type) {
					case "j":
					case "json":
						return res.json();
						case "arrayBuffer":
					case "array":
						return res.arrayBuffer();
					case "blob":
						return res.blob();
					case "fd":
					case "formData":
						return res.formData();
					case "text":
                        return res.text();
                    default:
                        throw new Error(prefix+'fetch type 錯誤');
				}
			})
			.then(res => cb(res,formData))
			.catch(e => {
				throw new Error(e)
			});
	} else {
		// console.error('不支持 fetch\n需更換其他方式');
		throw new Error(prefix+'不支持 fetch\n需更換其他方式');
	}
}

/**
 *
 * @param {string} url api 連結
 * @param {Function} cb 接受到 url 回傳的結果的 function
 * @param {string} type 接收到的數據型態
 * @returns {Promise<any>} fetch
 */
export const mGet = async (url = "", cb = (d => d), type = "json") => {
    const prefix = "[mGet] "
	if (url === "") throw new Error(prefix+"錯誤 參數 url 不得為空")
	// fetch 有相容性的問題
	if ("fetch" in window) {
		return await fetch(url, {
				method: "GET",
				credentials: 'same-origin',
				cache: 'no-cache',
			})
			.then( processStatus )
			.then(res => {
				if (!res.ok) throw new Error(prefix+'Network response was not ok.');
				switch (type) {
					case "j":
					case "json":
						return res.json();
					case "arrayBuffer":
					case "array":
						return res.arrayBuffer();
					case "blob":
						return res.blob();
					case "fd":
					case "formData":
						return res.formData();
					case "text":
                        return res.text();
                    default:
                        throw new Error(prefix+'fetch type 錯誤');
				}
			})
			.then(res => cb(res))
			.catch(e => {
				throw new Error(e)
			});
	} else {
		// console.error('不支持 fetch\n需更換其他方式');
		throw new Error(prefix+'不支持 fetch\n需更換其他方式')
	}

}

export const getPVal = (dom,val) => window.getComputedStyle(dom).getPropertyValue(val)
export const getRootVar = v => (typeof v === "string") ? getPVal(document.documentElement, '--' + v).trim() : "";
