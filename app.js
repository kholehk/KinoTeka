const cors = require('cors');
const express = require('express');
const { v4: uuid } = require('uuid');
const Joi = require('joi');
const { loadFile, saveFile } = require("./file-utils");

const filePath = "./movies.json";
const corsOption = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
};

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

app.options('/:id', cors(corsOption));

const port = process.env.PORT || 5000;

const movieSchema = Joi.object({
    title: Joi.array().required(),
    like: Joi.string().required(),
    dislike: Joi.string().required(),
});

async function getMovies(req, res) {

    console.log(req);

    const { id } = req.params;
    let movies = await loadFile(filePath);

    movies = id ? movies.filter(m => m.id === id) : movies;

    if (Array.isArray(movies) && movies.length) {
        res.send(movies);
        return;
    }

    res.sendStatus(404);
};

app.get('/', (req, res) => res.send(
    '<h1><a href=\"https://kholehk.github.io/KinoTeka\">Kinoteka</a></h1>'
));

app.get('/movies', async (req, res) => await getMovies(req, res));

app.get("/:id", async (req, res) => await getMovies(req, res));

app.post("/movies", async (req, res) => {
    // const { error } = movieSchema.validate(req.body);
    // if (error) {
    //     res.sendStatus(403).send(error);
    //     return;
    // }

    const movie = { ...req.body, id: uuid() };

    const movies = await loadFile(filePath);
    movies.push(movie);

    await saveFile(filePath, movies);
    res.sendStatus(201);
});

app.put("/:id", async (req, res) => {
    const { id } = req.params;

    const movies = await loadFile(filePath);
    const moviesUpdated = movies.map(movie => movie.id === id ? { ...req.body, id } : movie);

    await saveFile(filePath, moviesUpdated);
    res.sendStatus(202);
});

app.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const movies = await loadFile(filePath);
    const moviesUpdated = movies.filter(movie => movie.id !== id);

    await saveFile(filePath, moviesUpdated);
    res.sendStatus(202);
});

app.listen(port, () => {
    console.log(`App listening on port: ${port}`)
});