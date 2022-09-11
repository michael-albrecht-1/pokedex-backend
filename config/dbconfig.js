const mongoose = require("mongoose");

mongoose.connect(
  "mongodb://localhost:27017/pokedex",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
  },
  (err) => {
    if (!err) console.log("Mongodb connected");
    else console.log("Connection error" + err);
  }
);