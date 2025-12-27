'use client'

import { useState, useEffect } from 'react'
import { verychatService, type VeryChatUser } from '@/lib/services/verychat-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Loader2, CheckCircle2, AlertCircle, Send, X, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'
import {
  getVeryChatVerification,
  saveVeryChatVerification,
  clearVeryChatVerification,
  type VeryChatVerification,
} from '@/lib/utils/verychat-storage'

interface VeryChatLinkProps {
  walletAddress: string
  onVerificationChange?: (verification: VeryChatVerification | null) => void
}

type Step = 'input' | 'verify' | 'verified'

export function VeryChatLink({ walletAddress, onVerificationChange }: VeryChatLinkProps) {
  const { t } = useTranslation()
  const [handleId, setHandleId] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verification, setVerification] = useState<VeryChatVerification | null>(null)

  const isConfigured = verychatService.isConfigured()

  // Load existing verification from localStorage on mount
  useEffect(() => {
    if (walletAddress) {
      const stored = getVeryChatVerification(walletAddress)
      if (stored) {
        setVerification(stored)
        setStep('verified')
        onVerificationChange?.(stored)
      }
    }
  }, [walletAddress, onVerificationChange])

  async function handleRequestCode() {
    if (!handleId.trim()) return
    setLoading(true)
    setError(null)

    try {
      const result = await verychatService.requestVerificationCode(handleId)
      if (result.success) {
        setStep('verify')
        toast.success(t('verychat.codeSent'))
      } else {
        setError(result.message || t('verychat.codeRequestFailed'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verychat.codeRequestFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (!verificationCode.trim()) return
    setLoading(true)
    setError(null)

    try {
      const code = parseInt(verificationCode, 10)
      if (isNaN(code)) throw new Error(t('verychat.invalidCode'))

      // Get tokens (includes verification)
      const tokens = await verychatService.getTokens(handleId, code)

      // Save verification to localStorage
      const newVerification: VeryChatVerification = {
        handleId: handleId.replace(/^@/, ''),
        user: tokens.user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        verifiedAt: Date.now(),
      }

      saveVeryChatVerification(walletAddress, newVerification)
      setVerification(newVerification)
      setStep('verified')
      onVerificationChange?.(newVerification)
      toast.success(t('verychat.verified'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verychat.verifyFailed'))
    } finally {
      setLoading(false)
    }
  }

  function handleUnlink() {
    clearVeryChatVerification(walletAddress)
    setVerification(null)
    setStep('input')
    setHandleId('')
    setVerificationCode('')
    onVerificationChange?.(null)
    toast.success(t('verychat.unlinked'))
  }

  function handleBack() {
    setStep('input')
    setVerificationCode('')
    setError(null)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <MessageCircle className="h-4 w-4 text-violet" />
          {t('verychat.title')}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          {t('verychat.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfigured && (
          <div className="flex items-center gap-2 text-sm text-amber-500 p-2 bg-amber-500/10 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            VeryChat not configured
          </div>
        )}

        {step === 'verified' && verification ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{t('verychat.verified')}</p>
                <p className="text-xs text-muted-foreground truncate">
                  @{verification.handleId} • {verification.user.profileName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnlink}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : step === 'verify' ? (
          <div className="space-y-3">
            <div className="p-2 rounded-lg bg-violet/10 border border-violet/20">
              <p className="text-xs text-foreground">
                {t('verychat.codeInstructions')} <span className="font-medium">@{handleId}</span>
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="code" className="text-muted-foreground text-sm">
                {t('verychat.enterCode')}
              </Label>
              <Input
                id="code"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="bg-background border-border text-foreground text-center tracking-widest"
                maxLength={6}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleBack} disabled={loading}>
                {t('common.back')}
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-violet hover:bg-violet/90"
                onClick={handleVerify}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                {t('verychat.verify')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="handleId" className="text-muted-foreground text-sm">
                {t('verychat.handle')}
              </Label>
              <Input
                id="handleId"
                placeholder={t('verychat.handlePlaceholder')}
                value={handleId}
                onChange={(e) => setHandleId(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <Button
              size="sm"
              className="w-full bg-violet hover:bg-violet/90"
              onClick={handleRequestCode}
              disabled={loading || !handleId.trim() || !isConfigured}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {t('verychat.sendCode')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
