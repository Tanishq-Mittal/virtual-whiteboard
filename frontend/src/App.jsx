import { useRef, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5003";

function App() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 920, height: 620 });

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem("user"));
  const [isRegister, setIsRegister] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(3);
  const [boardBg, setBoardBg] = useState("#ffffff");
  const [tool, setTool] = useState("pen");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [theme, setTheme] = useState("dark");
  const [showGrid, setShowGrid] = useState(false);
  const [room, setRoom] = useState("main");
  const [socket, setSocket] = useState(null);
  const lastPointRef = useRef(null);

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snapshot = canvas.toDataURL();
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(snapshot);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }, [history, historyIndex]);

  // 🔥 keep login after refresh and initialize canvas
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setEmail(savedUser);
      setFullName(localStorage.getItem("fullName") || "");
      setAddress(localStorage.getItem("address") || "");
      setPhone(localStorage.getItem("phone") || "");
      setLoggedIn(true);
    }
  }, []);

  // Handle responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Calculate canvas dimensions based on screen size
      const width = window.innerWidth < 768 ? window.innerWidth - 40 : 920;
      const height = window.innerWidth < 768 ? 350 : 620;

      // Set the canvas resolution (drawing surface)
      canvas.width = width;
      canvas.height = height;

      // Redraw background
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = boardBg;
      ctx.fillRect(0, 0, width, height);

      setCanvasDimensions({ width, height });
    };

    if (loggedIn) {
      // Use setTimeout to ensure DOM is fully rendered
      const timer = setTimeout(updateCanvasSize, 0);
      window.addEventListener("resize", updateCanvasSize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateCanvasSize);
      };
    }
  }, [loggedIn, boardBg]);

  // Initialize canvas history when it's ready
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loggedIn) return;

    if (canvas.width > 0 && canvas.height > 0) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = boardBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const initial = canvas.toDataURL();
      setHistory([initial]);
      setHistoryIndex(0);
    }
  }, [loggedIn, canvasDimensions, boardBg]);

  useEffect(() => {
    if (!loggedIn) return;

    fetch(`${API_URL}/me`, {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.user) {
          const user = result.user;
          setFullName(user.fullName || "");
          setAddress(user.address || "");
          setPhone(user.phone || "");
          setEmail(user.email || "");
          localStorage.setItem("user", user.email || "");
          localStorage.setItem("fullName", user.fullName || "");
          localStorage.setItem("address", user.address || "");
          localStorage.setItem("phone", user.phone || "");
        }
      })
      .catch((err) => {
        console.error("Failed to load current user", err);
      });
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;
    if (socket) return;

    const s = io(API_URL);

    s.on("connect", () => {
      s.emit("joinRoom", { room, user: fullName || email });
    });

    s.on("userJoined", (data) => {
      console.log("User joined:", data);
    });

    s.on("drawEvent", (payload) => {
      if (payload && payload.room === room && payload.user !== (fullName || email)) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = payload.size;
        ctx.lineCap = "round";
        ctx.strokeStyle = payload.tool === "eraser" ? boardBg : payload.color;
        ctx.beginPath();
        ctx.moveTo(payload.fromX, payload.fromY);
        ctx.lineTo(payload.toX, payload.toY);
        ctx.stroke();
      }
    });

    s.on("clearBoard", () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = boardBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      pushHistory();
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [loggedIn, room, socket, boardBg, fullName, email, pushHistory]);


  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = history[newIndex];
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = history[newIndex];
    setHistoryIndex(newIndex);
  };

  const register = async () => {
  if (!fullName || !address || !phone || !email || !password) {
    alert("⚠️ Please fill all register fields");
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    alert("⚠️ Please enter a valid email address (e.g. user@example.com)");
    return;
  }
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  if (!phoneRegex.test(phone.trim())) {
    alert("⚠️ Please enter a valid phone number");
    return;
  }

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    credentials: 'include',
    body: JSON.stringify({
      fullName: fullName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim()
    })
  });

  const data = await res.json();
  
  if (data.success) {
    alert("✅ Registered Successfully! Please login now.");
    setFullName("");
    setAddress("");
    setPhone("");
    setEmail("");
    setPassword("");
    setIsRegister(false);
  } else {
    alert(`❌ Registration Failed: ${data.message}`);
  }
};



  const login = async () => {
  if (!email || !password) {
    alert("⚠️ Enter Email and Password");
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("⚠️ Please enter a valid email address (e.g. user@example.com)");
    return;
  }
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    credentials: 'include',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim() })
  });

  const data = await res.json();

  if (data.success) {
    setLoggedIn(true);
    setFullName(data.user?.fullName || "");
    setAddress(data.user?.address || "");
    setPhone(data.user?.phone || "");
    setEmail(data.user?.email || email.trim().toLowerCase());
    localStorage.setItem("user", data.user?.email || email.trim().toLowerCase());
    localStorage.setItem("fullName", data.user?.fullName || "");
    localStorage.setItem("phone", data.user?.phone || "");
    localStorage.setItem("address", data.user?.address || "");

    alert("🎉 Login Successful! Welcome to Whiteboard");
  } else {
    alert(`❌ Login Failed: ${data.message}`);
  }
};

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("fullName");
    localStorage.removeItem("phone");
    localStorage.removeItem("address");
    setFullName("");
    setAddress("");
    setPhone("");
    setLoggedIn(false);
  };

  const updateProfile = async () => {
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (phone && !phoneRegex.test(phone.trim())) {
      alert("⚠️ Please enter a valid phone number");
      return;
    }

    const res = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      credentials: 'include',
      body: JSON.stringify({
        fullName: fullName.trim(),
        address: address.trim(),
        phone: phone.trim()
      })
    });

    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem("fullName", fullName.trim());
      localStorage.setItem("phone", phone.trim());
      localStorage.setItem("address", address.trim());
      setIsEditingProfile(false);
      alert("✅ Profile updated successfully!");
    } else {
      alert(`❌ Update Failed: ${data.message}`);
    }
  };

  // Drawing tools - Support both mouse and touch
  const startDrawing = (e) => {
    setDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastPointRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (!drawing) return;
    setDrawing(false);
    lastPointRef.current = null;
    pushHistory();
  };

  const draw = (e) => {
    if (!drawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const current = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    const prev = lastPointRef.current;
    if (!prev) {
      lastPointRef.current = current;
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = size;
    ctx.lineCap = "round";

    if (tool === "eraser") {
      ctx.strokeStyle = boardBg;
    } else {
      ctx.strokeStyle = color;
    }

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    if (socket && room) {
      socket.emit("drawEvent", {
        room,
        user: fullName || email,
        fromX: prev.x,
        fromY: prev.y,
        toX: current.x,
        toY: current.y,
        color,
        size,
        tool
      });
    }

    lastPointRef.current = current;
    e.preventDefault();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = boardBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    pushHistory();
  };

  const save = () => {
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="app-container">
      <div className="app-overlay" />
      <div className="app-modal">
      
        <div className="app-content">
        
          <h1>✨ Smart Whiteboard</h1>

          {!loggedIn && (
            <>
              <div className="auth-buttons">
                <button
                  className={`btn-primary ${!isRegister ? 'active' : ''}`}
                  onClick={() => setIsRegister(false)}
                >
                  Login
                </button>
                <button
                  className={`btn-primary ${isRegister ? 'active' : ''}`}
                  onClick={() => setIsRegister(true)}
                >
                  Create Account
                </button>
              </div>

              {isRegister && (
                <>
                  <input placeholder="Full Name" value={fullName} onChange={(e)=>setFullName(e.target.value)} className="input-field"/>
                  <input placeholder="Address" value={address} onChange={(e)=>setAddress(e.target.value)} className="input-field"/>
                  <input placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} className="input-field"/>
                </>
              )}

              <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="input-field"/>
              <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="input-field"/>

              {isRegister ? (
                <button className="btn-primary btn-large" onClick={register}>Create Account</button>
              ) : (
                <button className="btn-primary btn-large" onClick={login}>Login</button>
              )}
            </>
          )}

          {loggedIn && (
            <>
              <div className="controls-main">
                <div className="controls-top">
                  <input
                    placeholder="Room ID"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="input-field room-input"
                  />
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (socket && room) {
                        socket.emit("joinRoom", { room, user: fullName || email });
                        alert(`Joined room ${room}`);
                      }
                    }}
                  >
                    Join Room
                  </button>
                </div>

                <div className="controls-drawing">
                  <div className="control-group">
                    <label>🎨 Color:</label>
                    <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="color-input"/>
                  </div>
                  
                  <div className="control-group">
                    <label>Thickness:</label>
                    <input type="range" min="1" max="30" value={size} onChange={(e)=>setSize(e.target.value)} className="range-input"/>
                  </div>

                  <div className="control-group">
                    <label>BG:</label>
                    <input type="color" value={boardBg} onChange={(e)=>setBoardBg(e.target.value)} className="color-input"/>
                  </div>

                  <div className="control-group">
                    <label>Tool:</label>
                    <select value={tool} onChange={(e)=>setTool(e.target.value)} className="input-field">
                      <option value="pen">Pen</option>
                      <option value="eraser">Eraser</option>
                    </select>
                  </div>
                </div>

                <div className="controls-actions">
                  <button className="btn-primary" onClick={undo} disabled={historyIndex <= 0}>↶ Undo</button>
                  <button className="btn-primary" onClick={redo} disabled={historyIndex >= history.length - 1}>↷ Redo</button>
                  <button className="btn-primary" onClick={clear}>🗑️ New</button>
                  <button className="btn-primary" onClick={save}>⬇️ Save</button>
                  <button className="btn-primary" onClick={() => setShowGrid(!showGrid)}>
                    {showGrid ? "Hide Grid" : "Show Grid"}
                  </button>
                  <button className="btn-primary" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
                  </button>
                  <button className="btn-primary btn-logout" onClick={logout}>Logout</button>
                </div>
              </div>

              <div className="profile-card">
                <h3>Welcome, {fullName || email || "Guest"}</h3>
                {isEditingProfile ? (
                  <>
                    <input placeholder="Full Name" value={fullName} onChange={(e)=>setFullName(e.target.value)} className="input-field"/>
                    <input placeholder="Address" value={address} onChange={(e)=>setAddress(e.target.value)} className="input-field"/>
                    <input placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} className="input-field"/>
                    <button className="btn-primary" onClick={updateProfile}>Save Changes</button>
                    <button className="btn-secondary" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <p><strong>Phone:</strong> {phone || "Not set"}</p>
                    <p><strong>Address:</strong> {address || "Not set"}</p>
                    <button className="btn-primary" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
                  </>
                )}
              </div>

              <canvas
                key={`canvas-${loggedIn}`}
                ref={canvasRef}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                className="drawing-canvas"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
              />
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
