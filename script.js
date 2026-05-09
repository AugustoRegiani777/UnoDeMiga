const WHATSAPP_BASE_URL = "https://wa.me/34641514569";

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
  { id: "atun-palta", nombre: "Atún, palta y queso", categoria: "de-la-casa", precio: 3.8, tags: ["pescado"] },
  { id: "salmon-phila", nombre: "Salmón ahumado y Philadelphia", categoria: "de-la-casa", precio: 3.8, tags: ["pescado"] },
];

const extrasSections = [
  {
    id: "tortas",
    nombre: "Tortas saladas o dulces",
    descripcion: "Elegí si querés sumar una torta salada para compartir o una opción dulce.",
    items: [
      { id: "torta-salada", nombre: "Torta salada", precio: 45, descripcion: "Formato para compartir con corte de mesa." },
      { id: "torta-dulce", nombre: "Torta dulce", precio: 35, descripcion: "Opción dulce para cierre de mesa o celebración." },
    ],
  },
  {
    id: "mesa-dulce",
    nombre: "Mesa dulce",
    descripcion: "Podés sumar piezas sueltas para armar una mesa dulce simple.",
    items: [
      { id: "croissant-simple", nombre: "Croissant", precio: 1, descripcion: "Unidad." },
      { id: "croissant-ddl", nombre: "Croissant con DDL", precio: 1.1, descripcion: "Unidad." },
      { id: "medialuna-dulce", nombre: "Medialunas", precio: 1, descripcion: "Unidad." },
    ],
  },
  {
    id: "mesa-salada",
    nombre: "Mesa salada",
    descripcion: "Sumá bollería salada para complementar el catering.",
    items: [
      { id: "medialuna-jyq", nombre: "Medialunas con jamón y queso", precio: 1.5, descripcion: "Unidad." },
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
  personas: 10,
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
      state.personas = Math.max(10, state.personas + delta);
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
  const ahorroSandwiches = Math.max(0, calculateOriginalSandwichSubtotal() - state.subtotalSandwiches);

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
  refs.summaryTotalLine.textContent = `Total estimado ${formatPrice(state.total)}`;
  refs.summarySavingsLine.textContent = ahorroSandwiches > 0 ? `Ahorro aplicado: ${formatPrice(ahorroSandwiches)}` : "";
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
