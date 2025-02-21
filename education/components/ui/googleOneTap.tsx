'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useCallback, useRef } from 'react'

// Type for Google One Tap Credential Response
interface GoogleCredentialResponse {
  credential: string
  select_by: string
  client_id: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: (notification: {
            isNotDisplayed(): boolean
            isSkippedMoment(): boolean
            getNotDisplayedReason(): string
            getSkippedReason(): string
          }) => void) => void
          renderButton: (parent: HTMLElement, config: any) => void
        }
      }
    }
  }
}

export default function OneTapComponent() {
  const supabase = createClient()
  const router = useRouter()
  const googleScript = useRef<HTMLScriptElement | null>(null)

  const generateNonce = async (): Promise<[string, string]> => {
    const randomBytes = new Uint8Array(32)
    crypto.getRandomValues(randomBytes)
    const nonce = btoa(String.fromCharCode.apply(null, randomBytes as unknown as number[]))
    
    const encoder = new TextEncoder()
    const encodedNonce = encoder.encode(nonce)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
    const hashArray = new Uint8Array(hashBuffer)
    const hashedNonce = Array.from(hashArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return [nonce, hashedNonce]
  }

  const handleCredentialResponse = useCallback(async (
    response: GoogleCredentialResponse, 
    nonce: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce,
      })

      if (error) throw error

      console.log('Successfully logged in with Google One Tap')
      router.refresh() // Refresh the current route to update server components
      router.push('/')
    } catch (error) {
      console.error('Error logging in with Google One Tap:', error)
    }
  }, [router, supabase.auth])

  const initializeGoogleOneTap = useCallback(async () => {
    try {
      // Check if Google script is loaded
      if (!window.google?.accounts?.id) {
        console.log('Google Identity Services not loaded yet')
        return
      }

      // Check for existing session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError

      if (session) {
        router.push('/')
        return
      }

      const [nonce, hashedNonce] = await generateNonce()

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: (response: GoogleCredentialResponse) => 
          handleCredentialResponse(response, nonce),
        nonce: hashedNonce,
        use_fedcm_for_prompt: true,
        cancel_on_tap_outside: false,
        prompt_parent_id: 'oneTap',
        context: 'signin', // or 'signup'
      })

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const reason = notification.isNotDisplayed()
            ? notification.getNotDisplayedReason()
            : notification.getSkippedReason()
          console.log('One Tap not displayed:', reason)
        }
      })
    } catch (error) {
      console.error('Error initializing Google One Tap:', error)
    }
  }, [handleCredentialResponse, router, supabase.auth])

  useEffect(() => {
    // Create and load the Google Identity Services script
    if (!googleScript.current) {
      googleScript.current = document.createElement('script')
      googleScript.current.src = 'https://accounts.google.com/gsi/client'
      googleScript.current.async = true
      googleScript.current.defer = true
      googleScript.current.onload = () => {
        console.log('Google Identity Services script loaded')
        initializeGoogleOneTap()
      }
      googleScript.current.onerror = (error) => {
        console.error('Error loading Google Identity Services:', error)
      }
      document.body.appendChild(googleScript.current)
    }

    return () => {
      // Cleanup script on unmount
      if (googleScript.current) {
        document.body.removeChild(googleScript.current)
        googleScript.current = null
      }
    }
  }, [initializeGoogleOneTap])

  // Return only the container div - script is handled in useEffect
  return (
    <div 
      id="oneTap" 
      className="fixed top-0 right-0 z-[100] m-4"
      aria-label="Google One Tap sign-in prompt"
    />
  )
}