import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Product from "../models/Product.js";
import { getDiscountedUnitPrice, getLineTotal, roundMoney } from "../utils/pricing.js";

const router = express.Router();

// For simplicity, we'll store cart client-side;
// this route can be extended later for persistent carts.

router.post("/validate", protect, async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const validatedItems = [];
    let total = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const quantity = Math.min(item.quantity, product.stock);
      const discountedUnitPrice = getDiscountedUnitPrice(product.price);
      const lineTotal = getLineTotal(discountedUnitPrice, quantity);

      validatedItems.push({
        productId: product._id,
        name: product.name,
        quantity,
        price: discountedUnitPrice,
        image: product.image,
        lineTotal,
      });

      total = roundMoney(total + lineTotal);
    }

    res.json({ items: validatedItems, total });
  } catch (error) {
    next(error);
  }
});

export default router;
