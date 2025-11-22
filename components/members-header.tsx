'use client'

import Link from 'next/link'
import { Search, Bell, Settings, User, FileText, Award, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function MembersHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/95 to-transparent backdrop-blur-sm border-b border-border/40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary-foreground"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">Cogedu</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Início
              </Link>
              <Link href="/series" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Séries
              </Link>
              <Link href="/turmas" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Turmas
              </Link>
              <Link href="/comunidades" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Comunidades
              </Link>
              <Link href="/admissao" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Admissões
              </Link>
              <Link href="/progress" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Meu Progresso
              </Link>
              <Link href="/certificados" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Certificados
              </Link>
            </nav>

            {/* Menu Mobile */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    href="/" 
                    className="text-base font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Início
                  </Link>
                  <Link 
                    href="/series" 
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Séries
                  </Link>
                  <Link 
                    href="/turmas" 
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Turmas
                  </Link>
                  <Link 
                    href="/comunidades" 
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Comunidades
                  </Link>
                  <Link 
                    href="/admissao" 
                    className="text-base font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    Admissões
                  </Link>
                  <Link 
                    href="/progress" 
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meu Progresso
                  </Link>
                  <Link 
                    href="/certificados" 
                    className="text-base font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Award className="h-4 w-4" />
                    Certificados
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar conteúdo..."
                className="pl-10 w-64 bg-secondary border-0 text-foreground placeholder:text-muted-foreground rounded-lg"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary lg:hidden">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <Bell className="h-5 w-5" />
            </Button>

            <ThemeSwitcher />

            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
              <Settings className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admissao/minhas" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Minhas Admissões
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/certificados" className="flex items-center gap-2 cursor-pointer">
                    <Award className="h-4 w-4" />
                    Certificados
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/progress" className="flex items-center gap-2 cursor-pointer">
                    Meu Progresso
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
