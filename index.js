const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI || "mongodb+srv://dbUser:vaultSecurePass123@cluster0.5a5dwrr.mongodb.net/ideaVaultDB?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let db;

async function runConnectionPipeline() {
  try {
    await client.connect();
    db = client.db("ideaVaultDB");
    console.log("Ecosystem database nodes fully operational.");
  } catch (err) {
    console.error("Database initialization fault:", err);
  }
}
runConnectionPipeline();

function verifyEcosystemToken(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).json({ message: "Access restricted. Missing vector." });
  }

  const identityToken = authorizationHeader.split(" ")[1];
  jwt.verify(identityToken, process.env.JWT_SECRET || "super_secret_cryptographic_vault_key_hash_2026", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Authorization parameters expired." });
    }
    req.decodedIdentity = decoded;
    next();
  });
}

app.post("/jwt", (req, res) => {
  const profilePayload = req.body;
  if (!profilePayload.email) {
    return res.status(400).json({ message: "Identity signature parameters incomplete." });
  }
  const token = jwt.sign(profilePayload, process.env.JWT_SECRET || "super_secret_cryptographic_vault_key_hash_2026", {
    expiresIn: "12h"
  });
  res.json({ token });
});

app.get("/my-comments", verifyEcosystemToken, async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Identity parameter missing." });
    }

    if (req.decodedIdentity.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: "Identity parameter verification mismatch." });
    }

    const userComments = await db.collection("comments")
      .aggregate([
        { 
          $match: { 
            userEmail: { $regex: `^${email}$`, $options: "i" } 
          } 
        },
        {
          $addFields: {
            convertIdeaId: {
              $cond: {
                if: { $eq: [{ $strLenCP: { $ifNull: ["$ideaId", ""] } }, 24] },
                then: { $toObjectId: "$ideaId" },
                else: "$ideaId"
              }
            }
          }
        },
        {
          $lookup: {
            from: "ideas",
            localField: "convertIdeaId",
            foreignField: "_id",
            as: "ideaDetails"
          }
        },
        {
          $unwind: {
            path: "$ideaDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            ideaId: 1,
            text: 1,
            userEmail: 1,
            userName: 1,
            timestamp: 1,
            timestampRaw: 1,
            ideaTitle: { $ifNull: ["$ideaDetails.title", "Archived Repository Concept"] }
          }
        },
        { $sort: { timestampRaw: -1, _id: -1 } }
      ])
      .toArray();

    res.json(userComments);
  } catch (err) {
    console.error("Database interaction pipeline mismatch:", err);
    res.status(500).json({ message: "Internal architecture matrix failure." });
  }
});

app.get("/ideas", async (req, res) => {
  try {
    const { search, category } = req.query;
    let databaseQuery = {};

    if (category && category !== "All") {
      databaseQuery.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (search && search.trim() !== "") {
      databaseQuery.title = { $regex: search.trim(), $options: "i" };
    }

    const repositoryCollection = await db.collection("ideas").find(databaseQuery).toArray();
    res.json(repositoryCollection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/ideas/:id", async (req, res) => {
  try {
    const parameterId = req.params.id;
    let databaseQuery = {};
    
    if (ObjectId.isValid(parameterId)) {
      databaseQuery = { _id: new ObjectId(parameterId) };
    } else {
      databaseQuery = { _id: parameterId };
    }

    const uniqueConcept = await db.collection("ideas").findOne(databaseQuery);
    if (!uniqueConcept) {
      return res.status(404).json({ message: "Target concept tracking index missing." });
    }
    res.json(uniqueConcept);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/ideas", verifyEcosystemToken, async (req, res) => {
  try {
    const newIdeaPayload = req.body;
    
    if (!newIdeaPayload.title || !newIdeaPayload.category) {
      return res.status(400).json({ message: "Required concept initialization fields missing." });
    }

    const compiledIdeaDocument = {
      ...newIdeaPayload,
      userEmail: req.decodedIdentity.email,
      authorEmail: req.decodedIdentity.email,
      timestampRaw: new Date().toISOString()
    };

    const executionResponse = await db.collection("ideas").insertOne(compiledIdeaDocument);
    res.status(201).json({ success: true, insertedId: executionResponse.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



app.listen(port, () => {
  console.log(`Ecosystem hub serving logic pathways via port: ${port}`);
});