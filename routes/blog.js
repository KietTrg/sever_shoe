const router = require("express").Router();
const ctrls = require("../controllers/blog");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");

router.get("/", ctrls.getBlogs);
router.post("/", [verifyAccessToken, isAdmin], ctrls.creatNewBlog);
router.get("/one/:bid", ctrls.getBlog);
router.put("/like/:bid", [verifyAccessToken], ctrls.likeBlog);
router.put("/dislike/:bid", [verifyAccessToken], ctrls.dislikeBlog);
router.put("/:bid", [verifyAccessToken, isAdmin], ctrls.updateBlog);
router.put(
  "/image/:bid",
  [verifyAccessToken, isAdmin],
  uploader.single("image"),
  ctrls.uploadImagesBlog
);
router.delete("/:bid", [verifyAccessToken, isAdmin], ctrls.deleteBlog);

module.exports = router;
