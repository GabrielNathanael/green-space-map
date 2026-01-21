import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl transition-transform group-hover:scale-105">
            <Image src="/graph.png" alt="Logo" fill className="object-cover" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight hidden sm:inline">
            GreenSpaceMap
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Navigation Items */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden md:flex rounded-full px-4 gap-2 hover:bg-primary/5 hover:text-primary transition-all"
          >
            <Link
              href="https://github.com/GabrielNathanael"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              <span>@GabrielNathanael</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="md:hidden rounded-full hover:bg-primary/5 hover:text-primary"
          >
            <Link
              href="https://github.com/GabrielNathanael"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
