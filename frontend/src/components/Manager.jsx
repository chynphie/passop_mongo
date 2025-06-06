import React from "react";
import { useRef, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import Login from "./Login";
import { deriveKey, decryptAESGCM, generateSalt, decodeToBytes, encryptVault } from '../utils/crypto';

const Manager = () => {
  const ref = useRef();
  const passwordRef = useRef();
  const [form, setform] = useState({ site: "", email: "", password: "" });
  const [passwordArray, setPasswordArray] = useState([]);
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const idleTimer = useRef(null);

  // Idle detection: clear vault after 5 minutes
  const resetIdle = () => {
    clearTimeout(idleTimer.current);
    const getPasswords = async () => {};
  };

  const decryptVault = async (passwords) => {
    const decryptedList = await Promise.all(
      passwords.map(async (data) => {
        const { encryptedVault, salt, iv, keyHex } = data;
        const decrypted = await decryptAESGCM(encryptedVault, keyHex, iv);
        return (decrypted);
      })
    );
    console.log("decryptedList", decryptedList);
    const updatedPasswordArray = decryptedList.flatMap(e => e.credentials);
    setPasswordArray(updatedPasswordArray);
  };

  const getPasswords = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    let res = await fetch(`http://localhost:3000/api/vault/${userId}`);
    let passwords = await res.json();
    console.log(passwords);
    decryptVault(passwords);
  };
  
  useEffect(() => {
    getPasswords();
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    return () => {
      clearTimeout(idleTimer.current);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown", resetIdle);
    };
  }, []);

  const copyText = (text) => {
    toast.success("Copied", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    navigator.clipboard.writeText(text);
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

  const savePassword = async (e) => {
    e.preventDefault();
    const vaultData = {
      // website: form.websiteURL,
      credentials: {websiteURL: form.websiteURL, email: form.email, password: form.password },
    };

    const salt = generateSalt();
    const keyHex = await deriveKey(form.password, salt);
    const userId = localStorage.getItem("userId");
    const { encryptedVault, iv } = await encryptVault(vaultData, keyHex);

    const body = {
      userId: userId,
      websiteURL: form.websiteURL,
      email: form.email,
      keyHex: keyHex,
      masterPassword: form.password,
      encryptedVault,
      salt,
      iv,
    };
    console.log("the body is----", body);

    try {
      const res = await fetch("http://localhost:3000/api/vault/save", {
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

  const editPassword = (id) => {
    console.log(id);
    toast("Edited", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    setform(passwordArray.filter((i) => i.id === id)[0]);
    setPasswordArray(passwordArray.filter((item) => item.id !== id));
  };

  const deletePassword = async (id) => {
    console.log(id);
    // const newPasswordArray = passwordArray.filter((item) => item.id !== id);
    let c = window.confirm(
      "Are you sure you want to delete this password? This action cannot be undone."
    );
    if (c) {
      let res = await fetch("http://localhost:3000", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      setPasswordArray(passwordArray.filter((item) => item.id !== id));
      toast.info("Deleted", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      // setPasswordArray(newPasswordArray);
      // localStorage.setItem("passwords", JSON.stringify(newPasswordArray));
    }
  };

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

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
      <div className="fixed inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>
      <div className="md:container md:p-0 md:py-16 md:mx-auto pt-3">
        <div className="items-center justify-center flex flex-col p-4 text-black gap-8">
          <h2 className="font-bold text-3xl py-4">Your Passwords</h2>
          <h1 className="text-4xl font-bold text-center">
            <span className="text-purple-500">&lt;</span>
            <span>Pass</span>
            <span className="text-purple-500">OP/ &gt;</span>
          </h1>
          <p className="text-purple-900 text-lg text-center">
            Your own Password Manager
          </p>

          <div className="flex flex-col p-4 text-black gap-8 items-center">
            <input
              value={form.websiteURL}
              onChange={handleChange}
              placeholder="Enter website URL"
              className="rounded-full border border-purple-600 w-full p-4 py-1"
              type="text"
              name="websiteURL"
              id="websiteURL"
            />
            <div className="flex flex-col md:flex-row w-full justify-between gap-7 ">
              <input
                value={form.email}
                placeholder="Enter email"
                onChange={handleChange}
                className="rounded-full border border-purple-600 w-full p-4 py-1"
                type="text"
                name="email"
                id="email"
              />
              <div className="relative">
                <input
                  ref={passwordRef}
                  value={form.passwordHash}
                  placeholder="Enter password"
                  onChange={handleChange}
                  className="rounded-full border border-purple-600 w-full p-4 py-1"
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
            </div>
            <button
              onClick={savePassword}
              className="flex text-white justify-center items-center gap-1 px-8 cursor-pointer bg-purple-500 hover:bg-purple-300 hover:border-1 border-purple-950 rounded-full py-2 w-fit"
            >
              <lord-icon
                src="https://cdn.lordicon.com/sbnjyzil.json"
                trigger="hover"
                stroke="bold"
                colors="primary:#ffffff,secondary:#ffffff"
              ></lord-icon>
              Save Password
            </button>
          </div>
          {!isLoggedIn && <div>Please log in to view your passwords.</div>}
          {isLoggedIn &&
            (passwordArray && passwordArray.length > 0 ? (
              <table className="table-auto w-full overflow-hidden mb-10">
                <thead className="bg-purple-900 text-white">
                  <tr>
                    <th className="py-2">Site</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Password</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-purple-100">
                  {passwordArray.map((item, index) => (
                    <tr key={index} className="border border-white">
                      <td className="flex items-center justify-center py-2 text-center">
                        <div className="flex items-center justify-center">
                          <a
                            href={item.websiteURL}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.websiteURL}
                          </a>
                          <div
                            className="cursor-pointer size-7"
                            onClick={() => copyText(item.websiteURL)}
                          >
                            <lord-icon
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                                paddingLeft: "3px",
                              }}
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="hover"
                            ></lord-icon>
                          </div>
                        </div>
                      </td>
                      <td className="justify-center py-2 text-center">
                        <div className="flex items-center justify-center">
                          <span>{item.email}</span>
                          <div
                            className="cursor-pointer size-7"
                            onClick={() => copyText(item.email)}
                          >
                            <lord-icon
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                                paddingLeft: "3px",
                              }}
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="hover"
                            ></lord-icon>
                          </div>
                        </div>
                      </td>
                      <td className="justify-center py-2 text-center">
                        <div className="flex items-center justify-center">
                          <input
                            type={item.showPassword ? "text" : "password"}
                            value={item.password}
                            readOnly
                            className="border-none bg-transparent text-center"
                          />
                          <div
                            className="cursor-pointer size-7"
                            onClick={() => {
                              const updatedArray = [...passwordArray];
                              updatedArray[index] = {
                                ...updatedArray[index],
                                showPassword: !updatedArray[index].showPassword,
                              };
                              setPasswordArray(updatedArray);
                            }}
                          >
                            <img
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                                paddingLeft: "3px",
                              }}
                              src={
                                item.showPassword
                                  ? "src/assets/icons/eye-512.webp"
                                  : "src/assets/icons/slice13-256.webp"
                              }
                              alt="toggle visibility"
                            />
                          </div>
                          <div
                            className="cursor-pointer size-7"
                            onClick={() => copyText(item.passwordHash)}
                          >
                            <lord-icon
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                                paddingLeft: "3px",
                              }}
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="hover"
                            ></lord-icon>
                          </div>
                        </div>
                      </td>
                      <td className="justify-center py-2 text-center">
                        <div className="flex items-center justify-center">
                          <div
                            className="cursor-pointer mx-2"
                            onClick={() => {
                              editPassword(item.id);
                            }}
                          >
                            <lord-icon
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                                paddingLeft: "3px",
                              }}
                              src="https://cdn.lordicon.com/gwlusjdu.json"
                              trigger="hover"
                            ></lord-icon>
                          </div>
                          <div
                            className="cursor-pointer mx-2"
                            onClick={() => {
                              deletePassword(item.id);
                            }}
                          >
                            <lord-icon
                              style={{
                                width: "25px",
                                height: "25px",
                                paddingTop: "3px",
                                paddingLeft: "3px",
                              }}
                              src="https://cdn.lordicon.com/skkahier.json"
                              trigger="hover"
                            ></lord-icon>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>No passwords to show</div>
            ))}
        </div>
      </div>
    </>
  );
};

export default Manager;
