const express = require("express");
const router = express.Router();
const axios = require("axios");

const API_URL = process.env.GATEWAY_URL
  ? `${process.env.GATEWAY_URL}/orders/orders`
  : "http://localhost:9001/orders/orders";

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(API_URL);
    res.render("orders/index", {
      orders: response.data,
      msg: req.query.msg || null,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des commandes :",
      error.message,
    );
    res
      .status(500)
      .send("Erreur serveur lors de la récupération des commandes");
  }
});

router.get("/add", (req, res) => {
  res.render("orders/add");
});

router.post("/add", async (req, res) => {
  try {
    const { customerName, totalAmount, status } = req.body;

    const orderDate = new Date().toISOString().split("T")[0];

    await axios.post(API_URL, {
      customerName,
      orderDate,
      totalAmount: Number(totalAmount),
      status: status || "En attente",
    });

    res.redirect("/orders?msg=Commande créée avec succès !");
  } catch (error) {
    console.error("Erreur lors de la création de la commande :", error.message);
    res.status(500).send("Impossible de créer la commande");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/${req.params.id}`);
    res.render("orders/edit", { order: response.data });
  } catch (error) {
    res.status(404).send("Commande introuvable");
  }
});

router.post("/:id/edit", async (req, res) => {
  try {
    const { customerName, totalAmount, status } = req.body;

    await axios.patch(`${API_URL}/${req.params.id}`, {
      customerName,
      totalAmount: Number(totalAmount),
      status,
    });

    res.redirect("/orders?msg=Commande mise à jour !");
  } catch (error) {
    console.error("Erreur lors de la modification :", error.message);
    res.status(500).send("Erreur lors de la mise à jour");
  }
});

router.get("/:id/delete", async (req, res) => {
  try {
    await axios.delete(`${API_URL}/${req.params.id}`);
    res.redirect("/orders?msg=Commande supprimée !");
  } catch (error) {
    console.error("Erreur lors de la suppression :", error.message);
    res.status(500).send("Impossible de supprimer la commande");
  }
});

module.exports = router;
