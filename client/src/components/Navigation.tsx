import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { UserCircle, LogOut, Menu, X, HeartHandshake } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;
  
  const navLinks = [
    { href: "/", label: "홈" },
    { href: "/tests", label: "심리검사" },
    { href: "/results", label: "검사결과" },
    { href: "/community", label: "마음톡" },
  ];

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <HeartHandshake className="w-6 h-6 text-primary" />
              </div>
              <span className="font-heading text-xl font-bold text-primary tracking-tight">
                마음이음
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary font-bold" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex md:items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                  <div className="flex flex-col items-end mr-2">
                    <span className="text-sm font-semibold">{user.firstName || '회원'}님</span>
                  </div>
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full border-2 border-primary/20" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <UserCircle className="w-6 h-6" />
                    </div>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">가족 프로필 관리</DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> 로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <a 
                href="/api/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
              >
                시작하기
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.href) 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground/70 hover:bg-primary/5 hover:text-primary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-4 border-t border-border">
            {user ? (
              <div className="px-5 space-y-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {user.profileImageUrl ? (
                      <img className="h-10 w-10 rounded-full" src={user.profileImageUrl} alt="" />
                    ) : (
                      <UserCircle className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-foreground">{user.firstName || '회원'}님</div>
                    <div className="text-sm font-medium leading-none text-muted-foreground mt-1">{user.email}</div>
                  </div>
                </div>
                <Link href="/profile">
                    <div className="block px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-primary/5 hover:text-primary cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                      가족 프로필 관리
                    </div>
                  </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-5 w-5" /> 로그아웃
                </button>
              </div>
            ) : (
              <div className="px-5">
                <a
                  href="/api/login"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90"
                >
                  로그인 / 회원가입
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
