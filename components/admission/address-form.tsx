'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin } from 'lucide-react'
import { StateSelect } from './state-select'
import {
  formatCEP,
  isValidCEPFormat,
  fetchCEP,
  getCachedCEP,
  setCachedCEP,
  type CEPData,
  type AddressData,
} from '@/lib/utils/cep'

interface AddressFormProps {
  initialData?: Partial<AddressData>
  onDataChange?: (data: AddressData) => void
  disabled?: boolean
}

export function AddressForm({
  initialData = {},
  onDataChange,
  disabled = false,
}: AddressFormProps) {
  const [cep, setCep] = useState(initialData.cep || '')
  const [logradouro, setLogradouro] = useState(initialData.logradouro || '')
  const [numero, setNumero] = useState(initialData.numero || '')
  const [complemento, setComplemento] = useState(initialData.complemento || '')
  const [bairro, setBairro] = useState(initialData.bairro || '')
  const [cidade, setCidade] = useState(initialData.cidade || '')
  const [estado, setEstado] = useState(initialData.estado || '')
  
  const [loading, setLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [fieldsLocked, setFieldsLocked] = useState(false)
  const [cepHasLogradouro, setCepHasLogradouro] = useState(false)

  // Verificar cache ao montar
  useEffect(() => {
    if (initialData.cep && isValidCEPFormat(initialData.cep) && !cep) {
      const cached = getCachedCEP(initialData.cep)
      if (cached) {
        applyCEPData(cached)
        setCep(formatCEP(initialData.cep))
      }
    }
  }, [])

  // Notificar mudanças
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
      })
    }
  }, [cep, logradouro, numero, complemento, bairro, cidade, estado])

  const applyCEPData = (data: CEPData) => {
    setLogradouro(data.logradouro || '')
    setBairro(data.bairro || '')
    setCidade(data.localidade || '')
    setEstado(data.uf || '')
    
    const hasLogradouro = !!data.logradouro
    setCepHasLogradouro(hasLogradouro)
    setFieldsLocked(hasLogradouro)
    
    // Se CEP não tem logradouro, liberar campos para edição
    if (!hasLogradouro) {
      setFieldsLocked(false)
    }
  }

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value)
    setCep(formatted)
    setCepError(null)
    
    // Limpar campos se CEP for limpo
    if (formatted.replace(/\D/g, '').length < 8) {
      setLogradouro('')
      setBairro('')
      setCidade('')
      setEstado('')
      setFieldsLocked(false)
      setCepHasLogradouro(false)
      return
    }

    // Buscar CEP quando estiver completo
    if (isValidCEPFormat(formatted)) {
      handleCEPBlur(formatted)
    }
  }

  const handleCEPBlur = async (cepValue?: string) => {
    const cepToSearch = cepValue || cep
    
    if (!isValidCEPFormat(cepToSearch)) {
      return
    }

    // Verificar cache primeiro
    const cached = getCachedCEP(cepToSearch)
    if (cached) {
      applyCEPData(cached)
      return
    }

    // Buscar CEP
    setLoading(true)
    setCepError(null)

    try {
      const data = await fetchCEP(cepToSearch)
      
      if (data) {
        // Salvar no cache
        setCachedCEP(cepToSearch, data)
        applyCEPData(data)
      } else {
        setCepError('CEP não encontrado')
        setFieldsLocked(false)
        setCepHasLogradouro(false)
      }
    } catch (error) {
      console.error('Error fetching CEP:', error)
      setCepError('Erro ao buscar CEP. Você pode preencher manualmente.')
      setFieldsLocked(false)
      setCepHasLogradouro(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Endereço</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CEP */}
        <div className="md:col-span-2">
          <Label htmlFor="cep">
            CEP <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="cep"
              value={cep}
              onChange={(e) => handleCEPChange(e.target.value)}
              onBlur={() => handleCEPBlur()}
              placeholder="00000-000"
              maxLength={9}
              disabled={disabled || loading}
              className={cepError ? 'border-destructive' : ''}
            />
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-primary self-center" />
            )}
          </div>
          {cepError && (
            <p className="text-sm text-destructive mt-1">{cepError}</p>
          )}
          {!cepHasLogradouro && cep && isValidCEPFormat(cep) && (
            <p className="text-sm text-muted-foreground mt-1">
              CEP sem logradouro. Preencha os campos manualmente.
            </p>
          )}
        </div>

        {/* Logradouro */}
        <div className="md:col-span-2">
          <Label htmlFor="logradouro">
            Logradouro <span className="text-destructive">*</span>
          </Label>
          <Input
            id="logradouro"
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
            placeholder="Rua, Avenida, etc."
            disabled={disabled || fieldsLocked}
            className={fieldsLocked ? 'bg-muted' : ''}
          />
        </div>

        {/* Número */}
        <div>
          <Label htmlFor="numero">
            Número <span className="text-destructive">*</span>
          </Label>
          <Input
            id="numero"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="123"
            disabled={disabled}
          />
        </div>

        {/* Complemento */}
        <div>
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            placeholder="Apto, Bloco, etc."
            disabled={disabled}
          />
        </div>

        {/* Bairro */}
        <div>
          <Label htmlFor="bairro">
            Bairro <span className="text-destructive">*</span>
          </Label>
          <Input
            id="bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Nome do bairro"
            disabled={disabled || fieldsLocked}
            className={fieldsLocked ? 'bg-muted' : ''}
          />
        </div>

        {/* Cidade */}
        <div>
          <Label htmlFor="cidade">
            Cidade <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Nome da cidade"
            disabled={disabled || fieldsLocked}
            className={fieldsLocked ? 'bg-muted' : ''}
          />
        </div>

        {/* Estado */}
        <div className="md:col-span-2">
          <StateSelect
            value={estado}
            onChange={(value) => setEstado(value)}
            disabled={disabled || fieldsLocked}
          />
        </div>
      </div>

      {fieldsLocked && (
        <p className="text-xs text-muted-foreground">
          Campos preenchidos automaticamente. Para editar, limpe o CEP e preencha manualmente.
        </p>
      )}
    </div>
  )
}
