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

      const body: any = {
        email,
        password,
        ...(isLogin ? {} : { name }),
      };

      if (!isLogin && storeId) {
        body.storeId = storeId;
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

      if (response.ok) {
        await response.json(); // consume the response
        // Handle successful login/register: show a simple confirmation and close
        try {
          const toast = window?.toast;
          if (toast) toast.success(isLogin ? "Logged in" : "Account created");
          else alert(isLogin ? "Logged in" : "Account created");
        } catch {
          // ignore
        }
        onClose();
      } else {
        // Handle error
        try {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || 'Authentication failed';
          console.error("Authentication failed", errorData);
          alert(errorMessage);
        } catch {
          const errText = await response.text();
          console.error("Authentication failed", errText);
          alert("Authentication failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert("An error occurred while trying to authenticate. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{isLogin ? "Login" : "Sign Up"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                autoFocus
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <Button type="submit" className="w-full">
              {isLogin ? "Login" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
