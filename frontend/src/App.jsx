import { useRef, useState, useEffect } from "react";

function App() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem("user"));
  const [isRegister, setIsRegister] = useState(false);

  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(3);
  const [boardBg, setBoardBg] = useState("#ffffff");
  const [tool, setTool] = useState("pen");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [theme, setTheme] = useState("dark");
  const [showGrid, setShowGrid] = useState(false);

  const pushHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snapshot = canvas.toDataURL();
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(snapshot);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  // 🔥 keep login after refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setLoggedIn(true);
      setFullName(localStorage.getItem("fullName") || "");
      setAddress(localStorage.getItem("address") || "");
      setPhone(localStorage.getItem("phone") || "");
      setEmail(savedUser);
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = boardBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const initial = canvas.toDataURL();
    setHistory([initial]);
    setHistoryIndex(0);
  }, [boardBg]);


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

  const res = await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
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
  const res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
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

  // Drawing tools
  const startDrawing = (e) => {
    setDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const stopDrawing = () => {
    if (!drawing) return;
    setDrawing(false);
    pushHistory();
  };

  const draw = (e) => {
    if (!drawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");

    ctx.lineWidth = size;
    ctx.lineCap = "round";

    if (tool === "eraser") {
      ctx.strokeStyle = boardBg;
    } else {
      ctx.strokeStyle = color;
    }

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
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
    <div style={{
      minHeight: "100vh",
      backgroundImage: `linear-gradient(rgba(2,16,41,0.80), rgba(8,29,62,0.85)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Inter, Arial, sans-serif",
      color: "#f5f7ff"
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(3,15,37,0.45)",
        zIndex: 0
      }} />
      <div style={{
        position: "relative",
        background: theme === "dark" ? "rgba(14,26,47,0.88)" : "rgba(255,255,255,0.94)",
        color: theme === "dark" ? "#e6eefc" : "#1f2a44",
        padding: "30px",
        borderRadius: "18px",
        boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
        textAlign: "center",
        width: "90%",
        maxWidth: "980px",
        zIndex: 1,
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.2)"
      }}>
      
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        textAlign: "center",
        width: "90%",
        maxWidth: "900px"

      }}>
        
        <h1>✨ Smart Whiteboard</h1>

        {!loggedIn && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
              <button
                style={{ ...btnStyle, marginRight: "10px", background: isRegister ? "#ddd" : "#4facfe", color: isRegister ? "#333" : "white" }}
                onClick={() => setIsRegister(false)}
              >
                Login
              </button>
              <button
                style={{ ...btnStyle, background: isRegister ? "#4facfe" : "#ddd", color: isRegister ? "white" : "#333" }}
                onClick={() => setIsRegister(true)}
              >
                Create Account
              </button>
            </div>

            {isRegister && (
              <>
                <input placeholder="Full Name" value={fullName} onChange={(e)=>setFullName(e.target.value)} style={inputStyle}/>
                <input placeholder="Address" value={address} onChange={(e)=>setAddress(e.target.value)} style={inputStyle}/>
                <input placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} style={inputStyle}/>
              </>
            )}

            <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} style={inputStyle}/>
            <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} style={inputStyle}/>

            {isRegister ? (
              <button style={btnStyle} onClick={register}>Create Account</button>
            ) : (
              <button style={btnStyle} onClick={login}>Login</button>
            )}
          </>
        )}

        {loggedIn && (
          <>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "10px",
              marginBottom: "15px"
            }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <span>🎨</span>
                <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} />
                <label>Thickness:</label>
                <input type="range" min="1" max="30" value={size} onChange={(e)=>setSize(e.target.value)} />
                <label>BG:</label>
                <input type="color" value={boardBg} onChange={(e)=>setBoardBg(e.target.value)} />
                <label>Tool:</label>
                <select value={tool} onChange={(e)=>setTool(e.target.value)} style={inputStyle}>
                  <option value="pen">Pen</option>
                  <option value="eraser">Eraser</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "end" }}>
                <button style={btnStyle} onClick={undo} disabled={historyIndex <= 0}>Undo</button>
                <button style={btnStyle} onClick={redo} disabled={historyIndex >= history.length - 1}>Redo</button>
                <button style={btnStyle} onClick={clear}>New Board</button>
                <button style={btnStyle} onClick={save}>Download</button>
                <button style={btnStyle} onClick={() => setShowGrid(!showGrid)}>
                  {showGrid ? "Hide Grid" : "Show Grid"}
                </button>
                <button style={btnStyle} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "Light Mode" : "Dark Mode"}</button>
                <button style={btnStyle} onClick={logout}>Logout</button>
              </div>
            </div>

            <div style={{ marginBottom: "16px", textAlign: "left", border: "1px solid #ddd", borderRadius: "10px", padding: "12px", background: "#f9f9f9" }}>
              <h3>Welcome, {fullName || email}</h3>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Phone:</strong> {phone || "Not set"}</p>
              <p><strong>Address:</strong> {address || "Not set"}</p>
            </div>

            <canvas
              ref={canvasRef}
              width={window.innerWidth < 600 ? 360 : 920}
              height={window.innerWidth < 600 ? 420 : 620}
              style={{
                width: "100%",
                height: "auto",
                border: "2px solid #ccc",
                borderRadius: "10px",
                cursor: "crosshair",
                background: boardBg,
                backgroundImage: showGrid ? "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)" : "none",
                backgroundSize: showGrid ? "24px 24px" : "none"
              }}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onMouseLeave={stopDrawing}
            />
          </>
        )}

      </div>
    </div>
  );
}

const inputStyle = {
  display: "block",
  margin: "10px auto",
  padding: "10px",
  width: "90%",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const btnStyle = {
  margin: "10px",
  padding: "10px 15px",
  border: "none",
  borderRadius: "8px",
  background: "#4facfe",
  color: "white",
  cursor: "pointer"
};

export default App;
