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



app.listen(port, () => {
  console.log(`Ecosystem hub serving logic pathways via port: ${port}`);
});