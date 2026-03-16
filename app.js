// Charger les events depuis le stockage local
let events = JSON.parse(localStorage.getItem("events")) || [];

// Fonction pour remplir le select normal avec suppression possible
function populateSelect() {
    const select = document.getElementById("eventSelect");
    if (!select) return;

    select.innerHTML = "";

    events.forEach((e, i) => {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = e.name;
        select.appendChild(option);
    });
}

// Fonction pour supprimer un modèle sélectionné
function deleteSelectedEvent() {
    const select = document.getElementById("eventSelect");
    if (!select || select.value === "") {
        alert("Veuillez sélectionner un modèle à supprimer.");
        return;
    }
    const index = parseInt(select.value);
    if (confirm(`Supprimer le modèle "${events[index].name}" ?`)) {
        events.splice(index, 1);
        localStorage.setItem("events", JSON.stringify(events));
        populateSelect();
        alert("Modèle supprimé !");
    }
}

// Chargement de la page
window.onload = function () {
    // Remplir le select
    populateSelect();

    // Si on est sur la page event
    if (document.getElementById("counters")) {

        let eventIndex = localStorage.getItem("currentEvent");

        if (eventIndex === null || !events[eventIndex]) {
            alert("Event introuvable.");
            window.location = "index.html";
            return;
        }

        renderCounters();

        let countersContainer = document.getElementById("counters");

        new Sortable(countersContainer, {
            animation: 200,
            ghostClass: 'dragging',
            onEnd: () => {
                let newOrder = Array.from(countersContainer.children).map(c => {
                    let index = Number(c.dataset.index);
                    return events[eventIndex].counters[index];
                });
                events[eventIndex].counters = newOrder;
                localStorage.setItem("events", JSON.stringify(events));
                renderCounters();
            }
        });
    }
};

// Création d'un nouvel event
function createNewEvent() {
    let name = document.getElementById("newEventName").value.trim();
    if (name === "") {
        alert("Veuillez entrer un nom pour l'event !");
        return;
    }
    let event = { name: name, counters: [] };
    events.push(event);
    localStorage.setItem("events", JSON.stringify(events));
    let index = events.length - 1;
    localStorage.setItem("currentEvent", index);
    window.location = "compteur.html";
}

// Charger un event via le select
function loadEvent() {
    const select = document.getElementById("eventSelect");
    if (!select || select.value === "") {
        alert("Veuillez sélectionner un event.");
        return;
    }
    localStorage.setItem("currentEvent", select.value);
    window.location = "compteur.html";
}

// Ajouter un compteur
function addCounterFromInput() {
    let input = document.getElementById("newCounterName");
    let name = input.value.trim().substring(0, 12);
    if (!name) { alert("Le compteur doit avoir un nom !"); return; }
    let eventIndex = localStorage.getItem("currentEvent");
    events[eventIndex].counters.push({ name: name, value: 0 });
    localStorage.setItem("events", JSON.stringify(events));
    input.value = "";
    renderCounters();
}

// Afficher les compteurs
function renderCounters() {
    let eventIndex = localStorage.getItem("currentEvent");
    let event = events[eventIndex];
    let container = document.getElementById("counters");
    document.getElementById("eventName").innerText = `${event.name}`;
    container.innerHTML = "";

    // Ne plus trier automatiquement pour conserver l'ordre de création
    // event.counters.sort((a,b) => b.value - a.value); <-- supprimé

    event.counters.forEach((c, i) => {
        let div = document.createElement("div");
        div.className = "counter";
        div.draggable = true;
        div.dataset.index = i;
        div.id = `counter-${i}`;
        div.innerHTML = `
            <button type="button" class="minus" onclick="decrement(${i})">−</button>
            <span class="counter-name">${c.name}</span>
            <span class="value">${c.value}</span>
            <button type="button" class="plus" onclick="incrementWithGlow(this, ${i})">+</button>
            <button type="button" class="delete" onclick="deleteCounter(${i})">🗑</button>
        `;
        container.appendChild(div);
    });
}

// Ajouter +1 avec animation glow
function incrementWithGlow(button, i) {
    increment(i);
    button.classList.add('glow');
    setTimeout(() => button.classList.remove('glow'), 200);
}

// Ajouter +1
function increment(i) {
    let eventIndex = localStorage.getItem("currentEvent");
    events[eventIndex].counters[i].value++;
    localStorage.setItem("events", JSON.stringify(events));
    renderCounters();
}

// Retirer -1
function decrement(i) {
    let eventIndex = localStorage.getItem("currentEvent");
    if (events[eventIndex].counters[i].value > 0) {
        events[eventIndex].counters[i].value--;
    }
    localStorage.setItem("events", JSON.stringify(events));
    renderCounters();
}

// Supprimer un compteur
function deleteCounter(i) {
    if (!confirm("Supprimer ce compteur ?")) return;
    let eventIndex = localStorage.getItem("currentEvent");
    events[eventIndex].counters.splice(i, 1);
    localStorage.setItem("events", JSON.stringify(events));
    renderCounters();
}

// Exporter les résultats
function exportResults() {
    let eventIndex = localStorage.getItem("currentEvent");
    let event = events[eventIndex];
    let text = "NethraCount\n\n";
    let date = new Date();
    text += "Event : " + event.name + "\n";
    text += "Date : " + date.toLocaleDateString() + "\n\n";
    event.counters.forEach(c => { text += c.name + " : " + c.value + "\n"; });
    let blob = new Blob([text], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "NethraCount_" + event.name + "_results.txt";
    a.click();
}

// Sauvegarder le modèle d'event
function saveModel() {
    let eventIndex = localStorage.getItem("currentEvent");
    let event = events[eventIndex];
    let model = { name: event.name, counters: event.counters.map(c => c.name) };
    let blob = new Blob([JSON.stringify(model, null, 2)], { type: "application/json" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "NethraCount_" + event.name + "_model.json";
    a.click();
    alert("Modèle sauvegardé !");
}