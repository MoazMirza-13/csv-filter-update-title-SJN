const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();

const parentIDToFind = process.env.PARENT_ID;
const inputFilePath = "./master-sheet.csv";
const outputFilePath = "./filtered-sheet.csv";

const results = [];

// Read and process the CSV file
fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on("data", (row) => {
    if (row.parentID === parentIDToFind) {
      results.push({
        id: row.id,
        title: row.title,
        parent_title: row.parent_title,
      });
    }
  })
  .on("end", () => {
    try {
      const header = "id,parent_title,title\n";
      const csvContent = results
        .map((row) => `${row.id},${row.parent_title},${row.title}`)
        .join("\n");
      fs.writeFileSync(outputFilePath, header + csvContent);
      console.log("Filtered CSV file has been created successfully.");
    } catch (err) {
      console.error("Error writing the CSV file:", err);
    }
  })
  .on("error", (err) => {
    console.error("Error reading the CSV file:", err);
  });
