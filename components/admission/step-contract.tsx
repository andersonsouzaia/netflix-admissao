'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Printer, Download } from 'lucide-react'
import { SignatureCanvasComponent } from './signature-canvas'
import { generateContractPDF, downloadPDF, printPDF, replaceContractTags, type ContractData } from '@/lib/utils/contract'

interface StepContractProps {
  step: any
  registrationId: number | null
  userId: string
  initialData: any
  onComplete: (data: any) => void
}

export function StepContract({
  step,
  initialData,
  onComplete
}: StepContractProps) {
  const [accepted, setAccepted] = useState(initialData.accepted || false)
  const [signature, setSignature] = useState<string | null>(initialData.signature || null)
  const [contractData, setContractData] = useState<ContractData>({
    nome: initialData.name || '',
    cpf: initialData.cpf || '',
    email: initialData.email || '',
    data: new Date().toLocaleDateString('pt-BR'),
    ...initialData
  })

  // Buscar dados do formulário para preencher tags
  useEffect(() => {
    const loadFormData = async () => {
      if (registrationId) {
        try {
          // Buscar dados básicos
          const response = await fetch(`/api/admissao/registrations/${registrationId}/data`)
          if (response.ok) {
            const data = await response.json()
            const formData: Record<string, any> = {}
            data.forEach((item: any) => {
              formData[item.field_name] = item.field_value
            })
            
            // Processar dados de endereço
            let enderecoData: any = {}
            if (formData.endereco) {
              try {
                enderecoData = typeof formData.endereco === 'string' 
                  ? JSON.parse(formData.endereco) 
                  : formData.endereco
              } catch (e) {
                console.error('Error parsing endereco:', e)
              }
            }
            
            setContractData(prev => ({
              ...prev,
              nome: formData.name || prev.nome,
              cpf: formData.cpf || prev.cpf,
              email: formData.email || prev.email,
              logradouro: enderecoData.logradouro || formData.logradouro || prev.logradouro || '',
              numero: enderecoData.numero || formData.numero || prev.numero || '',
              complemento: enderecoData.complemento || formData.complemento || prev.complemento || '',
              bairro: enderecoData.bairro || formData.bairro || prev.bairro || '',
              cidade: enderecoData.cidade || formData.cidade || prev.cidade || '',
              estado: enderecoData.estado || formData.estado || prev.estado || '',
              cep: enderecoData.cep || formData.cep || prev.cep || '',
              data: new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              }),
              ...formData
            }))
          }
        } catch (error) {
          console.error('Error loading form data:', error)
        }
      }
    }
    
    loadFormData()
  }, [registrationId])

  const defaultContractText = `
CONTRATO DE CONSTITUIÇÃO DE INSCRIÇÃO EM PROCESSO SELETIVO

{{nome}} (nome civil completo), nacionalidade brasileira, portador do CPF nº {{cpf}}, residente e domiciliado(a) à {{logradouro}}, nº {{numero}}{{#complemento}}, {{complemento}}{{/complemento}}, bairro {{bairro}}, município de {{cidade}}, {{estado}}, CEP {{cep}}, e-mail {{email}}, constitui, mediante as seguintes cláusulas, sua inscrição no processo seletivo:

Cláusula Primeira - O(A) candidato(a) declara que todas as informações fornecidas no processo de inscrição são verdadeiras e completas, assumindo total responsabilidade pela veracidade dos dados apresentados.

Cláusula Segunda - O(A) candidato(a) está ciente de que o pagamento da taxa de inscrição é obrigatório e condição essencial para a validação de sua participação no processo seletivo.

Cláusula Terceira - O(A) candidato(a) compromete-se a enviar toda a documentação solicitada dentro dos prazos estabelecidos, assumindo a responsabilidade pela veracidade e autenticidade dos documentos apresentados.

Cláusula Quarta - A documentação enviada será verificada pela instituição, que se reserva o direito de solicitar esclarecimentos adicionais ou documentos complementares quando necessário.

Cláusula Quinta - O(A) candidato(a) está ciente de que o resultado do processo seletivo será comunicado exclusivamente por e-mail, no endereço {{email}} informado no ato da inscrição.

Cláusula Sexta - O(A) candidato(a) declara estar ciente de todas as condições, regras e critérios de avaliação do processo seletivo, conforme divulgado no edital e materiais informativos.

Cláusula Sétima - O(A) candidato(a) autoriza a instituição a utilizar seus dados pessoais exclusivamente para fins relacionados ao processo seletivo, em conformidade com a Lei Geral de Proteção de Dados (LGPD).

Cláusula Oitava - O(A) candidato(a) está ciente de que a falsidade de informações ou documentos poderá resultar na desclassificação do processo seletivo, sem direito a reembolso da taxa de inscrição.

Cláusula Nona - Fica eleito o foro da comarca de {{cidade}}/{{estado}} para dirimir quaisquer dúvidas ou controvérsias oriundas deste contrato de inscrição.

E, por estar assim justo e contratado, assina este instrumento em 2 (duas) vias de igual teor e forma.

{{cidade}}, {{estado}}, {{data}}.

(Local e data)

____________________________________________________
{{nome}}
CPF: {{cpf}}

____________________________________________________
Assinatura Digital
  `

  const contractText = step.config 
    ? JSON.parse(step.config).contractText || defaultContractText
    : defaultContractText

  const processedContractText = replaceContractTags(contractText, contractData)

  const handlePrint = async () => {
    try {
      const pdfBytes = await generateContractPDF(contractText, contractData, signature)
      printPDF(pdfBytes)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erro ao gerar PDF para impressão')
    }
  }

  const handleDownload = async () => {
    try {
      const pdfBytes = await generateContractPDF(contractText, contractData, signature)
      downloadPDF(pdfBytes, `contrato-${contractData.nome || 'inscricao'}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erro ao gerar PDF para download')
    }
  }

  const handleContinue = () => {
    if (accepted) {
      onComplete({ 
        accepted: true, 
        signature,
        acceptedAt: new Date().toISOString(),
        contractData
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{step.name}</h2>
        <p className="text-muted-foreground">
          Leia atentamente o contrato, assine e aceite os termos para continuar.
        </p>
      </div>

      <Card className="p-6 bg-card border-border">
        <ScrollArea className="h-[500px] pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="text-foreground font-sans text-sm leading-relaxed">
              {processedContractText.split('\n').map((line, index, array) => {
                const trimmedLine = line.trim()
                const isEmpty = trimmedLine === ''
                const isTitle = trimmedLine.startsWith('CONTRATO')
                const isClause = trimmedLine.startsWith('Cláusula')
                const isSignatureLine = trimmedLine.startsWith('________________________________')
                const isLocalData = trimmedLine.startsWith('(Local e data)')
                const isNameLine = trimmedLine && !isClause && !isTitle && !isSignatureLine && !isLocalData && index > 0 && array[index - 1]?.trim().startsWith('{{nome}}')
                
                if (isTitle) {
                  return (
                    <div key={index} className="font-bold text-lg text-center mb-6 mt-2 uppercase">
                      {trimmedLine}
                    </div>
                  )
                }
                
                if (isClause) {
                  return (
                    <div key={index} className="font-semibold text-base mb-3 mt-4 first:mt-0">
                      {trimmedLine}
                    </div>
                  )
                }
                
                if (isSignatureLine) {
                  return (
                    <div key={index} className="mt-8 mb-4 text-center">
                      <div className="border-t-2 border-foreground w-64 mx-auto pt-2">
                        {trimmedLine}
                      </div>
                    </div>
                  )
                }
                
                if (isLocalData) {
                  return (
                    <div key={index} className="text-center mb-4 text-muted-foreground italic">
                      {trimmedLine}
                    </div>
                  )
                }
                
                if (isEmpty) {
                  return <div key={index} className="h-2" />
                }
                
                return (
                  <div key={index} className="mb-2 text-justify">
                    {trimmedLine}
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollArea>
      </Card>

      {/* Botões de impressão e download */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimir Contrato
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Baixar PDF
        </Button>
      </div>

      {/* Canvas de Assinatura */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Assinatura Digital</h3>
        <SignatureCanvasComponent
          onSignatureChange={setSignature}
          initialSignature={signature}
        />
      </div>

      {/* Checkboxes de Aceite */}
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="accept-contract"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
          />
          <label
            htmlFor="accept-contract"
            className="text-sm text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Li e concordo com os termos do contrato
          </label>
        </div>
        
        <div className="flex items-start space-x-3">
          <Checkbox
            id="accept-data"
            checked={initialData.dataAccepted || false}
            onCheckedChange={(checked) => {
              // Atualizar estado se necessário
            }}
          />
          <label
            htmlFor="accept-data"
            className="text-sm text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Confirmo que os dados fornecidos são verdadeiros
          </label>
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!accepted || !signature}
        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Aceitar e Continuar
      </Button>
    </div>
  )
}
