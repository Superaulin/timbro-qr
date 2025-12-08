// assets/js/api.js

// URL Web App Apps Script (già esistente per il sistema timbrature)
//const API_BASE_URL =
  //  "https://script.google.com/macros/s/AKfycbxaiiuQovXIT44GjKBpPXMtMSDXAg51M1lCgi-fbFnGkBTqE5y4PnnaiBQC-HiYGpkC/exec";
const API_BASE_URL =
    (window.TIMBRO_CONFIG && window.TIMBRO_CONFIG.apiBaseUrl) ||
    "https://script.google.com/macros/s/FAKE_URL_DI_DEFAULT/exec";
     
/**
 * Chiamata JSON → Apps Script (POST)
 * @param {string} action - azione (es. "getReportPaghe")
 * @param {object} payload - parametri business
 */
async function callApi(action, payload) {
    const body = {
        action,
        payload,
    };

    const res = await fetch(API_BASE_URL, {
    method: "POST",
    // niente JSON qui, altrimenti parte il preflight CORS
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(body), // lato Apps Script facciamo JSON.parse(e.postData.contents)
  });

    if (!res.ok) {
        throw new Error("Errore HTTP " + res.status);
    }

    const data = await res.json();
    if (!data.success) {
        throw new Error(data.message || "Errore generico API");
    }

    return data;
}

/**
 * Costruisce URL GET per export CSV
 */
function buildExportUrl(view, filters) {
    const params = new URLSearchParams();
    params.set("action", "exportReportPagheCsv");
    params.set("view", view);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.locationId) params.set("locationId", filters.locationId);
    if (filters.employeeQuery) params.set("employeeQuery", filters.employeeQuery);
    return `${API_BASE_URL}?${params.toString()}`;
}
