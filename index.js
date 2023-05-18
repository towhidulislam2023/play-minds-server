const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');
require('dotenv').config()
app.use(cors())
app.use(express.json())
const imageData = require("./fakedata/gimage.json")

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.get('/gallery', (req, res) => {
    res.send(imageData)
})

// console.log(process.env.DB_ACCESS_USER_ID);
// console.log(process.env.DB_ACCESS_PASS);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_ACCESS_USER_ID}:${process.env.DB_ACCESS_PASS}@cluster0.w8zzyxt.mongodb.net/?retryWrites=true&w=majority`;


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
        // await client.connect();

        const playMindsToysCollection = client.db("PlaymindsHub").collection("playmindsToysCollection")

        app.get("/toys", async (req, res) => {
            const reqinfo = req.query
            console.log(reqinfo.subcategory);
            const query = { subcategory: reqinfo.subcategory }

            const options = {
                // sort returned documents in ascending order by title (A->Z)
                // sort: { title: 1 },
                // Include only the `title` and `imdb` fields in each returned document
                projection: { _id: 1, name: 1, pictureURL: 1, price: 1, rating: 1 },
            };

            const cursor = playMindsToysCollection.find(query, options)
            const result = await cursor.toArray()
            res.send(result)
        })
        // app.get("/alltoys", async (req, res) => {
        //     const limit = req.query.limit || 2;

        //     const projection = { _id: 1, pictureURL: 1, name: 1, price: 1, sellerEmail: 1, sellerName: 1, subcategory: 1, availableQuantity: 1 };

        //     const result = await playMindsToysCollection.find().limit(parseInt(limit)).project(projection).toArray();

        //     res.send(result);
        // });

        app.get("/alltoys", async (req, res) => {
            const limit = req.query.limit || 2;
            const sortType = req.query.sort || ""
            const searchTerm = req.query.title || "";
            let sortOrder;
            if (sortType === "ascending") {
                sortOrder = 1;
            } else if (sortType === "descending") {
                sortOrder = -1;
            }
            const searchFilter = searchTerm.trim() !== "" ? { name: { $regex: searchTerm, $options: "i" } } : {};
            const options = {
                sort: { price: sortOrder },
                projection: { _id: 1, pictureURL: 1, name: 1, price: 1, sellerEmail: 1, sellerName: 1, subcategory: 1, availableQuantity: 1 }
            };

            const result = await playMindsToysCollection.find(searchFilter, options).limit(parseInt(limit)).toArray();
            res.send(result);
        });






        app.get("/viewdetails/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await playMindsToysCollection.findOne(query)
            res.send(result)
        })











        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);









app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})