import mongoose, { Schema } from "mongoose";


const availabilitySchema =new Schema({
    professorId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Professor"
    },
  date: {type:Date,required:true},
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isBooked: { type: Boolean, default: false },
});

const Availability = mongoose.model("Availability",availabilitySchema)
export default Availability;
