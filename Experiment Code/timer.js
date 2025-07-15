// Credit: Mateusz Rybczonec
let timerInterval = null;

function resetCountdown(){
  // hide app
  clearInterval(timerInterval);
  const timerEl = document.getElementById("timer-box");
  if (timerEl) {
    timerEl.innerHTML = "";
  }
}

function countDown(duration){
const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 30;
const ALERT_THRESHOLD = 10;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

let timePassed = 0;
let endCalled = 0;
let timeLeft = Math.ceil(duration/1000);
let remainingPathColor = COLOR_CODES.info.color;

const timerEl = document.getElementById("timer-box");

timerEl.innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
  )}</span>
</div>
`;

startTimer();

function onTimesUp() {
  clearInterval(timerInterval);
  endCalled = 1;
  timePassed = 0;
  timeLeft = Math.ceil(duration/1000) - timePassed;
  jsPsych.finishTrial();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = Math.ceil(duration/1000) - timePassed;
    document.getElementById("base-timer-label").innerHTML = formatTime(
      timeLeft
    );
    setCircleDasharray();
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
      clearInterval(timerInterval);
      jsPsych.finishTrial();
    }
  }, 1000);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;
  return `${minutes}:${seconds < 10 ? "0": ""}${seconds}`;
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  const path = document.getElementById("base-timer-path-remaining");
  if (timeLeft <= alert.threshold) {
      path.classList.remove(warning.color);
      path.classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
      path.classList.remove(info.color);
      path.classList.add(warning.color);
  }
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / Math.ceil(duration / 1000);
  return rawTimeFraction - (1 / Math.ceil(duration / 1000)) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}
}