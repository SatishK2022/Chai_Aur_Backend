require('dotenv').config()
const express = require('express');
const app = express();

const githubData = {
    "login": "SatishK2022",
    "id": 107935200,
    "node_id": "U_kgDOBm714A",
    "avatar_url": "https://avatars.githubusercontent.com/u/107935200?v=4",
    "gravatar_id": "",
    "url": "https://api.github.com/users/SatishK2022",
    "html_url": "https://github.com/SatishK2022",
    "followers_url": "https://api.github.com/users/SatishK2022/followers",
    "following_url": "https://api.github.com/users/SatishK2022/following{/other_user}",
    "gists_url": "https://api.github.com/users/SatishK2022/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/SatishK2022/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/SatishK2022/subscriptions",
    "organizations_url": "https://api.github.com/users/SatishK2022/orgs",
    "repos_url": "https://api.github.com/users/SatishK2022/repos",
    "events_url": "https://api.github.com/users/SatishK2022/events{/privacy}",
    "received_events_url": "https://api.github.com/users/SatishK2022/received_events",
    "type": "User",
    "site_admin": false,
    "name": "Satish Kumar",
    "company": null,
    "blog": "",
    "location": "Delhi, India",
    "email": null,
    "hireable": null,
    "bio": "A Passionate Frontend Developer",
    "twitter_username": null,
    "public_repos": 21,
    "public_gists": 0,
    "followers": 3,
    "following": 16,
    "created_at": "2022-06-21T13:41:23Z",
    "updated_at": "2023-08-27T14:32:43Z"
}

app.get('/', (req, res) => {
    res.send("<h1>Hello From Chai Aur Backend</h1>")
})

app.get('/twitter', (req, res) => {
    res.send("SatishKumar - Twitter")
})

app.get('/github', (req, res) => {
    res.json(githubData)
})

app.get('/instagram', (req, res) => {
    res.send("its_satishkumar")
})

app.listen(process.env.PORT, () => {
    console.log(`App is Listening on Port ${process.env.PORT}`);
})