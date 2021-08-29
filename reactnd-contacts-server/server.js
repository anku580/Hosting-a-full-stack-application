const express = require("express");
const { Sequelize, DataTypes, Model } = require("sequelize");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config");
const path = require("path");
const contacts = require("./contacts");

const app = express();

app.use(express.static("public"));
app.use(cors());

const sequelize = new Sequelize(
  `postgres://${config.username}:${config.password}@${config.host}:${config.pgPort}/${config.database}`
);

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
    },
    avatarURL: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/index.html"));
});

app.use((req, res, next) => {
  const token = req.get("Authorization");

  if (token) {
    req.token = token;
    next();
  } else {
    res.status(403).send({
      error:
        "Please provide an Authorization header to identify yourself (can be whatever you want)",
    });
  }
});

app.get("/contacts", async (req, res) => {
  const users = await User.findAll();
  res.send(users.map(({ dataValues }) => ({
    id: dataValues.id,
    name: dataValues.name,
    email: dataValues.email
  })));
});

app.delete("/contacts/:id", async (req, res) => {
    const {id} = req.params;
    const deleteItem = await User.destroy({where: {
        id: id
    }});
    res.send(contacts.remove(req.token, req.params.id));
});

app.post("/contacts", bodyParser.json(), async (req, res) => {
  const { name, email } = req.body;
    const id = Math.random().toString(36).substr(-8);
  if (name && email) {
      const newUser = await new User({
          name: name,
          email: email,
          id: id
      })
      const saveItem = await newUser.save();
      console.log(saveItem);
    res.send(contacts.add(req.token, {name: name, email: email, id: id}));
  } else {
    res.status(403).send({
      error: "Please provide both a name and an email address",
    });
  }
});

app.listen(config.port, async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    console.log("Server listening on port %s, Ctrl+C to stop", config.port);
    await User.sync();
    contacts.defaultData.contacts.forEach((contact) => {
      User.findOrCreate({ where: { id: contact.id }, defaults: contact });
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
