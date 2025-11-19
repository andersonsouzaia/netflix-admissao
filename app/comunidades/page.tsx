import { MembersHeader } from '@/components/members-header'

export default function ComunidadesPage() {
  return (
    <div className="min-h-screen bg-background">
      <MembersHeader />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Comunidades</h1>
          <p className="text-muted-foreground">
            Conteúdo de comunidades em desenvolvimento...
          </p>
        </div>
      </main>
    </div>
  )
}
