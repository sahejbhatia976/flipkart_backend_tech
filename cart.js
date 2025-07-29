const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const cart = mongoose.model(
  "cart",
  new mongoose.Schema({
    userID: String,
    items: [
      {
        productID: String,
        quantity: Number,
      },
    ],
  })
);

router.post("/cart/add", async (req, res) => {
  try {
    const { productID, quantity = 1, user } = req.body;
    if (!productID || !user) {
      return res
        .status(400)
        .json({ message: "Productid and user is required" });
    }

    let cart = await cart.findOne({userID:user,status:'active'});

    if(!cart){
        cart = new cart({userID:user,items:[],status:'active'});
    }

    const existingItemIndex = cart.items.findIndex(item=>items.productID===productID);

    if(existingItemIndex>-1){
        cart.items[existingItemIndex].quantity+=parseInt(quantity);
    }else{
        cart.items.push({
            productID,
            quantity:parseInt(quantity)
        });
    }
    cart.updateAt = new Date();
    await cart.save();
  } catch (err) {
    res.status(500).json({error:"Internal server error,item has not been added"})
  }
});

router.get('/carts',async(req,res)=>{
    try{
        const carts = await cart.find({});
        res.status(200).json({
            success:true,
            count:cart.length,
            data:carts
        });
    }catch(error){
        console.log("Error fetching cart",error);
        res.status(500).json({
            success:false,
            message:"Failed to fetch data",
            error:error.message,
        });
    }
});


//delete route assignment

router.delete("/cart/:id",async(req,res)=>{
    try{
        const deleteditems = await items.findByAndDelete(req.params.id);

        if(!deleteditems){
            return res.status(404).json({
                success:false,
                message:"Item not found"
            });
        }
        res.status(200).json({
            success:true,
            message: "Items deleted successfully",
            data: deleteditems
        });
    }catch(err){
        res.status(500).json({
            success:false,
            message:"Server error",
            error: error.message
        })
    }
});

module.exports = router;