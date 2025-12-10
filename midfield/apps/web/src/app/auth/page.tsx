"use client";

import { useState } from "react";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: logic.auth.signIn(email)
        console.log("Login with", email);
        setSent(true);
    };

    if (sent) {
        return (
            <div className="text-center pt-10">
                <h1 className="text-2xl font-bold mb-4">Check your email</h1>
                <p>We sent a magic link to {email}</p>
            </div>
        );
    }

    return (
        <div className="pt-10">
            <h1 className="text-2xl font-bold mb-6">Sign in / Sign up</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 bg-black text-white rounded font-bold"
                >
                    Send Magic Link
                </button>
            </form>
        </div>
    );
}
