'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Process {
  id: number
  name: string
  description: string | null
  is_active: number
}

interface Unit {
  id: number
  name: string
  description: string | null
  processes?: Process[]
}

interface UnitsAccordionProps {
  units: Unit[]
  courseId: number
}

export function UnitsAccordion({ units, courseId }: UnitsAccordionProps) {
  const router = useRouter()
  const [unitsWithProcesses, setUnitsWithProcesses] = useState<Unit[]>(units)

  useEffect(() => {
    // Buscar processos para cada unidade
    const fetchProcesses = async () => {
      const unitsData = await Promise.all(
        units.map(async (unit) => {
          try {
            const response = await fetch(
              `/api/admissao/processes?unit_id=${unit.id}&is_active=true`
            )
            if (response.ok) {
              const processes = await response.json()
              return { ...unit, processes }
        }
      } catch (error) {
            console.error(`Error fetching processes for unit ${unit.id}:`, error)
          }
          return { ...unit, processes: [] }
        })
      )
      setUnitsWithProcesses(unitsData)
    }

    if (units.length > 0) {
      fetchProcesses()
    }
  }, [units])

  const handleEnroll = (processId: number) => {
    router.push(`/admissao/inscricao/${processId}`)
  }

  if (unitsWithProcesses.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Nenhuma unidade disponível</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-6">Unidades e Processos Seletivos</h2>

      <Accordion type="single" collapsible className="w-full" defaultValue={unitsWithProcesses.length > 0 ? `unit-${unitsWithProcesses[0].id}` : undefined}>
        {unitsWithProcesses.map((unit) => {
          const processes = unit.processes || []
          const hasSingleProcess = processes.length === 1
          const hasMultipleProcesses = processes.length > 1

            return (
            <AccordionItem key={unit.id} value={`unit-${unit.id}`} className="border-b border-border">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex flex-col items-start gap-2">
                  <h3 className="text-xl font-semibold text-foreground">{unit.name}</h3>
                    {unit.description && (
                    <p className="text-sm text-muted-foreground">{unit.description}</p>
                    )}
                  </div>
              </AccordionTrigger>
              
              <AccordionContent>
                {processes.length === 0 ? (
                  <p className="text-muted-foreground py-4">
                    Nenhum processo seletivo disponível no momento.
                  </p>
                ) : hasSingleProcess ? (
                  // Se há apenas 1 processo, mostrar botão direto
                  <div className="py-4">
                    <Card className="p-6 bg-card border-border">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-semibold text-foreground mb-2">
                        {processes[0].name}
                      </h4>
                      {processes[0].description && (
                            <p className="text-sm text-muted-foreground">
                          {processes[0].description}
                        </p>
                      )}
                        </div>
                        <Button
                          onClick={() => handleEnroll(processes[0].id)}
                          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Inscrever-se
                        </Button>
                    </div>
                    </Card>
                  </div>
                ) : (
                  // Se há múltiplos processos, mostrar lista
                  <div className="py-4 space-y-3">
                    {processes.map((process) => (
                      <Card
                        key={process.id}
                        className="p-4 bg-card border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-foreground mb-1">
                              {process.name}
                            </h4>
                            {process.description && (
                              <p className="text-sm text-muted-foreground">
                                {process.description}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleEnroll(process.id)}
                            variant="outline"
                            className="flex-shrink-0"
                          >
                            Inscrever-se
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
