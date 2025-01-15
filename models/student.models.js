import mongoose, { Mongoose } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
 
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password:{
    type:String,
    required:true,
    select:false
  },
  appointedSlots: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
});

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.methods.isPasswordCorrect = async function (password) {
  const student = await this.model('Student').findById(this._id).select('+password');
  return await bcrypt.compare(password, student.password);
};

studentSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
};

const Student = mongoose.model("Student", studentSchema);
export default Student;
