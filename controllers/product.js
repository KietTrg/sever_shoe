const { response } = require("express");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const makeSKU = require("uniqid");

const createProduct = asyncHandler(async (req, res) => {
  const { title, price, description, brand, category, color, size } = req.body;
  req.body.size = size.slice(1);
  const thumb = req?.files?.thumb[0]?.path;
  const images = req?.files?.images?.map((el) => el.path);
  if (!(title && price && description && brand && category && color && size))
    throw new Error("Missing input");

  req.body.slug = slugify(title);
  if (thumb) req.body.thumb = thumb;
  if (images) req.body.images = images;
  const newProduct = await Product.create(req.body);
  return res.status(200).json({
    success: newProduct ? true : false,
    mes: newProduct ? "Created" : "Failed",
  });
});
const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid).populate({
    path: "ratings",
    populate: {
      path: "postedBy",
      select: "firstname lastname avatar",
    },
  });
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : "Cannot get product",
  });
});
const getProducts = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (mactheEl) => `$${mactheEl}`
  );
  const formatedQueries = JSON.parse(queryString);

  let colorQueryObject = {};
  //filtering
  if (queries?.title)
    formatedQueries.title = { $regex: queries.title, $options: "i" }; //'i': ko phan biet hoa hay thuong
  if (queries?.category)
    formatedQueries.category = { $regex: queries.category, $options: "i" }; //'i': ko phan biet hoa hay thuong
  if (queries?.color) {
    delete formatedQueries.color;
    const colorArr = queries.color?.split(",");
    const colorQuery = colorArr.map((el) => ({
      color: { $regex: el, $options: "i" },
    }));
    colorQueryObject = { $or: colorQuery };
  }

  let queryObject = {};
  if (queries?.q) {
    delete formatedQueries.q;
    queryObject = {
      $or: [
        {
          color: { $regex: queries.q, $options: "i" },
        },
        {
          title: { $regex: queries.q, $options: "i" },
        },
        {
          category: { $regex: queries.q, $options: "i" },
        },
        {
          brand: { $regex: queries.q, $options: "i" },
        },
        // {
        //   description: { $regex: queries.q, $options: "i" },
        // },
      ],
    };
  }
  const qr = { ...colorQueryObject, ...formatedQueries, ...queryObject };
  let queryCommand = Product.find(qr);

  //sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }
  //fields limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }
  //pagination
  const page = +req.query.page * 1 || 1;
  const limit = +req.query.limit * 1 || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand = queryCommand.skip(skip).limit(limit);
  // Execute query
  // so luong sp thoa man dk
  queryCommand
    .exec()
    .then(async (response) => {
      const counts = await Product.find(qr).countDocuments();
      return res.status(200).json({
        success: response ? true : false,
        productDatas: response ? response : "Cannot get products",
        counts,
      });
    })
    .catch((err) => {
      if (err) throw new Error(err.message);
    });

  // queryCommand.exec(async (err, response) => {
  //   if (err) throw new Error(err.message);
  //   const counts = await Product.find(formatedQueries).countDocuments();
  //   return res.status(200).json({
  //     success: response ? true : false,
  //     productDatas: response ? response : "Cannot get products",
  //     counts,
  //   });
  // });
});
const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const files = req?.files;
  if (files?.thumb) req.body.thumb = files?.thumb[0]?.path;
  if (files?.images) req.body.images = files?.images?.map((el) => el.path);
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedProduct ? true : false,
    mes: updatedProduct ? "Updated" : "Cannot updated product",
  });
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(pid);
  return res.status(200).json({
    success: deletedProduct ? true : false,
    mes: deletedProduct ? "Deleted Product" : "Cannot deleted product",
  });
});
const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, pid, updatedAt } = req.body;
  if (!star || !pid) throw new Error("Missing inputs");
  const ratingProduct = await Product.findById(pid);
  const alreadyRating = ratingProduct?.ratings?.find(
    (el) => el.postedBy.toString() === _id
  );
  // console.log({ alreadyRating });
  if (alreadyRating) {
    await Product.updateOne(
      { ratings: { $elemMatch: alreadyRating } },
      {
        $set: {
          "ratings.$.star": star,
          "ratings.$.comment": comment,
          "ratings.$.updatedAt": updatedAt,
        },
      },
      { new: true }
    );
  } else {
    await Product.findByIdAndUpdate(
      pid,
      {
        $push: { ratings: { star, comment, postedBy: _id, updatedAt } },
      },
      { new: true }
    );
  }
  const updatedProduct = await Product.findById(pid);
  const ratingCount = updatedProduct.ratings.length;
  const sumRatings = updatedProduct.ratings.reduce(
    (sum, el) => sum + +el.star,
    0
  );
  updatedProduct.totalRatings =
    Math.round((sumRatings * 10) / ratingCount) / 10;
  await updatedProduct.save();
  return res.status(200).json({
    success: true,
    updatedProduct,
  });
});
const uploadImagesProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (!req.files) throw new Error("Missing inputs");
  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $push: { images: { $each: req.files.map((el) => el.path) } },
    },
    { new: true }
  );
  // console.log(req.files);
  return res.status(200).json({
    success: response ? true : false,
    updatedProduct: response ? response : "Cannot upload images product",
  });
});
const addVarriant = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { title, price, color, size } = req.body;
  req.body.size = size.slice(1); ////new
  console.log(" req.body.size: ", req.body.size);
  console.log(size);
  const thumb = req?.files?.thumb[0]?.path;
  const images = req?.files?.images?.map((el) => el.path);
  if (!(title && price && color && size)) throw new Error("Missing input");
  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $push: {
        varriants: {
          color,
          price,
          title,
          thumb,
          images,
          size: req.body.size,
          sku: makeSKU().toUpperCase(),
        },
      },
    },
    { new: true }
  );
  // console.log(req.files);
  return res.status(200).json({
    success: response ? true : false,
    mes: response ? "Added varriant" : "Cannot added varriant",
  });
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratings,
  uploadImagesProduct,
  addVarriant,
};
