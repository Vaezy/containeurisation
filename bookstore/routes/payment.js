const express = require("express");
const router = express.Router();
const axios = require("axios");

const API_URL = process.env.GATEWAY_URL
  ? `${process.env.GATEWAY_URL}/payments/payments`
  : "http://localhost:9001/payments/payments";

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(API_URL);
    res.render("payments/index", {
      payments: response.data,
      msg: req.query.msg || null,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des paiements :",
      error.message,
    );
    res
      .status(500)
      .send("Erreur serveur lors de la récupération des paiements");
  }
});

router.get("/add", (req, res) => {
  res.render("payments/add", { orderId: req.query.orderId || "" });
});

router.post("/add", async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, status } = req.body;
    const paymentDate = new Date().toISOString().split("T")[0];

    await axios.post(API_URL, {
      orderId,
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      status: status || "Validé",
    });

    res.redirect("/payments?msg=Paiement enregistré avec succès !");
  } catch (error) {
    console.error("Erreur lors de la création du paiement :", error.message);
    res.status(500).send("Impossible d'enregistrer le paiement");
  }
});

router.get("/:id/edit", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/${req.params.id}`);
    res.render("payments/edit", { payment: response.data });
  } catch (error) {
    res.status(404).send("Paiement introuvable");
  }
});

router.post("/:id/edit", async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, status } = req.body;

    await axios.patch(`${API_URL}/${req.params.id}`, {
      orderId,
      amount: Number(amount),
      paymentMethod,
      status,
    });

    res.redirect("/payments?msg=Paiement mis à jour !");
  } catch (error) {
    console.error("Erreur lors de la modification :", error.message);
    res.status(500).send("Erreur lors de la mise à jour");
  }
});

router.get("/:id/delete", async (req, res) => {
  try {
    await axios.delete(`${API_URL}/${req.params.id}`);
    res.redirect("/payments?msg=Paiement supprimé !");
  } catch (error) {
    console.error("Erreur lors de la suppression :", error.message);
    res.status(500).send("Impossible de supprimer le paiement");
  }
});

module.exports = router;
