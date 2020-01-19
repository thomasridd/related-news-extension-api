
const fetch = require("node-fetch");

const urlIsPermitted = require("./allowed-domains");

const getData = async url => {
    const glitchedData = await getGlitched(url);
    if(glitchedData) {
        const keywords = glitchedKeywords(glitchedData);
        const newsApiData = await getNewsApi(keywords);
        const relevantArticles = filterNewsData(newsApiData);
        return combineData(glitchedData, relevantArticles);
    }
    return {}
};

const formatDisplayDate = (article) => {
    const publishedAt = Date.parse(article.publishedAt);
    article['displayDate'] = formattedDate(publishedAt);
    return article;
}

const formattedDate = (publishedAt) => {
    if(isToday(publishedAt)){
        const millisecondDiff = Date.now() - publishedAt;
        const hourDiff = Math.floor(millisecondDiff / (1000 * 60 * 60));

        if(hourDiff === 0) {
            return "just now"
        } else if(hourDiff === 1){
            return `1 hour ago`
        } else {
            return `${hourDiff} hours ago`
        }
    } else if(isYesterday(publishedAt)) {
        return "yesterday"
    } else {
        return
    }
}
const isToday = (millisecondDate) => {
    const someDate = new Date(millisecondDate)
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}

const isYesterday = (millisecondDate) => {
    const today = new Date()
    const someDate = new Date(millisecondDate)
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}


const combineData = (glitchedData, articles) => {
    const formattedArticles = articles;
    articles = articles.map((article) => formatDisplayDate(article))

    return {
        "articles": articles,
    }
}

const combineTrust = (glitchedData) => {

}

const filterNewsData = (fullData) => {
    return fullData.articles.filter(item => urlIsPermitted(item.url))
}

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
    const url = `https://newsapi.org/v2/everything?q=${keywords[0]}%20${keywords[1]}%20${keywords[2]}&from=2020-01-16&to=2020-01-20&sortBy=publishedAt&apiKey=${key}`;

    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.log(error);
        return {};
    }
};


module.exports = getData