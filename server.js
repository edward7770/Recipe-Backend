const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// POST /recipes
app.post("/recipes", async (req, res) => {
  const { title, making_time, serves, ingredients, cost } = req.body;

  if (!title || !making_time || !serves || !ingredients || !cost) {
    return res.json({
      message: "Recipe creation failed!",
      required: "title, making_time, serves, ingredients, cost",
    });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO recipes (title, making_time, serves, ingredients, cost) VALUES (?, ?, ?, ?, ?)",
      [title, making_time, serves, ingredients, cost]
    );

    const [rows] = await pool.execute("SELECT * FROM recipes WHERE id = ?", [result.insertId]);

    res.json({
      message: "Recipe successfully created!",
      recipe: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "DB error" });
  }
});

// GET /recipes
app.get("/recipes", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, title, making_time, serves, ingredients, cost FROM recipes"
    );
    res.json({ recipes: rows });
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

// GET /recipes/:id
app.get("/recipes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      "SELECT id, title, making_time, serves, ingredients, cost FROM recipes WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return res.json({ message: "No recipe found" });
    res.json({ message: "Recipe details by id", recipe: rows });
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

// PATCH /recipes/:id
app.patch("/recipes/:id", async (req, res) => {
  const { id } = req.params;
  const { title, making_time, serves, ingredients, cost } = req.body;

  try {
    const [existing] = await pool.execute("SELECT * FROM recipes WHERE id = ?", [id]);
    if (existing.length === 0) return res.json({ message: "No recipe found" });

    const recipe = existing[0];

    await pool.execute(
      "UPDATE recipes SET title = ?, making_time = ?, serves = ?, ingredients = ?, cost = ? WHERE id = ?",
      [
        title || recipe.title,
        making_time || recipe.making_time,
        serves || recipe.serves,
        ingredients || recipe.ingredients,
        cost || recipe.cost,
        id,
      ]
    );

    const [updated] = await pool.execute(
      "SELECT id, title, making_time, serves, ingredients, cost FROM recipes WHERE id = ?",
      [id]
    );

    res.json({
      message: "Recipe successfully updated!",
      recipe: updated,
    });
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

// DELETE /recipes/:id
app.delete("/recipes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute("SELECT * FROM recipes WHERE id = ?", [id]);
    if (rows.length === 0) return res.json({ message: "No recipe found" });

    await pool.execute("DELETE FROM recipes WHERE id = ?", [id]);
    res.json({ message: "Recipe successfully removed!" });
  } catch (err) {
    res.status(500).json({ message: "DB error" });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
