'use client'

import * as React from "react"
import { LogIn, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function AuthButton() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [userName, setUserName] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Check localStorage for authentication
    const userId = localStorage.getItem('userId')
    const name = localStorage.getItem('userName')
    setIsLoggedIn(!!userId)
    setUserName(name)
  }, [])

  const handleAuth = () => {
    if (isLoggedIn) {
      // Logout
      localStorage.removeItem('userId')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userName')
      setIsLoggedIn(false)
      setUserName(null)
      router.push('/')
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
