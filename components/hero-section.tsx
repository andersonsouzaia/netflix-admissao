import { Button } from '@/components/ui/button'
import { Play, Info } from 'lucide-react'

interface HeroSectionProps {
  title?: string
  description?: string
  image?: string
}

export function HeroSection({ 
  title = "Transforme Sua Carreira com Conhecimento de Elite",
  description = "Aprenda com os melhores especialistas do mundo em negócios, liderança e desenvolvimento pessoal. Acesso ilimitado a centenas de cursos exclusivos.",
  image = "/placeholder.svg?height=1080&width=1920"
}: HeroSectionProps = {}) {
  return (
    <section className="relative h-[85vh] flex items-center">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={image || "/placeholder.svg"}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="px-4 md:px-12 relative z-10 pt-20 w-full">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-base px-8 rounded-lg shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
              <Play className="h-5 w-5" fill="currentColor" />
              Assistir Agora
            </Button>
            
            <Button size="lg" variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/10 gap-2 text-base px-8 rounded-lg backdrop-blur-sm">
              <Info className="h-5 w-5" />
              Mais Informações
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-primary/20 text-primary rounded-md text-xs font-semibold">NOVO</span>
              <span>Conteúdo adicionado semanalmente</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
