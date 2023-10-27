const ProductCategory = require("../models/productCategory");
const asyncHandler = require("express-async-handler");

const creatCategory = asyncHandler(async (req, res) => {
  const response = await ProductCategory.create(req.body);
  return res.json({
    success: response ? true : false,
    creatCategory: response ? response : "Cannot create new category",
  });
});
const getCategories = asyncHandler(async (req, res) => {
  const response = await ProductCategory.find();
  return res.json({
    success: response ? true : false,
    productCategories: response ? response : "Cannot get category",
  });
});
const updateCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, {
    new: true,
  });
  return res.json({
    success: response ? true : false,
    updatedCategory: response ? response : "Cannot update category",
  });
});
const deleteCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndDelete(pcid);
  return res.json({
    success: response ? true : false,
    deletedCategory: response ? response : "Cannot delete category",
  });
});

module.exports = {
  creatCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
