const express = require("express");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 8000;

require("dotenv").config();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ni3cgn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("dragon-news");
    const newsCollection = db.collection("news");
    const categoriesCollection = db.collection("categories");

    app.get("/all-news", async (req, res) => {
      const news = await newsCollection.find().toArray();
      res.send({ status: true, message: "success", data: news });
    });

    app.get("/news/id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const news = await newsCollection.findOne(query);
      res.send(news);
    });
    app.get("/categories", async (req, res) => {
      const categories = await categoriesCollection.find().toArray();
      res.send({ status: true, message: "success", data: categories });
    });

    app.get("/news", async (req, res) => {
      const category = req.query.category;
      let newses;
      if (category === "all-news") {
        newses = await newsCollection.find().toArray();
      } else {
        newses = await newsCollection
          .find({ category: { $regex: category, $options: "i" } })
          .toArray();
      }
      res.json({ status: true, message: "success", data: newses });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to the Dragon News Server...");
});

app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
