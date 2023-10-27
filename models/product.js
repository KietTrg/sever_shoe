const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, //bo dau cach
    },
    //link san pham
    slug: {
      type: String,
      required: true,
      //unique: true,
      lowercase: true,
    },
    description: {
      type: Array,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    thumb: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    color: {
      type: String,
      require: true,
    },
    size: {
      type: Array,
      require: true,
    },

    ratings: [
      {
        star: { type: Number },
        postedBy: { type: mongoose.Types.ObjectId, ref: "User" },
        comment: { type: String },
        updatedAt: { type: Date },
      },
    ],
    totalRatings: {
      type: Number,
      default: 0,
    },
    varriants: [
      {
        color: String,
        price: Number,
        size: Array,
        thumb: String,
        images: Array,
        title: String,
        sku: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
