'use client'

import * as React from "react"
import { LogIn, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

export function AuthButton() {
  const router = useRouter()
  const { isLoggedIn, logout } = useAuth()

  const handleAuth = () => {
    if (isLoggedIn) {
      logout()
    } else {
      // Redirect to auth page (defaults to register mode)
      router.push('/auth')
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleAuth}
      className="fixed top-4 right-16 z-50"
    >
      {isLoggedIn ? (
        <>
          <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
          Log out
        </>
      ) : (
        <>
          <LogIn className="h-[1.2rem] w-[1.2rem] mr-2" />
          Sign up/in
        </>
      )}
    </Button>
  )
}

