const WHATSAPP_BASE_URL = "https://wa.me/34641514569";
const NEW_FLAVORS_API_URL = "http://localhost:3000/api/nuevos-sabores";
const VOTE_REGISTRATION_API_URL = "http://localhost:3000/api/registro-votacion";
const VOTE_STATUS_API_URL = "http://localhost:3000/api/vote-status";
const VOTE_PROFILE_STORAGE_KEY = "uno-de-miga-vote-profile";
const ANONYMOUS_VOTE_ID_STORAGE_KEY = "uno-de-miga-anonymous-vote-id";
const API_TIMEOUT_MS = 10000;
const VOTE_CLIENT_RESET_VERSION = "vote-reset-2026-05-13-1";

const steps = [
  { id: 1, label: "Personas" },
  { id: 2, label: "Servicio" },
  { id: 3, label: "Estilo" },
  { id: 4, label: "Sabores" },
  { id: 5, label: "Extras" },
  { id: 6, label: "Resumen" },
];

const servicios = [
  {
    id: "picoteo",
    nombre: "Picoteo",
    factor: 1.5,
    descripcion: "Ideal si los sándwiches acompañan otros platos.",
  },
  {
    id: "ligero",
    nombre: "Ligero",
    factor: 2.5,
    descripcion: "La opción recomendada para almuerzos y reuniones.",
  },
  {
    id: "completo",
    nombre: "Completo",
    factor: 3.5,
    descripcion: "Pensado para una comida principal y abundante.",
  },
];

const estilos = [
  {
    id: "mixto",
    nombre: "Mixto",
    descripcion: "Balancea clásicos y opciones más especiales.",
  },
  {
    id: "gourmet",
    nombre: "Gourmet",
    descripcion: "Empuja el pedido hacia sabores premium y de la casa.",
  },
  {
    id: "vegetariano",
    nombre: "Vegetariano",
    descripcion: "Filtra el menú a opciones sin carne ni pescado.",
  },
];

const filtros = [
  { id: "sin-cerdo", label: "Sin cerdo", tag: "cerdo" },
  { id: "sin-pescado", label: "Sin pescado", tag: "pescado" },
];

const preciosOriginales = {
  clasicos: 3.5,
  especiales: 3.5,
  "de-la-casa": 3.8,
};

const saboresData = [
  { id: "jamon-queso", nombre: "Jamón y queso", categoria: "clasicos", precio: 3.5, tags: ["cerdo"] },
  { id: "pasta-oliva", nombre: "Pasta de oliva y queso", categoria: "clasicos", precio: 3.5, tags: ["vegetariano"] },
  { id: "pimiento-gouda", nombre: "Pimiento asado, gouda y Philadelphia", categoria: "especiales", precio: 3.5, tags: ["vegetariano"] },
  { id: "pesto-tomate", nombre: "Pesto, tomate y queso", categoria: "especiales", precio: 3.5, tags: ["vegetariano"] },
  { id: "berenjena-brie", nombre: "Berenjena asada y queso brie", categoria: "especiales", precio: 3.5, tags: ["vegetariano"] },
  { id: "jamon-serrano", nombre: "Jamón serrano, rúcula y queso", categoria: "especiales", precio: 3.5, tags: ["cerdo"] },
  { id: "jamon-huevo", nombre: "Jamón y huevo", categoria: "de-la-casa", precio: 3.8, tags: ["cerdo"] },
  { id: "atun-palta", nombre: "Atún, palta y queso", categoria: "de-la-casa", precio: 3.8, tags: ["pescado"] },
  { id: "salmon-phila", nombre: "Salmón ahumado y Philadelphia", categoria: "de-la-casa", precio: 3.8, tags: ["pescado"] },
];

const extrasSections = [
  {
    id: "tortas",
    nombre: "Tortas saladas o dulces",
    descripcion: "Elegí si querés sumar una torta salada para compartir o una opción dulce.",
    items: [
      { id: "torta-salada", nombre: "Torta salada", precio: 80, descripcion: "Formato para compartir con corte de mesa." },
      { id: "torta-dulce", nombre: "Torta dulce", precio: 55, descripcion: "Opción dulce para cierre de mesa o celebración." },
    ],
  },
  {
    id: "mesa-dulce",
    nombre: "Mesa dulce",
    descripcion: "Podés sumar piezas sueltas para armar una mesa dulce simple.",
    items: [
      { id: "croissant-simple", nombre: "Croissant", precio: 1, descripcion: "Unidad." },
      { id: "croissant-ddl", nombre: "Croissant con DDL", precio: 1.1, descripcion: "Unidad." },
      { id: "medialuna-dulce", nombre: "Medialunas", precio: 2, descripcion: "Unidad." },
    ],
  },
  {
    id: "mesa-salada",
    nombre: "Mesa salada",
    descripcion: "Sumá bollería salada para complementar el catering.",
    items: [
      { id: "medialuna-jyq", nombre: "Medialunas con jamón y queso", precio: 2.3, descripcion: "Unidad." },
      { id: "croissant-jyq", nombre: "Croissant con jamón y queso", precio: 1.7, descripcion: "Unidad." },
    ],
  },
  {
    id: "veganos",
    nombre: "Productos veganos",
    descripcion: "Opciones veganas por encargo.",
    items: [
      { id: "docena-vegana", nombre: "Docena vegana", precio: 45, descripcion: "M?nimo una docena." },
    ],
  },
];

const extrasData = extrasSections.flatMap((section) =>
  section.items.map((item) => ({
    ...item,
    sectionId: section.id,
    sectionName: section.nombre,
  })),
);

saboresData.forEach((sabor) => {
  if (sabor.categoria === "clasicos" || sabor.categoria === "especiales") {
    sabor.precio = 3.1;
  }

  if (sabor.categoria === "de-la-casa") {
    sabor.precio = 3.5;
  }
});

const state = {
  currentStep: 1,
  personas: 7,
  servicio: servicios[1].id,
  factorServicio: servicios[1].factor,
  estilo: estilos[0].id,
  filtros: new Set(),
  selectionMemory: {},
  totalSandwiches: 0,
  saboresSeleccionados: {},
  extrasSeleccionados: {},
  activeExtraSection: extrasSections[0].id,
  subtotalSandwiches: 0,
  subtotalExtras: 0,
  total: 0,
};

for (const sabor of saboresData) {
  state.saboresSeleccionados[sabor.id] = 0;
  state.selectionMemory[sabor.id] = 0;
}

for (const extra of extrasData) {
  state.extrasSeleccionados[extra.id] = 0;
}

const refs = {
  builder: document.getElementById("catering-builder"),
  builderModal: document.getElementById("catering-modal"),
  launchButton: document.getElementById("catering-launch-button"),
  modalBackdrop: document.getElementById("catering-modal-backdrop"),
  modalClose: document.getElementById("catering-modal-close"),
  steps: document.getElementById("builder-steps"),
  progressFill: document.getElementById("builder-progress-fill"),
  personCount: document.getElementById("person-count"),
  serviceOptions: document.getElementById("service-options"),
  styleOptions: document.getElementById("style-options"),
  filterOptions: document.getElementById("filter-options"),
  resetFlavorsButton: document.getElementById("builder-reset-flavors"),
  flavorGroups: document.getElementById("flavor-groups"),
  extraOptions: document.getElementById("extra-options"),
  prevButton: document.getElementById("builder-prev"),
  nextButton: document.getElementById("builder-next"),
  flavorTarget: document.getElementById("flavor-target"),
  flavorSelected: document.getElementById("flavor-selected"),
  summaryConfig: document.getElementById("summary-config"),
  summaryFlavors: document.getElementById("summary-flavors"),
  summaryExtras: document.getElementById("summary-extras"),
  summaryPricePerPerson: document.getElementById("summary-price-per-person"),
  summaryTotalLine: document.getElementById("summary-total-line"),
  summarySavingsLine: document.getElementById("summary-savings-line"),
  selectionStatus: document.getElementById("builder-selection-status"),
  whatsappLink: document.getElementById("builder-whatsapp-link"),
  stepPanels: Array.from(document.querySelectorAll(".builder-step")),
  personButtons: Array.from(document.querySelectorAll("[data-person-action]")),
};

function initBuilder() {
  if (!refs.builder) {
    return;
  }

  renderStepIndicators();
  renderServiceOptions();
  renderStyleOptions();
  renderFilters();
  renderFlavorGroups();
  renderExtras();
  bindEvents();
  applyStylePreset();
  recalculateTotals();
  updateUI();
}

function bindEvents() {
  if (refs.launchButton) {
    refs.launchButton.addEventListener("click", () => {
      openBuilderModal();
    });
  }

  if (refs.modalClose) {
    refs.modalClose.addEventListener("click", closeBuilderModal);
  }

  if (refs.modalBackdrop) {
    refs.modalBackdrop.addEventListener("click", closeBuilderModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && refs.builderModal && !refs.builderModal.hidden) {
      closeBuilderModal();
    }
  });

  refs.personButtons.forEach((button) => {
    bindFastPress(button, () => {
      const delta = button.dataset.personAction === "increase" ? 1 : -1;
      state.personas = Math.max(7, state.personas + delta);
      applyStylePreset();
      updateUI();
    });
  });

  if (refs.resetFlavorsButton) {
    refs.resetFlavorsButton.addEventListener("click", () => {
      applyStylePreset();
      updateUI();
    });
  }

  refs.prevButton.addEventListener("click", () => {
    if (state.currentStep > 1) {
      state.currentStep -= 1;
      updateUI();
      scrollBuilderToTop();
    }
  });

  refs.nextButton.addEventListener("click", () => {
    if (!canAdvance(state.currentStep)) {
      return;
    }

    if (state.currentStep < steps.length) {
      state.currentStep += 1;
      updateUI();
      scrollBuilderToTop();
    }
  });
}

function bindFastPress(button, handler) {
  let lastPointerPressAt = 0;

  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") {
      event.preventDefault();
    }

    lastPointerPressAt = Date.now();
    handler();
  });

  button.addEventListener("click", () => {
    if (Date.now() - lastPointerPressAt < 350) {
      return;
    }

    handler();
  });
}

function scrollBuilderToTop() {
  const builderBody = refs.builder?.querySelector(".builder-body");
  if (builderBody) {
    builderBody.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function renderStepIndicators() {
  refs.steps.innerHTML = steps
    .map(
      (step) => `
        <div class="builder-step-indicator" data-step-indicator="${step.id}">
          <div class="builder-step-badge">${step.id}</div>
          <span class="builder-step-label">${step.label}</span>
        </div>
      `,
    )
    .join("");
}

function openBuilderModal() {
  if (refs.builderModal) {
    refs.builderModal.hidden = false;
    document.body.classList.add("has-catering-modal");
  }
}

function closeBuilderModal() {
  if (refs.builderModal) {
    refs.builderModal.hidden = true;
    document.body.classList.remove("has-catering-modal");
  }
}

function renderServiceOptions() {
  refs.serviceOptions.innerHTML = servicios
    .map(
      (servicio) => `
        <button type="button" class="builder-choice-card" data-service-id="${servicio.id}">
          <strong>${servicio.nombre}</strong>
          <span>${servicio.factor} sándwiches por persona</span>
          <small>${servicio.descripcion}</small>
        </button>
      `,
    )
    .join("");

  refs.serviceOptions.querySelectorAll("[data-service-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = servicios.find((item) => item.id === button.dataset.serviceId);
      state.servicio = selected.id;
      state.factorServicio = selected.factor;
      applyStylePreset();
      updateUI();
    });
  });
}

function renderStyleOptions() {
  refs.styleOptions.innerHTML = estilos
    .map(
      (estilo) => `
        <button type="button" class="builder-choice-card" data-style-id="${estilo.id}">
          <strong>${estilo.nombre}</strong>
          <small>${estilo.descripcion}</small>
        </button>
      `,
    )
    .join("");

  refs.styleOptions.querySelectorAll("[data-style-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.estilo = button.dataset.styleId;
      if (state.estilo === "vegetariano") {
        state.filtros.add("sin-cerdo");
        state.filtros.add("sin-pescado");
      }
      applyStylePreset();
      updateUI();
    });
  });
}

function renderFilters() {
  refs.filterOptions.innerHTML = filtros
    .map(
      (filtro) => `
        <button type="button" class="builder-filter" data-filter-id="${filtro.id}">
          ${filtro.label}
        </button>
      `,
    )
    .join("");

  refs.filterOptions.querySelectorAll("[data-filter-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const filterId = button.dataset.filterId;

      syncSelectionMemory();

      if (state.filtros.has(filterId)) {
        state.filtros.delete(filterId);
      } else {
        state.filtros.add(filterId);
      }

      if (state.estilo === "vegetariano" && (!state.filtros.has("sin-cerdo") || !state.filtros.has("sin-pescado"))) {
        state.estilo = "mixto";
      }

      normalizeSelections();
      updateUI();
    });
  });
}

function renderFlavorGroups() {
  const grouped = {
    clasicos: "Clásicos",
    especiales: "Especiales",
    "de-la-casa": "De la casa",
  };

  refs.flavorGroups.innerHTML = Object.entries(grouped)
    .map(([key, label]) => {
      const sabores = saboresData
        .filter((sabor) => sabor.categoria === key)
        .map((sabor) => {
          const disabled = isFlavorExcluded(sabor);
          return `
            <div class="builder-flavor-row${disabled ? " is-disabled" : ""}" data-flavor-row="${sabor.id}">
              <div class="builder-flavor-main">
                <span class="builder-flavor-name">${sabor.nombre}</span>
                <span class="builder-flavor-meta">${formatPrice(sabor.precio)} por sandwich</span>
              </div>
              <div class="builder-flavor-controls">
                <button type="button" class="builder-qty-btn" data-flavor-action="decrease" data-flavor-id="${sabor.id}" ${disabled ? "disabled" : ""}>-</button>
                <span class="builder-qty-value" id="flavor-qty-${sabor.id}">0</span>
                <button type="button" class="builder-qty-btn" data-flavor-action="increase" data-flavor-id="${sabor.id}" ${disabled ? "disabled" : ""}>+</button>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="builder-group">
          <p class="builder-group-title">${label}</p>
          <div class="builder-flavor-list">${sabores}</div>
        </div>
      `;
    })
    .join("");

  refs.flavorGroups.querySelectorAll("[data-flavor-action]").forEach((button) => {
    bindFastPress(button, () => {
      const flavorId = button.dataset.flavorId;
      const action = button.dataset.flavorAction;
      const currentTotal = getSelectedFlavorCount();

      if (action === "increase" && currentTotal >= state.totalSandwiches) {
        return;
      }

      state.saboresSeleccionados[flavorId] = Math.max(
        0,
        state.saboresSeleccionados[flavorId] + (action === "increase" ? 1 : -1),
      );

      syncSelectionMemory();
      updateUI();
    });
  });
}

function renderExtras() {
  refs.extraOptions.innerHTML = extrasSections
    .map((section) => {
      const isActive = section.id === state.activeExtraSection;
      const items = section.items
        .map(
          (extra) => `
            <div class="builder-extra-row">
              <div class="builder-extra-main">
                <span class="builder-extra-name">${extra.nombre}</span>
                <span class="builder-extra-meta">${extra.descripcion}</span>
                <span class="builder-extra-meta">${formatPrice(extra.precio)}</span>
              </div>
              <div class="builder-extra-controls">
                <button type="button" class="builder-qty-btn" data-extra-action="decrease" data-extra-id="${extra.id}">-</button>
                <span class="builder-qty-value" id="extra-qty-${extra.id}">0</span>
                <button type="button" class="builder-qty-btn" data-extra-action="increase" data-extra-id="${extra.id}">+</button>
              </div>
            </div>
          `,
        )
        .join("");

      return `
        <div class="builder-extra-section${isActive ? " is-open" : ""}">
          <button type="button" class="builder-extra-section-toggle" data-extra-section="${section.id}">
            <span class="builder-extra-section-title">${section.nombre}</span>
            <span class="builder-extra-section-meta">${section.descripcion}</span>
          </button>
          <div class="builder-extra-section-body"${isActive ? "" : " hidden"}>
            ${items}
          </div>
        </div>
      `;
    })
    .join("");

  refs.extraOptions.querySelectorAll("[data-extra-section]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeExtraSection = button.dataset.extraSection;
      renderExtras();
      updateExtraCounts();
    });
  });

  refs.extraOptions.querySelectorAll("[data-extra-action]").forEach((button) => {
    bindFastPress(button, () => {
      const extraId = button.dataset.extraId;
      const action = button.dataset.extraAction;
      state.extrasSeleccionados[extraId] = Math.max(
        0,
        state.extrasSeleccionados[extraId] + (action === "increase" ? 1 : -1),
      );
      updateUI();
    });
  });
}

function applyStylePreset() {
  state.totalSandwiches = Math.ceil(state.personas * state.factorServicio);

  const activeFlavors = getAllowedFlavors();
  const weightedFlavors = activeFlavors.map((sabor) => ({
    id: sabor.id,
    weight: getFlavorWeight(sabor),
  }));

  const distribution = distributeByWeight(weightedFlavors, state.totalSandwiches);

  saboresData.forEach((sabor) => {
    state.saboresSeleccionados[sabor.id] = distribution[sabor.id] || 0;
  });

  syncSelectionMemory();
  recalculateTotals();
}

function getFlavorWeight(sabor) {
  if (state.estilo === "vegetariano") {
    return sabor.tags.includes("vegetariano") ? 1 : 0;
  }

  if (state.estilo === "gourmet") {
    if (sabor.categoria === "de-la-casa") {
      return 4;
    }
    if (sabor.categoria === "especiales") {
      return 2;
    }
    return 1;
  }

  if (sabor.categoria === "de-la-casa") {
    return 2;
  }

  return 3;
}

function getAllowedFlavors() {
  return saboresData.filter((sabor) => !isFlavorExcluded(sabor));
}

function isFlavorExcluded(sabor) {
  if (state.estilo === "vegetariano" && !sabor.tags.includes("vegetariano")) {
    return true;
  }

  return filtros.some((filtro) => state.filtros.has(filtro.id) && sabor.tags.includes(filtro.tag));
}

function normalizeSelections() {
  const allowed = new Set(getAllowedFlavors().map((sabor) => sabor.id));

  saboresData.forEach((sabor) => {
    if (!allowed.has(sabor.id)) {
      if (state.saboresSeleccionados[sabor.id] > 0) {
        state.selectionMemory[sabor.id] = state.saboresSeleccionados[sabor.id];
      }
      state.saboresSeleccionados[sabor.id] = 0;
    }
  });

  let selected = getSelectedFlavorCount();

  if (selected === 0 || selected > state.totalSandwiches) {
    applyStylePreset();
    return;
  }

  const restorable = saboresData.filter(
    (sabor) =>
      allowed.has(sabor.id) &&
      state.saboresSeleccionados[sabor.id] === 0 &&
      state.selectionMemory[sabor.id] > 0,
  );

  for (const sabor of restorable) {
    if (selected >= state.totalSandwiches) {
      break;
    }

    const qtyToRestore = Math.min(state.selectionMemory[sabor.id], state.totalSandwiches - selected);
    state.saboresSeleccionados[sabor.id] += qtyToRestore;
    selected += qtyToRestore;
  }

  if (selected < state.totalSandwiches) {
    const distribution = distributeByWeight(
      getAllowedFlavors().map((sabor) => ({ id: sabor.id, weight: Math.max(1, state.saboresSeleccionados[sabor.id]) })),
      state.totalSandwiches - selected,
    );

    Object.entries(distribution).forEach(([id, qty]) => {
      state.saboresSeleccionados[id] += qty;
    });
  }

  syncSelectionMemory();
  recalculateTotals();
}

function syncSelectionMemory() {
  saboresData.forEach((sabor) => {
    if (state.saboresSeleccionados[sabor.id] > 0) {
      state.selectionMemory[sabor.id] = state.saboresSeleccionados[sabor.id];
    }
  });
}

function distributeByWeight(entries, total) {
  const distribution = {};
  const validEntries = entries.filter((entry) => entry.weight > 0);

  if (!validEntries.length) {
    return distribution;
  }

  const totalWeight = validEntries.reduce((sum, entry) => sum + entry.weight, 0);

  validEntries.forEach((entry) => {
    distribution[entry.id] = Math.floor((total * entry.weight) / totalWeight);
  });

  let remaining = total - Object.values(distribution).reduce((sum, qty) => sum + qty, 0);
  let index = 0;

  while (remaining > 0) {
    const entry = validEntries[index % validEntries.length];
    distribution[entry.id] += 1;
    remaining -= 1;
    index += 1;
  }

  return distribution;
}

function recalculateTotals() {
  state.subtotalSandwiches = saboresData.reduce(
    (sum, sabor) => sum + state.saboresSeleccionados[sabor.id] * sabor.precio,
    0,
  );

  state.subtotalExtras = extrasData.reduce(
    (sum, extra) => sum + state.extrasSeleccionados[extra.id] * extra.precio,
    0,
  );

  state.total = state.subtotalSandwiches + state.subtotalExtras;
}

function calculateOriginalSandwichSubtotal() {
  return saboresData.reduce((sum, sabor) => {
    const precioOriginal = preciosOriginales[sabor.categoria] ?? sabor.precio;
    return sum + state.saboresSeleccionados[sabor.id] * precioOriginal;
  }, 0);
}

function updateUI() {
  recalculateTotals();
  if (refs.selectionStatus) {
    refs.selectionStatus.textContent = `SÃ¡ndwiches: ${getSelectedFlavorCount()} / ${state.totalSandwiches}`;
  }
  updateStepIndicators();
  updatePanels();
  updateNavigation();
  updatePersonCount();
  updateSelectedCards();
  updateFilters();
  updateFlavorCounts();
  updateExtraCounts();
  updateSummary();
  updateWhatsAppLink();
}

function updateStepIndicators() {
  const indicators = Array.from(document.querySelectorAll("[data-step-indicator]"));
  indicators.forEach((indicator) => {
    const stepId = Number(indicator.dataset.stepIndicator);
    indicator.classList.toggle("is-active", stepId === state.currentStep);
    indicator.classList.toggle("is-complete", stepId < state.currentStep);
  });

  refs.progressFill.style.width = `${(state.currentStep / steps.length) * 100}%`;
}

function updatePanels() {
  refs.stepPanels.forEach((panel) => {
    const isCurrent = Number(panel.dataset.step) === state.currentStep;
    panel.hidden = !isCurrent;
    panel.classList.toggle("is-active", isCurrent);
  });
}

function updateNavigation() {
  refs.prevButton.disabled = state.currentStep === 1;
  refs.nextButton.disabled = state.currentStep === steps.length || !canAdvance(state.currentStep);
  refs.nextButton.textContent = "Siguiente";
  refs.nextButton.hidden = state.currentStep === steps.length;
  if (refs.selectionStatus) {
    refs.selectionStatus.textContent = `Sándwiches: ${getSelectedFlavorCount()} / ${state.totalSandwiches}`;
    refs.selectionStatus.hidden = state.currentStep < 4;
  }
}

function updatePersonCount() {
  refs.personCount.textContent = state.personas;
}

function updateSelectedCards() {
  refs.serviceOptions.querySelectorAll("[data-service-id]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.serviceId === state.servicio);
  });

  refs.styleOptions.querySelectorAll("[data-style-id]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.styleId === state.estilo);
  });
}

function updateFilters() {
  refs.filterOptions.querySelectorAll("[data-filter-id]").forEach((button) => {
    button.classList.toggle("is-active", state.filtros.has(button.dataset.filterId));
  });
}

function updateFlavorCounts() {
  const selectedCount = getSelectedFlavorCount();
  refs.flavorTarget.textContent = `${state.totalSandwiches} sándwiches`;
  refs.flavorSelected.textContent = `${selectedCount} / ${state.totalSandwiches}`;
  refs.flavorSelected.classList.toggle("is-invalid", selectedCount !== state.totalSandwiches);

  saboresData.forEach((sabor) => {
    const qtyRef = document.getElementById(`flavor-qty-${sabor.id}`);
    const rowRef = refs.flavorGroups.querySelector(`[data-flavor-row="${sabor.id}"]`);
    const excluded = isFlavorExcluded(sabor);

    if (qtyRef) {
      qtyRef.textContent = state.saboresSeleccionados[sabor.id];
    }

    if (rowRef) {
      rowRef.classList.toggle("is-disabled", excluded);
      rowRef.querySelectorAll("[data-flavor-action]").forEach((button) => {
        button.disabled = excluded;
      });
    }
  });
}

function updateExtraCounts() {
  extrasData.forEach((extra) => {
    const qtyRef = document.getElementById(`extra-qty-${extra.id}`);
    if (qtyRef) {
      qtyRef.textContent = state.extrasSeleccionados[extra.id];
    }
  });
}

function updateSummary() {
  const servicio = servicios.find((item) => item.id === state.servicio);
  const estilo = estilos.find((item) => item.id === state.estilo);
  const pricePerPerson = state.total / state.personas;
  const recommendationLine = buildSummaryRecommendationClean(servicio);

  refs.summaryConfig.innerHTML = [
    `${state.personas} personas`,
    `${servicio.nombre} (${servicio.factor} sándwiches por persona)`,
    `Estilo ${estilo.nombre}`,
  ]
    .map((item) => `<li>${item}</li>`)
    .join("");

  const selectedFlavors = saboresData
    .filter((sabor) => state.saboresSeleccionados[sabor.id] > 0)
    .map((sabor) => `<li>${state.saboresSeleccionados[sabor.id]}x ${sabor.nombre}</li>`)
    .join("");

  refs.summaryFlavors.innerHTML = selectedFlavors || "<li>Sin sabores seleccionados.</li>";

  const selectedExtras = extrasData
    .filter((extra) => state.extrasSeleccionados[extra.id] > 0)
    .map((extra) => `<li>${state.extrasSeleccionados[extra.id]}x ${extra.nombre}</li>`)
    .join("");

  refs.summaryExtras.innerHTML = selectedExtras || "<li>Sin extras.</li>";
  refs.summaryPricePerPerson.textContent = `${formatPrice(pricePerPerson)} por persona`;
  refs.summaryTotalLine.textContent = `${servicio.nombre} para ${state.personas} personas. Total ${formatPrice(state.total)}`;
  refs.summarySavingsLine.textContent = recommendationLine;
}

function buildSummaryRecommendation(servicio) {
  if (!servicio) {
    return "";
  }

  if (servicio.id === "picoteo") {
    return `Eligieron ${servicio.nombre.toLowerCase()} para picar entre ${state.personas}. Sugerido: agregar 1 plato fuerte y otra opción de picoteo.`;
  }

  if (servicio.id === "ligero") {
    return `Eligieron ${servicio.nombre.toLowerCase()}, comen ${state.personas} personas por ${formatPrice(state.total)}. Sugerido: agregar 1 plato fuerte.`;
  }

  if (servicio.id === "completo") {
    return `Eligieron ${servicio.nombre.toLowerCase()}, comen ${state.personas} personas por ${formatPrice(state.total)}. Sugerido: agregar snacks.`;
  }

  return "";
}

function buildSummaryRecommendationClean(servicio) {
  if (!servicio) {
    return "";
  }

  if (servicio.id === "picoteo") {
    return "Sugerido: agregar 1 plato fuerte y otra opción de picoteo.";
  }

  if (servicio.id === "ligero") {
    return "Sugerido: agregar 1 plato fuerte.";
  }

  if (servicio.id === "completo") {
    return "Sugerido: agregar snacks.";
  }

  return "";
}

function updateWhatsAppLink() {
  refs.whatsappLink.href = `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
}

function buildWhatsAppMessage() {
  const servicio = servicios.find((item) => item.id === state.servicio);
  const estilo = estilos.find((item) => item.id === state.estilo);

  let message = "Hola Uno de Miga! Quiero pedir un catering desde la web:\n\n";
  message += `Personas: ${state.personas}\n`;
  message += `Servicio: ${servicio.nombre}\n`;
  message += `Estilo: ${estilo.nombre}\n`;
  message += `Total estimado: ${formatPrice(state.total)} (${formatPrice(state.total / state.personas)} por persona)\n\n`;
  const ahorroSandwiches = Math.max(0, calculateOriginalSandwichSubtotal() - state.subtotalSandwiches);
  if (ahorroSandwiches > 0) {
    message += `Ahorro aplicado: ${formatPrice(ahorroSandwiches)}\n\n`;
  }
  message += "Sabores elegidos:\n";

  saboresData.forEach((sabor) => {
    const qty = state.saboresSeleccionados[sabor.id];
    if (qty > 0) {
      message += `- ${qty}x ${sabor.nombre}\n`;
    }
  });

  const extrasSeleccionados = extrasData.filter((extra) => state.extrasSeleccionados[extra.id] > 0);
  if (extrasSeleccionados.length) {
    message += "\nExtras:\n";
    extrasSeleccionados.forEach((extra) => {
      message += `- ${state.extrasSeleccionados[extra.id]}x ${extra.nombre}\n`;
    });
  }

  return message;
}

function canAdvance(step) {
  if (step === 4) {
    return getSelectedFlavorCount() === state.totalSandwiches;
  }

  return step >= 1 && step <= steps.length;
}

function getSelectedFlavorCount() {
  return Object.values(state.saboresSeleccionados).reduce((sum, qty) => sum + qty, 0);
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

initBuilder();
// initVoting();

function renderVotes(container, votes) {
  const sortedVotes = Object.entries(votes)
    .sort(([, totalA], [, totalB]) => totalB - totalA);

  if (!sortedVotes.length) {
    container.innerHTML = '<li class="voting-result-empty">Todavía no hay votos cargados.</li>';
    return;
  }

  container.innerHTML = sortedVotes
    .map(
      ([sabor, total], index) => `
        <li class="voting-result-item">
          <span class="voting-result-rank">#${index + 1}</span>
          <span class="voting-result-name">${escapeHtml(capitalizeWords(sabor))}</span>
          <strong class="voting-result-total">${total} voto(s)</strong>
        </li>
      `,
    )
    .join("");
}

function capitalizeWords(value) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function initVoting() {
  const newFlavorForm = document.getElementById("new-flavor-form");
  const newFlavorSelect = document.getElementById("new-flavor");
  const newFlavorFeedback = document.getElementById("new-flavor-feedback");
  const newFlavorsList = document.getElementById("new-flavors-list");
  const refreshNewFlavorsButton = document.getElementById("refresh-new-flavors");

  if (
    !newFlavorForm ||
    !newFlavorSelect ||
    !newFlavorFeedback ||
    !newFlavorsList
  ) {
    return;
  }

  function resetStoredVoteStateIfNeeded() {
    try {
      const resetKey = "uno-de-miga-vote-reset-version";
      const appliedVersion = localStorage.getItem(resetKey);

      if (appliedVersion === VOTE_CLIENT_RESET_VERSION) {
        return;
      }

      localStorage.removeItem(VOTE_PROFILE_STORAGE_KEY);
      localStorage.removeItem(ANONYMOUS_VOTE_ID_STORAGE_KEY);

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("uno-de-miga-vote-lock:")) {
          localStorage.removeItem(key);
        }
      });

      localStorage.setItem(resetKey, VOTE_CLIENT_RESET_VERSION);
    } catch (error) {
      console.error(error);
    }
  }

  function normalizePhoneInputValue(value) {
    return String(value || "").replace(/[^\d+]/g, "").trim();
  }

  function isValidPhoneInput(value) {
    return /^\+?[0-9]{8,15}$/.test(normalizePhoneInputValue(value));
  }

  resetStoredVoteStateIfNeeded();

  async function loadVotes(url, listElement) {
    listElement.innerHTML = '<li class="voting-result-empty">Cargando votos...</li>';

    try {
      const result = await fetchJsonWithTimeout(url);

      if (!result.ok) {
        throw new Error("No se pudieron cargar los votos.");
      }

      const votes = result.data || {};
      const flavors = currentVotingConfig?.flavors || [];

      if (!flavors.length) {
        await loadVotingData();
        return;
      }

      renderVotes(listElement, flavors, votes, hasVotedThisWeek);
    } catch (error) {
      listElement.innerHTML = '<li class="voting-result-empty">No pudimos cargar el ranking ahora mismo.</li>';
      console.error(error);
    }
  }

  async function fetchJsonWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      const rawBody = await response.text();
      const data = rawBody ? JSON.parse(rawBody) : {};

      return {
        ok: response.ok,
        status: response.status,
        data,
      };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("El servidor tardó demasiado en responder. Intenta otra vez.");
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function submitVote(config) {
    const sabor = config.selectElement.value.trim();

    if (!sabor) {
      config.feedbackElement.textContent = config.emptyMessage;
      config.feedbackElement.classList.add("is-error");
      return;
    }

    config.feedbackElement.textContent = "Enviando voto...";
    config.feedbackElement.classList.remove("is-error");

    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sabor }),
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar el voto.");
      }

      const result = await response.json();
      config.feedbackElement.textContent = `Gracias. ${result.sabor} ahora tiene ${result.total} voto(s).`;
      config.selectElement.value = "";
      await config.afterSuccess();
    } catch (error) {
      config.feedbackElement.textContent = "No pudimos registrar tu voto. Revisa que el backend esté corriendo.";
      config.feedbackElement.classList.add("is-error");
      console.error(error);
    }
  }

  votingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    await submitVote({
      url: VOTES_API_URL,
      selectElement: favoriteFlavorSelect,
      feedbackElement: votingFeedback,
      emptyMessage: "Selecciona un sabor antes de votar.",
      afterSuccess: () => loadVotes(VOTES_API_URL, votesList),
    });
  });

  newFlavorForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    await submitVote({
      url: NEW_FLAVORS_API_URL,
      selectElement: newFlavorSelect,
      feedbackElement: newFlavorFeedback,
      emptyMessage: "Selecciona un nuevo sabor antes de votar.",
      afterSuccess: () => loadVotes(NEW_FLAVORS_API_URL, newFlavorsList),
    });
  });

  if (refreshVotesButton) {
    refreshVotesButton.addEventListener("click", () => {
      loadVotes(VOTES_API_URL, votesList);
    });
  }

  if (refreshNewFlavorsButton) {
    refreshNewFlavorsButton.addEventListener("click", () => {
      loadVotes(NEW_FLAVORS_API_URL, newFlavorsList);
    });
  }

  loadVotes(VOTES_API_URL, votesList);
  loadVotes(NEW_FLAVORS_API_URL, newFlavorsList);
}

function capitalizeWords(value) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getVotePercentage(total, grandTotal) {
  if (!grandTotal) {
    return 0;
  }

  return Math.round((total / grandTotal) * 100);
}

function renderVotes(container, flavors, votes, voteLocked) {
  const sortedFlavors = [...flavors].sort((flavorA, flavorB) => {
    const totalA = Number(votes[flavorA.id] || 0);
    const totalB = Number(votes[flavorB.id] || 0);
    return totalB - totalA;
  });
  const totalVotes = sortedFlavors.reduce((sum, flavor) => sum + Number(votes[flavor.id] || 0), 0);

  container.innerHTML = sortedFlavors
    .map((flavor, index) => {
      const total = Number(votes[flavor.id] || 0);
      const percentage = getVotePercentage(total, totalVotes);

      return `
        <li class="voting-result-item">
          <span class="voting-result-rank">#${index + 1}</span>
          <div class="voting-result-main">
            <span class="voting-result-name">${escapeHtml(flavor.name || capitalizeWords(flavor.id))}</span>
            <div class="voting-result-bar" aria-hidden="true">
              <span class="voting-result-fill" style="width: ${percentage}%"></span>
            </div>
            <div class="voting-result-meta">
              <span>${percentage}% del total</span>
              <span>${total} voto(s)</span>
            </div>
          </div>
          <button
            type="button"
            class="button contact-button-primary voting-row-button"
            data-vote-flavor="${escapeHtml(flavor.id)}"
          >
            Votar
          </button>
        </li>
      `;
    })
    .join("");
}

function initVoting() {
  const newFlavorFeedback = document.getElementById("new-flavor-feedback");
  const newFlavorsList = document.getElementById("new-flavors-list");
  const refreshNewFlavorsButton = document.getElementById("refresh-new-flavors");
  const voteModal = document.getElementById("vote-modal");
  const voteModalBackdrop = document.getElementById("vote-modal-backdrop");
  const voteModalClose = document.getElementById("vote-modal-close");
  const voteProfileForm = document.getElementById("vote-profile-form");
  const voteBirthdate = document.getElementById("vote-birthdate");
  const votePhone = document.getElementById("vote-phone");
  const votePromosConsent = document.getElementById("vote-promos-consent");
  const voteProfileFeedback = document.getElementById("vote-profile-feedback");
  const votePageTitle = document.querySelector(".vote-page-title");
  const votePageDescription = document.querySelector(".voting-copy-wide .voting-text");
  let pendingVoteConfig = null;
  let currentVotingConfig = null;
  let hasVotedThisWeek = false;

  if (
    !newFlavorFeedback ||
    !newFlavorsList ||
    !voteModal ||
    !voteProfileForm ||
    !voteBirthdate ||
    !votePhone ||
    !votePromosConsent ||
    !voteProfileFeedback
  ) {
    return;
  }

  function getStoredVoteProfile() {
    try {
      const rawProfile = localStorage.getItem(VOTE_PROFILE_STORAGE_KEY);
      return rawProfile ? JSON.parse(rawProfile) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function storeVoteProfile(profile) {
    localStorage.setItem(VOTE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }

  function getCurrentVoteLockKey() {
    return currentVotingConfig?.weekId
      ? `uno-de-miga-vote-lock:${currentVotingConfig.weekId}`
      : null;
  }

  function syncLocalVoteLock() {
    const voteLockKey = getCurrentVoteLockKey();
    hasVotedThisWeek = voteLockKey ? localStorage.getItem(voteLockKey) === "true" : false;
  }

  function setLocalVoteLock() {
    const voteLockKey = getCurrentVoteLockKey();
    if (!voteLockKey) {
      return;
    }

    localStorage.setItem(voteLockKey, "true");
    hasVotedThisWeek = true;
  }

  function hasCompletedVoteProfile() {
    const profile = getStoredVoteProfile();

    return Boolean(
      profile &&
      profile.fechaNacimiento &&
      profile.telefono &&
      profile.aceptaPromos === true,
    );
  }

  function openVoteModal(prefill = null) {
    voteModal.hidden = false;
    document.body.classList.add("has-vote-modal");
    voteProfileFeedback.textContent = "";
    voteProfileFeedback.classList.remove("is-error");

    if (prefill) {
      voteBirthdate.value = prefill.fechaNacimiento || "";
      votePhone.value = prefill.telefono || "";
      votePromosConsent.checked = prefill.aceptaPromos === true;
    }
  }

  function closeVoteModal() {
    voteModal.hidden = true;
    document.body.classList.remove("has-vote-modal");
  }

  function showPhoneCorrectionPrompt() {
    newFlavorFeedback.innerHTML = 'El telefono no tiene un formato valido. <button type="button" class="voting-inline-action" data-fix-phone>Pulsa aqui para arreglarlo</button>';
    newFlavorFeedback.classList.add("is-error");
  }

  function openPhoneCorrectionFlow() {
    const profile = getStoredVoteProfile() || {};
    openVoteModal({
      ...profile,
      aceptaPromos: true,
    });
    voteProfileFeedback.textContent = "Revisa el telefono y vuelve a intentarlo. Ejemplo: +34 641 514 569";
    voteProfileFeedback.classList.add("is-error");
    votePhone.focus();
    votePhone.select?.();
  }

  function updateFeedback(message, isError = false) {
    newFlavorFeedback.textContent = message;
    newFlavorFeedback.classList.toggle("is-error", isError);
  }

  async function loadVotingData() {
    newFlavorsList.innerHTML = '<li class="voting-result-empty">Cargando votos...</li>';

    try {
      const response = await fetch("http://localhost:3000/api/config-votacion");

      if (!response.ok) {
        throw new Error("No se pudo cargar la votacion.");
      }

      currentVotingConfig = await response.json();
      syncLocalVoteLock();

      if (votePageTitle && currentVotingConfig.title) {
        votePageTitle.textContent = currentVotingConfig.title;
      }

      if (votePageDescription && currentVotingConfig.description) {
        votePageDescription.textContent = currentVotingConfig.description;
      }

      renderVotes(
        newFlavorsList,
        currentVotingConfig.flavors || [],
        currentVotingConfig.votes || {},
        hasVotedThisWeek,
      );
    } catch (error) {
      newFlavorsList.innerHTML = '<li class="voting-result-empty">No pudimos cargar el ranking ahora mismo.</li>';
      console.error(error);
    }
  }

  async function submitVote(config) {
    const sabor = String(config.flavor || "").trim();

    if (!sabor) {
      updateFeedback(config.emptyMessage, true);
      return;
    }

    if (hasVotedThisWeek) {
      updateFeedback("Ya registramos tu voto de esta semana.", true);
      return;
    }

    const voteProfile = getStoredVoteProfile();

    if (!voteProfile) {
      updateFeedback("Necesitamos tus datos antes de registrar el voto.", true);
      return;
    }

    updateFeedback("Enviando voto...");

    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sabor,
          telefono: voteProfile.telefono,
          fechaNacimiento: voteProfile.fechaNacimiento,
          aceptaPromos: voteProfile.aceptaPromos,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409 && result.alreadyVoted) {
          setLocalVoteLock();
          await loadVotingData();
        }

        throw new Error(result.error || "No se pudo registrar el voto.");
      }

      setLocalVoteLock();
      updateFeedback(`Gracias. Tu voto para ${capitalizeWords(result.sabor)} ya quedo registrado.`);
      await loadVotingData();
    } catch (error) {
      updateFeedback(error.message || "No pudimos registrar tu voto.", true);
      console.error(error);
    }
  }

  newFlavorsList.addEventListener("click", async (event) => {
    const voteButton = event.target.closest("[data-vote-flavor]");

    if (!voteButton || hasVotedThisWeek) {
      return;
    }

    const selectedFlavor = voteButton.getAttribute("data-vote-flavor");

    if (!hasCompletedVoteProfile()) {
      pendingVoteConfig = {
        url: NEW_FLAVORS_API_URL,
        flavor: selectedFlavor,
        emptyMessage: "Selecciona un nuevo sabor antes de votar.",
      };
      openVoteModal(getStoredVoteProfile());
      return;
    }

    await submitVote({
      url: NEW_FLAVORS_API_URL,
      flavor: selectedFlavor,
      emptyMessage: "Selecciona un nuevo sabor antes de votar.",
    });
  });

  if (refreshNewFlavorsButton) {
    refreshNewFlavorsButton.addEventListener("click", () => {
      loadVotingData();
    });
  }

  if (voteModalClose) {
    voteModalClose.addEventListener("click", closeVoteModal);
  }

  if (voteModalBackdrop) {
    voteModalBackdrop.addEventListener("click", closeVoteModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !voteModal.hidden) {
      closeVoteModal();
    }
  });

  voteProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const profile = {
      fechaNacimiento: voteBirthdate.value,
      telefono: votePhone.value.trim(),
      aceptaPromos: votePromosConsent.checked,
    };

    if (!profile.fechaNacimiento || !profile.telefono || !profile.aceptaPromos) {
      voteProfileFeedback.textContent = "Completa todos los datos y acepta recibir promos antes de seguir.";
      voteProfileFeedback.classList.add("is-error");
      return;
    }

    storeVoteProfile(profile);
    closeVoteModal();

    if (pendingVoteConfig) {
      const config = pendingVoteConfig;
      pendingVoteConfig = null;
      await submitVote(config);
    }
  });

  loadVotingData();
}

function renderVotes(container, flavors, votes, voteLocked) {
  const safeFlavors = Array.isArray(flavors) ? flavors : [];
  const safeVotes = votes && typeof votes === "object" ? votes : {};
  const sortedVotes = [...safeFlavors].sort((flavorA, flavorB) => {
    const totalA = Number(safeVotes[flavorA.id] || 0);
    const totalB = Number(safeVotes[flavorB.id] || 0);
    return totalB - totalA;
  });
  const totalVotes = sortedVotes.reduce((sum, flavor) => sum + Number(safeVotes[flavor.id] || 0), 0);

  if (!sortedVotes.length) {
    container.innerHTML = '<li class="voting-result-empty">Todavía no hay votos cargados.</li>';
    return;
  }

  container.innerHTML = sortedVotes
    .map((flavor, index) => {
      const total = Number(safeVotes[flavor.id] || 0);
      const percentage = getVotePercentage(total, totalVotes);

      return `
        <li class="voting-result-item">
          <span class="voting-result-rank">#${index + 1}</span>
          <div class="voting-result-main">
            <span class="voting-result-name">${escapeHtml(flavor.name || capitalizeWords(flavor.id))}</span>
            <div class="voting-result-bar" aria-hidden="true">
              <span class="voting-result-fill" style="width: ${percentage}%"></span>
            </div>
            <div class="voting-result-meta">
              <span>${percentage}% del total</span>
              <span>${total} voto(s)</span>
            </div>
          </div>
          <button
            type="button"
            class="button contact-button-primary voting-row-button"
            data-vote-flavor="${escapeHtml(flavor.id)}"
          >
            Votar
          </button>
        </li>
      `;
    })
    .join("");
}

function getVotePercentage(total, grandTotal) {
  if (!grandTotal) {
    return 0;
  }

  return Math.round((total / grandTotal) * 100);
}

function initVoting() {
  const newFlavorFeedback = document.getElementById("new-flavor-feedback");
  const newFlavorsList = document.getElementById("new-flavors-list");
  const refreshNewFlavorsButton = document.getElementById("refresh-new-flavors");
  const voteModal = document.getElementById("vote-modal");
  const voteModalBackdrop = document.getElementById("vote-modal-backdrop");
  const voteModalClose = document.getElementById("vote-modal-close");
  const voteProfileForm = document.getElementById("vote-profile-form");
  const voteName = document.getElementById("vote-name");
  const voteNeighborhood = document.getElementById("vote-neighborhood");
  const voteBirthdate = document.getElementById("vote-birthdate");
  const votePhone = document.getElementById("vote-phone");
  const votePromosConsent = document.getElementById("vote-promos-consent");
  const voteConsentAccept = document.getElementById("vote-consent-accept");
  const voteConsentReject = document.getElementById("vote-consent-reject");
  const voteProfileFeedback = document.getElementById("vote-profile-feedback");
  const votePageTitle = document.querySelector(".vote-page-title");
  const votePageDescription = document.querySelector(".voting-copy-wide .voting-text");
  const voteProfileInputs = [voteName, voteNeighborhood, voteBirthdate, votePhone];
  const voteSubmitButton = voteProfileForm.querySelector('[type="submit"]');
  let pendingVoteConfig = null;
  let currentVotingConfig = null;
  let hasVotedThisWeek = false;
  let feedbackToastTimer = null;

  if (
    !newFlavorFeedback ||
    !newFlavorsList ||
    !voteModal ||
    !voteProfileForm ||
    !voteName ||
    !voteNeighborhood ||
    !voteBirthdate ||
    !votePhone ||
    !votePromosConsent ||
    !voteConsentAccept ||
    !voteConsentReject ||
    !voteProfileFeedback
  ) {
    return;
  }

  function updateFeedback(message, isError = false) {
    clearTimeout(feedbackToastTimer);
    newFlavorFeedback.hidden = false;
    newFlavorFeedback.innerHTML = message;
    newFlavorFeedback.classList.toggle("is-error", isError);
    newFlavorFeedback.classList.add("is-visible");

    feedbackToastTimer = setTimeout(() => {
      newFlavorFeedback.classList.remove("is-visible");
      setTimeout(() => {
        if (!newFlavorFeedback.classList.contains("is-visible")) {
          newFlavorFeedback.hidden = true;
          newFlavorFeedback.textContent = "";
          newFlavorFeedback.classList.remove("is-error");
        }
      }, 220);
    }, isError ? 5000 : 3600);
  }

  function getCurrentVoteLockKey() {
    return currentVotingConfig?.weekId
      ? `uno-de-miga-vote-lock:${currentVotingConfig.weekId}`
      : null;
  }

  function syncLocalVoteLock() {
    const voteLockKey = getCurrentVoteLockKey();
    hasVotedThisWeek = voteLockKey ? localStorage.getItem(voteLockKey) === "true" : false;
  }

  function setLocalVoteLock() {
    const voteLockKey = getCurrentVoteLockKey();

    if (!voteLockKey) {
      return;
    }

    localStorage.setItem(voteLockKey, "true");
    hasVotedThisWeek = true;
  }

  function resetStoredVoteStateIfNeeded() {
    try {
      const resetKey = "uno-de-miga-vote-reset-version";
      const appliedVersion = localStorage.getItem(resetKey);

      if (appliedVersion === VOTE_CLIENT_RESET_VERSION) {
        return;
      }

      localStorage.removeItem(VOTE_PROFILE_STORAGE_KEY);
      localStorage.removeItem(ANONYMOUS_VOTE_ID_STORAGE_KEY);

      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("uno-de-miga-vote-lock:")) {
          localStorage.removeItem(key);
        }
      });

      localStorage.setItem(resetKey, VOTE_CLIENT_RESET_VERSION);
    } catch (error) {
      console.error(error);
    }
  }

  function normalizePhoneInputValue(value) {
    return String(value || "").replace(/[^\d+]/g, "").trim();
  }

  function isValidPhoneInput(value) {
    return /^\+?[0-9]{8,15}$/.test(normalizePhoneInputValue(value));
  }

  function showPhoneCorrectionPrompt() {
    updateFeedback('El telefono no tiene un formato valido. <button type="button" class="voting-inline-action" data-fix-phone>Pulsa aqui para arreglarlo</button>', true);
  }

  function openPhoneCorrectionFlow() {
    const profile = getStoredVoteProfile() || {};

    openVoteModal({
      ...profile,
      aceptaPromos: true,
    });
    voteProfileFeedback.textContent = "Revisa el telefono y vuelve a intentarlo. Ejemplo: +34 641 514 569";
    voteProfileFeedback.classList.add("is-error");
    votePhone.focus();
    votePhone.select?.();
  }

  async function fetchJsonWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      const rawBody = await response.text();
      const data = rawBody ? JSON.parse(rawBody) : {};

      return {
        ok: response.ok,
        status: response.status,
        data,
      };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("El servidor tardó demasiado en responder. Intenta otra vez.");
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function loadVotingData() {
    newFlavorsList.innerHTML = '<li class="voting-result-empty">Cargando votos...</li>';

    try {
      const result = await fetchJsonWithTimeout("http://localhost:3000/api/config-votacion");

      if (!result.ok) {
        throw new Error("No se pudo cargar la votacion.");
      }

      currentVotingConfig = result.data;
      syncLocalVoteLock();

      if (votePageTitle && currentVotingConfig.title) {
        votePageTitle.textContent = currentVotingConfig.title;
      }

      if (votePageDescription && currentVotingConfig.description) {
        votePageDescription.textContent = currentVotingConfig.description;
      }

      renderVotes(
        newFlavorsList,
        currentVotingConfig.flavors || [],
        currentVotingConfig.votes || {},
        hasVotedThisWeek,
      );
    } catch (error) {
      newFlavorsList.innerHTML = '<li class="voting-result-empty">No pudimos cargar el ranking ahora mismo.</li>';
      console.error(error);
    }
  }

  resetStoredVoteStateIfNeeded();

  function syncConsentButtons(accepted) {
    votePromosConsent.checked = accepted;
    voteConsentAccept.classList.toggle("is-active", accepted);
    voteConsentReject.classList.toggle("is-active", !accepted);
    voteProfileForm.classList.toggle("is-locked", !accepted);
    voteProfileInputs.forEach((input) => {
      input.disabled = !accepted;
      input.required = accepted;
    });

    if (voteSubmitButton) {
      voteSubmitButton.textContent = accepted ? "Completar y votar" : "Seguir sin promos";
    }
  }

  function getAnonymousProfile() {
    return {
      nombre: "",
      barrio: "",
      fechaNacimiento: "",
      telefono: "",
      aceptaPromos: false,
      clientId: getAnonymousVoteId(),
    };
  }

  function getStoredVoteProfile() {
    try {
      const rawProfile = localStorage.getItem(VOTE_PROFILE_STORAGE_KEY);
      return rawProfile ? JSON.parse(rawProfile) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function storeVoteProfile(profile) {
    localStorage.setItem(VOTE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }

  function getAnonymousVoteId() {
    const storedId = localStorage.getItem(ANONYMOUS_VOTE_ID_STORAGE_KEY);

    if (storedId) {
      return storedId;
    }

    const newId = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(ANONYMOUS_VOTE_ID_STORAGE_KEY, newId);
    return newId;
  }

  function hasCompletedVoteProfile() {
    const profile = getStoredVoteProfile();

    if (profile?.aceptaPromos === false && profile?.clientId) {
      return true;
    }

    return Boolean(
      profile &&
      profile.nombre &&
      profile.barrio &&
      profile.fechaNacimiento &&
      profile.telefono,
    );
  }

  function openVoteModal(prefill = null) {
    voteModal.hidden = false;
    document.body.classList.add("has-vote-modal");
    voteProfileFeedback.textContent = "";
    voteProfileFeedback.classList.remove("is-error");

    if (prefill) {
      voteName.value = prefill.nombre || "";
      voteNeighborhood.value = prefill.barrio || "";
      voteBirthdate.value = prefill.fechaNacimiento || "";
      votePhone.value = prefill.telefono || "";
      syncConsentButtons(prefill.aceptaPromos === true);
      return;
    }

    voteName.value = "";
    voteNeighborhood.value = "";
    voteBirthdate.value = "";
    votePhone.value = "";
    syncConsentButtons(true);
  }

  function closeVoteModal() {
    voteModal.hidden = true;
    document.body.classList.remove("has-vote-modal");
  }

  async function loadVotes(url, listElement) {
    await loadVotingData();
  }

  async function submitVote(config) {
    const sabor = String(config.flavor || "").trim();

    if (!sabor) {
      config.feedbackElement.textContent = config.emptyMessage;
      config.feedbackElement.classList.add("is-error");
      return;
    }

    const voteProfile = getStoredVoteProfile();

    if (!voteProfile) {
      config.feedbackElement.textContent = "Necesitamos tus datos antes de registrar el voto.";
      config.feedbackElement.classList.add("is-error");
      return;
    }

    if (hasVotedThisWeek) {
      updateFeedback("Solo puedes votar 1 vez por semana :S", true);
      return;
    }

    config.feedbackElement.textContent = "Enviando voto...";
    config.feedbackElement.classList.remove("is-error");

    try {
      const result = await fetchJsonWithTimeout(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sabor,
          nombre: voteProfile.nombre,
          barrio: voteProfile.barrio,
          telefono: voteProfile.telefono,
          fechaNacimiento: voteProfile.fechaNacimiento,
          aceptaPromos: voteProfile.aceptaPromos === true,
          clientId: voteProfile.clientId || null,
        }),
      });

      if (!result.ok) {
        throw new Error(result.data.error || "No se pudo registrar el voto.");
      }

      setLocalVoteLock();
      config.feedbackElement.textContent = `Tu voto fue computado en ${result.data.sabor}, espero gane! ;)`;
      if (typeof config.afterSuccess === "function") {
        await config.afterSuccess();
      }
    } catch (error) {
      if (error.message === "El telefono no tiene un formato valido.") {
        showPhoneCorrectionPrompt();
        openPhoneCorrectionFlow();
        return;
      }

      config.feedbackElement.textContent = error.message || "No pudimos registrar tu voto.";
      config.feedbackElement.classList.add("is-error");
      console.error(error);
    }
  }

  async function checkVoteStatus() {
    const profile = getStoredVoteProfile() || {};
    const params = new URLSearchParams();

    if (profile.telefono) {
      params.set("telefono", profile.telefono);
    }

    if (profile.nombre) {
      params.set("nombre", profile.nombre);
    }

    if (profile.clientId) {
      params.set("clientId", profile.clientId);
    }

    const result = await fetchJsonWithTimeout(`${VOTE_STATUS_API_URL}?${params.toString()}`);

    if (!result.ok) {
      throw new Error("No se pudo comprobar si ya habías votado.");
    }

    return result.data;
  }

  newFlavorsList.addEventListener("click", async (event) => {
    const voteButton = event.target.closest("[data-vote-flavor]");

    if (!voteButton) {
      return;
    }

    const selectedFlavor = voteButton.getAttribute("data-vote-flavor");

    try {
      const voteStatus = await checkVoteStatus();

      if (voteStatus.alreadyVoted) {
        setLocalVoteLock();
        updateFeedback("Solo puedes votar 1 vez por semana :S", true);
        await loadVotingData();
        return;
      }
    } catch (error) {
      updateFeedback(error.message || "No pudimos comprobar tu estado de voto.", true);
      return;
    }

    if (!hasCompletedVoteProfile()) {
      openVoteModal(getStoredVoteProfile());
      return;
    }

    await submitVote({
      url: NEW_FLAVORS_API_URL,
      flavor: selectedFlavor,
      feedbackElement: newFlavorFeedback,
      emptyMessage: "Selecciona un nuevo sabor antes de votar.",
      afterSuccess: () => loadVotes(NEW_FLAVORS_API_URL, newFlavorsList),
    });
  });

  if (refreshNewFlavorsButton) {
    refreshNewFlavorsButton.addEventListener("click", () => {
      loadVotes(NEW_FLAVORS_API_URL, newFlavorsList);
    });
  }

  newFlavorFeedback.addEventListener("click", (event) => {
    const fixPhoneButton = event.target.closest("[data-fix-phone]");

    if (!fixPhoneButton) {
      return;
    }

    openPhoneCorrectionFlow();
  });

  voteConsentAccept.addEventListener("click", () => {
    syncConsentButtons(true);
    voteProfileFeedback.textContent = "";
    voteProfileFeedback.classList.remove("is-error");
  });

  voteConsentReject.addEventListener("click", () => {
    syncConsentButtons(false);
    voteProfileFeedback.textContent = "";
    voteProfileFeedback.classList.remove("is-error");
  });

  if (voteModalClose) {
    voteModalClose.addEventListener("click", closeVoteModal);
  }

  if (voteModalBackdrop) {
    voteModalBackdrop.addEventListener("click", closeVoteModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !voteModal.hidden) {
      closeVoteModal();
    }
  });

  voteProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!votePromosConsent.checked) {
      storeVoteProfile(getAnonymousProfile());
      closeVoteModal();
      updateFeedback("Registro listo. Ahora vuelve a pulsar en votar.", false);

      return;
    }

    const profile = {
      nombre: voteName.value.trim(),
      barrio: voteNeighborhood.value.trim(),
      fechaNacimiento: voteBirthdate.value,
      telefono: votePhone.value.trim(),
      aceptaPromos: votePromosConsent.checked,
    };

    if (!profile.nombre || !profile.barrio || !profile.fechaNacimiento || !profile.telefono) {
      voteProfileFeedback.textContent = "Completa nombre, barrio, cumpleaños y teléfono antes de seguir.";
      voteProfileFeedback.classList.add("is-error");
      return;
    }

    if (!isValidPhoneInput(profile.telefono)) {
      voteProfileFeedback.textContent = "El telefono no tiene un formato valido. Usa algo como +34 641 514 569.";
      voteProfileFeedback.classList.add("is-error");
      votePhone.focus();
      votePhone.select?.();
      return;
    }

    voteProfileFeedback.textContent = "Guardando registro...";
    voteProfileFeedback.classList.remove("is-error");

    let registrationResult;

    try {
      registrationResult = await fetchJsonWithTimeout(VOTE_REGISTRATION_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
    } catch (error) {
      voteProfileFeedback.textContent = error.message || "No se pudo guardar el registro.";
      voteProfileFeedback.classList.add("is-error");
      return;
    }

    if (!registrationResult.ok) {
      voteProfileFeedback.textContent = registrationResult.data.error || "No se pudo guardar el registro.";
      voteProfileFeedback.classList.add("is-error");
      return;
    }

    storeVoteProfile(profile);
    closeVoteModal();
    updateFeedback("Registro listo. Ahora vuelve a pulsar en votar.", false);
  });

  loadVotes(NEW_FLAVORS_API_URL, newFlavorsList);

  votePhone.addEventListener("input", () => {
    if (voteProfileFeedback.classList.contains("is-error")) {
      voteProfileFeedback.textContent = "";
      voteProfileFeedback.classList.remove("is-error");
    }
  });
}

document.addEventListener("click", (event) => {
  const closeButton = event.target.closest("#vote-modal-close");
  const backdrop = event.target.closest("#vote-modal-backdrop");

  if (closeButton || backdrop) {
    const voteModal = document.getElementById("vote-modal");

    if (voteModal) {
      voteModal.hidden = true;
      document.body.classList.remove("has-vote-modal");
    }

    return;
  }
});
