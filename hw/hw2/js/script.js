let score = 0;

let attempts = localStorage.getItem("total_attempts");

if (attempts === null) {
  attempts = 0;
} else {
  attempts = Number(attempts);
}

document.querySelector("#totalAttempts").textContent = `Total Times Quiz Taken: ${attempts}`;

displayQ4Choices();
displayQ9Choices();

document.querySelector("button").addEventListener("click", gradeQuiz);

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));

    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function displayQ4Choices() {
  let q4ChoicesArray = ["Maine", "Rhode Island", "Maryland", "Delaware"];
  shuffleArray(q4ChoicesArray);

  let choicesContainer = document.querySelector("#q4Choices");
  choicesContainer.textContent = "";

  for (let choice of q4ChoicesArray) {
    let cleanId = choice.replaceAll(" ", "");

    let div = document.createElement("div");
    div.className = "form-check form-check-inline";

    let input = document.createElement("input");
    input.type = "radio";
    input.name = "q4";
    input.id = `q4${cleanId}`;
    input.value = choice;
    input.className = "form-check-input";

    let label = document.createElement("label");
    label.htmlFor = `q4${cleanId}`;
    label.textContent = choice;
    label.className = "form-check-label";

    div.appendChild(input);
    div.appendChild(label);
    choicesContainer.appendChild(div);
  }
}

function displayQ9Choices() {
  let q9ChoicesArray = ["Northeast", "Southwest", "Midwest", "Pacific Northwest"];
  shuffleArray(q9ChoicesArray);

  let choicesContainer = document.querySelector("#q9Choices");
  choicesContainer.textContent = "";

  for (let choice of q9ChoicesArray) {
    let cleanId = choice.replaceAll(" ", "");

    let div = document.createElement("div");
    div.className = "form-check form-check-inline";

    let input = document.createElement("input");
    input.type = "radio";
    input.name = "q9";
    input.id = `q9${cleanId}`;
    input.value = choice;
    input.className = "form-check-input";

    let label = document.createElement("label");
    label.htmlFor = `q9${cleanId}`;
    label.textContent = choice;
    label.className = "form-check-label";

    div.appendChild(input);
    div.appendChild(label);
    choicesContainer.appendChild(div);
  }
}

function normalizeAnswer(answer) {
  return answer.trim().toLowerCase();
}

function setMarkImage(index, imageName, altText) {
  let markContainer = document.querySelector(`#markImg${index}`);
  markContainer.textContent = "";

  let img = document.createElement("img");
  img.src = `img/${imageName}`;
  img.alt = altText;
  img.className = "mark-img";

  markContainer.appendChild(img);
}

function rightAnswer(index) {
  let feedback = document.querySelector(`#q${index}Feedback`);
  feedback.textContent = "Correct!";
  feedback.className = "feedbackBox mt-2 bg-success text-white rounded";

  setMarkImage(index, "checkmark.png", "Checkmark");
  score += 10;
}

function wrongAnswer(index) {
  let feedback = document.querySelector(`#q${index}Feedback`);
  feedback.textContent = "Incorrect!";
  feedback.className = "feedbackBox mt-2 bg-warning text-dark rounded";

  setMarkImage(index, "xmark.png", "X mark");
}

function clearFeedback() {
  for (let i = 1; i <= 10; i++) {
    document.querySelector(`#q${i}Feedback`).textContent = "";
    document.querySelector(`#q${i}Feedback`).className = "feedbackBox mt-2";
    document.querySelector(`#markImg${i}`).textContent = "";
  }

  document.querySelector("#totalScore").textContent = "";
  document.querySelector("#congratsMessage").textContent = "";
}

function isFormValid() {
  let isValid = true;
  let missingQuestions = [];

  if (document.querySelector("#q1").value.trim() === "") {
    isValid = false;
    missingQuestions.push("Question 1");
  }

  if (document.querySelector("#q2").value === "") {
    isValid = false;
    missingQuestions.push("Question 2");
  }

  if (document.querySelector("input[name=q3]:checked") === null) {
    isValid = false;
    missingQuestions.push("Question 3");
  }

  if (document.querySelector("input[name=q4]:checked") === null) {
    isValid = false;
    missingQuestions.push("Question 4");
  }

  if (document.querySelector("#q5").value.trim() === "") {
    isValid = false;
    missingQuestions.push("Question 5");
  }

  if (document.querySelector("#q6").value === "") {
    isValid = false;
    missingQuestions.push("Question 6");
  }

  if (document.querySelector("input[name=q7]:checked") === null) {
    isValid = false;
    missingQuestions.push("Question 7");
  }

  if (document.querySelector("input[name=q8]:checked") === null) {
    isValid = false;
    missingQuestions.push("Question 8");
  }

  if (document.querySelector("input[name=q9]:checked") === null) {
    isValid = false;
    missingQuestions.push("Question 9");
  }

  if (document.querySelector("#q10").value.trim() === "") {
    isValid = false;
    missingQuestions.push("Question 10");
  }

  if (!isValid) {
    document.querySelector("#validationFdbk").textContent =
      `Please answer: ${missingQuestions.join(", ")}`;
  }

  return isValid;
}

function gradeQuiz() {
  document.querySelector("#validationFdbk").textContent = "";
  clearFeedback();

  if (!isFormValid()) {
    return;
  }

  score = 0;

  let q1Response = normalizeAnswer(document.querySelector("#q1").value);
  let q2Response = document.querySelector("#q2").value;

  if (q1Response === "sacramento") {
    rightAnswer(1);
  } else {
    wrongAnswer(1);
  }

  if (q2Response === "mo") {
    rightAnswer(2);
  } else {
    wrongAnswer(2);
  }

  if (
    document.querySelector("#q3Washington").checked &&
    document.querySelector("#q3Jefferson").checked &&
    document.querySelector("#q3Roosevelt").checked &&
    document.querySelector("#q3Lincoln").checked &&
    !document.querySelector("#q3Jackson").checked
  ) {
    rightAnswer(3);
  } else {
    wrongAnswer(3);
  }

  let selectedQ4 = document.querySelector("input[name=q4]:checked");

  if (selectedQ4 !== null && selectedQ4.value === "Rhode Island") {
    rightAnswer(4);
  } else {
    wrongAnswer(4);
  }

  let q5Response = normalizeAnswer(document.querySelector("#q5").value);

  if (q5Response === "arizona") {
    rightAnswer(5);
  } else {
    wrongAnswer(5);
  }

  let q6Response = document.querySelector("#q6").value;

  if (q6Response === "FL") {
    rightAnswer(6);
  } else {
    wrongAnswer(6);
  }

  let selectedQ7 = document.querySelector("input[name=q7]:checked");

  if (selectedQ7 !== null && selectedQ7.value === "Lake Michigan") {
    rightAnswer(7);
  } else {
    wrongAnswer(7);
  }

  if (
    document.querySelector("#q8California").checked &&
    document.querySelector("#q8Oregon").checked &&
    document.querySelector("#q8Washington").checked &&
    !document.querySelector("#q8Nevada").checked &&
    !document.querySelector("#q8Arizona").checked
  ) {
    rightAnswer(8);
  } else {
    wrongAnswer(8);
  }

  let selectedQ9 = document.querySelector("input[name=q9]:checked");

  if (selectedQ9 !== null && selectedQ9.value === "Southwest") {
    rightAnswer(9);
  } else {
    wrongAnswer(9);
  }

  let q10Response = normalizeAnswer(document.querySelector("#q10").value);

  if (q10Response === "austin") {
    rightAnswer(10);
  } else {
    wrongAnswer(10);
  }

  let totalScore = document.querySelector("#totalScore");
  totalScore.textContent = `Total Score: ${score} / 100`;

  if (score < 80) {
    totalScore.className = "text-center mt-4 text-danger";
  } else {
    totalScore.className = "text-center mt-4 text-success";
  }

  if (score > 80) {
    document.querySelector("#congratsMessage").textContent =
      "Congratulations! You scored above 80 points!";
  }

  attempts++;
  document.querySelector("#totalAttempts").textContent =
    `Total Times Quiz Taken: ${attempts}`;

  localStorage.setItem("total_attempts", attempts);
}