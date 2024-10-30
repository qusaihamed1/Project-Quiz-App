async function fetchQuestions(category, numQuestions) {
  try {
    const response = await fetch(`https://the-trivia-api.com/v2/questions?categories=${category}&limit=${numQuestions}&region=US`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data || data.length === 0) {
      console.log("No questions found in the response.");
      return [];
    }
    return data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return []; 
  }
}

const categories = {
  "General Knowledge": "general_knowledge",
  "Science & Nature": "science",
  Sports: "sport",
  History: "history",
  Geography: "geography",
  Technology: "technology",
};

const loadQuestions = async (key) => {
  const category = categories[key];
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = "Loading questions...";
  try {
    const questions = await fetchQuestions(category, 10);
    quizDiv.innerHTML = "";
    if (questions && questions.length > 0) {
      localStorage.setItem("questions", JSON.stringify(questions));
      localStorage.setItem("category", key);
      window.location.href = "Questions.html";
    } else {
      quizDiv.innerHTML = "No questions available.";
    }
  } catch (error) {
    quizDiv.innerHTML = "Error fetching questions.";
    console.error("Error fetching questions:", error);
  } 
};

const questionsCont = document.getElementById("questions-Cont");
const categoryName = document.getElementById("categoryName");
const numofQuestions = document.getElementById("numofQuestions");
let index = 0;
let numberofcorrect = 0; 
const userAnswers = [];

function displayQuestions() {
  const questions = JSON.parse(localStorage.getItem("questions"));
  const category = localStorage.getItem("category");
  categoryName.innerHTML = `${category} Quiz`;
  numofQuestions.innerHTML = `Question ${index + 1} / 10`;

  if (questions && index < questions.length) {
    const questionsHtml = `
      <h3>${index + 1}. ${questions[index].question.text}</h3>
      ${[...questions[index].incorrectAnswers, questions[index].correctAnswer]
        .sort(() => Math.random() - 0.5)
        .map((option) => `
          <div>
            <label>
              <input type="radio" name="question-${index}" value="${option.replace(/'/g, "&apos;")}" 
                onclick="checkAnswer('${option.replace(/'/g, "\\'")}', '${questions[index].correctAnswer.replace(/'/g, "\\'")}', ${index})">
              ${option}
              <span id="icon-${index}-${option.replace(/ /g, '').replace(/'/g, "")}" style="float: right;"></span>
            </label>
          </div>
        `).join("")}
      ${index < 9 ? `<button id="nextbtn" onclick="nextQuestion()">Next</button>` : `<button id="nextbtn" onclick="endQuiz()">Submit</button>`}
    `;

    questionsCont.innerHTML = questionsHtml;
  } else {
    questionsCont.innerHTML = "No questions available.";
  }
}


const checkAnswer = (option, correct, questionIndex) => {
  userAnswers[questionIndex] = option;
console.log(correct);
const inputs = document.getElementsByName(`question-${questionIndex}`);
inputs.forEach((input) => {
  input.disabled = true;
  const parentLabel = input.parentElement;
  const iconSpan = document.getElementById(`icon-${questionIndex}-${input.value.replace(/ /g, '').replace(/'/g, "")}`);
  
  if (iconSpan) {
    iconSpan.innerHTML = "";
  }

  if (input.value.trim() === correct) {
    parentLabel.classList.add("correct-answer");
    if (iconSpan) {
      iconSpan.innerHTML = `&#10004;`; 
      iconSpan.style.color = "green";
    }
  } else if (input.value.trim() === option) {
    parentLabel.classList.add("incorrect-answer");
    if (iconSpan) {
      iconSpan.innerHTML = `&#x274c;`; 
      iconSpan.style.color = "red";
    }
  }
});


  if (option === correct) {
    numberofcorrect++;
  }

  localStorage.setItem("numcorrect", numberofcorrect);
};

if (window.location.pathname.includes("Questions.html")) {
  displayQuestions();
}

const nextQuestion = () => {
  index++;
  displayQuestions();
};

let timer; 
const clearTimer = () => {
  clearInterval(timer);
};

function endQuiz() {
  clearTimer(); 
  localStorage.setItem("numberOfCorrectAnswers", numberofcorrect);
  localStorage.removeItem("questions");
  localStorage.removeItem("category");
  window.location.replace("Result.html");
}

if (window.location.pathname.includes("Result.html")) {
  const resultElement = document.getElementById("result");
  const numberOfCorrectAnswers = localStorage.getItem("numberOfCorrectAnswers");
  
  if (numberOfCorrectAnswers !== null) {
    resultElement.innerHTML = `${numberOfCorrectAnswers} / 10`;

    const passed = numberOfCorrectAnswers >= 5;
    const successMessage = passed ? "Success! You passed the quiz." : "Fail! Better luck next time.";
    const emoji = passed ? `<p>&#129395;</p>` : `<p>&#128577;</p>`;
    
    const messageElement = document.createElement("p");
    messageElement.innerHTML = `${successMessage} ${emoji}`;
    messageElement.style.fontSize = "15px";
    messageElement.style.color = passed ? "green" : "red";
    
    document.querySelector(".result-cont").appendChild(messageElement);
  } else {
    window.location.href = "index.html";
  }
  
  localStorage.removeItem("numberOfCorrectAnswers");
  localStorage.removeItem("questions");
  localStorage.removeItem("category");
}

const backtohome = () => {
  window.location.href = "index.html";
};

if (window.location.pathname.includes("Questions.html")) {
  const timerElement = document.getElementById("timer");
  let totalTime = 600;
  timer = setInterval(() => {
    totalTime--;
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    timerElement.textContent = `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
    if (totalTime <= 0) {
      clearTimer(); 
      endQuiz();
    }
  }, 1000);
}
