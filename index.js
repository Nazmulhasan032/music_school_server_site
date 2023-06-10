const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;




app.use(cors());
app.use(express.json());



// const verifyJWT = (req, res, next) => {
//   const authorization = req.headers.authorization;
//   if (!authorization) {
//     return res.status(401).send({ error: true, message: 'unauthorized access' });
//   }
//   // bearer token
//   const token = authorization.split(' ')[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ error: true, message: 'unauthorized access' })
//     }
//     req.decoded = decoded;
//     next();
//   })
// }


app.get('/', (req, res) => {
  res.send('server is running');
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5dmbeep.mongodb.net/?retryWrites=true&w=majority`;

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

    const usersCollection = client.db("academy").collection("users");
    const classesCollection = client.db("academy").collection("classes");
    const allClassCollection = client.db("academy").collection("allclass");
    const instructorCollection = client.db("academy").collection("instructor");
    const allInstructorCollection = client.db("academy").collection("allinstructor");
    const enrollCollection = client.db("academy").collection("enroll");




    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: '1h' })

      res.send({ token })
    })

    // verifyJWT, verifyAdmin,
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });


    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })

    // student enroll class api-------
    // verifyJWT,
    app.get('/enroll', async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }

      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ error: true, message: 'forbidden access' })
      // }

      const query = { email: email };
      const result = await enrollCollection.find(query).toArray();
      res.send(result);
    });



    app.post('/enroll', async (req, res) => {
      const enrollClass = req.body;
      const result = await enrollCollection.insertOne(enrollClass);
      res.send(result);
    })

    app.delete('/enroll/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await enrollCollection.deleteOne(query);
      res.send(result);
    })





    app.get('/classes', async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    })

    app.get('/allclass', async (req, res) => {
      const result = await allClassCollection.find().toArray();
      res.send(result);
    })

    app.get('/instructor', async (req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result);
    })


    app.get('/allinstructor', async (req, res) => {
      const result = await allInstructorCollection.find().toArray();
      res.send(result);
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
  console.log(`server is running on ${port}`);
})