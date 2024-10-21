import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import QRCode from "qrcode";

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// PostgreSQL client setup
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "jk32@12345AA",
  port: 5432,
});

// Connect to the database
db.connect();

// Variable to hold the fetched data
let info = [];

// Fetch data from the database and store it in the info variable
db.query("SELECT * FROM data", (err, res) => {
  if (err) {
    console.log("Error in query", err.stack);
  } else {
    info = res.rows; // Store the fetched data in the info variable
  }
});

// Route to render the main page
app.get("/", (req, res) => {
  res.render("main.ejs", { qrData: null, items: info });
});

// Route to handle form submission and generate QR code
app.post("/submit", async (req, res) => {
  const selectedItemName = req.body.ItemName; // Get the selected item name from the form
  const selectedItem = info.find(item => item.name === selectedItemName); // Find the corresponding item in info

  if (selectedItem) {
    const name = selectedItem.name;
    const price = selectedItem.price;

    // Generate QR code with the name and price data
    QRCode.toDataURL(`Name: ${name}, Price: ${price}`, { errorCorrectionLevel: "H" }, (err, url) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error generating QR code");
      }

      // Pass the generated QR code (url) to the template
      res.render("main.ejs", { qrData: url, items: info });
    });
  } else {
    res.status(400).send("Item not found");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is hot and live at: ${port}`);
});
