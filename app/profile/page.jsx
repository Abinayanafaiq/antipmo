"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      } else {
        router.push("/login");
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Profile</h1>

        <div className="mt-6 p-6 border-4 border-black rounded-xl card-app">
          <div className="text-lg font-semibold">{profile.user.name}</div>
          <div className="text-sm text-gray-500">{profile.user.email}</div>

          <div className="mt-4">
            <div>
              Current Streak:{" "}
              <strong>{profile.challenge?.currentStreak ?? 0} hari</strong>
            </div>
            <div>
              Longest Streak:{" "}
              <strong>{profile.challenge?.longestStreak ?? 0} hari</strong>
            </div>
            <div>
              Target: <strong>{profile.challenge?.dayTarget ?? 30} hari</strong>
            </div>
          </div>

          <div className="mt-4">
            <button className="px-4 py-2 border-4 border-black rounded font-bold">
              Edit Profile (placeholder)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
