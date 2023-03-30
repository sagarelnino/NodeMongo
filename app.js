const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');

//init app & middleware
const app = express();
app.use(express.json())

//connect to db
let db; 

connectToDb((err) => {
    if(!err) {
        app.listen(9000, () => {
            console.log('App is listening on port 9000');
        });
        db = getDb();
    }
})

//routes
app.get('/books', (req, res) => {
    //current page
    const page = req.query.p || 0;
    const perPage = 2;

    let books = [];

    db.collection('books')
        .find()
        .sort({ author: 1 })
        .skip(page * perPage)
        .limit(perPage)
        .forEach(book => books.push(book))
        .then(() => {
            res.status(200).json(books)
        })
        .catch(() => {
            res.status(500).json({error: 'Could not fetch the items'})
        })
});

app.get('/books/:id', (req, res) => {
    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
        .findOne({_id: new ObjectId(req.params.id)})
        .then(book => {
            res.status(200).json(book)
        })
        .catch(() => {
            res.status(500).json({error: 'Could not fetch the item'})
        })
    }else{
        res.status(500).json({error: 'Not a valid id'})
    }
});

app.post('/books', (req, res) => {
    const book = req.body;

    db.collection('books')
        .insertOne(book)
        .then(result => {
            res.status(201).json(result);
        })
        .catch(err => {
            res.status(500).json({err: 'Could not add data'});
        })
})

app.delete('/books/:id', (req, res) => {
    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
        .deleteOne({_id: new ObjectId(req.params.id)})
        .then(result => {
            res.status(200).json(result)
        })
        .catch(() => {
            res.status(500).json({error: 'Could not delete the item'})
        })
    }else{
        res.status(500).json({error: 'Not a valid id'})
    }
})

app.patch('/books/:id', (req, res) => {
    const updatedBook = req.body;

    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
        .updateOne({_id: new ObjectId(req.params.id)}, {$set: updatedBook})
        .then(result => {
            res.status(200).json(result)
        })
        .catch(() => {
            res.status(500).json({error: 'Could not update the item'})
        })
    }else{
        res.status(500).json({error: 'Not a valid id'})
    }
})