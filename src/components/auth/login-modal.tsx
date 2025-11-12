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

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
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
  // use the admin API path under /api
  const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      // Include optional storeId when registering from the storefront so the
      // admin can associate the created user with the correct store.
      // Provide the store id via NEXT_PUBLIC_STORE_ID in the storefront env.
      const storeId = process.env.NEXT_PUBLIC_STORE_ID;

      const body: { 
        email: string; 
        password: string; 
        name?: string; 
        storeId?: string;
        address?: string;
        phone?: string;
        gender?: string;
      } = {
        email,
        password,
        ...(isLogin ? {} : { name }),
      };

      if (!isLogin && storeId) {
        body.storeId = storeId;
      }

      if (!isLogin) {
        if (address) body.address = address;
        if (phone) body.phone = phone;
        if (gender) body.gender = gender;
      }

      const response = await fetch(`${adminUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      // Read body once and parse accordingly to avoid "body stream already read"
      const text = await response.text();
      if (response.ok) {
        // Try to parse JSON, but don't fail if it's empty/non-JSON
        try {
          const _data = text ? JSON.parse(text) : null;
          // (optional) use returned data if needed
          void _data;
        } catch {
          // ignore parse errors for success responses
        }
        try {
          const toast = window?.toast;
          if (toast) toast.success(isLogin ? "Logged in" : "Account created");
          else alert(isLogin ? "Logged in" : "Account created");
        } catch {
          // ignore
        }
        onClose();
      } else {
        // Handle error: try to parse JSON first, otherwise use raw text
        let errorMessage = 'Authentication failed';
        try {
          const err = text ? JSON.parse(text) : null;
          errorMessage = err?.message || err?.error || errorMessage;
          console.error("Authentication failed", err ?? text);
        } catch {
          console.error("Authentication failed", text);
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert("An error occurred while trying to authenticate. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isLogin ? "Login" : "Sign Up"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
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
                  required={!isLogin}
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
          )}

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
                autoFocus={isLogin}
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
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              // Reset form when switching
              setEmail("");
              setPassword("");
              setName("");
              setAddress("");
              setPhone("");
              setGender("");
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin
              ? "Don't have an account? Sign up here"
              : "Already have an account? Login here"}
          </button>
        </div>
        
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
