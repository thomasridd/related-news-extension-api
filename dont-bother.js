const falsePositives = [
    ".google",
    "googleads",
    "robots.txt",
    "favicon.ico",
    "window.location"
]

const urlShouldBeIgnored = (url) => {
    const allowed = falsePositives.filter((domain) => url.indexOf(domain) > -1)
    return allowed.length > 0
}
module.exports = urlShouldBeIgnored