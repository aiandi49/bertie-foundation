import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title = "Admin Panel" }: AdminLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navigation />
      
      <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              Back to Site
            </Button>
          </div>
        </div>
      </div>
      
      <main className="flex-1 bg-zinc-950">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
