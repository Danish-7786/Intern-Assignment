// Assuming you have a Student model

import jwt from "jsonwebtoken";
import Student from "../models/student.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import Professor from "../models/Professor.models.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import Availability from "../models/availableSlots.model.js";
import ApiError from "../utils/ApiError.js";

import Appointment from "../models/appointedSlots.models.js";
// Register a new student
const registerStudent = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if ([name, email, password].some((field) => field?.trim() == "")) {
    throw new ApiError(404, "All fields are required");
  }
  // Check if the student already exists
  const existingStudent = await Student.findOne({ email });
  if (existingStudent) {
    throw new ApiError(400, "Student already exists");
  }

  // Create a new student
  const newStudent = await Student.create({
    name,
    email,
    password,
  });

  res
    .status(201)
    .json(new ApiResponse(200, newStudent, "Student created successfully"));
});

// Login a student
const loginStudent = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => field?.trim() == "")) {
    throw ApiError(404, "All fields are required");
  }
  // Check if the student exists
  const student = await Student.findOne({ email });
  if (!student) {
    throw new ApiError(400, "Student with this mail doesn't exists");
  }

  const isMatch = await student.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(400, "Invalid email or password");
  }

  const token = await student.generateAccessToken();

  res
    .status(201)
    .json(new ApiResponse(200, { student: student, token: token }, "success"));
});

const allProfessor = asyncHandler(async (req, res) => {
  const professor = await Professor.find();
  return res.status(201).json(new ApiResponse(200, professor));
});

const allAvailableSlot = asyncHandler(async (req, res) => {
  const { professorId } = req.params;
  // console.log(professorId);
  const availableSlots = await Professor.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(professorId),
      },
    },
    {
      $lookup: {
        from: "availabilities",
        localField: "availableSlots",
        foreignField: "_id",
        as: "availableSlots",
        pipeline: [
          {
            $match: {
              isBooked: false,
            },
          },
        ],
      },
    },
  ]);

  return res.status(201).json(new ApiResponse(200, availableSlots));
});


const bookSlot = asyncHandler(async (req, res) => {
  const { professorId, slotId } = req.params;
  if (
    !mongoose.isValidObjectId(professorId) ||
    !mongoose.isValidObjectId(slotId)
  ) {
    throw new ApiError(400, "Invalid professor or slot ID");
  }
  const availableSlot = await Availability.findById(slotId);

  if (!availableSlot) {
    throw new ApiError(400, "No such slot exists");
  }
  if (availableSlot.isBooked) {
    throw new ApiError(400, "slot is already booked");
  }
  availableSlot.isBooked = true;

  await availableSlot.save();

 
  const appointment = await Appointment.create({
    studentId: req.user._id,
    professorId,
    availabilityId: availableSlot._id,
  });
  await Student.findByIdAndUpdate(req.user._id, {
    $push: { appointments: appointment._id },
  });
  await Professor.findByIdAndUpdate(professorId, {
    $push: { appointments: appointment._id },
  });

  return res.status(201).json(new ApiResponse(200,{appointment}, "slot booked successfully"));
});

const myBookedSlots = asyncHandler(async (req, res) => {
  const student = await Student.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "appointments",
        localField: "appointedSlots",
        foreignField: "_id",
        as: "my_Appointments",
      },
    },
  ]);
  return res.status(201).json(new ApiResponse(200, student, "success"));
});


export {
  registerStudent,
  loginStudent,
  allProfessor,
  allAvailableSlot,
  bookSlot,
  myBookedSlots,
};
