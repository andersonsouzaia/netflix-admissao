'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Clock, MapPin, Calendar, FileText, CheckCircle2 } from 'lucide-react'

interface Module {
  id: number
  name: string
  content: string
  order_index: number
}

interface Question {
  id: number
  question_text: string
  question_type: string
  options: string[] | null
  correct_answer: any
  points: number
  order_index: number
}

interface Evaluation {
  id: number
  name: string
  description: string | null
  evaluation_type: string
  location: string | null
  date: string | null
  instructions: string | null
  time_limit_minutes: number | null
  modules?: Module[]
}

interface StepEvaluationProps {
  step: any
  registrationId: number | null
  userId: string
  initialData: any
  onComplete: (data: any) => void
}

export function StepEvaluation({
  step,
  registrationId,
  initialData,
  onComplete
}: StepEvaluationProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [selectedModule, setSelectedModule] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    fetchEvaluations()
  }, [step.id])

  const fetchEvaluations = async () => {
    try {
      const response = await fetch(`/api/admissao/steps/evaluations?step_id=${step.id}`)
      if (response.ok) {
        const data = await response.json()
        setEvaluations(data)
        if (data.length > 0) {
          setSelectedEvaluation(data[0])
          if (data[0].modules && data[0].modules.length > 0) {
            setSelectedModule(data[0].modules[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error)
    }
  }

  const fetchQuestions = async (evaluationId: number) => {
    try {
      const response = await fetch(`/api/admissao/evaluations/${evaluationId}/questions`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  useEffect(() => {
    if (selectedEvaluation && isStarted && selectedEvaluation.evaluation_type === 'online') {
      fetchQuestions(selectedEvaluation.id)
      
      // Iniciar timer se houver tempo limite
      if (selectedEvaluation.time_limit_minutes) {
        setTimeRemaining(selectedEvaluation.time_limit_minutes * 60)
      }
    }
  }, [selectedEvaluation, isStarted])

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && isStarted && !isCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            // Auto-submit quando o tempo acabar
            if (selectedEvaluation) {
              setIsCompleted(true)
              onComplete({
                evaluationId: selectedEvaluation.id,
                answers,
                completedAt: new Date().toISOString(),
                status: 'completed'
              })
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining, isStarted, isCompleted, selectedEvaluation, answers, onComplete])

  const handleStartEvaluation = () => {
    if (selectedEvaluation) {
      setIsStarted(true)
      if (selectedEvaluation.evaluation_type === 'online') {
        fetchQuestions(selectedEvaluation.id)
      }
    }
  }

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitEvaluation = () => {
    if (selectedEvaluation) {
      setIsCompleted(true)
      onComplete({
        evaluationId: selectedEvaluation.id,
        answers,
        completedAt: new Date().toISOString(),
        status: 'completed'
      })
    }
  }

  const handleCompleteEvaluation = () => {
    if (selectedEvaluation) {
      onComplete({
        evaluationId: selectedEvaluation.id,
        completedAt: new Date().toISOString(),
        status: 'completed'
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (evaluations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{step.name}</h2>
          <p className="text-muted-foreground">Carregando avaliações...</p>
        </div>
      </div>
    )
  }

  const currentModule = selectedEvaluation?.modules?.find(m => m.id === selectedModule)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{step.name}</h2>
        <p className="text-muted-foreground">
          {selectedEvaluation?.evaluation_type === 'online'
            ? 'Realize a avaliação online abaixo. Use os módulos de conteúdo ao lado para consulta.'
            : 'Informações sobre a avaliação presencial.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar com Módulos */}
        {selectedEvaluation?.evaluation_type === 'online' && selectedEvaluation.modules && selectedEvaluation.modules.length > 0 && (
          <div className="lg:col-span-1">
            <Card className="p-4 bg-card border-border h-full">
              <h3 className="text-lg font-semibold text-foreground mb-4">Módulos de Conteúdo</h3>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {selectedEvaluation.modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModule(module.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedModule === module.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      <div className="font-medium">{module.name}</div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className={selectedEvaluation?.evaluation_type === 'online' && selectedEvaluation.modules && selectedEvaluation.modules.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <Card className="p-6 bg-card border-border">
            {selectedEvaluation && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {selectedEvaluation.name}
                  </h3>
                  {selectedEvaluation.description && (
                    <p className="text-muted-foreground mb-4">
                      {selectedEvaluation.description}
                    </p>
                  )}
                </div>

                {/* Informações da Avaliação */}
                <div className="space-y-3">
                  {selectedEvaluation.evaluation_type === 'presencial' && (
                    <>
                      {selectedEvaluation.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Local</p>
                            <p className="text-sm text-muted-foreground">{selectedEvaluation.location}</p>
                          </div>
                        </div>
                      )}

                      {selectedEvaluation.date && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Data e Hora</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedEvaluation.date).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedEvaluation.evaluation_type === 'online' && selectedEvaluation.time_limit_minutes && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Tempo Limite</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEvaluation.time_limit_minutes} minutos
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedEvaluation.instructions && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Instruções</p>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedEvaluation.instructions}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Conteúdo do Módulo Selecionado (para avaliações online) */}
                {selectedEvaluation.evaluation_type === 'online' && currentModule && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground">
                      {currentModule.name}
                    </h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-foreground whitespace-pre-wrap">
                        {currentModule.content}
                      </p>
                    </div>
                  </div>
                )}

                {/* Área de Avaliação */}
                {selectedEvaluation.evaluation_type === 'online' && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    {!isStarted ? (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-foreground">Avaliação</h4>
                        <div className="p-6 bg-muted rounded-lg">
                          <p className="text-muted-foreground text-center mb-4">
                            Clique em "Iniciar Avaliação" para começar a prova.
                          </p>
                          {selectedEvaluation.time_limit_minutes && (
                            <p className="text-sm text-muted-foreground text-center">
                              Você terá {selectedEvaluation.time_limit_minutes} minutos para completar a avaliação.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : isCompleted ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 className="h-5 w-5" />
                          <h4 className="text-lg font-semibold">Avaliação Concluída</h4>
                        </div>
                        <p className="text-muted-foreground">
                          Suas respostas foram enviadas com sucesso. Aguarde a correção.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-foreground">Questões</h4>
                          {timeRemaining !== null && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-lg">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-mono font-semibold text-primary">
                                {formatTime(timeRemaining)}
                              </span>
                            </div>
                          )}
                        </div>

                        {questions.length === 0 ? (
                          <div className="p-6 bg-muted rounded-lg">
                            <p className="text-muted-foreground text-center">
                              Carregando questões...
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {questions.map((question, index) => (
                              <Card key={question.id} className="p-6 bg-card border-border">
                                <div className="space-y-4">
                                  <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm">
                                      {index + 1}
                                    </span>
                                    <div className="flex-1">
                                      <p className="font-medium text-foreground mb-3">
                                        {question.question_text}
                                      </p>
                                      {question.question_type === 'multiple_choice' && question.options && (
                                        <RadioGroup
                                          value={answers[question.id] || ''}
                                          onValueChange={(value) => handleAnswerChange(question.id, value)}
                                        >
                                          {question.options.map((option, optIndex) => (
                                            <div key={optIndex} className="flex items-center space-x-2 py-2">
                                              <RadioGroupItem value={option} id={`q${question.id}-opt${optIndex}`} />
                                              <Label
                                                htmlFor={`q${question.id}-opt${optIndex}`}
                                                className="cursor-pointer flex-1"
                                              >
                                                {option}
                                              </Label>
                                            </div>
                                          ))}
                                        </RadioGroup>
                                      )}
                                      {question.question_type === 'true_false' && (
                                        <RadioGroup
                                          value={answers[question.id] || ''}
                                          onValueChange={(value) => handleAnswerChange(question.id, value)}
                                        >
                                          <div className="flex items-center space-x-2 py-2">
                                            <RadioGroupItem value="true" id={`q${question.id}-true`} />
                                            <Label htmlFor={`q${question.id}-true`} className="cursor-pointer">
                                              Verdadeiro
                                            </Label>
                                          </div>
                                          <div className="flex items-center space-x-2 py-2">
                                            <RadioGroupItem value="false" id={`q${question.id}-false`} />
                                            <Label htmlFor={`q${question.id}-false`} className="cursor-pointer">
                                              Falso
                                            </Label>
                                          </div>
                                        </RadioGroup>
                                      )}
                                      {question.question_type === 'essay' && (
                                        <Textarea
                                          placeholder="Digite sua resposta aqui..."
                                          value={answers[question.id] || ''}
                                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                          className="min-h-[120px]"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}

                            <div className="flex justify-end pt-4">
                              <Button
                                onClick={handleSubmitEvaluation}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                disabled={Object.keys(answers).length === 0}
                              >
                                Finalizar Avaliação
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Botões de Ação */}
                {!isStarted && !isCompleted && (
                  <div className="flex gap-4 pt-4">
                    {selectedEvaluation.evaluation_type === 'online' && (
                      <Button
                        onClick={handleStartEvaluation}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Iniciar Avaliação
                      </Button>
                    )}
                    {selectedEvaluation.evaluation_type === 'presencial' && (
                      <Button
                        onClick={handleCompleteEvaluation}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Confirmar Presença
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
