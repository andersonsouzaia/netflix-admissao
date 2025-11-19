'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
]

interface StateSelectProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export function StateSelect({ value, onChange, disabled = false }: StateSelectProps) {
  const handleValueChange = (selectedValue: string) => {
    if (onChange) {
      onChange(selectedValue)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="estado">
        Estado (UF) <span className="text-destructive">*</span>
      </Label>
      <Select
        value={value || ''}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger id="estado" className={disabled ? 'bg-muted' : ''}>
          <SelectValue placeholder="Selecione o estado" />
        </SelectTrigger>
        <SelectContent>
          {BRAZILIAN_STATES.map((state) => (
            <SelectItem key={state.code} value={state.code}>
              {state.name} ({state.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

