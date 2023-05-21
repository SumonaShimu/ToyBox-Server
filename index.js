const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//connect mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7omvjfn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // client.connect((err) => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    // });
    const toyCollection = client.db('toyCollection').collection('toys');


    //get all toys
    app.get('/alltoys', async (req, res) => {
      const cursor = toyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    })
    //get a toy by id
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const options = {

      };

      const result = await toyCollection.findOne(query, options);
      res.send(result);
    })
    // Create index for toy name 
    const indexKeys = { name: 1 };
    const indexOptions = { name: "nameIndex" };
    const result = await toyCollection.createIndex(indexKeys, indexOptions);

    app.get('/search/:text', async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({
          name: { $regex: text, $options: "i" }
        }).toArray();

      res.send(result);
    });

    //get mytoys
    app.get('/mytoys', async (req, res) => {
      let query = {};
      console.log(req.query.email)
      if (req.query?.email) {
        query = {
          sellerEmail: req.query.email
        }
      }
      const result = await toyCollection.find(query).sort({ "price": 1 }).toArray();
      res.send(result);
    })
    //post
    app.post('/addtoy', async (req, res) => {
      const addedtoy = req.body;
      console.log(addedtoy);
      const result = await toyCollection.insertOne(addedtoy);
      res.send(result);
    });
    //update
    app.patch('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedtoy = req.body;
      console.log(updatedtoy);
      const updatedDoc = {
        $set: {
          ...updatedtoy
        }
      }

      const result = await toyCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })
    //delete
    app.delete('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('ToyBox running')
})

app.listen(port, () => {
  console.log(`ToyBox Server is running on port ${port}`)
})


