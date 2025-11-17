"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
      if (!adminUrl) {
        throw new Error("Admin API URL is not configured");
      }
      const normalizedAdminUrl = adminUrl.replace(/\/$/, "");
      const endpoint = "/api/auth/register";
      const storeId = process.env.NEXT_PUBLIC_STORE_ID;
      const body: {
        email: string;
        password: string;
        name: string;
        storeId?: string;
        address?: string;
        phone?: string;
        gender?: string;
      } = {
        email,
        password,
        name,
      };
      if (storeId) body.storeId = storeId;
      if (address) body.address = address;
      if (phone) body.phone = phone;
      if (gender) body.gender = gender;
      const response = await fetch(`${normalizedAdminUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "x-debug": "true",
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const text = await response.text();
      if (response.ok) {
        try {
          const _data = text ? JSON.parse(text) : null;
          void _data;
        } catch {}
        try {
          const toast = window?.toast;
          if (toast) toast.success("Account created");
          else alert("Account created");
        } catch {}
        onClose();
      } else {
        let errorMessage = 'Registration failed';
        try {
          const err = text ? JSON.parse(text) : null;
          errorMessage = err?.message || err?.error || err?.detail || errorMessage;
          console.error("Registration failed:", {
            status: response.status,
            error: err,
            raw: text
          });
        } catch {
          console.error("Registration failed:", {
            status: response.status,
            raw: text
          });
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred while trying to register. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sign Up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Personal Information</h3>
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., +62 812 3456 7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select your gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="address" className="text-sm font-medium">Address</Label>
              <textarea
                id="address"
                placeholder="Enter your complete address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Account Information</h3>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mt-1"
              />
            </div>
          </div>
          <Button type="submit" className="w-full py-2 h-auto text-base">
            Sign Up
          </Button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm">Sudah punya akun?{' '}
            <button
              type="button"
              className="text-blue-600 hover:underline font-semibold"
              onClick={() => {
                if (onSwitchToLogin) {
                  onClose();
                  onSwitchToLogin();
                }
              }}
            >Login</button>
          </span>
        </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
