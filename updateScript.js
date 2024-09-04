const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();
const { default: axios } = require("axios");

const inputFilePath = "./filtered-sheet.csv";

const titlesToShow = [];
let startFromTitle = false;

// Read and process the CSV file
fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on("data", (row) => {
    if (row.title.startsWith("درس نمبر 13")) {
      startFromTitle = true;
    }
    if (startFromTitle) {
      titlesToShow.push({
        id: row.id,
        title: row.title,
      });
    }
  })
  .on("end", async () => {
    console.log('Titles starting from "درس نمبر 13":', titlesToShow);

    // Sign in to get access tokens
    const { accessToken } = await signIn();

    // Iterate over the titles and update them
    for (const item of titlesToShow) {
      // Extract the number from the title
      const titleNumber = parseInt(item.title.split(" ")[2]);

      // Increment the number by 1
      const newTitleNumber = titleNumber + 1;

      // Update the title string
      const updatedTitle = `درس نمبر ${newTitleNumber}`;

      console.log(updatedTitle);

      // Update the title via API
      await updateTitle(item.id, updatedTitle, accessToken);
    }
  })
  .on("error", (err) => {
    console.error("Error reading the CSV file:", err);
  });

// Function to sign in and get tokens
async function signIn() {
  try {
    const signInUrl = process.env.signInUrl;
    const username = process.env.user;
    const password = process.env.password;

    const response = await axios.post(signInUrl, {
      username,
      password,
    });
    const { accessToken, refreshToken } = response.data;
    console.log("Signed in successfully.");
    console.log("accessToken", accessToken);
    console.log("refreshToken", refreshToken);
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("An error occurred during sign in:", error);
    throw error;
  }
}

// Function to update the title via API
async function updateTitle(id, updatedTitle, accessToken) {
  try {
    const updateUrl = process.env.updateUrl;
    const url = `${updateUrl}/${id}`;
    const response = await axios.patch(
      url,
      { title: updatedTitle },
      {
        headers: {
          accessToken: accessToken,
        },
      }
    );
    console.log(`Successfully updated ID ${id} to "${updatedTitle}"`);
    console.log("Response:", response.data);
  } catch (error) {
    console.error(`An error occurred while updating ID ${id}:`, error);
  }
}
