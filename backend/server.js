const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({ secret: "secret123", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ✅ ONE shared users array for all logins
let users = [];

// ✅ Register
app.post("/register", (req, res) => {
  const existing = users.find(u => u.email === req.body.email);
  if (existing) {
    return res.send({ success: false, message: "User already exists" });
  }
  users.push({ email: req.body.email, password: req.body.password, source: "manual" });
  res.send({ success: true });
});

// ✅ Login
app.post("/login", (req, res) => {
  const user = users.find(
    (u) => u.email === req.body.email && u.password === req.body.password
  );
  if (user) res.send({ success: true });
  else res.send({ success: false });
});

app.listen(5000, () => console.log("Server running on 5000"));