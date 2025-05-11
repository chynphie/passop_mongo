import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { sha1 } from 'js-sha1';

export function PasswordAnalyzer({ password }) {
  const [entropy, setEntropy] = useState(0);
  const [charSets, setCharSets] = useState({});
  const [pwnedCount, setPwnedCount] = useState(null);

  // 1) Character-set heuristics + entropy
  useEffect(() => {
    if (!password) {
      setEntropy(0);
      setCharSets({});
      return;
    }
    const has = { lower: /[a-z]/.test(password),
                  upper: /[A-Z]/.test(password),
                  digits: /\d/.test(password),
                  symbols: /[^A-Za-z0-9]/.test(password) };
    setCharSets(has);

    // estimate pool size
    let pool = 0;
    if (has.lower)  pool += 26;
    if (has.upper)  pool += 26;
    if (has.digits) pool += 10;
    if (has.symbols)pool += 32;   // approx.
    // entropy = log2(pool^length)
    const e = password.length * Math.log2(pool || 1);
    setEntropy(Math.round(e * 100) / 100);
    localStorage.setItem('passwordEntropy', e.toString());
  }, [password]);

  // 2) Debounced breach check
  useEffect(() => {
    if (!password) return setPwnedCount(null);
    const handle = setTimeout(async () => {
      const hash = sha1(password).toUpperCase();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);
      try {
        const res = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
        // console.log(res);
        
        // response is list of “SUFFIX:COUNT”
        const match = res.data
          .split('\r\n')
          .find(line => line.split(':')[0] === suffix);
        setPwnedCount(match ? parseInt(match.split(':')[1], 10) : 0);
      } catch {
        setPwnedCount(-1); // error
      }
    }, 500); // wait 500ms after typing stops

    return () => clearTimeout(handle);
  }, [password]);

  return (
    <div className="p-4 border rounded mt-10">
      <p><strong>Entropy:</strong> {entropy} bits</p>
      <p><strong>Char sets:</strong> 
        {charSets.lower && ' lowercase,'}
        {charSets.upper && ' uppercase,'}
        {charSets.digits && ' digits,'}
        {charSets.symbols && ' symbols'}
      </p>
      <p>
        <strong>Breach check:</strong>{' '}
        {pwnedCount === null
          ? '—'
          : pwnedCount === -1
            ? 'Error checking'
            : pwnedCount > 0
              ? `Seen ${pwnedCount} times`
              : 'Not found'}
      </p>
    </div>
  );
}
