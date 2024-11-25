const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { Pool } = require("pg");

const app = express();

// Database connection
const pool = new Pool({
  user: "your_username",
  host: "localhost",
  database: "ecommerce_db",
  password: "12345",
  port: 5432,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---- Routes ----

// Home Page
app.get("/", (req, res) => {
  res.render("home"); // Render the new "home.ejs" file
});

// 1. Seller Dashboard
app.get("/seller/dashboard", async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM Products WHERE seller_id = $1", [1]); // Example seller_id
    res.render("seller/dashboard", { products: products.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/seller/add-product", async (req, res) => {
  const { name, description, price, stock } = req.body;
  const seller_id = 1; // Replace with actual logged-in seller_id
  try {
    await pool.query(
      "INSERT INTO Products (seller_id, name, description, price, stock) VALUES ($1, $2, $3, $4, $5)",
      [seller_id, name, description, price, stock]
    );
    res.redirect("/seller/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// 2. Admin Panel
app.get("/admin/dashboard", async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM Users");
    res.render("admin/dashboard", { users: users.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/admin/update-user", async (req, res) => {
  const { id, role } = req.body;
  try {
    await pool.query("UPDATE Users SET role = $1 WHERE id = $2", [role, id]);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// 3. Customer Buying Process
app.get("/customer/shop", async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM Products");
    res.render("shop", { products: products.rows }); // Updated to render the new "shop.ejs"
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/customer/add-to-cart", async (req, res) => {
  const { product_id, quantity } = req.body;
  const customer_id = 1; // Replace with actual logged-in customer_id
  try {
    await pool.query(
      "INSERT INTO Orders (customer_id, product_id, quantity, status) VALUES ($1, $2, $3, 'Pending')",
      [customer_id, product_id, quantity]
    );
    res.redirect("/customer/cart");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/customer/cart", async (req, res) => {
  const customer_id = 1; // Replace with actual logged-in customer_id
  try {
    const cart = await pool.query(
      `SELECT o.id, p.name, o.quantity, p.price 
       FROM Orders o 
       JOIN Products p ON o.product_id = p.id 
       WHERE o.customer_id = $1 AND o.status = 'Pending'`,
      [customer_id]
    );
    res.render("customer/cart", { cart: cart.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// 4. About Page
app.get("/about", (req, res) => {
  res.render("about"); // Render the "about.ejs" file
});

// 5. Contact Page
app.get("/contact", (req, res) => {
  res.render("contact"); // Render the "contact.ejs" file
});

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Received contact form submission from ${name} (${email}): ${message}`);
  res.redirect("/contact");
});

// 6. Backend Data Management
app.post("/customer/add-address", async (req, res) => {
  const { address, city, state, zip } = req.body;
  const user_id = 1; // Replace with actual logged-in user_id
  try {
    await pool.query(
      "INSERT INTO Addresses (user_id, address, city, state, zip) VALUES ($1, $2, $3, $4, $5)",
      [user_id, address, city, state, zip]
    );
    res.redirect("/customer/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ---- Static File Handling and Views ----
// Place all static files like CSS/JS in the "public" folder and use "views" for EJS templates.

// ---- Start Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
