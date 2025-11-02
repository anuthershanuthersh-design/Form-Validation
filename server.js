const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ------------------ MongoDB Setup ------------------
const uri = "mongodb+srv://abishekrt67_db_user:Abishek1523@cluster0.qkkdilq.mongodb.net/?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true&appName=Cluster0";

const client = new MongoClient(uri);
let usersCollection;

// Connect to MongoDB and get the "users" collection
async function connectDB() {
  try {
    await client.connect();
    const db = client.db("userdb"); // database name
    usersCollection = db.collection("users"); // collection name
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
connectDB();

// ------------------ Validation Functions ------------------
function isValidEmail(email) {
  return /^[^ ]+@[^ ]+\.[a-z]{2,3}$/.test(email);
}
function isValidPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
}
function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(phone);
}

// ------------------ Routes ------------------

// Register a new user
app.post("/register", async (req, res) => {
  try {
    const { fullname, email, password, phone, dob, gender } = req.body;

    // Server-side validation
    if (!fullname || fullname.trim().length < 3)
      return res.status(400).json({ error: "Full name must be at least 3 characters" });
    if (!email || !isValidEmail(email))
      return res.status(400).json({ error: "Invalid email address" });
    if (!password || !isValidPassword(password))
      return res.status(400).json({ error: "Weak password. Must include uppercase, lowercase & number" });
    if (!phone || !isValidPhone(phone))
      return res.status(400).json({ error: "Invalid phone number" });
    if (!dob)
      return res.status(400).json({ error: "Date of birth required" });
    if (!gender)
      return res.status(400).json({ error: "Gender required" });

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user into MongoDB
    const newUser = { fullname, email, password: hashedPassword, phone, dob, gender };
    await usersCollection.insertOne(newUser);

    res.json({ message: "✅ Registration Successful!", user: { fullname, email, phone, dob, gender } });

  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all users (exclude passwords)
app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
    res.json(users);
  } catch (err) {
    console.error("❌ Fetch users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
