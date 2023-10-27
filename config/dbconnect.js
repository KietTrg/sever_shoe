const { default: mongoose } = require("mongoose");

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    if (conn.connection.readyState === 1) console.log("ket noi db thanh cong");
    else console.log("khong thanh cong"); //check ket noi thanh cong ?
  } catch (error) {
    console.log("DB failed");
    throw new Error(error);
  }
};

module.exports = dbConnect;
