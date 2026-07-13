console.log("script.js connected");
document.querySelector("#zip").addEventListener("change", displayCity);
document.querySelector("#state").addEventListener("change", displayCounties);
document.querySelector("#username").addEventListener("change", checkUsername);
document.querySelector("#password").addEventListener("click", suggestPassword);
document.querySelector("#signupForm").addEventListener("submit", validateForm);

loadStates();

/**
 * Retrieve city, latitude, and longitude using a ZIP code.
 */
async function displayCity() {
  const zipCode = document.querySelector("#zip").value.trim();

  const zipError = document.querySelector("#zipError");
  const city = document.querySelector("#city");
  const latitude = document.querySelector("#latitude");
  const longitude = document.querySelector("#longitude");

  zipError.textContent = "";
  city.textContent = "";
  latitude.textContent = "";
  longitude.textContent = "";

  try {
    const url =
      `https://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data === false) {
      zipError.textContent = "Zip code not found";
      zipError.style.color = "red";
      return;
    }

    city.textContent = data.city;
    latitude.textContent = data.latitude;
    longitude.textContent = data.longitude;
  } catch (error) {
    zipError.textContent = "Unable to retrieve ZIP code information";
    zipError.style.color = "red";
    console.error(error);
  }
}

/**
 * Load every US state into the state dropdown.
 */
async function loadStates() {
  const stateMenu = document.querySelector("#state");

  stateMenu.textContent = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select One";
  stateMenu.appendChild(defaultOption);

  try {
    const url = "https://csumb.space/api/allStatesAPI.php";
    const response = await fetch(url);
    const data = await response.json();

    for (const item of data) {
      const option = document.createElement("option");

      option.value = item.usps;
      option.textContent = item.state;

      stateMenu.appendChild(option);
    }
  } catch (error) {
    console.error(error);

    stateMenu.textContent = "";

    const errorOption = document.createElement("option");
    errorOption.value = "";
    errorOption.textContent = "Unable to load states";

    stateMenu.appendChild(errorOption);
  }
}

/**
 * Loads counties after the usre selects a state.
 */
async function displayCounties() {
  const state = document.querySelector("#state").value;
  const countyMenu = document.querySelector("#county");

  countyMenu.textContent = "";

  if (state === "") {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Select a state first";
    countyMenu.appendChild(option);
    return;
  }

  try {
    const url =
      `https://csumb.space/api/countyListAPI.php?state=${state}`;

    const response = await fetch(url);
    const data = await response.json();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select One";
    countyMenu.appendChild(defaultOption);

    for (const item of data) {
      const option = document.createElement("option");

      option.value = item.county;
      option.textContent = item.county;

      countyMenu.appendChild(option);
    }
  } catch (error) {
    console.error(error);

    const errorOption = document.createElement("option");
    errorOption.value = "";
    errorOption.textContent = "Unable to load counties";
    countyMenu.appendChild(errorOption);
  }
}

/**
 * Checks whether the username is available.
 *
 * @returns {Promise<boolean>} True when available, otherwise false.
 */
async function checkUsername() {
  const username = document.querySelector("#username").value.trim();
  const usernameError = document.querySelector("#usernameError");

  usernameError.textContent = "";

  if (username.length === 0) {
    usernameError.textContent = "Username required";
    usernameError.style.color = "red";
    return false;
  }

  try {
    const url =
      `https://csumb.space/api/usernamesAPI.php?username=${encodeURIComponent(username)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Username API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.available) {
      usernameError.textContent = "Username available!";
      usernameError.style.color = "green";
      return true;
    }

    usernameError.textContent = "Username taken";
    usernameError.style.color = "red";
    return false;
  } catch (error) {
    usernameError.textContent = "Unable to check username";
    usernameError.style.color = "red";

    console.error(error);
    return false;
  }
}

/**
 * Retrieves and displays an eight character suggested password.
 */
async function suggestPassword() {
  const suggestedPassword = document.querySelector("#suggestedPassword");

  suggestedPassword.textContent = "Generating suggested password...";

  try {
    const url =
      "https://csumb.space/api/suggestedPassword.php?length=8";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Password API error: ${response.status}`);
    }

    const data = await response.json();

    /*
     * This supports either:
     * { "password": "example" }
     * or a direct JSON string.
     */
    const passwordSuggestion =
      typeof data === "string" ? data : data.password;

    suggestedPassword.textContent =
      `Suggested password: ${passwordSuggestion}`;
  } catch (error) {
    suggestedPassword.textContent =
      "Unable to generate a suggested password";

    console.error(error);
  }
}

/**
 * Validates the username and passwords before submission.
 */
async function validateForm(event) {
  event.preventDefault();

  let isValid = true;

  const password = document.querySelector("#password").value;
  const passwordAgain =
    document.querySelector("#passwordAgain").value;

  const passwordError =
    document.querySelector("#passwordError");

  passwordError.textContent = "";

  // Validate the username using the external API.
  const usernameAvailable = await checkUsername();

  if (usernameAvailable === false) {
    isValid = false;
  }

  // Password must contain at least six characters.
  if (password.length < 6) {
    passwordError.textContent =
      "Password must contain at least 6 characters";

    passwordError.style.color = "red";
    isValid = false;
  } else if (password !== passwordAgain) {
    // Password and confirmation must match.
    passwordError.textContent =
      "Passwords do not match";

    passwordError.style.color = "red";
    isValid = false;
  } else {
    passwordError.textContent = "Passwords match";
    passwordError.style.color = "green";
  }

  // Submit manually only after all validation passes.
  if (isValid) {
    document.querySelector("#signupForm").submit();
  }
}