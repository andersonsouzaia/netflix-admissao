'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface StepInstructionsProps {
  step: any
  registrationId: number | null
  userId: string
  initialData: any
  onComplete: (data: any) => void
}

export function StepInstructions({
  step,
  initialData,
  onComplete
}: StepInstructionsProps) {
  const instructions = step.config 
    ? JSON.parse(step.config).instructions || 'Nenhuma instrução configurada.'
    : 'Este é um passo informativo. Clique em continuar para prosseguir.'

  const handleContinue = () => {
    onComplete({ read: true, readAt: new Date().toISOString() })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{step.name}</h2>
        <p className="text-muted-foreground">
          Leia as instruções abaixo antes de continuar.
        </p>
      </div>

      <Card className="p-6 bg-card border-border">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-foreground font-sans">
            {instructions}
          </pre>
        </div>
      </Card>

      <Button
        onClick={handleContinue}
        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Continuar
      </Button>
    </div>
  )
}
