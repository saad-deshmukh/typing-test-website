import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import process from "process";
import { fileURLToPath, pathToFileURL } from "url";
import sequelize from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const db = {};

// console.log("Initializing Sequelize Models ");

// Read all model files in this directory
const files = fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  });

// Load and initialize models
for (const file of files) {
 // console.log(`Found model file: ${file}`);

  const modulePath = path.join(__dirname, file);

  const { default: modelFactory } = await import(
    pathToFileURL(modulePath).href
  );

  const model = modelFactory(sequelize, Sequelize.DataTypes);
  db[model.name] = model;

 // console.log(` Initialized model: ${model.name}`);
}

// console.log(" Running Model Associations ");

// Run associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    // console.log(` Associated model: ${modelName}`);
  }
});

// console.log(" Models Initialized Successfully ");
// console.log("Exporting DB object with keys ", Object.keys(db));

// re-export existing instances (NO redeclaration)
export { sequelize };
export { Sequelize };

// default export (full db object)
export default db;

// named exports for controllers
export const {
  User,
  Game,
  Player,
  GameStats
} = db;
