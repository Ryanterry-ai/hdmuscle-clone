"use client";

import { useState } from "react";

export default function Newsletter({ variant: variant = "footer" }: { variant?: "footer" | "popup" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (variant === "popup") {
    return (
      <div className="bg-[#1d1d1d] p-6 rounded-lg text-center">
        <h3 className="font-oswald text-xl text-white mb-2">Subscribe & Get 10% Off</h3>
        <p className="text-[#a0a0a0] text-sm mb-4">Join our newsletter for exclusive offers and health tips.</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2 rounded text-sm outline-none"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#ffcc00] text-black px-6 py-2 rounded font-oswald text-sm font-bold hover:bg-[#ffd100] disabled:opacity-50"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${status === "success" ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-white text-black px-3 py-2 text-[13px] rounded-l outline-none"
        disabled={status === "loading"}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-[#ffcc00] text-black px-4 py-2 text-[13px] font-bold rounded-r hover:bg-[#ffd100] disabled:opacity-50"
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>
      {message && (
        <p className={`absolute mt-12 text-xs ${status === "success" ? "text-green-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
    </form>
  );
}