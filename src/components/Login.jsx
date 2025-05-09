import React from "react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { argon2id } from "hash-wasm";
import { ToastContainer, toast } from "react-toastify";
import { deriveKey, decryptAESGCM, generateSalt, decodeToBytes, encryptVault } from '../utils/crypto';

const Login = () => {
  const [form, setform] = useState({
    // websiteURL: "",
    email: "",
    password: "",
  });
  const ref = useRef();
  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };
  const passwordRef = useRef();
  const [email, setEmail] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const idleTimer = useRef(null);
  const navigate = useNavigate();

  const resetIdle = () => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setVault(null);
      alert("Session timed out. Please log in again.");
    }, 1000 * 60 * 5);
  };
  const showPassword = () => {
    passwordRef.current.type = "text";
    console.log(ref.current.src);
    if (ref.current.src.includes("src/assets/icons/eye-512.webp")) {
      ref.current.src = "src/assets/icons/slice13-256.webp";
      passwordRef.current.type = "password";
    } else {
      alert("show password");
      ref.current.src = "src/assets/icons/eye-512.webp";
      passwordRef.current.type = "text";
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const vaultData = {
      // website: form.websiteURL,
      credentials: { email: form.email, password: form.password },
    };

    const salt = generateSalt();
    const keyHex = await deriveKey(form.password, salt);
    const { encryptedVault, iv } = await encryptVault(vaultData, keyHex);

    const body = {
      // websiteURL: form.websiteURL,
      email: form.email,
      masterPassword: form.password,
      encryptedVault,
      salt,
      iv,
    };
    console.log("the body is----", body);

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to register");
      }

      toast.success("Password Added", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (error) {
      toast.error(error.message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  // Login + vault fetch + decryption
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const body = {
      // websiteURL: form.websiteURL,
      email: form.email,
      masterPassword: form.password,
    };
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log("the data is----", data);

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
      localStorage.setItem("userId", data.userId);
      const { encryptedVault, salt, iv } = data;
      // derive key
      const keyHex = await deriveKey(form.password, salt);
      console.log("the key is----", keyHex);

      // decrypt vault
      const decrypted = await decryptAESGCM(encryptedVault, keyHex, iv);
      console.log("the decrypted vault is----", decrypted);
      setVault(decrypted);
      toast.success("Login Success", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      // resetIdle();
      console.log("logged in successfully");
      localStorage.setItem("isLoggedIn", true);
      navigate("/Manage");
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error(err.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setVault(null);
    } finally {
      setLoading(false);
    }
  };
  // console.log("the vault is----", vault);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div
        className="p-7 flex flex-col gap-4 w-full justifyCenter"
        style={{ alignItems: "center" }}
      >
        <input
          value={form.email}
          placeholder="Enter your email address"
          onChange={handleChange}
          className="rounded-full border border-purple-600 w-70 p-4 py-1"
          type="text"
          name="email"
          id="email"
        />
        <div className="relative">
          <input
            ref={passwordRef}
            value={form.password}
            placeholder="Enter password"
            onChange={handleChange}
            className="rounded-full border border-purple-600 w-100 p-4 py-1"
            type="password"
            name="password"
            id="password"
          />
          <span
            className="absolute right-[3px] top-[0px] cursor-pointer"
            onClick={showPassword}
          >
            <img
              ref={ref}
              className="p-1"
              width={33}
              src="src/assets/icons/slice13-256.webp"
              alt="eye"
            />
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "alignItems",
            gap: "12px",
          }}
        >
          <button
            className="flex text-white justify-center items-center gap-1 px-8 cursor-pointer
       bg-purple-500 hover:bg-purple-300 hover:border-1 border-purple-950 rounded-full py-2 w-fit"
            onClick={(e) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(form.email)) {
                toast.error("Invalid email address", {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "dark",
                });
                return;
              }
              if (form.password.length < 10) {
                toast.error("Password strength must be strong", {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "dark",
                });
                return;
              }
              // Create an empty vault for the user during registration
              const emptyVault = { credentials: [] };
              setVault(emptyVault);
              handleRegister(e);
            }}
            type="submit"
            name="submit"
            id="submit"
          >
            <lord-icon
              src="https://cdn.lordicon.com/kdduutaw.json"
              trigger="hover"
              stroke="bold"
              style={{ width: "25px", height: "25px" }}
            ></lord-icon>
            Add Password
          </button>
          <button
            className="flex text-white justify-center items-center gap-1 px-8 cursor-pointer
       bg-purple-500 hover:bg-purple-300 hover:border-1 border-purple-950 rounded-full py-2 w-fit"
            onClick={handleLogin}
            type="submit"
            name="submit"
            id="submit"
          >
            <lord-icon
              src="https://cdn.lordicon.com/kdduutaw.json"
              trigger="hover"
              stroke="bold"
              style={{ width: "25px", height: "25px" }}
            ></lord-icon>
            Login + Manage Password
          </button>
        </div>
        <div className="mt-4 w-fit" style={{ width: "566px" }}>
          <h2
            className="text-lg font-bold mb-4"
            style={{ display: "flex", justifyContent: "center" }}
          >
            Password-Strength Analytics
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span>Strength:</span>
              <div className="flex justify-between gap-2">
                <span>
                  {form.password.length < 6
                    ? "Weak"
                    : form.password.length < 10
                    ? "Moderate"
                    : "Strong"}
                </span>
                <div className="flex justify-center">
                  {form.password.length < 6 && (
                    <lord-icon
                      src="https://cdn.lordicon.com/xlayapaf.json"
                      trigger="hover"
                      stroke="bold"
                      colors="primary:#3a3347,secondary:#e83a30,tertiary:#b26836"
                      style={{ width: "25px", height: "25px" }}
                    ></lord-icon>
                  )}
                  {form.password.length >= 6 && form.password.length < 10 && (
                    <lord-icon
                      src="https://cdn.lordicon.com/xlayapaf.json"
                      trigger="hover"
                      stroke="bold"
                      colors="primary:#3a3347,secondary:#e8b730,tertiary:#b26836"
                      style={{ width: "25px", height: "25px" }}
                    ></lord-icon>
                  )}
                  {form.password.length >= 10 && (
                    <lord-icon
                      src="https://cdn.lordicon.com/xlayapaf.json"
                      trigger="hover"
                      stroke="bold"
                      colors="primary:#3a3347,secondary:#a5e830,tertiary:#b26836"
                      style={{
                        width: "25px",
                        height: "25px",
                        marginTop: "1px",
                      }}
                    ></lord-icon>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Length:</span>
              <span>{form.password.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Contains Numbers:</span>
              <span
                style={{
                  textWeight: "bold",
                  color: /\d/.test(form.password) ? "#30ba4a" : "#b00600",
                }}
              >
                {/\d/.test(form.password) ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Contains Special Characters:</span>
              <span
                style={{
                  textWeight: "bold",
                  color: /[!@#$%^&*(),.?":{}|<>]/.test(form.password)
                    ? "#30ba4a"
                    : "#b00600",
                }}
              >
                {/[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
