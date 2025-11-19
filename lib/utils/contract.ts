// Utilitários para geração de contrato PDF

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export interface ContractData {
  nome?: string
  cpf?: string
  email?: string
  data?: string
  [key: string]: any
}

// Substituir tags no texto do contrato
export function replaceContractTags(text: string, data: ContractData): string {
  let result = text
  
  // Substituir tags condicionais {{#campo}}...{{/campo}}
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
    if (data[key] && data[key] !== '') {
      return content
    }
    return ''
  })
  
  // Substituir tags no formato {{tag}}
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    const value = data[key] || ''
    result = result.replace(regex, String(value))
  })
  
  // Substituir data atual se não fornecida
  if (!data.data) {
    result = result.replace(/\{\{data\}\}/g, new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }))
  }
  
  // Limpar linhas vazias excessivas
  result = result.replace(/\n{3,}/g, '\n\n')
  
  return result
}

// Gerar PDF do contrato
export async function generateContractPDF(
  contractText: string,
  data: ContractData,
  signature?: string | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  const { width, height } = page.getSize()
  const margin = 50
  const maxWidth = width - 2 * margin
  
  // Substituir tags
  const processedText = replaceContractTags(contractText, data)
  
  // Dividir texto em linhas
  const lines = processedText.split('\n')
  let yPosition = height - margin
  const lineHeight = 14
  const fontSize = 10
  
  // Adicionar texto do contrato
  let currentPage = page
  
  // Adicionar título (extrair do texto processado ou usar padrão)
  const titleLine = lines.find(line => line.trim().startsWith('CONTRATO')) || 'CONTRATO DE CONSTITUIÇÃO DE INSCRIÇÃO EM PROCESSO SELETIVO'
  const titleText = titleLine.trim()
  const titleWidth = boldFont.widthOfTextAtSize(titleText, 16)
  currentPage.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: yPosition,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  })
  
  yPosition -= 40
  lines.forEach((line, lineIndex) => {
    if (yPosition < margin + 150) {
      // Adicionar nova página se necessário
      currentPage = pdfDoc.addPage([595, 842])
      yPosition = height - margin
    }
    
    const trimmedLine = line.trim()
    const isEmpty = trimmedLine === ''
    const isTitle = trimmedLine.startsWith('CONTRATO')
    const isClause = trimmedLine.startsWith('Cláusula')
    const isSignatureLine = trimmedLine.startsWith('________________________________')
    
    // Pular título (já foi adicionado)
    if (isTitle) {
      return
    }
    
    if (isEmpty) {
      yPosition -= lineHeight
      return
    }
    
    if (isClause) {
      // Cláusulas em negrito
      yPosition -= 10
      const clauseWidth = boldFont.widthOfTextAtSize(trimmedLine, 12)
      if (clauseWidth > maxWidth) {
        // Quebrar cláusula se necessário
        const words = trimmedLine.split(' ')
        let currentLine = ''
        words.forEach(word => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word
          const textWidth = boldFont.widthOfTextAtSize(testLine, 12)
          if (textWidth > maxWidth && currentLine) {
            currentPage.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: 12,
              font: boldFont,
              color: rgb(0, 0, 0),
            })
            yPosition -= lineHeight + 2
            currentLine = word
          } else {
            currentLine = testLine
          }
        })
        if (currentLine) {
          currentPage.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: 12,
            font: boldFont,
            color: rgb(0, 0, 0),
          })
        }
      } else {
        currentPage.drawText(trimmedLine, {
          x: margin,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        })
      }
      yPosition -= lineHeight + 5
      return
    }
    
    if (isSignatureLine) {
      // Linha de assinatura
      yPosition -= 20
      currentPage.drawLine({
        start: { x: margin + 100, y: yPosition },
        end: { x: margin + 300, y: yPosition },
        thickness: 1,
        color: rgb(0, 0, 0),
      })
      yPosition -= lineHeight + 10
      return
    }
    
    // Texto normal - quebrar linha se muito longa
    const words = trimmedLine.split(' ')
    let currentLine = ''
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const textWidth = font.widthOfTextAtSize(testLine, fontSize)
      
      if (textWidth > maxWidth && currentLine) {
        currentPage.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        })
        yPosition -= lineHeight
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    
    if (currentLine) {
      currentPage.drawText(currentLine, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      })
      yPosition -= lineHeight
    }
    
    yPosition -= 3 // Espaçamento entre linhas
  })
  
  // Adicionar assinatura se houver
  if (signature) {
    yPosition -= 30
    
    try {
      const signatureImage = await pdfDoc.embedPng(signature)
      const signatureDims = signatureImage.scale(0.3)
      
      page.drawImage(signatureImage, {
        x: margin,
        y: yPosition - signatureDims.height,
        width: signatureDims.width,
        height: signatureDims.height,
      })
      
      yPosition -= signatureDims.height + 20
    } catch (error) {
      console.error('Error embedding signature:', error)
    }
  }
  
  // Adicionar linha de assinatura
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: margin + 200, y: yPosition },
    thickness: 1,
    color: rgb(0, 0, 0),
  })
  
  page.drawText('Assinatura', {
    x: margin,
    y: yPosition - 15,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  // Adicionar data
  page.drawText(`Data: ${data.data || new Date().toLocaleDateString('pt-BR')}`, {
    x: margin + 250,
    y: yPosition - 15,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  return await pdfDoc.save()
}

// Baixar PDF
export function downloadPDF(pdfBytes: Uint8Array, filename: string = 'contrato.pdf') {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Imprimir PDF
export function printPDF(pdfBytes: Uint8Array) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  document.body.appendChild(iframe)
  iframe.onload = () => {
    iframe.contentWindow?.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
      URL.revokeObjectURL(url)
    }, 1000)
  }
}

