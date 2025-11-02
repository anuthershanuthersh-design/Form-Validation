const { MongoClient, ServerApiVersion } = require("mongodb");
const bcrypt = require("bcrypt");

const uri = "mongodb+srv://abishekrt67_db_user:Abishek1523@cluster0.qkkdilq.mongodb.net/?retryWrites=true&w=majority";

async function runTest() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    const db = client.db("userdb");
    const usersCollection = db.collection("users");

    // Hash a test password
    const hashedPassword = await bcrypt.hash("Test1234", 10);

    // Dummy user
    const dummyUser = {
      fullname: "Test User",
      email: "testuser@example.com",
      password: hashedPassword,
      phone: "1234567890",
      dob: "2000-01-01",
      gender: "Male"
    };

    const result = await usersCollection.insertOne(dummyUser);
    console.log("✅ Dummy user inserted with _id:", result.insertedId);

  } catch (err) {
    console.error("Error inserting dummy user:", err);
  } finally {
    await client.close();
  }
}

runTest();