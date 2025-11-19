'use client'

import { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface SignatureCanvasProps {
  onSignatureChange?: (signature: string | null) => void
  initialSignature?: string | null
  width?: number
  height?: number
}

export function SignatureCanvasComponent({
  onSignatureChange,
  initialSignature,
  width = 600,
  height = 200
}: SignatureCanvasProps) {
  const sigPadRef = useRef<SignatureCanvas>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Carregar assinatura inicial se houver
    if (initialSignature && sigPadRef.current) {
      const img = new Image()
      img.src = initialSignature
      img.onload = () => {
        const ctx = sigPadRef.current?.getCanvas().getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
        }
      }
    }
  }, [initialSignature, width, height])

  const handleClear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear()
      if (onSignatureChange) {
        onSignatureChange(null)
      }
    }
  }

  const handleEnd = () => {
    if (sigPadRef.current && onSignatureChange) {
      const signature = sigPadRef.current.toDataURL('image/png')
      onSignatureChange(signature)
    }
  }

  return (
    <div className="space-y-3">
      <div className="border-2 border-border rounded-lg bg-white p-4" style={{ width, height: height + 40 }}>
        <SignatureCanvas
          ref={sigPadRef}
          canvasProps={{
            width,
            height,
            className: 'signature-canvas'
          }}
          backgroundColor="white"
          onEnd={handleEnd}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClear}
        className="w-full sm:w-auto"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Limpar Assinatura
      </Button>
    </div>
  )
}

