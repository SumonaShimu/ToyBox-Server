const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId,ServerApiVersion  } = require('mongodb');
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
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const toyCollection = client.db('toyCollection').collection('toys');
    //get all toys
    app.get('/alltoys', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })
  //get a toy by id
  app.get('/toy/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }

    const options = {
        //projection: { title: 1, price: 1, toy_id: 1, img: 1 },_________
    };

    const result = await toyCollection.findOne(query, options);
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


