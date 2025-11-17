// This file has been completely rewritten to ensure no syntax errors and only contains the login functionality.
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
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
      if (!adminUrl) {
        throw new Error("Admin API URL is not configured");
      }
      const normalizedAdminUrl = adminUrl.replace(/\/$/, "");
      const endpoint = "/api/auth/login";
      const body = { email, password };
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
          if (toast) toast.success("Logged in");
          else alert("Logged in");
        } catch {}
        onClose();
      } else {
        let errorMessage = 'Authentication failed';
        try {
          const err = text ? JSON.parse(text) : null;
          errorMessage = err?.message || err?.error || err?.detail || errorMessage;
          console.error("Authentication failed:", {
            status: response.status,
            error: err,
            raw: text
          });
        } catch {
          console.error("Authentication failed:", {
            status: response.status,
            raw: text
          });
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
          <DialogTitle className="text-2xl">Login</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                autoFocus
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
            Login
          </Button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm">Belum punya akun?{' '}
            <button
              type="button"
              className="text-blue-600 hover:underline font-semibold"
              onClick={() => {
                if (onSwitchToRegister) {
                  onClose();
                  onSwitchToRegister();
                }
              }}
            >Daftar</button>
          </span>
        </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
