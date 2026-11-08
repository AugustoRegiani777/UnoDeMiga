const WHATSAPP_BASE_URL = "https://wa.me/34641514569";
const NEW_FLAVORS_API_URL = "/api/nuevos-sabores";
const VOTE_REGISTRATION_API_URL = "/api/registro-votacion";
const VOTE_STATUS_API_URL = "/api/vote-status";
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
  { id: "jamon-serrano", nombre: "Jamón serrano, rúcula y queso", categoria: "especiales", precio: 3.5, tags: ["cerdo"] },
  { id: "jamon-huevo", nombre: "Jamón y huevo", categoria: "de-la-casa", precio: 3.8, tags: ["cerdo"] },
  { id: "huevo-queso", nombre: "Huevo y queso", categoria: "de-la-casa", precio: 3.8, tags: ["vegetariano"] },
  { id: "atun-palta", nombre: "Atún, aguacate y queso", categoria: "de-la-casa", precio: 3.8, tags: ["pescado"] },
  { id: "mortadela-pesto", nombre: "Mortadela, pesto y queso", categoria: "de-la-casa", precio: 3.8, tags: ["cerdo"] },
];

const extrasSections = [
  {
    id: "tortas",
    nombre: "Tortas saladas o dulces",
    descripcion: "Elegí si querés sumar una torta salada para compartir o una opción dulce.",
    items: [
      { id: "torta-salada-5-2", nombre: "Torta salada (5 personas, 2 gustos)", precio: 45, descripcion: "Formato para compartir con corte de mesa." },
      { id: "torta-salada-10-2", nombre: "Torta salada (10 personas, 2 gustos)", precio: 60, descripcion: "Formato para compartir con corte de mesa." },
      { id: "torta-salada-10-3", nombre: "Torta salada (10 personas, 3 gustos)", precio: 70, descripcion: "Formato para compartir con corte de mesa." },
      { id: "tarta-dulce", nombre: "Tarta dulce", precio: 50, descripcion: "Torta dulce para cierre de mesa o celebración." },
    ],
  },
  {
    id: "mesa-dulce",
    nombre: "Mesa dulce",
    descripcion: "Podés sumar piezas sueltas para armar una mesa dulce simple.",
    items: [
      { id: "cookies-ddl", nombre: "Cookies de dulce de leche", precio: 3, descripcion: "Unidad." },
    ],
  },
  {
    id: "mesa-salada",
    nombre: "Mesa salada",
    descripcion: "Sumá opciones saladas para complementar el catering.",
    items: [
      { id: "chipa-queso", nombre: "Chipa de queso", precio: 1, descripcion: "Unidad." },
      { id: "chipa-jamon", nombre: "Chipa de jamón", precio: 1, descripcion: "Unidad." },
    ],
  },
  {
    id: "veganos",
    nombre: "Productos veganos",
    descripcion: "Opciones veganas por encargo.",
    items: [
      { id: "docena-vegana", nombre: "Docena veggie", precio: 40, descripcion: "12 sándwiches veganos." },
      { id: "media-docena-vegana", nombre: "Media docena veggie", precio: 20, descripcion: "6 sándwiches veganos." },
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

// Precios de catering — igual que la caja física (Miga POS). `sabor.precio`
// queda en precio de lista (igual a `preciosOriginales`); el descuento no es
// un precio por unidad distinto, se aplica por paquete en recalculateTotals().
const PRECIO_CATERING_DOCENA = 34;
const PRECIO_CATERING_MEDIA_DOCENA = 19;
const PRECIO_CATERING_PREMIUM_EXTRA = 0.30;

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
  confirmModal: document.getElementById("builder-confirm"),
  confirmBackdrop: document.getElementById("builder-confirm-backdrop"),
  confirmText: document.getElementById("builder-confirm-text"),
  confirmAccept: document.getElementById("builder-confirm-accept"),
  confirmCancel: document.getElementById("builder-confirm-cancel"),
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
  summaryFlavorsSubtotal: document.getElementById("summary-flavors-subtotal"),
  summaryExtras: document.getElementById("summary-extras"),
  summaryExtrasSubtotal: document.getElementById("summary-extras-subtotal"),
  summaryPricePerPerson: document.getElementById("summary-price-per-person"),
  summaryTotalLine: document.getElementById("summary-total-line"),
  summarySavingsLine: document.getElementById("summary-savings-line"),
  selectionStatus: document.getElementById("builder-selection-status"),
  whatsappLink: document.getElementById("builder-whatsapp-link"),
  stepPanels: Array.from(document.querySelectorAll(".builder-step")),
  personButtons: Array.from(document.querySelectorAll("[data-person-action]")),
};

let builderConfirmResolver = null;

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
    if (event.key === "Escape" && refs.confirmModal && !refs.confirmModal.hidden) {
      resolveBuilderConfirm(false);
      return;
    }

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

  if (refs.confirmAccept) {
    refs.confirmAccept.addEventListener("click", () => {
      resolveBuilderConfirm(true);
    });
  }

  if (refs.confirmCancel) {
    refs.confirmCancel.addEventListener("click", () => {
      resolveBuilderConfirm(false);
    });
  }

  if (refs.confirmBackdrop) {
    refs.confirmBackdrop.addEventListener("click", () => {
      resolveBuilderConfirm(false);
    });
  }

  refs.nextButton.addEventListener("click", async () => {
    if (!canAdvance(state.currentStep)) {
      return;
    }

    if (state.currentStep === 4 && !(await confirmFlavorSelection())) {
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
  resolveBuilderConfirm(false);
  if (refs.builderModal) {
    refs.builderModal.hidden = true;
    document.body.classList.remove("has-catering-modal");
  }
}

function openBuilderConfirm(message) {
  if (!refs.confirmModal || !refs.confirmText) {
    return Promise.resolve(window.confirm(message));
  }

  refs.confirmText.textContent = message;
  refs.confirmModal.hidden = false;

  return new Promise((resolve) => {
    builderConfirmResolver = resolve;
  });
}

function resolveBuilderConfirm(result) {
  if (refs.confirmModal) {
    refs.confirmModal.hidden = true;
  }

  if (builderConfirmResolver) {
    const resolve = builderConfirmResolver;
    builderConfirmResolver = null;
    resolve(result);
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

// Replica la lógica de precios de la caja física (Miga POS): la cantidad
// total de sándwiches N se arma en docenas completas (34€), después una
// media docena si sobra (19€), y lo que no entra en ningún paquete se
// cobra suelto a precio de lista (`unidad.precio`). Cada sándwich "de la
// casa" (premium) que cae DENTRO de una docena o media docena suma +0,30€;
// si queda suelto ya paga su propio precio de lista más alto y no lleva
// el extra.
//
// No hay "orden de agregado" real (se elige una cantidad por sabor en una
// lista, no se van sumando unidades una por una). Para decidir qué unidades
// entran en el paquete y cuáles quedan sueltas se usa el orden en que están
// definidos los sabores en la lista de origen: todas las unidades del
// primer sabor, después las del segundo, etc.
// Devuelve el desglose en paquetes (para mostrarlo como líneas de carrito,
// cada una con su propio precio de lista tachado) además del total. Mantiene
// la misma matemática que antes: el total da exactamente igual.
function computeSandwichBucketBreakdown(unidadesSandwich) {
  const n = unidadesSandwich.length;
  const docenas = Math.floor(n / 12);
  const resto = n - docenas * 12;
  const medias = Math.floor(resto / 6);
  const sueltosCount = resto - medias * 6;

  let docenaRow = null;
  if (docenas > 0) {
    const slice = unidadesSandwich.slice(0, docenas * 12);
    const premium = slice.filter((u) => u.premium).length;
    docenaRow = {
      count: docenas * 12,
      listPrice: slice.reduce((sum, u) => sum + u.precio, 0),
      price: docenas * PRECIO_CATERING_DOCENA + premium * PRECIO_CATERING_PREMIUM_EXTRA,
    };
  }

  let mediaRow = null;
  if (medias > 0) {
    const slice = unidadesSandwich.slice(docenas * 12, docenas * 12 + 6);
    const premium = slice.filter((u) => u.premium).length;
    mediaRow = {
      count: 6,
      listPrice: slice.reduce((sum, u) => sum + u.precio, 0),
      price: PRECIO_CATERING_MEDIA_DOCENA + premium * PRECIO_CATERING_PREMIUM_EXTRA,
    };
  }

  const sueltosUnidades = unidadesSandwich.slice(docenas * 12 + medias * 6);
  const sueltosTotal = sueltosUnidades.reduce((sum, u) => sum + u.precio, 0);

  const total = (docenaRow ? docenaRow.price : 0) + (mediaRow ? mediaRow.price : 0) + sueltosTotal;

  return { docenaRow, mediaRow, sueltosCount, sueltosTotal, total };
}

function computeSandwichBucketPrice(unidadesSandwich) {
  return computeSandwichBucketBreakdown(unidadesSandwich).total;
}

function recalculateTotals() {
  const unidadesSandwich = saboresData.flatMap((sabor) => {
    const cantidad = state.saboresSeleccionados[sabor.id] || 0;
    return Array.from({ length: cantidad }, () => ({
      precio: sabor.precio,
      premium: sabor.categoria === "de-la-casa",
    }));
  });

  state.subtotalSandwiches = computeSandwichBucketPrice(unidadesSandwich);

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
    refs.selectionStatus.textContent = `Sándwiches: ${getSelectedFlavorCount()} / ${state.totalSandwiches}`;
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
  refs.flavorSelected.textContent = `${selectedCount} seleccionados`;
  refs.flavorSelected.classList.toggle("is-invalid", selectedCount === 0);

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
  refs.summaryFlavorsSubtotal.textContent = `Subtotal sándwiches: ${formatPrice(state.subtotalSandwiches)}`;
  refs.summaryFlavorsSubtotal.hidden = !selectedFlavors;

  const selectedExtras = extrasData
    .filter((extra) => state.extrasSeleccionados[extra.id] > 0)
    .map((extra) => `<li>${state.extrasSeleccionados[extra.id]}x ${extra.nombre}</li>`)
    .join("");

  refs.summaryExtras.innerHTML = selectedExtras || "<li>Sin extras.</li>";
  refs.summaryExtrasSubtotal.textContent = `Subtotal extras: ${formatPrice(state.subtotalExtras)}`;
  refs.summaryExtrasSubtotal.hidden = !selectedExtras;
  refs.summaryPricePerPerson.textContent = formatPrice(state.total);
  refs.summaryTotalLine.textContent = `Costo por persona ${formatPrice(pricePerPerson)}`;
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
    return getSelectedFlavorCount() > 0;
  }

  return step >= 1 && step <= steps.length;
}

function confirmFlavorSelection() {
  const selected = getSelectedFlavorCount();
  const recommended = state.totalSandwiches;

  if (selected === recommended) {
    return Promise.resolve(true);
  }

  const difference = Math.abs(selected - recommended);
  const noun = difference === 1 ? "sándwich" : "sándwiches";

  if (selected < recommended) {
    return openBuilderConfirm(
      `Elegiste ${difference} ${noun} menos de lo recomendado. Si te parece bien así, seguimos.`,
    );
  }

  return openBuilderConfirm(
    `Elegiste ${difference} ${noun} más de lo recomendado. Si te parece bien así, seguimos.`,
  );
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
    container.innerHTML = '<li class="voting-result-empty">TodavÃ­a no hay votos cargados.</li>';
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
        throw new Error("El servidor tardÃ³ demasiado en responder. Intenta otra vez.");
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
      config.feedbackElement.textContent = "No pudimos registrar tu voto. Revisa que el backend estÃ© corriendo.";
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
      const response = await fetch("/api/config-votacion");

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
    container.innerHTML = '<li class="voting-result-empty">TodavÃ­a no hay votos cargados.</li>';
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
        throw new Error("El servidor tardÃ³ demasiado en responder. Intenta otra vez.");
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function loadVotingData() {
    newFlavorsList.innerHTML = '<li class="voting-result-empty">Cargando votos...</li>';

    try {
      const result = await fetchJsonWithTimeout("/api/config-votacion");

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
      throw new Error("No se pudo comprobar si ya habÃ­as votado.");
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
      voteProfileFeedback.textContent = "Completa nombre, barrio, cumpleaÃ±os y telÃ©fono antes de seguir.";
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

// ── Box Office Selector ──────────────────────────────────────────────────────

const BOX_CONFIGS = {
  daily:     { name: "Box Daily",     price: 19,  total: 6  },
  meeting:   { name: "Box Meeting",   price: 34,  total: 12 },
  executive: { name: "Box Executive", price: 68,  total: 24 },
};

// Preset amounts para Docena (12). Se escala proporcional al total de la box.
const BOX_REGULAR_PRESET = {
  "jamon-queso": 4,
  "pasta-oliva": 2,
  "pimiento":    2,
  "pesto":       2,
  "serrano":     2,
};

const BOX_REGULAR_FLAVORS = [
  { id: "jamon-queso", name: "Jamón y queso",                               precio: 3.5 },
  { id: "pasta-oliva", name: "Pasta de oliva y queso",                      precio: 3.5 },
  { id: "pimiento",    name: "Pimiento asado, queso gouda y Philadelphia",  precio: 3.5 },
  { id: "pesto",       name: "Pesto, tomate y queso",                       precio: 3.5 },
  { id: "serrano",     name: "Jamón serrano, rúcula y queso",               precio: 3.5 },
];

const BOX_DELACASA_FLAVORS = [
  { id: "atun-palta",      name: "Atún, aguacate y queso",   precio: 3.8 },
  { id: "huevo-queso",     name: "Huevo y queso",            precio: 3.8 },
  { id: "huevo-jamon",     name: "Huevo y jamón",            precio: 3.8 },
  { id: "mortadela-pesto", name: "Mortadela, pesto y queso", precio: 3.8 },
  { id: "especial-semana", name: "Especial de la semana",    precio: 3.8 },
];

// Complementos que se pueden sumar al pedido de sándwiches, después de
// elegir los sabores. No tienen descuento por cantidad.
const BOX_EXTRAS = [
  { id: "chipa",      name: "Chipá",            precio: 1   },
  { id: "chocotorta", name: "Chocotorta",       precio: 3.5 },
  { id: "alfajor",    name: "Alfajor Havanna",  precio: 3   },
  { id: "bebida",     name: "Bebida",           precio: 2   },
];

const BSX_STEPS = [
  { id: "sabores",  label: "Sabores" },
  { id: "extras",   label: "Complementos" },
  { id: "opciones", label: "Opciones" },
  { id: "resumen",  label: "Resumen" },
];

function bsxBuildPreset(box) {
  const regular = {};
  const scale = box.total / 12;
  BOX_REGULAR_FLAVORS.forEach((f) => {
    regular[f.id] = (BOX_REGULAR_PRESET[f.id] || 0) * scale;
  });
  const delaCasa = {};
  BOX_DELACASA_FLAVORS.forEach((f) => { delaCasa[f.id] = 0; });
  const extras = {};
  BOX_EXTRAS.forEach((e) => { extras[e.id] = 0; });
  return { regular, delaCasa, extras };
}

const boxSel = {
  state: { box: null, step: 0, regular: {}, delaCasa: {}, extras: {}, mitades: false, dia: "" },
  refs: {},

  init() {
    const modal = document.getElementById("box-selector-modal");
    if (!modal) return;
    this.refs = {
      modal,
      backdrop: document.getElementById("box-selector-backdrop"),
      close:    document.getElementById("box-selector-close"),
      title:    document.getElementById("box-selector-title"),
      body:     document.getElementById("box-selector-body"),
      counter:  document.getElementById("box-selector-counter"),
      prev:     document.getElementById("box-selector-prev"),
      next:     document.getElementById("box-selector-next"),
    };
    document.querySelectorAll("[data-box]").forEach((btn) => {
      btn.addEventListener("click", () => this.open(btn.dataset.box));
    });
    this.refs.backdrop.addEventListener("click", () => this.close());
    this.refs.close.addEventListener("click",    () => this.close());
    this.refs.prev.addEventListener("click",     () => this.goTo(this.state.step - 1));
    this.refs.next.addEventListener("click",     () => this.advance());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.refs.modal.hidden) this.close();
    });
  },

  open(boxOrId) {
    const config = typeof boxOrId === "string" ? BOX_CONFIGS[boxOrId] : boxOrId;
    if (!config) return;
    const preset = bsxBuildPreset(config);
    this.state = { box: config, step: 0, regular: preset.regular, delaCasa: preset.delaCasa, extras: preset.extras, mitades: false, dia: "" };
    this.refs.title.textContent = config.name;
    this.refs.modal.hidden = false;
    document.body.classList.add("has-box-modal");
    this.render();
  },

  close() {
    this.refs.modal.hidden = true;
    document.body.classList.remove("has-box-modal");
  },

  totalRegular()  { return Object.values(this.state.regular).reduce((a, b) => a + b, 0); },
  totalDelaCasa() { return Object.values(this.state.delaCasa).reduce((a, b) => a + b, 0); },
  totalAll()      { return this.totalRegular() + this.totalDelaCasa(); },
  extraCost()     { return this.totalDelaCasa() * 0.30; },

  // En modo "extendable" (Docena/Media docena por encargo) no hay un precio
  // de box fijo: se puede seguir agregando de a 1, a precio de lista, hasta
  // completar otra media docena o docena y volver a entrar en descuento —
  // misma lógica de paquetes que el cotizador de catering.
  unidadesSandwich() {
    const { regular, delaCasa } = this.state;
    const regUnits = BOX_REGULAR_FLAVORS.flatMap((f) =>
      Array.from({ length: regular[f.id] || 0 }, () => ({ precio: f.precio, premium: false })),
    );
    const casaUnits = BOX_DELACASA_FLAVORS.flatMap((f) =>
      Array.from({ length: delaCasa[f.id] || 0 }, () => ({ precio: f.precio, premium: true })),
    );
    return [...regUnits, ...casaUnits];
  },

  breakdown() { return computeSandwichBucketBreakdown(this.unidadesSandwich()); },

  extrasTotal() {
    return Object.entries(this.state.extras).reduce((sum, [id, qty]) => {
      const extra = BOX_EXTRAS.find((e) => e.id === id);
      return sum + qty * (extra ? extra.precio : 0);
    }, 0);
  },

  finalPrice() {
    const base = this.state.box.extendable
      ? this.breakdown().total
      : this.state.box.price + this.extraCost();
    return base + this.extrasTotal();
  },

  // Precio de lista de lo elegido (sin descuento) — vale tanto para los
  // packs fijos de Office como para Docena/Media docena, para mostrar el
  // precio tachado cuando hay descuento. Los complementos no tienen
  // descuento, así que suman igual a ambos lados.
  listPrice() {
    return this.unidadesSandwich().reduce((sum, u) => sum + u.precio, 0) + this.extrasTotal();
  },

  // Filas de carrito: una por paquete de descuento alcanzado, más los
  // sueltos que todavía no completaron el próximo paquete.
  cartRowsHtml() {
    if (!this.state.box.extendable) return "";
    const { docenaRow, mediaRow, sueltosCount, sueltosTotal } = this.breakdown();
    const rows = [];
    if (docenaRow) rows.push(cartRowHtml(`${docenaRow.count} sándwiches`, docenaRow.listPrice, docenaRow.price));
    if (mediaRow)  rows.push(cartRowHtml(`${mediaRow.count} sándwiches`, mediaRow.listPrice, mediaRow.price));
    if (sueltosCount > 0) rows.push(cartLooseRowHtml(`+${sueltosCount} suelto${sueltosCount > 1 ? "s" : ""}`, sueltosTotal));
    return rows.length ? `<ul class="promo-cart-rows">${rows.join("")}</ul>` : "";
  },

  advance() {
    const { step } = this.state;
    if (step === 0 && this.totalAll() < this.state.box.total) return;
    if (step === BSX_STEPS.length - 1) { this.sendToWhatsApp(); return; }
    this.goTo(step + 1);
  },

  goTo(step) {
    if (step < 0 || step >= BSX_STEPS.length) return;
    this.state.step = step;
    this.render();
  },

  render() {
    const { step, box } = this.state;
    const stepId = BSX_STEPS[step].id;
    const total = this.totalAll();
    const remaining = box.total - total;
    const finalPrice = this.finalPrice();
    const listPrice = this.listPrice();
    const priceHtml = listPrice > finalPrice
      ? `<span class="office-price-old">${formatEUR(listPrice)} €</span> ${formatEUR(finalPrice)} €`
      : `${formatEUR(finalPrice)} €`;
    // En el paso de sabores el conteo y el desglose ya se muestran arriba,
    // fijos, en la cabecera de la lista — acá solo hace falta avisar si
    // todavía no se llegó al mínimo.
    this.refs.counter.innerHTML = stepId === "sabores"
      ? remaining > 0
        ? remaining === 1
          ? "Falta 1 sándwich para el descuento"
          : `Faltan ${remaining} sándwiches para el descuento`
        : ""
      : priceHtml;
    this.refs.prev.hidden = step === 0;
    this.refs.next.textContent = step === BSX_STEPS.length - 1 ? "Confirmar por WhatsApp" : "Siguiente";

    if (stepId === "sabores")       this.renderSabores();
    else if (stepId === "extras")   this.renderExtras();
    else if (stepId === "opciones") this.renderOpciones();
    else                             this.renderResumen();
  },

  renderSabores() {
    const { box, regular, delaCasa } = this.state;
    const total = this.totalAll();
    const canAdd = box.extendable || total < box.total;

    const regularItems = BOX_REGULAR_FLAVORS.map((f) => {
      const qty = regular[f.id] || 0;
      return `
        <li class="bsx-flavor-item">
          <span class="bsx-flavor-name">${f.name}</span>
          <div class="bsx-counter">
            <button class="bsx-counter-btn" type="button" data-action="dec" data-cat="regular" data-id="${f.id}" ${qty === 0 ? "disabled" : ""}>−</button>
            <span class="bsx-counter-val">${qty}</span>
            <button class="bsx-counter-btn" type="button" data-action="inc" data-cat="regular" data-id="${f.id}" ${!canAdd ? "disabled" : ""}>+</button>
          </div>
        </li>`;
    }).join("");

    const delaCasaItems = BOX_DELACASA_FLAVORS.map((f) => {
      const qty = delaCasa[f.id] || 0;
      return `
        <li class="bsx-flavor-item">
          <span class="bsx-flavor-name">${f.name}</span>
          <div class="bsx-counter">
            <button class="bsx-counter-btn" type="button" data-action="dec" data-cat="delaCasa" data-id="${f.id}" ${qty === 0 ? "disabled" : ""}>−</button>
            <span class="bsx-counter-val">${qty}</span>
            <button class="bsx-counter-btn" type="button" data-action="inc" data-cat="delaCasa" data-id="${f.id}" ${!canAdd ? "disabled" : ""}>+</button>
          </div>
        </li>`;
    }).join("");

    this.refs.body.innerHTML = `
      <div class="bsx-step-header bsx-step-header-sticky">
        <div class="bsx-live-count">
          <span class="bsx-live-count-number">${total}</span>
          <span class="bsx-live-count-label">sándwiches<br>en tu pedido</span>
        </div>
        ${this.cartRowsHtml()}
        <p class="bsx-step-label">Elegí tus sabores</p>
        <p class="bsx-step-hint">${box.extendable
          ? `Mínimo ${box.total} sándwiches para el descuento. Podés sumar más: cada 6 o 12 extra entran en otro paquete con descuento.`
          : `Modificá la selección a tu gusto. Total: ${box.total} sándwiches.`}</p>
      </div>
      <ul class="bsx-flavor-list">${regularItems}</ul>
      <div class="bsx-delacasa-header">
        <p class="bsx-delacasa-label">De la casa</p>
        <span class="bsx-delacasa-badge">+0,30 € por unidad</span>
      </div>
      <ul class="bsx-flavor-list">${delaCasaItems}</ul>`;

    this.refs.body.querySelectorAll(".bsx-counter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const { action, cat, id } = btn.dataset;
        const sel = cat === "regular" ? this.state.regular : this.state.delaCasa;
        const cur = sel[id] || 0;
        const tot = this.totalAll();
        if (action === "inc" && (box.extendable || tot < box.total)) sel[id] = cur + 1;
        if (action === "dec" && cur > 0)         sel[id] = cur - 1;
        this.render();
      });
    });
  },

  renderExtras() {
    const { extras } = this.state;
    const items = BOX_EXTRAS.map((e) => {
      const qty = extras[e.id] || 0;
      return `
        <li class="bsx-flavor-item">
          <span class="bsx-flavor-name">${e.name} <span class="bsx-extra-price">${formatEUR(e.precio)} € c/u</span></span>
          <div class="bsx-counter">
            <button class="bsx-counter-btn" type="button" data-extra="${e.id}" data-action="dec" ${qty === 0 ? "disabled" : ""}>−</button>
            <span class="bsx-counter-val">${qty}</span>
            <button class="bsx-counter-btn" type="button" data-extra="${e.id}" data-action="inc">+</button>
          </div>
        </li>`;
    }).join("");

    this.refs.body.innerHTML = `
      <div class="bsx-step-header">
        <p class="bsx-step-label">¿Sumás algún complemento?</p>
        <p class="bsx-step-hint">Chipá, chocotorta, alfajores o bebidas — se suman al pedido sin descuento.</p>
      </div>
      <ul class="bsx-flavor-list">${items}</ul>`;

    this.refs.body.querySelectorAll("[data-extra]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const { extra: id, action } = btn.dataset;
        const cur = extras[id] || 0;
        if (action === "inc") extras[id] = cur + 1;
        if (action === "dec" && cur > 0) extras[id] = cur - 1;
        this.render();
      });
    });
  },

  renderOpciones() {
    this.refs.body.innerHTML = `
      <div class="bsx-step-header">
        <p class="bsx-step-label">Opciones de entrega</p>
      </div>
      <div class="bsx-opciones">
        <label class="bsx-option-row">
          <input type="checkbox" id="bsx-mitades" ${this.state.mitades ? "checked" : ""}>
          <span>Quiero los sándwiches cortados a la mitad</span>
        </label>
        <div class="bsx-option-field">
          <label for="bsx-dia">Día de entrega</label>
          <input type="text" id="bsx-dia" placeholder="Ej: Martes 22 de julio" value="${this.state.dia}">
        </div>
      </div>`;
    document.getElementById("bsx-mitades").addEventListener("change", (e) => { this.state.mitades = e.target.checked; });
    document.getElementById("bsx-dia").addEventListener("input",    (e) => { this.state.dia = e.target.value; });
  },

  renderResumen() {
    const { box, regular, delaCasa, extras, mitades, dia } = this.state;
    const extraCost = this.extraCost();
    const finalPrice = this.finalPrice();

    const regularLines = Object.entries(regular)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => {
        const f = BOX_REGULAR_FLAVORS.find((x) => x.id === id);
        return `<li>${q}× ${f ? f.name : id}</li>`;
      }).join("");

    const delaCasaLines = Object.entries(delaCasa)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => {
        const f = BOX_DELACASA_FLAVORS.find((x) => x.id === id);
        return `<li>${q}× ${f ? f.name : id}</li>`;
      }).join("");

    const extrasLines = Object.entries(extras)
      .filter(([, q]) => q > 0)
      .map(([id, q]) => {
        const e = BOX_EXTRAS.find((x) => x.id === id);
        return `<li>${q}× ${e ? e.name : id} — ${formatEUR((e ? e.precio : 0) * q)} €</li>`;
      }).join("");

    const priceBreakdown = !box.extendable && extraCost > 0
      ? `<p class="bsx-summary-extra">${box.price} € + ${extraCost.toFixed(2).replace(".", ",")} € (de la casa)</p>`
      : "";

    const listPrice = this.listPrice();
    const priceHtml = listPrice > finalPrice
      ? `<span class="office-price-old">${formatEUR(listPrice)} €</span> ${formatEUR(finalPrice)} €`
      : `${formatEUR(finalPrice)} €`;

    this.refs.body.innerHTML = `
      <div class="bsx-step-header">
        <p class="bsx-step-label">Resumen del pedido</p>
      </div>
      <div class="bsx-summary">
        <p class="bsx-summary-box">${box.name}</p>
        ${this.cartRowsHtml()}
        ${regularLines ? `<div class="bsx-summary-group"><p class="bsx-summary-label">Sándwiches</p><ul>${regularLines}</ul></div>` : ""}
        ${delaCasaLines ? `<div class="bsx-summary-group"><p class="bsx-summary-label">De la casa (+0,30 €)</p><ul>${delaCasaLines}</ul></div>` : ""}
        ${extrasLines ? `<div class="bsx-summary-group"><p class="bsx-summary-label">Complementos</p><ul>${extrasLines}</ul></div>` : ""}
        <p class="bsx-summary-extra">${mitades ? "✂ Cortados a la mitad" : "Enteros"}</p>
        ${dia ? `<p class="bsx-summary-extra">Entrega: ${dia}</p>` : ""}
        ${priceBreakdown}
        <p class="bsx-summary-price">${priceHtml}</p>
      </div>`;
  },

  buildMessage() {
    const { box, regular, delaCasa, extras, mitades, dia } = this.state;
    const finalPrice = this.finalPrice();
    const priceStr = formatEUR(finalPrice);
    const lines = [`¡Hola! Quiero pedir ${box.name} — ${priceStr} €.`, ""];

    const regularEntries = Object.entries(regular).filter(([, q]) => q > 0);
    if (regularEntries.length) {
      lines.push("*Sabores*");
      regularEntries.forEach(([id, q]) => {
        const f = BOX_REGULAR_FLAVORS.find((x) => x.id === id);
        lines.push(`• ${q}× ${f ? f.name : id}`);
      });
      lines.push("");
    }

    const delaCasaEntries = Object.entries(delaCasa).filter(([, q]) => q > 0);
    if (delaCasaEntries.length) {
      lines.push("*De la casa (+0,30 € c/u)*");
      delaCasaEntries.forEach(([id, q]) => {
        const f = BOX_DELACASA_FLAVORS.find((x) => x.id === id);
        lines.push(`• ${q}× ${f ? f.name : id}`);
      });
      lines.push("");
    }

    const extrasEntries = Object.entries(extras).filter(([, q]) => q > 0);
    if (extrasEntries.length) {
      lines.push("*Complementos*");
      extrasEntries.forEach(([id, q]) => {
        const e = BOX_EXTRAS.find((x) => x.id === id);
        lines.push(`• ${q}× ${e ? e.name : id} — ${formatEUR((e ? e.precio : 0) * q)} €`);
      });
      lines.push("");
    }

    lines.push(mitades ? "Los quiero cortados a la mitad." : "Los quiero enteros.");
    if (dia) lines.push(`Día de entrega: ${dia}`);
    return lines.join("\n");
  },

  sendToWhatsApp() {
    const url = `https://wa.me/34641514569?text=${encodeURIComponent(this.buildMessage())}`;
    window.open(url, "_blank", "noreferrer");
    this.close();
  },
};

document.addEventListener("DOMContentLoaded", () => { boxSel.init(); });

const PRICE_MEDIALUNA_UNIT = 2.5;
const PRICE_MEDIALUNA_DOCENA = 24;

function formatEUR(n) { return n % 1 === 0 ? `${n}` : n.toFixed(2).replace(".", ","); }

// Fila de carrito compartida entre el selector de sándwiches y el de
// medialunas: un paquete con descuento (precio de lista tachado) o un
// renglón de sueltos sin descuento todavía.
function cartRowHtml(label, listPrice, price) {
  const priceHtml = listPrice > price
    ? `<span class="office-price-old">${formatEUR(listPrice)} €</span> ${formatEUR(price)} €`
    : `${formatEUR(price)} €`;
  return `
    <li class="promo-cart-row">
      <span class="promo-cart-row-label">${label}</span>
      <span class="promo-cart-row-price">${priceHtml}</span>
    </li>`;
}

function cartLooseRowHtml(label, total) {
  return `
    <li class="promo-cart-row promo-cart-row-loose">
      <span class="promo-cart-row-label">${label}</span>
      <span class="promo-cart-row-price">${formatEUR(total)} €</span>
    </li>`;
}

const medialunaSel = {
  state: { count: 12 },
  refs: {},

  init() {
    const modal = document.getElementById("medialuna-modal");
    if (!modal) return;
    this.refs = {
      modal,
      backdrop: document.getElementById("medialuna-modal-backdrop"),
      close:    document.getElementById("medialuna-modal-close"),
      dec:      document.getElementById("medialuna-dec"),
      inc:      document.getElementById("medialuna-inc"),
      count:    document.getElementById("medialuna-count"),
      cartRows: document.getElementById("medialuna-cart-rows"),
      confirm:  document.getElementById("medialuna-confirm"),
    };
    this.refs.backdrop.addEventListener("click", () => this.close());
    this.refs.close.addEventListener("click",    () => this.close());
    this.refs.dec.addEventListener("click", () => this.setCount(this.state.count - 1));
    this.refs.inc.addEventListener("click", () => this.setCount(this.state.count + 1));
    this.refs.confirm.addEventListener("click", () => this.sendToWhatsApp());
  },

  open() {
    this.state.count = 12;
    this.refs.modal.hidden = false;
    document.body.classList.add("has-promo-modal");
    this.render();
  },

  close() {
    this.refs.modal.hidden = true;
    document.body.classList.remove("has-promo-modal");
  },

  setCount(n) {
    this.state.count = Math.max(1, n);
    this.render();
  },

  // Cada bloque de 12 paga precio de docena; el resto, precio por unidad.
  breakdown() {
    const n = this.state.count;
    const docenas = Math.floor(n / 12);
    const sueltosCount = n - docenas * 12;
    const docenaRow = docenas > 0
      ? { count: docenas * 12, listPrice: docenas * 12 * PRICE_MEDIALUNA_UNIT, price: docenas * PRICE_MEDIALUNA_DOCENA }
      : null;
    const sueltosTotal = sueltosCount * PRICE_MEDIALUNA_UNIT;
    return { docenaRow, sueltosCount, sueltosTotal };
  },

  price() {
    const { docenaRow, sueltosTotal } = this.breakdown();
    return (docenaRow ? docenaRow.price : 0) + sueltosTotal;
  },

  render() {
    this.refs.count.textContent = this.state.count;
    const { docenaRow, sueltosCount, sueltosTotal } = this.breakdown();
    const rows = [];
    if (docenaRow) rows.push(cartRowHtml(`${docenaRow.count} medialunas`, docenaRow.listPrice, docenaRow.price));
    if (sueltosCount > 0) rows.push(cartLooseRowHtml(`+${sueltosCount} suelta${sueltosCount > 1 ? "s" : ""}`, sueltosTotal));
    this.refs.cartRows.innerHTML = rows.join("");
  },

  sendToWhatsApp() {
    const priceStr = formatEUR(this.price());
    const text = `¡Hola! Quiero pedir ${this.state.count} medialunas — ${priceStr} €.`;
    window.open(`https://wa.me/34641514569?text=${encodeURIComponent(text)}`, "_blank", "noreferrer");
    this.close();
  },
};

document.addEventListener("DOMContentLoaded", () => { medialunaSel.init(); });


(function initHeroNews() {
  const news = document.getElementById("hero-news");
  if (!news) return;
  const track = document.getElementById("hero-news-slides");
  const dots  = Array.from(document.querySelectorAll(".hero-news-dot"));
  const total = dots.length;
  let current = 0;
  let timer;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(Number(dot.dataset.dot));
      startTimer();
    });
  });

  // Tap anywhere on the card to advance to next slide (not on CTA links/buttons)
  track.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    goTo(current + 1);
    startTimer();
  });

  startTimer();
})();

(function initPromoModal() {
  const modal = document.getElementById("promo-modal");
  const openBtn = document.getElementById("hero-promo-open");
  const closeBtn = document.getElementById("promo-modal-close");
  const backdrop = document.getElementById("promo-modal-backdrop");
  const menuLink = document.getElementById("promo-modal-menu-link");
  const items = document.querySelectorAll(".promo-modal-item");
  if (!modal || !openBtn) return;

  function open() {
    modal.hidden = false;
    document.body.classList.add("has-promo-modal");
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove("has-promo-modal");
  }

  openBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  menuLink?.addEventListener("click", close);

  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      close();
      const promo = btn.dataset.promo;
      if (promo === "daily") boxSel.open({ ...BOX_CONFIGS.daily, name: "Media docena", extendable: true });
      else if (promo === "meeting") boxSel.open({ ...BOX_CONFIGS.meeting, name: "Docena", extendable: true });
      else if (promo === "medialunas") medialunaSel.open();
    });
  });
})();

(function initMenuGroups() {
  document.querySelectorAll(".menu-group-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      const body = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!isOpen));
      body.hidden = isOpen;
    });
  });
})();

(function initAnchorScroll() {
  // El topbar + nav son sticky y tapan la parte de arriba de la pantalla.
  // El salto nativo del navegador (href="#seccion") no sabe restarle ese
  // espacio, así que la sección queda escondida detrás. Acá medimos la
  // altura real del header en el momento del click (cambia según el ancho
  // de pantalla) y scrolleamos exactamente hasta que el título de la
  // sección quede visible justo debajo.
  const header = document.querySelector(".site-header");
  const links = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  if (!header || !links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      // Apuntamos al primer elemento de título dentro de la sección (el
      // "kicker" tipo CATERING/OFFICE, o si no hay, el h1/h2), no al
      // contenedor entero: en layouts de dos columnas el título a veces
      // queda centrado verticalmente y no arranca en el borde superior de
      // la sección. El kicker a veces va antes del h2 y a veces después
      // según la sección, así que se usa el que aparezca primero en el DOM.
      const heading = target.querySelector(".kicker, h1, h2") || target;
      const headerBottom = header.getBoundingClientRect().bottom;
      const targetTop = heading.getBoundingClientRect().top + window.scrollY;
      const offset = targetTop - headerBottom - 12;
      window.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
      history.pushState(null, "", `#${id}`);
    });
  });
})();

(function initPromoBanners() {
  const items = Array.from(document.querySelectorAll(".cookie-banner"))
    .map((banner) => ({
      banner,
      inner: banner.querySelector(".cookie-inner"),
      wheel: banner.querySelector(".cookie-wheel"),
      text:  banner.querySelector(".cookie-text"),
      rtl:   banner.dataset.direction === "rtl",
      tl:    null,
      shown: null,
    }))
    .filter((item) => item.inner && item.wheel && item.text);

  if (!items.length || typeof gsap === "undefined") return;

  function syncItem(item, animate) {
    if (!item.tl) return;
    const rect = item.banner.getBoundingClientRect();
    const vh   = window.innerHeight;
    const shouldShow = rect.top < vh;

    if (shouldShow === item.shown) return;
    item.shown = shouldShow;

    if (animate) {
      shouldShow ? item.tl.play() : item.tl.reverse();
    } else {
      item.tl.progress(shouldShow ? 1 : 0);
    }
  }

  function onScroll() {
    items.forEach((item) => syncItem(item, true));
  }

  function setup(item) {
    if (item.tl) item.tl.kill();
    gsap.set([item.wheel, item.text], { clearProps: "all" });
    gsap.set(item.wheel, { yPercent: -50 });

    const dir      = item.rtl ? -1 : 1;
    const travelX  = item.inner.offsetWidth - item.wheel.offsetWidth - 16;
    const duration = Math.max(0.9, travelX / 580);

    item.tl = gsap.timeline({ paused: true });
    item.tl.fromTo(item.wheel,
        { x: 0 },
        { x: dir * travelX, ease: "power1.inOut", duration },
        0
      )
      .fromTo(item.text,
        { opacity: 0 },
        { opacity: 1, ease: "power1.out", duration: duration * 0.5 },
        duration * 0.5
      );

    item.shown = null;
    syncItem(item, false); // sincroniza con la posición actual sin animar (carga inicial / resize)
  }

  items.forEach(setup);

  // El ancho del wheel depende de la imagen ya cargada (width:auto según su propia
  // relación de aspecto). Si todavía no cargó cuando corrió el setup inicial, el
  // travelX queda mal calculado y la animación se pasa de largo. Recalcular apenas
  // cada imagen termine de cargar.
  items.forEach((item) => {
    const img = item.wheel.querySelector("img");
    if (img && !img.complete) {
      const resetup = () => setup(item);
      img.addEventListener("load", resetup, { once: true });
      img.addEventListener("error", resetup, { once: true });
    }
  });

  window.addEventListener("scroll", onScroll, { passive: true });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => items.forEach(setup), 200);
  });
})();

(function initAnalyticsConsent() {
  // Google Analytics solo se carga si el usuario acepta las cookies
  // (RGPD/LSSI). La decisión queda guardada en localStorage para no
  // volver a preguntar en visitas futuras.
  const GA_MEASUREMENT_ID = "G-7QKHPSL7RF";
  const STORAGE_KEY = "uno-de-miga-cookie-consent"; // "accepted" | "rejected"

  const banner = document.getElementById("cookie-consent-banner");
  const acceptBtn = document.getElementById("cookie-consent-accept");
  const rejectBtn = document.getElementById("cookie-consent-reject");
  if (!banner || !acceptBtn || !rejectBtn) return;

  function loadGoogleAnalytics() {
    if (window.gaLoaded) return;
    window.gaLoaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
  }

  let storedChoice;
  try {
    storedChoice = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    storedChoice = null;
  }

  if (storedChoice === "accepted") {
    loadGoogleAnalytics();
  } else if (storedChoice !== "rejected") {
    banner.hidden = false;
  }

  acceptBtn.addEventListener("click", () => {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch (e) { /* noop */ }
    banner.hidden = true;
    loadGoogleAnalytics();
  });

  rejectBtn.addEventListener("click", () => {
    try { localStorage.setItem(STORAGE_KEY, "rejected"); } catch (e) { /* noop */ }
    banner.hidden = true;
  });
})();
