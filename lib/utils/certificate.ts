// Este arquivo é APENAS para uso server-side (APIs)
// Para constantes usadas no cliente, importe de './certificate-constants'

import 'server-only'

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import QRCode from 'qrcode'
import { readFileSync } from 'fs'
import { join } from 'path'
import { Buffer } from 'buffer'

// Re-exportar constantes (este arquivo é apenas server-side)
export { A4_LANDSCAPE_WIDTH, A4_LANDSCAPE_HEIGHT, MIN_BACKGROUND_WIDTH, MIN_BACKGROUND_HEIGHT } from './certificate-constants'

export interface CertificateData {
  studentName: string
  courseName: string
  issuedAt: Date
  certificateCode: string
  publicUrl: string
  backgroundImageUrl?: string
  title?: string
  subtitle?: string
  signatureLine?: string
}

export async function generateCertificatePDF(data: CertificateData): Promise<Uint8Array> {
  // Criar novo documento PDF em paisagem
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([A4_LANDSCAPE_WIDTH, A4_LANDSCAPE_HEIGHT])

  // Carregar fontes
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Adicionar imagem de fundo se fornecida
  if (data.backgroundImageUrl) {
    try {
      // Tentar carregar a imagem do caminho fornecido
      let imageBytes: Uint8Array
      
      if (data.backgroundImageUrl.startsWith('http://') || data.backgroundImageUrl.startsWith('https://')) {
        // Se for URL, fazer fetch
        const response = await fetch(data.backgroundImageUrl)
        const arrayBuffer = await response.arrayBuffer()
        imageBytes = new Uint8Array(arrayBuffer)
      } else {
        // Se for caminho local
        let imagePath: string
        if (data.backgroundImageUrl.startsWith('/uploads/')) {
          // Arquivo em uploads
          imagePath = join(process.cwd(), data.backgroundImageUrl)
        } else if (data.backgroundImageUrl.startsWith('/')) {
          // Arquivo em public
          imagePath = join(process.cwd(), 'public', data.backgroundImageUrl)
        } else {
          imagePath = data.backgroundImageUrl
        }
        imageBytes = readFileSync(imagePath)
      }

      // Determinar tipo de imagem
      let image
      if (data.backgroundImageUrl.endsWith('.png') || imageBytes[0] === 0x89) {
        image = await pdfDoc.embedPng(imageBytes)
      } else {
        image = await pdfDoc.embedJpg(imageBytes)
      }

      // Redimensionar e centralizar a imagem de fundo
      const imageDims = image.scale(1)
      const scaleX = A4_LANDSCAPE_WIDTH / imageDims.width
      const scaleY = A4_LANDSCAPE_HEIGHT / imageDims.height
      const scale = Math.max(scaleX, scaleY) // Cobrir toda a página

      page.drawImage(image, {
        x: 0,
        y: 0,
        width: imageDims.width * scale,
        height: imageDims.height * scale,
      })
    } catch (error) {
      console.error('Error loading background image:', error)
      // Continuar sem imagem de fundo se houver erro
    }
  }

  // Título do certificado
  const title = data.title || 'CERTIFICADO'
  const titleFontSize = 48
  const titleWidth = helveticaBoldFont.widthOfTextAtSize(title, titleFontSize)
  page.drawText(title, {
    x: (A4_LANDSCAPE_WIDTH - titleWidth) / 2,
    y: A4_LANDSCAPE_HEIGHT - 120,
    size: titleFontSize,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  })

  // Subtítulo (se fornecido)
  if (data.subtitle) {
    const subtitleFontSize = 24
    const subtitleWidth = helveticaFont.widthOfTextAtSize(data.subtitle, subtitleFontSize)
    page.drawText(data.subtitle, {
      x: (A4_LANDSCAPE_WIDTH - subtitleWidth) / 2,
      y: A4_LANDSCAPE_HEIGHT - 160,
      size: subtitleFontSize,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    })
  }

  // Texto principal
  const mainText = `Certificamos que ${data.studentName}`
  const mainTextFontSize = 20
  const mainTextWidth = helveticaFont.widthOfTextAtSize(mainText, mainTextFontSize)
  page.drawText(mainText, {
    x: (A4_LANDSCAPE_WIDTH - mainTextWidth) / 2,
    y: A4_LANDSCAPE_HEIGHT - 250,
    size: mainTextFontSize,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  })

  // Nome do curso
  const courseText = `concluiu o curso: ${data.courseName}`
  const courseTextFontSize = 18
  const courseTextWidth = helveticaFont.widthOfTextAtSize(courseText, courseTextFontSize)
  page.drawText(courseText, {
    x: (A4_LANDSCAPE_WIDTH - courseTextWidth) / 2,
    y: A4_LANDSCAPE_HEIGHT - 290,
    size: courseTextFontSize,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  })

  // Data de emissão
  const dateText = `Emitido em ${data.issuedAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })}`
  const dateTextFontSize = 14
  const dateTextWidth = helveticaFont.widthOfTextAtSize(dateText, dateTextFontSize)
  page.drawText(dateText, {
    x: (A4_LANDSCAPE_WIDTH - dateTextWidth) / 2,
    y: 180,
    size: dateTextFontSize,
    font: helveticaFont,
    color: rgb(0.4, 0.4, 0.4),
  })

  // Linha de assinatura (se fornecida)
  if (data.signatureLine) {
    const signatureText = data.signatureLine
    const signatureFontSize = 12
    const signatureWidth = helveticaFont.widthOfTextAtSize(signatureText, signatureFontSize)
    page.drawText(signatureText, {
      x: (A4_LANDSCAPE_WIDTH - signatureWidth) / 2,
      y: 140,
      size: signatureFontSize,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    })
  }

  // Gerar QR Code no canto inferior direito
  const qrCodeSize = 120
  const qrCodeMargin = 30
  const qrCodeX = A4_LANDSCAPE_WIDTH - qrCodeSize - qrCodeMargin
  const qrCodeY = qrCodeMargin

  // Garantir que a URL pública existe
  if (!data.publicUrl) {
    console.warn('Public URL not provided for QR code')
  }

  try {
    console.log('Generating QR code for URL:', data.publicUrl)
    
    // Gerar QR code como data URL primeiro, depois converter para buffer
    const qrCodeDataUrl = await QRCode.toDataURL(data.publicUrl, {
      width: qrCodeSize * 4, // Maior resolução para melhor qualidade
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })

    console.log('QR code generated successfully')

    // Converter data URL para buffer
    const base64Data = qrCodeDataUrl.split(',')[1]
    if (!base64Data) {
      throw new Error('Failed to extract base64 data from QR code')
    }

    // Usar Buffer global ou importado
    let qrCodeBuffer: Uint8Array
    if (typeof Buffer !== 'undefined') {
      qrCodeBuffer = Buffer.from(base64Data, 'base64')
    } else {
      // Fallback para ambiente sem Buffer
      const binaryString = atob(base64Data)
      qrCodeBuffer = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        qrCodeBuffer[i] = binaryString.charCodeAt(i)
      }
    }

    // Embed PNG do QR code
    const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer)
    
    // Desenhar QR code no canto inferior direito
    page.drawImage(qrCodeImage, {
      x: qrCodeX,
      y: qrCodeY,
      width: qrCodeSize,
      height: qrCodeSize,
    })

    // Desenhar borda ao redor do QR code (usando linhas)
    const borderWidth = 1
    const borderColor = rgb(0.5, 0.5, 0.5)
    // Linha superior
    page.drawLine({
      start: { x: qrCodeX - 2, y: qrCodeY + qrCodeSize + 2 },
      end: { x: qrCodeX + qrCodeSize + 2, y: qrCodeY + qrCodeSize + 2 },
      thickness: borderWidth,
      color: borderColor,
    })
    // Linha inferior
    page.drawLine({
      start: { x: qrCodeX - 2, y: qrCodeY - 2 },
      end: { x: qrCodeX + qrCodeSize + 2, y: qrCodeY - 2 },
      thickness: borderWidth,
      color: borderColor,
    })
    // Linha esquerda
    page.drawLine({
      start: { x: qrCodeX - 2, y: qrCodeY - 2 },
      end: { x: qrCodeX - 2, y: qrCodeY + qrCodeSize + 2 },
      thickness: borderWidth,
      color: borderColor,
    })
    // Linha direita
    page.drawLine({
      start: { x: qrCodeX + qrCodeSize + 2, y: qrCodeY - 2 },
      end: { x: qrCodeX + qrCodeSize + 2, y: qrCodeY + qrCodeSize + 2 },
      thickness: borderWidth,
      color: borderColor,
    })

    // Texto abaixo do QR code
    const qrText = 'Validar Certificado'
    const qrTextFontSize = 9
    const qrTextWidth = helveticaFont.widthOfTextAtSize(qrText, qrTextFontSize)
    page.drawText(qrText, {
      x: qrCodeX + (qrCodeSize - qrTextWidth) / 2,
      y: qrCodeY - 18,
      size: qrTextFontSize,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    })

    // URL abaixo do texto (pequena)
    const urlText = data.publicUrl.replace(/^https?:\/\//, '').substring(0, 30) + '...'
    const urlTextFontSize = 6
    const urlTextWidth = helveticaFont.widthOfTextAtSize(urlText, urlTextFontSize)
    page.drawText(urlText, {
      x: qrCodeX + (qrCodeSize - urlTextWidth) / 2,
      y: qrCodeY - 28,
      size: urlTextFontSize,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    })

    console.log('QR code drawn successfully on PDF')
  } catch (error: any) {
    console.error('Error generating QR code:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      publicUrl: data.publicUrl,
    })
    // Desenhar um placeholder se o QR code falhar
    const errorBgColor = rgb(0.9, 0.9, 0.9)
    const errorBorderColor = rgb(0.5, 0.5, 0.5)
    // Desenhar fundo (retângulo preenchido)
    page.drawRectangle({
      x: qrCodeX,
      y: qrCodeY,
      width: qrCodeSize,
      height: qrCodeSize,
      color: errorBgColor,
    })
    // Desenhar borda com linhas
    const borderThickness = 2
    page.drawLine({
      start: { x: qrCodeX, y: qrCodeY },
      end: { x: qrCodeX + qrCodeSize, y: qrCodeY },
      thickness: borderThickness,
      color: errorBorderColor,
    })
    page.drawLine({
      start: { x: qrCodeX, y: qrCodeY + qrCodeSize },
      end: { x: qrCodeX + qrCodeSize, y: qrCodeY + qrCodeSize },
      thickness: borderThickness,
      color: errorBorderColor,
    })
    page.drawLine({
      start: { x: qrCodeX, y: qrCodeY },
      end: { x: qrCodeX, y: qrCodeY + qrCodeSize },
      thickness: borderThickness,
      color: errorBorderColor,
    })
    page.drawLine({
      start: { x: qrCodeX + qrCodeSize, y: qrCodeY },
      end: { x: qrCodeX + qrCodeSize, y: qrCodeY + qrCodeSize },
      thickness: borderThickness,
      color: errorBorderColor,
    })
    // Texto de erro
    page.drawText('QR Code\nError', {
      x: qrCodeX + 15,
      y: qrCodeY + qrCodeSize / 2 - 5,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    })
  }

  // Salvar PDF
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

export function generateCertificateCode(): string {
  // Gerar código único para o certificado
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}`.toUpperCase()
}

