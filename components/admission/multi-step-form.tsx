'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Check, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StepBasicData } from './step-basic-data'
import { StepComplementaryData } from './step-complementary-data'
import { StepDocuments } from './step-documents'
import { StepEvaluation } from './step-evaluation'
import { StepPayment } from './step-payment'
import { StepContract } from './step-contract'
import { StepInstructions } from './step-instructions'

interface Step {
  id: number
  step_type: string
  name: string
  order_index: number
  is_required: number
  config: string | null
  fields?: any[]
  documents?: any[]
  evaluations?: any[]
}

interface MultiStepFormProps {
  steps: Step[]
  processId: number
  registrationId: number | null
  userId: string
  onComplete?: () => void
}

export function MultiStepForm({
  steps,
  processId,
  registrationId,
  userId,
  onComplete
}: MultiStepFormProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [stepData, setStepData] = useState<Record<number, any>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Ordenar passos por order_index
  const sortedSteps = [...steps].sort((a, b) => a.order_index - b.order_index)

  useEffect(() => {
    // Carregar dados salvos se houver registrationId
    if (registrationId) {
      loadSavedData()
    }
    
    // Carregar dados do localStorage como backup
    loadFromLocalStorage()
  }, [registrationId])

  // Salvar no localStorage
  const saveToLocalStorage = useCallback((stepId: number, data: any) => {
    try {
      const key = `admission_form_${processId}_${stepId}`
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }, [processId])

  // Carregar do localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      sortedSteps.forEach(step => {
        const key = `admission_form_${processId}_${step.id}`
        const saved = localStorage.getItem(key)
        if (saved) {
          const parsed = JSON.parse(saved)
          // Restaurar dados se não houver dados do backend
          if (!stepData[step.id] && parsed.data) {
            setStepData(prev => ({ ...prev, [step.id]: parsed.data }))
          }
        }
      })
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }, [processId, sortedSteps, stepData])

  const loadSavedData = async () => {
    if (!registrationId) return

    for (const step of sortedSteps) {
      try {
        const response = await fetch(
          `/api/admissao/registrations/${registrationId}/data?step_id=${step.id}`
        )
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            const formData: Record<string, any> = {}
            data.forEach((item: any) => {
              formData[item.field_name] = item.field_value
            })
            setStepData(prev => ({ ...prev, [step.id]: formData }))
            setCompletedSteps(prev => new Set([...prev, step.id]))
          }
        }
      } catch (error) {
        console.error(`Error loading data for step ${step.id}:`, error)
      }
      }
    }

  // Função para salvar dados (com debounce)
  const saveStepData = useCallback(async (stepId: number, data: any, immediate = false) => {
    // Limpar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Atualizar estado local imediatamente
    setStepData(prev => ({ ...prev, [stepId]: data }))
    setSaved(false)

    // Salvar no localStorage imediatamente
    saveToLocalStorage(stepId, data)

    // Função de salvamento
    const performSave = async () => {
      setSaving(true)
      setSaved(false)

      try {
        // Salvar no backend se houver registrationId
        if (registrationId) {
          const response = await fetch(`/api/admissao/registrations/${registrationId}/data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              step_id: stepId,
              data
            })
        })

        if (response.ok) {
            setSaved(true)
            // Limpar indicador após 2 segundos
            setTimeout(() => setSaved(false), 2000)
          }
        }
      } catch (error) {
        console.error('Error saving step data:', error)
      } finally {
        setSaving(false)
        }
      }

    if (immediate) {
      await performSave()
    } else {
      // Debounce de 2 segundos
      saveTimeoutRef.current = setTimeout(performSave, 2000)
    }
  }, [registrationId, saveToLocalStorage])

  const handleStepComplete = async (stepId: number, data: any) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
    // Salvar imediatamente quando completar o passo
    await saveStepData(stepId, data, true)

    // Avançar para o próximo passo
    if (currentStepIndex < sortedSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      // Último passo completado
      if (onComplete) {
        onComplete()
      }
    }
  }

  // Auto-save quando mudar de step
  useEffect(() => {
    const currentStepId = sortedSteps[currentStepIndex]?.id
    const currentData = stepData[currentStepId]
    
    // Salvar dados do step atual quando mudar de step (exceto no primeiro carregamento)
    if (currentData && currentStepId) {
      saveStepData(currentStepId, currentData, false)
    }
  }, [currentStepIndex])

  // Função para atualizar dados do step atual (para auto-save)
  const handleStepDataChange = useCallback((stepId: number, data: any) => {
    setStepData(prev => ({ ...prev, [stepId]: data }))
    // Salvar com debounce
    saveStepData(stepId, data, false)
  }, [saveStepData])

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const handleNext = () => {
    if (currentStepIndex < sortedSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const goToStep = (index: number) => {
    // Permitir ir para passos já completados
    if (completedSteps.has(sortedSteps[index].id) || index <= currentStepIndex) {
      setCurrentStepIndex(index)
    }
  }

  const currentStep = sortedSteps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === sortedSteps.length - 1
  const isCurrentStepCompleted = completedSteps.has(currentStep.id)

  const renderStepContent = () => {
    if (!currentStep) return null

    const stepProps = {
      step: currentStep,
      registrationId,
      userId,
      initialData: stepData[currentStep.id] || {},
      onComplete: (data: any) => handleStepComplete(currentStep.id, data),
      onDataChange: (data: any) => handleStepDataChange(currentStep.id, data)
    }

    switch (currentStep.step_type) {
      case 'basic_data':
        return <StepBasicData {...stepProps} />
      case 'complementary_data':
        return <StepComplementaryData {...stepProps} />
      case 'documents':
        return <StepDocuments {...stepProps} />
      case 'evaluation':
        return <StepEvaluation {...stepProps} />
      case 'payment':
        return <StepPayment {...stepProps} />
      case 'contract':
        return <StepContract {...stepProps} />
      case 'instructions':
        return <StepInstructions {...stepProps} />
      default:
        return <div>Passo não implementado: {currentStep.step_type}</div>
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Stepper Horizontal */}
      <div className="w-full pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {sortedSteps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id)
            const isCurrent = index === currentStepIndex
            const isAccessible = isCompleted || index <= currentStepIndex

            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                disabled={!isAccessible}
                className={cn(
                  "flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "text-xs sm:text-sm",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                title={step.name}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {index + 1}
                  </span>
                )}
                <span className="font-medium truncate text-center">{step.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
            </div>

      {/* Status de salvamento */}
      {(saving || saved) && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : saved ? (
            <>
              <Save className="h-4 w-4 text-green-500" />
              <span className="text-green-500">Salvo</span>
            </>
          ) : null}
          </div>
        )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="text-sm text-muted-foreground">
          Passo {currentStepIndex + 1} de {sortedSteps.length}
        </div>

        {!isCurrentStepCompleted && !isLastStep && (
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={isLastStep}
            className="flex items-center gap-2"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

