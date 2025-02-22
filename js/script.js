document.addEventListener('DOMContentLoaded', function() {
  console.log('Document ready');

  // Add reset functionality
  document.querySelector('button[name="reset"]').addEventListener('click', function() {
    const form = document.getElementById('assessment-form');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    
    scores.risk = 0;
    scores.likelihood = 0;
    scores.impact = 0;
    
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    
    renderScores();
  });

  // Function to parse URL parameters
  function getUrlParams() {
      const params = new URLSearchParams(window.location.search);
      const selections = params.get('q');
      if (!selections) return null;
      return parseInt(selections, 10);
  }

  // Function to set URL with current selections
  function updateUrl(binaryString) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', binaryString.toString());
      window.history.replaceState({}, '', url);
  }

// Sample data
const questions = [
  { id: 1, text: 'The attack can be completed with common skills' },
  { id: 2, text: 'The attack can be completed without significant resources' },
  { id: 3, text: 'The asset is undefended' },
  { id: 4, text: 'There are known weaknesses in the current defences' },
  { id: 5, text: 'The vulnerability is always present in the asset' },
  { id: 6, text: 'The attack can be performed w/o meeting pre-conditions' },
  { id: 7, text: 'There will be consequences from internal sources' },
  { id: 8, text: 'There will be consequences from external sources' },
  { id: 9, text: 'The asset has or creates significant business value' },
  { id: 10, text: 'The repair or replacement costs will be significant' }
];

const scores = {
  risk: 0,
  likelihood: 0,
  impact: 0
};

// Function to render questions
function renderQuestions() {
  const form = document.getElementById('assessment-form');
  questions.forEach(question => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = `question-${question.id}`;
      checkbox.addEventListener('change', updateScores);
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(' ' + question.text));
      form.appendChild(label);
  });
}

// Function to update scores
function updateScores() {
  const form = document.getElementById('assessment-form');
  const checkboxes = form.querySelectorAll('input[type="checkbox"]');
  
  // Convert checkboxes to binary string
  let binaryString = 0;
  checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
          binaryString |= (1 << index);
      }
  });

  // Update URL with current selections
  updateUrl(binaryString);

  // Calculate scores using original algorithm
  scores.likelihood = calculateLikelihood(binaryString);
  scores.impact = calculateImpact(binaryString);
  scores.risk = calculateRisk(scores.likelihood, scores.impact);

  renderScores();
}

function calculateLikelihood(binaryString) {
  return calculateChunkScore(binaryString, 0, 5, 2);
}

function calculateImpact(binaryString) {
  return calculateChunkScore(binaryString, 6, 9, 2);
}

function calculateChunkScore(binaryString, startIndex, stopIndex, blockSize) {
  let scoreAccumulator = 0;
  
  for (let i = startIndex; i <= stopIndex; i += blockSize) {
      const blockScore = (binaryString >> i) & 3; // Get 2 bits
      const blockScorePartA = blockScore & 1;
      const blockScorePartB = (blockScore >> 1) & 1;
      const calculatedScore = Math.pow(2, blockScorePartA + blockScorePartB);

      if (scoreAccumulator === 0 || scoreAccumulator === 2) {
          scoreAccumulator = calculatedScore;
      } else if (scoreAccumulator === 1) {
          scoreAccumulator = (calculatedScore === 4 ? 2 : 1);
      } else if (scoreAccumulator === 4) {
          scoreAccumulator = (calculatedScore === 1 ? 2 : 4);
      }
  }

  return scoreAccumulator;
}

function calculateRisk(likelihood, impact) {
  const riskSum = likelihood + impact;
  if (riskSum <= 3) return 1;  // Low
  if (riskSum <= 5) return 2;  // Medium
  return 4;  // High
}

// Function to render scores
function renderScores() {
  const scoresDiv = document.getElementById('scores');
  scoresDiv.innerHTML = `
      <p class="score__item">Risk <span class="score score--${getScoreClass(scores.risk)}">${getScoreText(scores.risk)}</span></p>
      <p class="score__item">Likelihood <span class="score score--${getScoreClass(scores.likelihood)}">${getScoreText(scores.likelihood)}</span></p>
      <p class="score__item">Impact <span class="score score--${getScoreClass(scores.impact)}">${getScoreText(scores.impact)}</span></p>
  `;
}

// Function to get score text
function getScoreText(score) {
  if (score <= 1) return 'Low';
  if (score === 2) return 'Medium';
  return 'High';
}

// Function to get score class
function getScoreClass(score) {
  if (score <= 1) return 'low';
  if (score === 2) return 'medium';
  return 'high';
}

// Function to set checkboxes from binary string
function setCheckboxesFromBinary(binaryString) {
  const form = document.getElementById('assessment-form');
  const checkboxes = form.querySelectorAll('input[type="checkbox"]');
  
  checkboxes.forEach((checkbox, index) => {
      checkbox.checked = !!(binaryString & (1 << index));
  });
  
  updateScores();
}

// Modify initial render to check URL parameters
renderQuestions();
const urlSelections = getUrlParams();
if (urlSelections !== null) {
  setCheckboxesFromBinary(urlSelections);
} else {
  renderScores();
}

});