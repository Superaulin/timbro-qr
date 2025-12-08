// assets/js/reportPaghe.js

const DAILY_THRESHOLD_HOURS = 8; // soglia ore ordinarie (deve matchare Apps Script)

document.addEventListener("DOMContentLoaded", () => {
    initDateDefaults();
    initTabs();
    initReportEvents();
});

/**
 * Imposta valori di default delle date (mese corrente)
 */
function initDateDefaults() {
    const startInput = document.getElementById("startDate");
    const endInput = document.getElementById("endDate");

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    startInput.value = toInputDate(firstDay);
    endInput.value = toInputDate(now);
}

function toInputDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Gestione tab riepilogo/dettaglio
 */
function initTabs() {
    const buttons = document.querySelectorAll(".tab-button");
    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            buttons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const target = btn.getAttribute("data-tab");
            document
                .querySelectorAll(".tab-content")
                .forEach((tab) => tab.classList.remove("active"));
            document
                .getElementById(`tab-content-${target}`)
                .classList.add("active");
        });
    });
}

/**
 * Eventi principali report
 */
function initReportEvents() {
    const btnGenerate = document.getElementById("btnGenerateReport");
    const btnExportRiepilogo = document.getElementById("btnExportRiepilogoCsv");
    const btnExportDettaglio = document.getElementById("btnExportDettaglioCsv");

    btnGenerate.addEventListener("click", async () => {
        const filters = getFilters();
        const status = document.getElementById("reportStatus");
        status.className = "report-status";
        status.textContent = "Generazione report in corso...";

        try {
            const data = await callApi("getReportPaghe", filters);
            renderRiepilogo(data.riepilogo || []);
            renderDettaglio(data.dettaglio || []);
            status.classList.add("success");
            status.textContent = "Report aggiornato.";
        } catch (err) {
            console.error(err);
            status.classList.add("error");
            status.textContent =
                "Errore nella generazione del report: " + err.message;
        }
    });

    btnExportRiepilogo.addEventListener("click", () => {
        const filters = getFilters();
        const url = buildExportUrl("riepilogo", filters);
        window.open(url, "_blank");
    });

    btnExportDettaglio.addEventListener("click", () => {
        const filters = getFilters();
        const url = buildExportUrl("dettaglio", filters);
        window.open(url, "_blank");
    });
}

/**
 * Recupera i filtri dalla UI
 */
function getFilters() {
    const startDate = document.getElementById("startDate").value || "";
    const endDate = document.getElementById("endDate").value || "";
    const locationId = document.getElementById("locationSelect").value || "";
    const employeeQuery = document.getElementById("employeeSearch").value || "";

    return {
        startDate,
        endDate,
        locationId,
        employeeQuery,
    };
}

/**
 * Render tabelle
 */
function renderRiepilogo(rows) {
    const tbody = document.getElementById("riepilogoTableBody");
    tbody.innerHTML = "";

    rows.forEach((row) => {
        const tr = document.createElement("tr");

        addCell(tr, row.cliente);
        addCell(tr, row.codiceDipendente);
        addCell(tr, row.cognome);
        addCell(tr, row.nome);
        addCell(tr, row.matricolaEsterna);
        addCell(tr, row.periodoDal);
        addCell(tr, row.periodoAl);
        addCell(tr, row.sedePrevalente);
        addCell(tr, row.giorniLavorati);
        addCell(tr, row.giorniConAnomalie);
        addCell(tr, formatHours(row.oreTotali));
        addCell(tr, formatHours(row.oreOrdinarie));
        addCell(tr, formatHours(row.oreOltreSoglia));
        addCell(tr, row.numAnomalie);
        addCell(tr, row.note || "");

        tbody.appendChild(tr);
    });

    const count = document.getElementById("riepilogoCount");
    count.textContent = `${rows.length} dipendente/i nel periodo selezionato`;
}

function renderDettaglio(rows) {
    const tbody = document.getElementById("dettaglioTableBody");
    tbody.innerHTML = "";

    rows.forEach((row) => {
        const tr = document.createElement("tr");
        if (row.flagAnomalia === "S") {
            tr.classList.add("anomaly");
        }

        addCell(tr, row.cliente);
        addCell(tr, row.codiceDipendente);
        addCell(tr, row.cognome);
        addCell(tr, row.nome);
        addCell(tr, row.matricolaEsterna);
        addCell(tr, row.data);
        addCell(tr, row.giornoSettimana);
        addCell(tr, row.sedePrevalente);
        addCell(tr, row.primoIn);
        addCell(tr, row.ultimoOut);
        addCell(tr, formatHours(row.oreLavorate));
        addCell(tr, formatHours(row.oreOrdinarie));
        addCell(tr, formatHours(row.oreOltreSoglia));
        addCell(tr, row.numeroTimbri);
        addCell(tr, row.flagAnomalia);
        addCell(tr, (row.tipiAnomalia || []).join(";"));
        addCell(tr, row.dettaglioAnomalia || "");

        tbody.appendChild(tr);
    });

    const count = document.getElementById("dettaglioCount");
    count.textContent = `${rows.length} giorno/i nel periodo selezionato`;
}

function addCell(tr, value) {
    const td = document.createElement("td");
    td.textContent = value != null ? value : "";
    tr.appendChild(td);
}

/**
 * Format ore in decimali → stringa con 2 decimali
 */
function formatHours(val) {
    if (val == null || val === "") return "";
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toFixed(2).replace(".", ",");
}
