"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      router.push("/dashboard");
    } else {
      alert(data.error || "Login gagal");
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_#000] p-8">
        <CardContent className="p-0">
          <h1 className="text-4xl font-extrabold text-black mb-6 tracking-tight">
            Login
          </h1>

          {/* FORM LOGIN DI SINI */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="flex flex-col">
              <Label className="text-black font-semibold mb-1">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-black border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_#000] h-12"
                required
              />
            </div>

            <div className="flex flex-col">
              <Label className="text-black font-semibold mb-1">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white text-black border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_#000] h-12"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#ffdd00] text-black border-4 border-black rounded-lg font-extrabold text-lg shadow-[4px_4px_0px_0px_#000] h-12 active:translate-y-1 active:shadow-none"
            >
              Masuk
            </Button>
          </form>

          <p className="mt-5 font-medium text-black">
            Belum punya akun?
            <a href="/register" className="underline ml-1 font-bold">
              Daftar
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
