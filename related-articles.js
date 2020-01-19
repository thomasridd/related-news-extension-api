
const fetch = require("node-fetch");
const moment = require("moment");
const urlIsPermitted = require("./allowed-domains");
const shouldBeIgnored = require("./dont-bother");

const getData = async url => {
    if(shouldBeIgnored(url)) {
        return emptyResponse(url);
    }
    const glitchedData = await getGlitched(url);
    if(glitchedData) {
        const keywords = glitchedKeywords(glitchedData);
        const newsApiData = await getNewsApi(keywords);
        const relevantArticles = filterNewsData(newsApiData);
        return combineData(glitchedData, relevantArticles);
    }
    return emptyResponse(url)
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
        return "yesterday";
    } else {
        return moment(publishedAt).format('MMMM Do');
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
    const trust = combineTrustIndicators(glitchedData);

    articles = articles.map((article) => formatDisplayDate(article))

    return {
        "articles": articles,
        "analysis": glitchedData["glitched"],
        "warnings": trust.negative.length
    }
}

const emptyResponse = (url) => {
    return {
        'articles':[],
        'warnings':0,
        'glitched': `https://glitched.news/article?url=${url}`
    }
}

const combineTrustIndicators = (glitchedData) => {
    var positive = [];
    var negative = [];
    glitchedData["content"]["trustIndicators"]["positive"].forEach((item) => positive.push(item));
    glitchedData["content"]["trustIndicators"]["negative"].forEach((item) => negative.push(item));

    glitchedData["text"]["trustIndicators"]["positive"].forEach((item) => positive.push(item));
    glitchedData["text"]["trustIndicators"]["negative"].forEach((item) => negative.push(item));

    glitchedData["blacklists"]["trustIndicators"]["positive"].forEach((item) => positive.push(item));
    glitchedData["blacklists"]["trustIndicators"]["negative"].forEach((item) => negative.push(item));

    glitchedData["related"]["trustIndicators"]["positive"].forEach((item) => positive.push(item));
    glitchedData["related"]["trustIndicators"]["negative"].forEach((item) => negative.push(item));

    glitchedData["factchecks"]["trustIndicators"]["positive"].forEach((item) => positive.push(item));
    glitchedData["factchecks"]["trustIndicators"]["negative"].forEach((item) => negative.push(item));

    return { 'positive': positive, 'negative': negative}
}

const filterNewsData = (fullData) => {
    console.log(fullData);
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
    const url = `https://glitched.news/api/article?url=${articleUrl}`;
    const glitched = `https://glitched.news/article?url=${articleUrl}`;
    try {
        const response = await fetch(url);
        const glitchedJson = await response.json();
        glitchedJson["glitched"] = glitched
        return glitchedJson
    } catch (error) {
        console.log(error);
        return null;
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