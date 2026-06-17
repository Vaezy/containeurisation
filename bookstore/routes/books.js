const express = require("express");
const router = express.Router();
const axios = require("axios");

const API_URL = process.env.GATEWAY_URL
  ? `${process.env.GATEWAY_URL}/inventory/books`
  : "http://localhost:9001/inventory/books";

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(API_URL);
    res.render("books/index", {
      books: response.data,
      msg: req.query.msg || null,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des livres :", error.message);
    res.status(500).send("Erreur serveur");
  }
});

router.get("/add", (req, res) => {
  res.render("books/add");
});

router.post("/add", async (req, res) => {
  try {
    const { title, author, description } = req.body;

    await axios.post(API_URL, { title, author, description });

    res.redirect("/books?msg=Livre ajouté avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'ajout du livre :", error.message);
    res.status(500).send("Impossible d'ajouter le livre");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/${req.params.id}`);
    res.render("books/show", { book: response.data });
  } catch (error) {
    console.error("Erreur lors de la récupération du livre :", error.message);
    res.status(404).send("Livre introuvable");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/${req.params.id}`);
    res.render("books/edit", { book: response.data });
  } catch (error) {
    res.status(404).send("Livre introuvable");
  }
});

router.post("/:id/edit", async (req, res) => {
  try {
    const { title, author, description } = req.body;

    await axios.patch(`${API_URL}/${req.params.id}`, {
      title,
      author,
      description,
    });

    res.redirect("/books?msg=Livre modifié avec succès !");
  } catch (error) {
    console.error("Erreur lors de la modification :", error.message);
    res.status(500).send("Erreur lors de la mise à jour");
  }
});

router.get("/:id/delete", async (req, res) => {
  try {
    await axios.delete(`${API_URL}/${req.params.id}`);
    res.redirect("/books?msg=Livre supprimé avec succès !");
  } catch (error) {
    console.error("Erreur lors de la suppression :", error.message);
    res.status(500).send("Impossible de supprimer le livre");
  }
});

module.exports = router;
