// assets/js/app.js

document.addEventListener("DOMContentLoaded", () => {
    // Gestione cambio view sidebar
    document.querySelectorAll(".nav-item").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (btn.disabled) return;

            document
                .querySelectorAll(".nav-item")
                .forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const target = btn.getAttribute("data-view");
            document
                .querySelectorAll(".view")
                .forEach((v) => v.classList.remove("active"));
            document
                .getElementById(`view-${target}`)
                .classList.add("active");
        });
    });

    // Logout (placeholder: torna alla login)
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            // qui puoi fare chiamata logout server, poi redirect
            window.location.href = "login.html";
        });
    }
});
