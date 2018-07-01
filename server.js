var express = require("express");
var products = require("./data/product");
var review = require("./data/review");
var app = express();
app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

app.get('/products', (req, res) => {
    return res.send(products[0]);
});

app.get('/review/:id', (req, res) => {
    return res.send(review[req.params.id]);
});

app.listen((process.env.PORT || 4000), (err) => {
    if (err) {
        console.error(err)
        return;
    }
    console.log(`Server is now running on localhost: ${process.env.PORT || 4000}`)
});
