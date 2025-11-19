// Utilitários para busca de CEP

export interface CEPData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export interface AddressData {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

// Formatar CEP (00000-000)
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '')
  if (cleaned.length <= 5) {
    return cleaned
  }
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
}

// Validar formato de CEP
export function isValidCEPFormat(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, '')
  return cleaned.length === 8
}

// Buscar CEP via ViaCEP
export async function fetchCEPFromViaCEP(cep: string): Promise<CEPData | null> {
  try {
    const cleaned = cep.replace(/\D/g, '')
    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    if (data.erro) {
      return null
    }
    
    return {
      cep: data.cep,
      logradouro: data.logradouro || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || '',
    }
  } catch (error) {
    console.error('Error fetching CEP from ViaCEP:', error)
    return null
  }
}

// Buscar CEP via BrasilAPI (backup)
export async function fetchCEPFromBrasilAPI(cep: string): Promise<CEPData | null> {
  try {
    const cleaned = cep.replace(/\D/g, '')
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleaned}`)
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    return {
      cep: data.cep || cleaned,
      logradouro: data.street || '',
      complemento: '',
      bairro: data.neighborhood || '',
      localidade: data.city || '',
      uf: data.state || '',
    }
  } catch (error) {
    console.error('Error fetching CEP from BrasilAPI:', error)
    return null
  }
}

// Buscar CEP com fallback
export async function fetchCEP(cep: string): Promise<CEPData | null> {
  if (!isValidCEPFormat(cep)) {
    return null
  }
  
  // Tentar ViaCEP primeiro
  let data = await fetchCEPFromViaCEP(cep)
  
  // Se falhar, tentar BrasilAPI
  if (!data || data.erro) {
    data = await fetchCEPFromBrasilAPI(cep)
  }
  
  return data
}

// Cache de CEP no localStorage
const CEP_CACHE_KEY = 'cep_cache'
const CEP_CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 horas

interface CEPCacheEntry {
  data: CEPData
  timestamp: number
}

export function getCachedCEP(cep: string): CEPData | null {
  try {
    const cleaned = cep.replace(/\D/g, '')
    const cache = localStorage.getItem(CEP_CACHE_KEY)
    
    if (!cache) {
      return null
    }
    
    const cacheData: Record<string, CEPCacheEntry> = JSON.parse(cache)
    const entry = cacheData[cleaned]
    
    if (!entry) {
      return null
    }
    
    // Verificar se cache expirou
    if (Date.now() - entry.timestamp > CEP_CACHE_EXPIRY) {
      delete cacheData[cleaned]
      localStorage.setItem(CEP_CACHE_KEY, JSON.stringify(cacheData))
      return null
    }
    
    return entry.data
  } catch (error) {
    console.error('Error reading CEP cache:', error)
    return null
  }
}

export function setCachedCEP(cep: string, data: CEPData): void {
  try {
    const cleaned = cep.replace(/\D/g, '')
    const cache = localStorage.getItem(CEP_CACHE_KEY)
    const cacheData: Record<string, CEPCacheEntry> = cache ? JSON.parse(cache) : {}
    
    cacheData[cleaned] = {
      data,
      timestamp: Date.now(),
    }
    
    localStorage.setItem(CEP_CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error setting CEP cache:', error)
  }
}
