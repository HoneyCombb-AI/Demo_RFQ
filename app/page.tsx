"use client"

import * as React from "react"
import { loginWithCode } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (code.length !== 4) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const result = await loginWithCode(code)
      if (result?.error) {
        setError(result.error)
        setCode("")
        setIsLoading(false)
      } else if (result?.success && result.redirectUrl) {
        router.push(result.redirectUrl)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  // Auto-submit when 4 digits are entered
  React.useEffect(() => {
    if (code.length === 4) {
      handleSubmit()
    }
  }, [code])

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* Top Header */}
      <header className="border-b bg-background px-6 py-4">
        <h1 className="text-xl font-bold">RFQ Reports</h1>
        <p className="text-sm text-muted-foreground">Manufacturing Analysis Portal</p>
      </header>

      {/* Main Content (Centered) */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg border-border/50 bg-background">
          <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center">
            <h2 className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Access Portal
            </h2>
            <h3 className="text-2xl font-bold mb-2">
              Enter Organization Code
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
              Enter your 4-digit code to view your reports.
            </p>

            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
              <InputOTP 
                maxLength={4} 
                value={code} 
                onChange={setCode} 
                disabled={isLoading}
                autoFocus
              >
                <InputOTPGroup className="gap-3">
                  <InputOTPSlot index={0} className="w-14 h-16 text-2xl rounded-md border" />
                  <InputOTPSlot index={1} className="w-14 h-16 text-2xl rounded-md border" />
                  <InputOTPSlot index={2} className="w-14 h-16 text-2xl rounded-md border" />
                  <InputOTPSlot index={3} className="w-14 h-16 text-2xl rounded-md border" />
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <p className="text-sm font-medium text-red-500 mt-4 h-5">
                  {error}
                </p>
              )}
              {!error && <div className="mt-4 h-5" />}

              <Button 
                type="submit" 
                className="w-full mt-4 h-12 text-xs tracking-widest font-bold uppercase"
                disabled={code.length !== 4 || isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                View Reports
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
