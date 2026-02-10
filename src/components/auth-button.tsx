'use client'

import * as React from "react"
import { LogIn, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

export function AuthButton() {
  const router = useRouter()
  const { isLoggedIn, logout, user } = useAuth()

  const handleAuth = () => {
    if (isLoggedIn) {
      logout()
    } else {
      // Redirect to auth page (defaults to register mode)
      router.push('/auth')
    }
  }

  return (
    <div className="fixed top-4 right-16 z-50 flex items-center gap-2">
      {isLoggedIn && user?.name && (
        <span className="text-sm font-medium">
          {user.name}
        </span>
      )}
      <Button
        variant="outline"
        onClick={handleAuth}
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
    </div>
  )
}

