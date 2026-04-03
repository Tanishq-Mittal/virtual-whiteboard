const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/whiteboard");

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  source: { type: String, default: "manual" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// Middleware
app.use(cors({
  origin: "http://localhost:5174",
  credentials: true
}));
app.use(express.json());
app.use(session({ 
  secret: process.env.SESSION_SECRET || "secret123", 
  resave: false, 
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false, // set to true in production with HTTPS
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ✅ Register
app.post("/register", async (req, res) => {
  try {
    const fullName = req.body.fullName?.trim();
    const address = req.body.address?.trim();
    const phone = req.body.phone?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!fullName || !address || !phone || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      address,
      phone,
      email,
      password: hashedPassword,
      source: "manual"
    });
    await user.save();

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    
    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
    
    // Store in session
    req.login(user, (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: "Login successful", user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address
      }});
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Get current user profile
app.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
  const { fullName, email, phone, address } = req.user;
  res.json({ success: true, user: { fullName, email, phone, address } });
});

// ✅ View all registered users (for testing/admin only)
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Don't show passwords
    res.json({ 
      success: true, 
      totalUsers: users.length, 
      users: users.map(u => ({
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        address: u.address,
        source: u.source,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Update profile
app.put("/profile", async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
  try {
    const { fullName, address, phone } = req.body;
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (phone !== undefined) {
      const phoneRegex = /^\+?[0-9]{7,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({ success: false, message: "Invalid phone number" });
      }
      updateData.phone = phone.trim();
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }
    await User.findByIdAndUpdate(req.user._id, updateData);
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Real-time socket.io collaboration
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`socket connected ${socket.id}`);
  socket.on("joinRoom", ({ room, user }) => {
    socket.join(room);
    socket.to(room).emit("userJoined", { user, id: socket.id });
  });

  socket.on("drawEvent", (payload) => {
    if (payload.room) socket.to(payload.room).emit("drawEvent", payload);
  });

  socket.on("clearBoard", (room) => {
    if (room) socket.to(room).emit("clearBoard");
  });

  socket.on("disconnect", () => {
    console.log(`socket disconnected ${socket.id}`);
  });
});

server.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));