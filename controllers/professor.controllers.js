import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Professor from "../models/Professor.models.js";

import Availability from "../models/availableSlots.model.js";
import Appointment from "../models/appointedSlots.models.js";
import Student from "../models/student.models.js";

const registerProfessor = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if ([name, email, password].some((field) => field?.trim() == "")) {
    throw new ApiError(404, "All fields are required");
  }
  const existedProfessor = await Professor.findOne({ email });
  if (existedProfessor) {
    throw new ApiError(404, `Professor with this email exists`);
  }
  const professor = await Professor.create({
    name,
    email,
    password,
  });
  return res.status(201).json(new ApiResponse(200, professor));
});

const loginProfessor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(404, "All fields are required");
  }
  const professor = await Professor.findOne({ email });

  if (!professor) {
    throw new ApiError(401, "Invalid Email");
  }
  const isPasswordCorrect = await professor.isPasswordCorrect(password);
  const token = await professor.generateAccessToken();
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, { professor: professor, token: token }));
});

const addAvailableSlot = asyncHandler(async (req, res) => {
  const { date, startTime, endTime, isBooked } = req.body;
  if ([date, startTime, endTime].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  // const isSlotExisted = await Professor.findById
  const isSlotExisted = await Availability.findOne({
    professorId: req.user._id,
    date,
    startTime,
    endTime,
  });

  if (isSlotExisted) {
    throw new ApiError(
      400,
      "Slot already exists with the entered date and time"
    );
  }
  const professor = await Professor.findById(req.user._id);
  const slot = await Availability.create({
    professorId: req.user._id,
    date,
    startTime,
    endTime,
    isBooked,
  });
  professor.availableSlots.push(slot);
  await professor.save();

  return res.status(201).json(new ApiResponse(200, professor));
});

const allBooking = asyncHandler(async (req, res) => {
  const professor = await Professor.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
            $lookup: {
                from: "appointments",
                localField: "appointments",
                foreignField: "_id",
                as: "my_Appointments",
               
              },   
    }
  ]);
  
  return  res.status(201).json(new ApiResponse(200,professor))
  // const allBookedSlots = pro
});


const manageBooking = asyncHandler(async(req,res)=> {
    const {appointmentId}= req.params;
    const {status}= req.body;
    if(status == "cancelled"){
     try{
         await Appointment.findByIdAndDelete(appointmentId);
         return res.status(201).json(new ApiResponse(200,"appointment cancelled successfully"))
     }
     catch(err){
        throw new ApiError(404,err);
     }
    }
    const appointment =  await Appointment.findById(appointmentId);
    appointment.status = "scheduled";
    await appointment.save();
    return res.status(201).json(new ApiResponse(200,appointment,"appointment successfully scheduled "))
})



export { registerProfessor, loginProfessor, addAvailableSlot, allBooking,manageBooking };
