const MESSAGE_ELEMENT_ID = "message";
const REFRESH_PERIOD_MS = 1000;
const GO_MESSAGE = "Go!"

const queueIntervalSeconds=getQueueInterval() || 360;
const seedOffset = getSeedOffset(queueIntervalSeconds);

window.onload = function() {
  if(!getSeedOffset(queueIntervalSeconds)) { return renderNoSeedError() };

  setInterval(main, REFRESH_PERIOD_MS);
}

function main() {
  const message = getNextMessage();
  setMessage(message);
  
  if(getQueryParam("sound") !== "true") return;

  if(message === GO_MESSAGE) {
    (new Audio("./ffxiv_full_party.mp3")).play(); 
  }
}

function getNextMessage() {
  const now = Math.floor(new Date().getTime() / 1000);
  const timeToQueue = queueIntervalSeconds - ((now + seedOffset) % queueIntervalSeconds) - 1;

  return timeToQueue == 0 ? "Go!" : `${secondsToTimer(timeToQueue)}`;
}

// Converts the seed into a numeric offset that works with the specified queue interval
function getSeedOffset(interval) {
  const seedStr = getQueryParam("seed");
  if(seedStr === null || seedStr === undefined) { return null }

  // Doesn't need to be securely random or anything, just needs to be consistent
  const numericSeedValue = seedStr.split("").reduce((acc, letter) => acc + letter.charCodeAt(0), 0);
  return numericSeedValue % interval;
}

function getQueueInterval() {
  return getQueryParam("interval");
}

function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function setMessage(message) {
  element = document.getElementById(MESSAGE_ELEMENT_ID);
  element.innerText = message;
}

function renderNoSeedError() {
  setMessage("ERROR: No seed value specified.");
}

function secondsToTimer(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600); // Because someone's going to do it.
  const minutes = Math.floor(totalSeconds / 60 % 60);
  const seconds = totalSeconds % 60;

  const includeSet = new Set(["h", "m"]); // Only worry about hours/minutes. Seconds are always included.
  if(hours === 0) { includeSet.delete("h") } // No hours? No problem.
  if(minutes === 0 && hours === 0) { includeSet.delete("m") } // No minutes or hours? We're down to seconds - omit minutes.
  const showFullSeconds = (minutes > 0 || hours > 0) ? true : false

  return [
    (includeSet.has("h") && hours),
    (includeSet.has("m") && (includeSet.has("h") ? minutes.toString().padStart(2, "0") : minutes)),
    showFullSeconds ? seconds.toString().padStart(2, "0") : seconds
  ]
    .filter(x => x) // Strip out falsey values for hours/minutes
    .join(":");
}

