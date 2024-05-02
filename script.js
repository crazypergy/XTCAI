window.onload = function () {
  // Show loading spinner
  document.getElementById('loadingSpinner').classList.remove('d-none');

  /* Fetch and Display Random Card */
  fetchRandomCard();

  function fetchRandomCard() {
      const endpoint = `https://api.scryfall.com/cards/random`;
      let rulingsUrl;
      let imageUrl;

      fetch(endpoint)
          .then((response) => response.json())
          .then((data) => {
              rulingsUrl = data.rulings_uri;
              imageUrl = data.image_uris.normal;
              return fetch(rulingsUrl);
          })
          .then((response) => response.json())
          .then((data) => {
              const rulings = data.data.map((ruling) => ruling.comment);
              const rulingsText = rulings.join(" ");
              const cardTextDiv = document.getElementById("rulesText");

              if (rulings.length === 0) {
                  cardTextDiv.textContent = "There are no rules for this card.";
              } else {
                  cardTextDiv.textContent = rulingsText;
              }

              const cardImage = document.getElementById("cardImage");
              cardImage.onload = function () {
                  // Hide loading spinner after the image is loaded
                  document.getElementById('loadingSpinner').classList.add('d-none');
              };
              cardImage.src = imageUrl;
              cardImage.classList.remove('d-none'); // Show the image
          })
          .catch((error) => {
              console.log("There was an error fetching the random card: ", error);
          });
  }

  /* User Search */
  const form = document.querySelector("form");
  const input = document.querySelector(".form-control");
  const output = document.getElementById("rulesText");
  const image = document.querySelector(".cardImage");

  form.addEventListener("submit", (event) => {
      event.preventDefault();
      const userInput = input.value.trim();
      sendToModel(userInput);
  });

  async function sendToModel(input) {
      const endpoint = `https://api.scryfall.com/cards/named?exact=${input}`;
      let rulingsUrl;
      let imageUrl;

      fetch(endpoint)
          .then((response) => response.json())
          .then((data) => {
              rulingsUrl = data.rulings_uri;
              imageUrl = data.image_uris.normal;
              return fetch(rulingsUrl);
          })
          .then((response) => response.json())
          .then((data) => {
              const rulings = data.data.map((ruling) => ruling.comment);
              const rulingsText = rulings.join(" ");
              output.textContent = rulingsText || "There are no rules for this card.";
              image.src = imageUrl;
          })
          .catch((error) => {
              console.log("There was an error searching for the card: ", error);
          });
  }

  // Explains the Card
  // Get the button element
  var explainBtn = document.getElementById("explainBtn");

  // Add click event listener to the button
  explainBtn.addEventListener("click", function () {
      // Get the text from the rulesText div
      var rulesText = document.getElementById("rulesText").textContent;
      console.log("The button was clicked");

      // Send the text to the Inference API
      var payload = {
          options: 'wait_for_model',
          inputs: rulesText
      }

      query(payload).then((response) => {
          var summaryText = (JSON.stringify(response)).split(":");
          var rulesText = document.getElementById("rulesText");
          rulesText.textContent = summaryText[1];
      }).catch((error) => {
          console.log("An error occurred:", error);
      });
  });

  // Function to send query to Inference API
  async function query(data) {
      try {
          const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
              headers: {
                  'Authorization': "Bearer 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"
              },
              method: "POST",
              body: JSON.stringify(data),
          });

          if (!response.ok) {
              throw new Error('Failed to fetch data from the Inference API');
          }
          const result = await response.json();
          return result;
      } catch (error) {
          console.log("An error occurred:", error);
          throw error;
      }
  }
}
