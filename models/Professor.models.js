// models/User.js
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const availabilitySchema ={
  date: {type:Date,required:true},
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isBooked: { type: Boolean, default: false },
};

const professorSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select:false },
  name: { type: String, required: true },
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
  availableSlots: [
      {
        type : mongoose.Schema.Types.ObjectId,
        ref:"Availability"
      }
  ],
});

professorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

professorSchema.methods.isPasswordCorrect = async function (password) {
  const professor = await this.model('Professor').findById(this._id).select('+password');
  return await bcrypt.compare(password, professor.password);
};
professorSchema.methods.generateAccessToken = async function () {
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

const Professor = mongoose.model("Professor", professorSchema);
export default Professor;


// models/Availability.js

//module.exports = mongoose.model("Availability", availabilitySchema);

// models/Appointment.js
