const express = require('express');
const fetch = require("node-fetch");

const path = require('path')
const PORT = process.env.PORT || 5000

const app = express();

const getData = async url => {
    const glitchedData = await getGlitched(url);
    if(glitchedData) {
        const keywords = glitchedKeywords(glitchedData);
        return await getNewsApi(keywords);
    }

    return {}
};

const glitchedKeywords = (glitchedData) => {
    try {
        return glitchedData["topics"]["keywords"].map(k => k.name)
    } catch (error) {
        return []
    }
}

const getGlitched = async articleUrl => {
    const url = `https://glitched.news/api/article?url=${articleUrl}`
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.log(error);
        return {};
    }
};


const getNewsApi = async keywords => {
    const key = process.env.API_KEY;
    const url = `https://newsapi.org/v2/everything?q=${keywords[0]}%20${keywords[1]}%20${keywords[2]}&from=2020-01-16&to=2019-12-18&sortBy=publishedAt&apiKey=${key}`;
    console.log(url);
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.log(error);
        return {};
    }
};

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