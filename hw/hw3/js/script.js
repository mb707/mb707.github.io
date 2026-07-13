const API_BASE_URL = "https://pokeapi.co/api/v2";
const DEFAULT_SPECIES_COUNT = 1025;
const MAX_HISTORY_ITEMS = 5;
const CACHE_PREFIX = "pokemonResearch:";

const typeThemes = {
  normal: { accent: "#7b7d7d", dark: "#4b4d4d", soft: "#eeeeee" },
  fire: { accent: "#ef6c35", dark: "#a83814", soft: "#fff0e9" },
  water: { accent: "#3f83d8", dark: "#20589e", soft: "#e9f3ff" },
  electric: { accent: "#e4b51b", dark: "#947000", soft: "#fff8d8" },
  grass: { accent: "#52a95a", dark: "#2f7436", soft: "#eaf7eb" },
  ice: { accent: "#51aeb8", dark: "#26717a", soft: "#e9fafc" },
  fighting: { accent: "#bd3e36", dark: "#76231e", soft: "#fae9e7" },
  poison: { accent: "#9556a7", dark: "#60316e", soft: "#f5eaf8" },
  ground: { accent: "#b88745", dark: "#765326", soft: "#f8efe3" },
  flying: { accent: "#728ed1", dark: "#425a98", soft: "#edf1fb" },
  psychic: { accent: "#e9517e", dark: "#a7214b", soft: "#ffeaf0" },
  bug: { accent: "#8d9d25", dark: "#596615", soft: "#f3f6df" },
  rock: { accent: "#9c8b45", dark: "#655826", soft: "#f4f0df" },
  ghost: { accent: "#625b99", dark: "#39335f", soft: "#eeecf8" },
  dragon: { accent: "#6848c9", dark: "#3e278b", soft: "#efebff" },
  dark: { accent: "#5b514d", dark: "#2d2927", soft: "#ece9e8" },
  steel: { accent: "#7b8d9a", dark: "#495761", soft: "#edf1f3" },
  fairy: { accent: "#d46aa5", dark: "#93396c", soft: "#fcebf5" }
};

const form = document.querySelector("#pokemonForm");
const searchInput = document.querySelector("#pokemonSearch");
const randomButton = document.querySelector("#randomButton");
const submitButton = form.querySelector("button[type='submit']");
const messageArea = document.querySelector("#messageArea");
const pokemonResult = document.querySelector("#pokemonResult");
const historySection = document.querySelector("#historySection");
const historyButtons = document.querySelector("#historyButtons");

let speciesCount = DEFAULT_SPECIES_COUNT;
let memoryHistory = [];

form.addEventListener("submit", handleSearch);
randomButton.addEventListener("click", loadRandomPokemon);
historyButtons.addEventListener("click", handleHistoryClick);

initializePage();

/**
 * Loads the current species count and displays saved search history.
 */
async function initializePage() {
  renderHistory();

  try {
    const data = await fetchJson(`${API_BASE_URL}/pokemon-species/?limit=1`);
    speciesCount = data.count;
  } catch (error) {
    console.warn("Could not retrieve the current species count. Using fallback.", error);
  }
}

/**
 * Handles a user-submitted Pokémon name or National Pokédex number.
 * @param {SubmitEvent} event
 */
function handleSearch(event) {
  event.preventDefault();
  const query = normalizeSearchTerm(searchInput.value);

  if (!query) {
    showError("Please enter a Pokémon name or National Pokédex number.");
    searchInput.focus();
    return;
  }

  loadPokemon(query);
}

/**
 * Retrieves and displays a randomly selected Pokémon species.
 */
function loadRandomPokemon() {
  const randomId = Math.floor(Math.random() * speciesCount) + 1;
  searchInput.value = randomId;
  loadPokemon(String(randomId));
}

/**
 * Handles clicks on saved recent-search buttons.
 * @param {MouseEvent} event
 */
function handleHistoryClick(event) {
  const button = event.target.closest("button[data-pokemon]");

  if (!button) {
    return;
  }

  searchInput.value = button.dataset.pokemon;
  loadPokemon(button.dataset.pokemon);
}

/**
 * Fetches a Pokémon profile and its species record from PokéAPI.
 * @param {string} query Pokémon name or ID
 */
async function loadPokemon(query) {
  setLoading(true);
  showLoading(query);

  try {
    const pokemon = await getPokemonData(query);
    const species = await getSpeciesData(pokemon.species.url);

    displayPokemon(pokemon, species);
    saveToHistory(pokemon.name);
    renderHistory();
    searchInput.value = pokemon.name;
  } catch (error) {
    console.error(error);

    if (error.message === "NOT_FOUND") {
      showError(`No Pokémon was found for “${query}.” Check the spelling or try a Pokédex number.`);
    } else {
      showError("The research terminal could not contact PokéAPI. Please check your connection and try again.");
    }
  } finally {
    setLoading(false);
  }
}

/**
 * Gets Pokémon endpoint data, using session storage as a small cache.
 * @param {string} query
 * @returns {Promise<object>}
 */
async function getPokemonData(query) {
  const cacheKey = `${CACHE_PREFIX}pokemon:${query}`;
  const cachedData = readCache(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const data = await fetchJson(`${API_BASE_URL}/pokemon/${encodeURIComponent(query)}`);
  writeCache(cacheKey, data);
  writeCache(`${CACHE_PREFIX}pokemon:${data.name}`, data);
  return data;
}

/**
 * Gets species endpoint data, using session storage as a small cache.
 * @param {string} url
 * @returns {Promise<object>}
 */
async function getSpeciesData(url) {
  const cacheKey = `${CACHE_PREFIX}species:${url}`;
  const cachedData = readCache(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const data = await fetchJson(url);
  writeCache(cacheKey, data);
  return data;
}

/**
 * Fetches JSON and throws a useful error when the request fails.
 * @param {string} url
 * @returns {Promise<object>}
 */
async function fetchJson(url) {
  const response = await fetch(url);

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  return response.json();
}

/**
 * Updates the page with data returned by PokéAPI.
 * @param {object} pokemon
 * @param {object} species
 */
function displayPokemon(pokemon, species) {
  const artwork =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.other?.home?.front_default ||
    pokemon.sprites.front_default;

  const englishGenus = species.genera.find((entry) => entry.language.name === "en");
  const englishFlavor = getEnglishFlavorText(species.flavor_text_entries);
  const primaryType = pokemon.types[0]?.type.name || "normal";

  applyTypeTheme(primaryType);

  document.querySelector("#dexNumber").textContent = `#${String(pokemon.id).padStart(4, "0")}`;
  document.querySelector("#pokemonCategory").textContent = englishGenus?.genus || "Pokémon";
  document.querySelector("#pokemonName").textContent = formatName(pokemon.name);

  const pokemonImage = document.querySelector("#pokemonImage");

  if (artwork) {
    pokemonImage.src = artwork;
    pokemonImage.alt = `Official artwork of ${formatName(pokemon.name)}`;
    pokemonImage.hidden = false;
  } else {
    pokemonImage.removeAttribute("src");
    pokemonImage.alt = "Artwork unavailable";
    pokemonImage.hidden = true;
  }

  document.querySelector("#flavorText").textContent =
    englishFlavor || "No English Pokédex description is available for this Pokémon.";

  document.querySelector("#pokemonHeight").textContent = `${(pokemon.height / 10).toFixed(1)} m`;
  document.querySelector("#pokemonWeight").textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
  document.querySelector("#baseExperience").textContent = pokemon.base_experience ?? "Unknown";
  document.querySelector("#pokemonHabitat").textContent = formatName(species.habitat?.name || "unknown");
  document.querySelector("#pokemonGeneration").textContent = formatGeneration(species.generation.name);
  document.querySelector("#captureRate").textContent = `${species.capture_rate} / 255`;

  displayTypes(pokemon.types);
  displayAbilities(pokemon.abilities);
  displayStats(pokemon.stats);
  displayMoves(pokemon.moves);

  messageArea.hidden = true;
  pokemonResult.hidden = false;
  pokemonResult.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Displays Pokémon type badges.
 * @param {Array} types
 */
function displayTypes(types) {
  const typeBadges = document.querySelector("#typeBadges");
  typeBadges.replaceChildren();

  types.forEach((typeEntry) => {
    const badge = document.createElement("span");
    badge.className = "type-badge";
    badge.textContent = typeEntry.type.name;
    typeBadges.appendChild(badge);
  });
}

/**
 * Displays available and hidden abilities.
 * @param {Array} abilities
 */
function displayAbilities(abilities) {
  const abilityList = document.querySelector("#abilityList");
  abilityList.replaceChildren();

  abilities.forEach((abilityEntry) => {
    const pill = document.createElement("span");
    pill.className = "info-pill";
    pill.textContent = formatName(abilityEntry.ability.name);

    if (abilityEntry.is_hidden) {
      const hiddenLabel = document.createElement("span");
      hiddenLabel.className = "hidden-label";
      hiddenLabel.textContent = " (hidden)";
      pill.appendChild(hiddenLabel);
    }

    abilityList.appendChild(pill);
  });
}

/**
 * Displays all six base statistics as accessible progress bars.
 * @param {Array} stats
 */
function displayStats(stats) {
  const statsList = document.querySelector("#statsList");
  statsList.replaceChildren();

  stats.forEach((statEntry) => {
    const row = document.createElement("div");
    row.className = "stat-row";

    const name = document.createElement("span");
    name.className = "stat-name";
    name.textContent = formatStatName(statEntry.stat.name);

    const value = document.createElement("span");
    value.className = "stat-value";
    value.textContent = statEntry.base_stat;

    const track = document.createElement("div");
    track.className = "stat-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", `${formatStatName(statEntry.stat.name)} base statistic`);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "255");
    track.setAttribute("aria-valuenow", String(statEntry.base_stat));

    const fill = document.createElement("div");
    fill.className = "stat-fill";
    fill.style.width = `${Math.min((statEntry.base_stat / 180) * 100, 100)}%`;

    track.appendChild(fill);
    row.append(name, value, track);
    statsList.appendChild(row);
  });
}

/**
 * Displays a small sample of moves to keep the profile readable.
 * @param {Array} moves
 */
function displayMoves(moves) {
  const movesList = document.querySelector("#movesList");
  movesList.replaceChildren();

  const moveSample = moves.slice(0, 8);

  if (moveSample.length === 0) {
    const message = document.createElement("span");
    message.textContent = "No move data available.";
    movesList.appendChild(message);
    return;
  }

  moveSample.forEach((moveEntry) => {
    const pill = document.createElement("span");
    pill.className = "info-pill";
    pill.textContent = formatName(moveEntry.move.name);
    movesList.appendChild(pill);
  });
}

/**
 * Displays the loading state while fetch requests are active.
 * @param {string} query
 */
function showLoading(query) {
  pokemonResult.hidden = true;
  messageArea.hidden = false;
  messageArea.innerHTML = `
    <div class="loading-card">
      <div class="loading-spinner" aria-hidden="true"></div>
      <h2>Scanning PokéAPI…</h2>
      <p>Retrieving research data for ${escapeHtml(query)}.</p>
    </div>
  `;
}

/**
 * Displays an error message to the user.
 * @param {string} message
 */
function showError(message) {
  pokemonResult.hidden = true;
  messageArea.hidden = false;
  messageArea.innerHTML = `
    <div class="error-card">
      <div class="error-symbol" aria-hidden="true">!</div>
      <h2>Research record unavailable</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

/**
 * Enables or disables controls during a request.
 * @param {boolean} isLoading
 */
function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  randomButton.disabled = isLoading;
  searchInput.disabled = isLoading;
}

/**
 * Changes the interface palette to match the Pokémon's primary type.
 * @param {string} typeName
 */
function applyTypeTheme(typeName) {
  const theme = typeThemes[typeName] || typeThemes.normal;
  const root = document.documentElement;

  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-dark", theme.dark);
  root.style.setProperty("--accent-soft", theme.soft);
}

/**
 * Saves successful searches in localStorage.
 * @param {string} pokemonName
 */
function saveToHistory(pokemonName) {
  const history = getHistory();
  const updatedHistory = [pokemonName, ...history.filter((name) => name !== pokemonName)]
    .slice(0, MAX_HISTORY_ITEMS);

  memoryHistory = updatedHistory;

  try {
    localStorage.setItem("pokemonResearchHistory", JSON.stringify(updatedHistory));
  } catch (error) {
    console.warn("Search history could not be saved. Using temporary memory instead.", error);
  }
}

/**
 * Retrieves the user's recent successful searches.
 * @returns {Array<string>}
 */
function getHistory() {
  try {
    const storedHistory = JSON.parse(localStorage.getItem("pokemonResearchHistory"));

    if (Array.isArray(storedHistory)) {
      memoryHistory = storedHistory;
    }
  } catch (error) {
    console.warn("Search history could not be read. Using temporary memory instead.", error);
  }

  return memoryHistory;
}

/**
 * Renders recent searches as buttons.
 */

function renderHistory() {
  const history = getHistory();
  historyButtons.replaceChildren();
  historySection.hidden = history.length === 0;

  history.forEach((pokemonName) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-button";
    button.dataset.pokemon = pokemonName;
    button.textContent = formatName(pokemonName);
    historyButtons.appendChild(button);
  });
}

/**
 * Returns a clean English Pokédex entry.
 * @param {Array} entries
 * @returns {string}
 */

function getEnglishFlavorText(entries) {
  const preferredVersions = ["scarlet", "violet", "sword", "shield", "ultra-sun", "ultra-moon"];
  const englishEntries = entries.filter((entry) => entry.language.name === "en");

  const preferredEntry = preferredVersions
    .map((version) => englishEntries.find((entry) => entry.version.name === version))
    .find(Boolean);

  const selectedEntry = preferredEntry || englishEntries.at(-1);

  return selectedEntry?.flavor_text.replace(/[\n\f\r]+/g, " ").replace(/\s+/g, " ").trim() || "";
}

/**
 * Normalizes common user-entered Pokémon names for API lookup.
 * @param {string} value
 * @returns {string}
 */

function normalizeSearchTerm(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Converts API names such as "special-attack" into display text.
 * @param {string} value
 * @returns {string}
 */

function formatName(value) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Uses familiar abbreviations for statistic names.
 * @param {string} statName
 * @returns {string}
 */

function formatStatName(statName) {
  const labels = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Attack",
    "special-defense": "Sp. Defense",
    speed: "Speed"
  };

  return labels[statName] || formatName(statName);
}

/**
 * Formats generation names returned as generation-i, generation-ii, etc.
 * @param {string} generationName
 * @returns {string}
 */

function formatGeneration(generationName) {
  return generationName.replace("generation-", "Generation ").toUpperCase();
}

/**
 * Reads a JSON value from session storage.
 * @param {string} key
 * @returns {object|null}
 */

function readCache(key) {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn("Cached data could not be read.", error);
    return null;
  }
}


/**
 * Writes a JSON value to session storage.
 * @param {string} key
 * @param {object} value
 */


function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Data could not be cached.", error);
  }
}

/**
 * Escapes text before inserting it into an HTML template string.
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}
