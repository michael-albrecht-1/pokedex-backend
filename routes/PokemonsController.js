const express = require("express");
const router = express.Router();

const { PokemonsModel } = require("../models/pokemonsModel");

router.get("/", (req, res) => {
  PokemonsModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.error("error to get pokemons");
  });
});

router.post("/", (req, res) => {
  const newRecord = new PokemonsModel({
    number: Math.round(Math.random() * 10000),
    name: req.body.name,
    description: req.body.description,
    weight: req.body.weight,
    height: req.body.height,
    avatar: req.body.avatar,
  });
});

module.exports = router;
