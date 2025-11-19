import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CogEdu</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sua plataforma de ensino online completa.
            </p>
          </div>

          {/* Links Rápidos */}
          <div className="space-y-4">
            <h3 className="font-semibold">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/series" className="text-muted-foreground transition-colors hover:text-foreground">
                  Séries
                </Link>
              </li>
              <li>
                <Link href="/comunidades" className="text-muted-foreground transition-colors hover:text-foreground">
                  Comunidades
                </Link>
              </li>
              <li>
                <Link href="/turmas" className="text-muted-foreground transition-colors hover:text-foreground">
                  Turmas
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div className="space-y-4">
            <h3 className="font-semibold">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ajuda" className="text-muted-foreground transition-colors hover:text-foreground">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-muted-foreground transition-colors hover:text-foreground">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-muted-foreground transition-colors hover:text-foreground">
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/termos" className="text-muted-foreground transition-colors hover:text-foreground">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-muted-foreground transition-colors hover:text-foreground">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          © 2025 CogEdu. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
