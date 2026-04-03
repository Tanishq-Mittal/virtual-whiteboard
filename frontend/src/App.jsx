import { useRef, useState, useEffect } from "react";

function App() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(3);

  // 🔥 keep login after refresh
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setLoggedIn(true);
  }, []);

  const register = async () => {
  if (!email || !password) {
    alert("⚠️ Please fill all fields");
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("⚠️ Please enter a valid email address (e.g. user@example.com)");
    return;
  }

  await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  });

  alert("✅ Registered Successfully!");

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
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.success) {
    setLoggedIn(true);
    localStorage.setItem("user", email);

    alert("🎉 Login Successful! Welcome to Whiteboard");
  } else {
    alert("❌ Wrong Email or Password");
  }
};

  const logout = () => {
    localStorage.removeItem("user");
    setLoggedIn(false);
  };

  // ✅ FIXED DRAWING SYSTEM
  const startDrawing = (e) => {
    setDrawing(true);

    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const draw = (e) => {
    if (!drawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");

    ctx.lineWidth = size;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  // ✅ FIXED CLEAR
  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
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
      background: "linear-gradient(to right, #4facfe, #00f2fe)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial"
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
            <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} style={inputStyle}/>
            <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} style={inputStyle}/>
            
            <button style={btnStyle} onClick={register}>Register</button>
            <button style={btnStyle} onClick={login}>Login</button>
            
          </>
        )}

        {loggedIn && (
          <>
            <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center"
}}>

              🎨 <input type="color" onChange={(e)=>setColor(e.target.value)} />
              
              ✏️ Size:
              <input
                type="range"
                min="1"
                max="20"
                value={size}
                onChange={(e)=>setSize(e.target.value)}
              />

              <button style={btnStyle} onClick={()=>setColor("#ffffff")}>Eraser</button>
              <button style={btnStyle} onClick={clear}>Clear</button>
              <button style={btnStyle} onClick={save}>Save</button>
              <button style={btnStyle} onClick={logout}>Logout</button>
            </div>

            <canvas
  ref={canvasRef}
  width={window.innerWidth < 600 ? 300 : 800}
  height={window.innerWidth < 600 ? 300 : 500}
  style={{
    width: "100%",
    border: "2px solid #ccc",
    borderRadius:"10px",
    cursor:"crosshair"
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
