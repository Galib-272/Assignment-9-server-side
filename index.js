const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://assignment-9-client-side.vercel.app",
      /\.vercel\.app$/,
    ],
    credentials: true,
  }),
);
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let dbContext = null;

function getDatabaseContext() {
  if (!dbContext) {
    return client.db("ideaVaultDB");
  }
  return dbContext;
}

function verifyEcosystemToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access tokens missing from headers." });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    process.env.JWT_SECRET || "fallback-secret",
    (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Expired or corrupt credential footprint." });
      }
      req.decodedIdentity = decoded;
      next();
    },
  );
}

app.post("/jwt", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }
    const db = getDatabaseContext();
    const userRecord = await db
      .collection("user")
      .findOne({ email: { $regex: `^${email}$`, $options: "i" } });

    if (!userRecord) {
      return res
        .status(401)
        .json({ message: "No account found with this email." });
    }

    const resolvedUser = {
      email: userRecord.email,
      name: userRecord.name || email.split("@")[0],
      image: userRecord.image || null,
    };

    const token = jwt.sign(
      { email: resolvedUser.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    );
    res.json({ token, user: resolvedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/jwt/google", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required." });
    }

    const db = getDatabaseContext();
    const cleanEmail = email.trim();

    let userRecord = await db.collection("users").findOne({
      email: { $regex: `^${cleanEmail}$`, $options: "i" },
    });

    if (!userRecord) {
      const newUser = {
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
        image: null,
        createdAt: new Date(),
      };
      const result = await db.collection("users").insertOne(newUser);
      userRecord = { _id: result.insertedId, ...newUser };
    }

    const token = jwt.sign(
      { email: userRecord.email },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    );

    res.json({ token, user: userRecord });
  } catch (err) {
    console.error("Backend /jwt/google route internal crash:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/users/profile", verifyEcosystemToken, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Missing tracking criteria." });
    }
    if (req.decodedIdentity.email.toLowerCase() !== email.toLowerCase()) {
      return res
        .status(403)
        .json({ message: "Verification parameters mismatch." });
    }
    const db = getDatabaseContext();
    const userRecord = await db.collection("users").findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });
    if (!userRecord) {
      return res.json({
        email,
        name: "Expert Innovator",
        image: null,
      });
    }
    res.json(userRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/users/profile", verifyEcosystemToken, async (req, res) => {
  try {
    const { email, name, image } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Target identity matrix signature required." });
    }
    if (req.decodedIdentity.email.toLowerCase() !== email.toLowerCase()) {
      return res
        .status(403)
        .json({ message: "Identity adjustment transaction unauthorized." });
    }
    const db = getDatabaseContext();
    const updatePayload = {};
    if (name) updatePayload.name = name.trim();
    if (image) updatePayload.image = image.trim();
    await db
      .collection("users")
      .updateOne(
        { email: { $regex: `^${email}$`, $options: "i" } },
        { $set: updatePayload },
        { upsert: true },
      );
    const freshUserRecord = await db.collection("users").findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });
    res.json({ success: true, user: freshUserRecord });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/ideas", verifyEcosystemToken, async (req, res) => {
  try {
    const idea = req.body;
    if (!idea.title || !idea.email) {
      return res.status(400).json({ message: "Title and email are required." });
    }
    idea.createdAt = new Date();
    idea.isDefault = false;
    const db = getDatabaseContext();
    const result = await db.collection("ideas").insertOne(idea);
    res.json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/ideas", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const db = getDatabaseContext();
    const { search, category, defaultOnly, limit } = req.query;
    const filter = {};

    if (defaultOnly === "true") {
      filter.isDefault = true;
    }
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (category && category !== "All") {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    let queryCursor = db.collection("ideas").find(filter);

    if (limit) {
      queryCursor = queryCursor.limit(parseInt(limit, 10));
    }

    const result = await queryCursor.toArray();
    res.json(result);
  } catch (err) {
    console.error("Error fetching ideas:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/ideas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabaseContext();
    const idea = await db
      .collection("ideas")
      .findOne({ _id: new ObjectId(id) });
    if (!idea) return res.status(404).json({ message: "Concept not found." });
    res.json(idea);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/ideas/:id", verifyEcosystemToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatePayload = req.body;
    const db = getDatabaseContext();
    const result = await db
      .collection("ideas")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatePayload });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/ideas/:id", verifyEcosystemToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabaseContext();
    const result = await db
      .collection("ideas")
      .deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/comments", async (req, res) => {
  try {
    const { ideaId, email } = req.query;
    const db = getDatabaseContext();
    const filter = {};
    if (ideaId) filter.ideaId = ideaId;
    if (email) {
      filter.$or = [
        { userEmail: email },
        { email: email },
        { authorEmail: email },
      ];
    }
    const result = await db.collection("comments").find(filter).toArray();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/comments", verifyEcosystemToken, async (req, res) => {
  try {
    const comment = req.body;
    if (!comment.ideaId || !comment.text) {
      return res.status(400).json({ message: "ideaId and text are required." });
    }
    comment.timestamp = new Date();
    comment.userEmail = req.decodedIdentity.email;
    const db = getDatabaseContext();
    const result = await db.collection("comments").insertOne(comment);
    res.json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/my-comments", verifyEcosystemToken, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email required." });
    if (req.decodedIdentity.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: "Unauthorized." });
    }
    const db = getDatabaseContext();
    const result = await db
      .collection("comments")
      .find({
        $or: [{ userEmail: email }, { email: email }, { authorEmail: email }],
      })
      .toArray();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/comments/:id", verifyEcosystemToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text required." });
    }
    const db = getDatabaseContext();
    const result = await db
      .collection("comments")
      .updateOne(
        { _id: new ObjectId(id), userEmail: req.decodedIdentity.email },
        { $set: { text: text.trim() } },
      );
    if (result.matchedCount === 0) {
      return res
        .status(403)
        .json({ message: "Comment not found or unauthorized." });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/comments/:id", verifyEcosystemToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabaseContext();
    const result = await db.collection("comments").deleteOne({
      _id: new ObjectId(id),
      userEmail: req.decodedIdentity.email,
    });
    if (result.deletedCount === 0) {
      return res
        .status(403)
        .json({ message: "Comment not found or unauthorized." });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Ecosystem matrix server running cleanly.");
});

async function runServer() {
  try {
    await client.connect();
    dbContext = client.db("ideaVaultDB");
    console.log("Successfully connected to MongoDB cluster.");

    app.listen(port, () => {
      console.log("Server node processing requests on port: " + port);
    });
  } catch (err) {
    console.error("Server initialization blocked by database failure:", err);
    process.exit(1);
  }
}

runServer();
