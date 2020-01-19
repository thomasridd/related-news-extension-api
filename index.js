const express = require('express');
const getData = require('./related-articles');

const PORT = process.env.PORT || 5000

const app = express();

app.get('/', async (req, res) => {
    var q=req.query.q;
    try {
        var data = await getData(q);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept" );

        res.end(JSON.stringify(data));
    } catch (error) {
        console.log(error);
    }
});

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});