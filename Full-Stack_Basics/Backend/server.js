import express from 'express'

const app = express();

// app.get('/', (req, res) => {
//     res.send("<h1>Server is Ready</h1>");
// })

// get a list of 5 jokes

app.get('/jokes', (req, res) => {
    const jokes =[
        {
            id: 1,
            joke: "I'm a joke"
        },
        {
            id: 2,
            joke: "I'm a joke"
        },
        {
            id: 3,
            joke: "I'm a joke"
        },
        {
            id: 4,
            joke: "I'm a joke"
        },
        {
            id: 5,
            joke: "I'm a joke"
        }
    ]

    res.send(jokes);
});

const port = process.env.PORT || 5000;

app.listen(port, (req, res) => {
    console.log(`Serve at http://localhost:${port}`);
})