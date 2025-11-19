'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddressForm } from './address-form'
import type { AddressData } from '@/lib/utils/cep'

interface StepComplementaryDataProps {
  step: any
  registrationId: number | null
  userId: string
  initialData: any
  onComplete: (data: any) => void
}

export function StepComplementaryData({
  step,
  initialData,
  onComplete
}: StepComplementaryDataProps) {
  const [fields, setFields] = useState<any[]>([])

  useEffect(() => {
    fetchFields()
  }, [step.id])

  const fetchFields = async () => {
      try {
      const response = await fetch(`/api/admissao/steps/fields?step_id=${step.id}`)
        if (response.ok) {
          const data = await response.json()
          setFields(data)
      }
    } catch (error) {
      console.error('Error fetching fields:', error)
    }
  }

  const defaultValues: Record<string, any> = {}
  fields.forEach(field => {
    const fieldName = field.field_name?.toLowerCase() || ''
    const fieldLabel = field.field_label?.toLowerCase() || ''
    
    // Não incluir campos de endereço, telefone e data de nascimento nos defaultValues
    const addressFields = ['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'uf', 'rua', 'avenida', 'endereco', 'endereco_completo']
    const basicFields = ['telefone', 'phone', 'celular', 'data_nascimento', 'datanascimento', 'datanasc', 'datanascimento', 'birthdate', 'data_de_nascimento', 'nascimento']
    
    const isAddressField = addressFields.some(af => fieldName.includes(af) || fieldLabel.includes(af)) || field.field_type === 'address'
    const isBasicField = basicFields.some(bf => fieldName.includes(bf) || fieldLabel.includes(bf))
    
    if (!isAddressField && !isBasicField) {
      defaultValues[field.field_name] = initialData[field.field_name] || ''
    }
  })

  // Verificar se há campo de endereço configurado
  const hasAddressField = fields.some(f => f.field_name === 'endereco' || f.field_type === 'address')
  
  // Dados iniciais do endereço
  const addressInitialData = initialData.endereco 
    ? (typeof initialData.endereco === 'string' ? JSON.parse(initialData.endereco) : initialData.endereco)
    : {
        cep: initialData.cep || '',
        logradouro: initialData.logradouro || '',
        numero: initialData.numero || '',
        complemento: initialData.complemento || '',
        bairro: initialData.bairro || '',
        cidade: initialData.cidade || '',
        estado: initialData.estado || ''
      }

  const form = useForm({
    defaultValues
  })

  const [addressData, setAddressData] = useState<AddressData | null>(null)

  const onSubmit = (data: any) => {
    // Incluir dados do endereço se houver
    if (addressData) {
      data.endereco = JSON.stringify(addressData)
      data.cep = addressData.cep
      data.logradouro = addressData.logradouro
      data.numero = addressData.numero
      data.complemento = addressData.complemento
      data.bairro = addressData.bairro
      data.cidade = addressData.cidade
      data.estado = addressData.estado
    }
    onComplete(data)
  }

  const renderField = (field: any) => {
    const fieldName = field.field_name

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'number':
  return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            rules={{ required: field.is_required ? 'Campo obrigatório' : false }}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.field_label}
                  {field.is_required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type={field.field_type}
                    placeholder={`Digite ${field.field_label.toLowerCase()}`}
                      {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
                    />
        )

      case 'date':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            rules={{ required: field.is_required ? 'Campo obrigatório' : false }}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.field_label}
                  {field.is_required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                    <Input
                      type="date"
                      {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'textarea':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            rules={{ required: field.is_required ? 'Campo obrigatório' : false }}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.field_label}
                  {field.is_required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={`Digite ${field.field_label.toLowerCase()}`}
                      {...formField}
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case 'select':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            rules={{ required: field.is_required ? 'Campo obrigatório' : false }}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.field_label}
                  {field.is_required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Selecione ${field.field_label.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options && field.options.map((option: string, index: number) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      default:
        return null
    }
  }

  if (fields.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Endereço</h2>
          <p className="text-muted-foreground">Carregando campos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Endereço</h2>
        <p className="text-muted-foreground">
          Preencha seu endereço completo para continuar com a inscrição.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo de Endereço - Sempre presente */}
          <div className="p-6 bg-card border border-border rounded-lg">
            <AddressForm
              initialData={addressInitialData}
              onDataChange={setAddressData}
            />
          </div>

          {/* Outros campos personalizados */}
          {fields
            .filter(field => {
              const fieldName = field.field_name?.toLowerCase() || ''
              const fieldLabel = field.field_label?.toLowerCase() || ''
              
              // Remover campos de endereço (já estão no AddressForm)
              if (field.field_type === 'address' || fieldName === 'endereco' || fieldLabel.includes('endereço')) return false
              
              // Remover campos duplicados de endereço (CEP, logradouro, cidade, estado, etc.)
              const addressFields = ['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'uf', 'rua', 'avenida', 'endereco_completo']
              if (addressFields.some(af => fieldName.includes(af) || fieldLabel.includes(af))) return false
              
              // Remover telefone e data de nascimento (movidos para dados básicos)
              const basicFields = ['telefone', 'phone', 'celular', 'data_nascimento', 'datanascimento', 'datanasc', 'dataNascimento', 'birthdate', 'data_de_nascimento', 'nascimento']
              if (basicFields.some(bf => fieldName.includes(bf) || fieldLabel.includes(bf))) return false
              
              return true
            })
            .map(field => renderField(field))}

          <Button
            type="submit"
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continuar
        </Button>
      </form>
    </Form>
    </div>
  )
}
