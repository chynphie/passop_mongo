import React from "react";
import { useRef, useState, useEffect } from "react";
import { argon2id } from "hash-wasm";

const Login = () => {
  const [form, setform] = useState({
    websiteURL: "",
    email: "",
    password: "",
  });
  const ref = useRef();
  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const passwordRef = useRef();

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

  // === 1. Generate random salt (128-bit) ===
  const generateSalt = (length = 16) => {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array)); // Base64 encoded salt
  };

  // === 2. Derive encryption key using Argon2id ===
  const deriveKey = async (password, saltBase64) => {
    const saltBytes = Uint8Array.from(atob(saltBase64), (c) => c.charCodeAt(0));
    const hashHex = await argon2id({
      password, // string
      iterations: 3, // time cost
      salt: saltBytes, // Uint8Array
      memorySize: 1 << 16, // 64 MiB
      parallelism: 1, // p=1
      hashLength: 32, // 32 bytes = 256 bits
    });
    return hashHex; // hex string
  };

  // === 3. Encrypt vault data using AES-GCM ===
  const encryptVault = async (vaultObj, keyHex) => {
    const keyBuffer = new Uint8Array(
      keyHex.match(/.{1,2}/g).map((b) => parseInt(b, 16))
    );
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      "AES-GCM",
      false,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(vaultObj));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encoded
    );

    return {
      encryptedVault: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv)),
    };
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const vaultData = {
      website: form.websiteURL,
      credentials: { email: form.email, password: form.password },
    };

    const salt = generateSalt();
    const keyHex = await deriveKey(form.password, salt);
    const { encryptedVault, iv } = await encryptVault(vaultData, keyHex);

    const body = {
      websiteURL: form.websiteURL,
      email: form.email,
      password: form.password,
      encryptedVault: `${encryptedVault}:${iv}`,
      salt,
    };

    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log(await res.json());
  };

  return (
    <div
      className="p-7 flex flex-col gap-4 w-full justifyCenter"
      style={{ alignItems: "center" }}
    >
      <input
        value={form.websiteURL}
        placeholder="Enter website URL"
        onChange={handleChange}
        className="rounded-full border border-purple-600 w-70 p-4 py-1"
        type="text"
        name="websiteURL"
        id="websiteURL"
      />
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
        style={{ display: "flex", justifyContent: "alignItems", gap: "12px" }}
      >
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
          Login
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
          Register/Add
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
          Manage Password
        </button>
      </div>
      <div className="mt-4 w-fit" style={{ width: "566px" }}>
        <h2 className="text-lg font-bold mb-4" style={{display: "flex" , justifyContent: "center"}}>Password-Strength Analytics</h2>
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
                    style={{ width: "25px", height: "25px", marginTop: "1px" }}
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
  );
};

export default Login;
