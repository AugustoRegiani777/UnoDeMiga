require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");
const { createClient } = require("redis");
const path = require("path");
const fs = require("fs/promises");

const app = express();
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL;
const REDIS_KEY_PREFIX = String(process.env.REDIS_KEY_PREFIX || "").trim();
const ALLOW_TEST_DATA_RESET = process.env.ALLOW_TEST_DATA_RESET === "true";
const PARTICIPANTS_KEY = "participantes:votacion";
const ANONYMOUS_PARTICIPANTS_KEY = "participantes-anonimos:votacion";
const WEEKLY_FLAVORS_FILE = path.join(__dirname, "weekly-flavors.json");

const client = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => (retries < 3 ? 500 : false),
    connectTimeout: 3000,
  },
});

client.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

function normalizePhone(phone) {
  return String(phone).replace(/[^\d+]/g, "").trim();
}

function normalizeFlavorName(flavor) {
  return String(flavor).trim().toLowerCase();
}

function getWeekInfo(date = new Date()) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
  const week = String(weekNumber).padStart(2, "0");
  const year = utcDate.getUTCFullYear();

  return {
    weekId: `${year}-W${week}`,
    year,
    week,
  };
}

function getVotesKey(weekId) {
  return withPrefix(`votos:nuevos-sabores:${weekId}`);
}

function getVoterRegistryKey(weekId) {
  return withPrefix(`votantes:nuevos-sabores:${weekId}`);
}

function withPrefix(key) {
  return REDIS_KEY_PREFIX ? `${REDIS_KEY_PREFIX}${key}` : key;
}

function getParticipantKey(phone) {
  return withPrefix(`${PARTICIPANTS_KEY}:${phone}`);
}

function getAnonymousParticipantKey(clientId) {
  return withPrefix(`${ANONYMOUS_PARTICIPANTS_KEY}:${clientId}`);
}

function getTestKeyPattern() {
  return REDIS_KEY_PREFIX ? `${REDIS_KEY_PREFIX}*` : null;
}

function buildVoterIdentifiers({ telefono, clientId, aceptaPromos }) {
  const identifiers = [];

  if (aceptaPromos && telefono) {
    identifiers.push(`phone:${normalizePhone(telefono)}`);
  }

  if (!aceptaPromos && clientId) {
    identifiers.push(`anon:${String(clientId).trim()}`);
  }

  return [...new Set(identifiers.filter(Boolean))];
}

async function findPreviousVote(voterRegistryKey, identifiers) {
  for (const identifier of identifiers) {
    const vote = await client.hGet(voterRegistryKey, identifier);

    if (vote) {
      return { identifier, vote };
    }
  }

  return null;
}

async function readWeeklyFlavorsConfig() {
  const rawFile = await fs.readFile(WEEKLY_FLAVORS_FILE, "utf8");
  const parsed = JSON.parse(rawFile);

  if (!parsed || !Array.isArray(parsed.flavors) || !parsed.flavors.length) {
    throw new Error("weekly-flavors.json debe incluir un array 'flavors' con al menos un sabor.");
  }

  const flavors = parsed.flavors
    .map((flavor) => ({
      id: normalizeFlavorName(flavor.id || flavor.name),
      name: String(flavor.name || "").trim(),
    }))
    .filter((flavor) => flavor.id && flavor.name);

  if (!flavors.length) {
    throw new Error("weekly-flavors.json no tiene sabores válidos.");
  }

  return {
    title: parsed.title || "Vota el próximo sabor",
    description:
      parsed.description ||
      "Elige el sabor que debería entrar al menú esta semana.",
    weekLabel: parsed.weekLabel || "Semana actual",
    flavors,
  };
}

async function getCurrentVotingConfig() {
  const weekInfo = getWeekInfo();
  const config = await readWeeklyFlavorsConfig();

  return {
    ...config,
    weekId: weekInfo.weekId,
    year: weekInfo.year,
    week: weekInfo.week,
  };
}

function validateParticipantData(body, allowedFlavorIds) {
  const { sabor, nombre, barrio, telefono, fechaNacimiento, aceptaPromos, clientId } = body;

  if (!sabor || typeof sabor !== "string" || !sabor.trim()) {
    return 'Debes enviar un campo "sabor" de tipo texto.';
  }

  const normalizedFlavor = normalizeFlavorName(sabor);

  if (!allowedFlavorIds.includes(normalizedFlavor)) {
    return "Ese sabor no esta habilitado en la votacion de esta semana.";
  }

  if (typeof aceptaPromos !== "boolean") {
    return 'Debes enviar un campo "aceptaPromos" de tipo booleano.';
  }

  if (aceptaPromos === false) {
    if (!clientId || typeof clientId !== "string" || !clientId.trim()) {
      return 'Debes enviar un campo "clientId" para votos anónimos.';
    }

    return null;
  }

  if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
    return 'Debes enviar un campo "nombre" de tipo texto.';
  }

  if (!barrio || typeof barrio !== "string" || !barrio.trim()) {
    return 'Debes enviar un campo "barrio" de tipo texto.';
  }

  if (!telefono || typeof telefono !== "string") {
    return 'Debes enviar un campo "telefono" de tipo texto.';
  }

  if (!fechaNacimiento || typeof fechaNacimiento !== "string") {
    return 'Debes enviar un campo "fechaNacimiento" de tipo texto.';
  }

  const telefonoNormalizado = normalizePhone(telefono);

  if (!/^\+?[0-9]{8,15}$/.test(telefonoNormalizado)) {
    return "El telefono no tiene un formato valido.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento.trim())) {
    return "La fecha de nacimiento debe estar en formato YYYY-MM-DD.";
  }

  return null;
}

function validateRegistrationData(body) {
  const { nombre, barrio, telefono, fechaNacimiento, aceptaPromos } = body;

  if (aceptaPromos !== true) {
    return "Debes aceptar promos para completar el registro.";
  }

  if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
    return 'Debes enviar un campo "nombre" de tipo texto.';
  }

  if (!barrio || typeof barrio !== "string" || !barrio.trim()) {
    return 'Debes enviar un campo "barrio" de tipo texto.';
  }

  if (!telefono || typeof telefono !== "string") {
    return 'Debes enviar un campo "telefono" de tipo texto.';
  }

  if (!fechaNacimiento || typeof fechaNacimiento !== "string") {
    return 'Debes enviar un campo "fechaNacimiento" de tipo texto.';
  }

  const telefonoNormalizado = normalizePhone(telefono);

  if (!/^\+?[0-9]{8,15}$/.test(telefonoNormalizado)) {
    return "El telefono no tiene un formato valido.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento.trim())) {
    return "La fecha de nacimiento debe estar en formato YYYY-MM-DD.";
  }

  return null;
}

async function saveParticipantProfile({ nombre, barrio, telefono, fechaNacimiento, aceptaPromos, clientId, weekId, flavor }) {
  if (aceptaPromos === false) {
    await client.hSet(getAnonymousParticipantKey(clientId), {
      clientId: clientId.trim(),
      aceptaPromos: "false",
      origen: "votacion-web",
      lastVoteWeek: weekId,
      lastVoteFlavor: flavor,
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  const telefonoNormalizado = normalizePhone(telefono);

  await client.hSet(getParticipantKey(telefonoNormalizado), {
    nombre: nombre.trim(),
    barrio: barrio.trim(),
    telefono: telefonoNormalizado,
    fechaNacimiento: fechaNacimiento.trim(),
    aceptaPromos: String(aceptaPromos),
    origen: "votacion-web",
    lastVoteWeek: weekId,
    lastVoteFlavor: flavor,
    updatedAt: new Date().toISOString(),
  });
}

async function saveRegisteredParticipantProfile({ nombre, barrio, telefono, fechaNacimiento }) {
  const telefonoNormalizado = normalizePhone(telefono);

  await client.hSet(getParticipantKey(telefonoNormalizado), {
    nombre: nombre.trim(),
    barrio: barrio.trim(),
    telefono: telefonoNormalizado,
    fechaNacimiento: fechaNacimiento.trim(),
    aceptaPromos: "true",
    origen: "votacion-web",
    updatedAt: new Date().toISOString(),
  });
}

async function buildVoteResults(config, weekId) {
  const storedVotes = await client.hGetAll(getVotesKey(weekId));

  return config.flavors.reduce((accumulator, flavor) => {
    accumulator[flavor.id] = Number(storedVotes[flavor.id] || 0);
    return accumulator;
  }, {});
}

async function deleteKeysByPattern(pattern) {
  let cursor = "0";
  let deletedCount = 0;

  do {
    const result = await client.scan(cursor, {
      MATCH: pattern,
      COUNT: 100,
    });

    cursor = result.cursor;
    const keys = result.keys || [];

    if (keys.length) {
      deletedCount += await client.del(keys);
    }
  } while (cursor !== "0");

  return deletedCount;
}

app.get("/api/config-votacion", async (_req, res) => {
  try {
    const config = await getCurrentVotingConfig();
    const results = await buildVoteResults(config, config.weekId);

    res.json({
      title: config.title,
      description: config.description,
      weekLabel: config.weekLabel,
      weekId: config.weekId,
      flavors: config.flavors,
      votes: results,
    });
  } catch (error) {
    console.error("Error al leer la configuracion de votacion:", error);
    res.status(500).json({
      error: "No se pudo cargar la configuracion de votacion.",
    });
  }
});

app.get("/api/nuevos-sabores", async (_req, res) => {
  try {
    const config = await getCurrentVotingConfig();
    const resultados = await buildVoteResults(config, config.weekId);
    res.json(resultados);
  } catch (error) {
    console.error("Error al leer votos de nuevos sabores:", error);
    res.status(500).json({
      error: "No se pudieron leer los votos de nuevos sabores.",
    });
  }
});

app.get("/api/vote-status", async (req, res) => {
  try {
    const config = await getCurrentVotingConfig();
    const hasAcceptedProfile = Boolean(req.query.telefono);
    const previousVote = await findPreviousVote(
      getVoterRegistryKey(config.weekId),
      buildVoterIdentifiers({
        telefono: req.query.telefono,
        clientId: req.query.clientId,
        aceptaPromos: hasAcceptedProfile,
      }),
    );

    res.json({
      alreadyVoted: Boolean(previousVote),
      weekId: config.weekId,
      sabor: previousVote?.vote || null,
      matchedBy: previousVote?.identifier || null,
    });
  } catch (error) {
    console.error("Error al comprobar estado de voto:", error);
    res.status(500).json({
      error: "No se pudo comprobar si el usuario ya voto.",
    });
  }
});

app.post("/api/registro-votacion", async (req, res) => {
  try {
    const validationError = validateRegistrationData(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const { nombre, barrio, telefono, fechaNacimiento } = req.body;

    await saveRegisteredParticipantProfile({
      nombre,
      barrio,
      telefono,
      fechaNacimiento,
    });

    res.status(201).json({
      message: "Registro guardado",
      telefono: normalizePhone(telefono),
    });
  } catch (error) {
    console.error("Error al guardar registro de votacion:", error);
    res.status(500).json({
      error: "No se pudo guardar el registro de votacion.",
    });
  }
});

app.post("/api/nuevos-sabores", async (req, res) => {
  try {
    const config = await getCurrentVotingConfig();
    const allowedFlavorIds = config.flavors.map((flavor) => flavor.id);
    const validationError = validateParticipantData(req.body, allowedFlavorIds);

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const { sabor, nombre, barrio, telefono, fechaNacimiento, aceptaPromos, clientId } = req.body;
    const saborNormalizado = normalizeFlavorName(sabor);
    const weekId = config.weekId;
    const voterRegistryKey = getVoterRegistryKey(weekId);
    const voterIdentifiers = buildVoterIdentifiers({
      telefono,
      clientId,
      aceptaPromos,
    });
    const previousVote = await findPreviousVote(voterRegistryKey, voterIdentifiers);

    if (previousVote) {
      return res.status(409).json({
        error: "Este usuario ya voto esta semana.",
        alreadyVoted: true,
        weekId,
        sabor: previousVote.vote,
        matchedBy: previousVote.identifier,
      });
    }

    await saveParticipantProfile({
      nombre,
      barrio,
      telefono,
      fechaNacimiento,
      aceptaPromos,
      clientId,
      weekId,
      flavor: saborNormalizado,
    });

    const multi = client.multi();
    voterIdentifiers.forEach((identifier) => {
      multi.hSet(voterRegistryKey, identifier, saborNormalizado);
    });
    multi.hIncrBy(getVotesKey(weekId), saborNormalizado, 1);
    const [, nuevoConteo] = await multi.exec();

    res.status(201).json({
      mensaje: "Voto registrado",
      sabor: saborNormalizado,
      total: Number(nuevoConteo),
      weekId,
      alreadyVoted: false,
    });
  } catch (error) {
    console.error("Error al guardar voto de nuevo sabor:", error);
    res.status(500).json({
      error: "No se pudo registrar el voto de nuevo sabor.",
    });
  }
});

app.post("/api/test/reset", async (_req, res) => {
  try {
    if (!ALLOW_TEST_DATA_RESET) {
      return res.status(403).json({
        error: "La limpieza de datos de prueba no esta habilitada.",
      });
    }

    const pattern = getTestKeyPattern();

    if (!pattern) {
      return res.status(400).json({
        error: "Configura REDIS_KEY_PREFIX antes de limpiar datos de prueba.",
      });
    }

    const deletedKeys = await deleteKeysByPattern(pattern);

    res.json({
      message: "Datos de prueba eliminados.",
      deletedKeys,
      pattern,
    });
  } catch (error) {
    console.error("Error al limpiar datos de prueba:", error);
    res.status(500).json({
      error: "No se pudieron limpiar los datos de prueba.",
    });
  }
});

async function startServer() {
  if (REDIS_URL) {
    try {
      await client.connect();
      console.log("Conectado a Redis.");
      console.log(`Prefijo Redis activo: ${REDIS_KEY_PREFIX || "(sin prefijo)"}`);
    } catch (error) {
      console.warn("Redis no disponible — el sitio corre sin funciones de votación.", error.message);
    }
  } else {
    console.warn("REDIS_URL no configurada — el sitio corre sin funciones de votación.");
  }

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

startServer();
