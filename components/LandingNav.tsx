'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[oklch(0.922_0_0)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold tracking-tight transition-colors duration-500 ${
            scrolled
              ? 'bg-[oklch(0.205_0_0)] text-white'
              : 'bg-white text-[oklch(0.205_0_0)]'
          }`}
        >
          M
        </div>
        <span
          className={`text-sm font-semibold tracking-tight transition-colors duration-500 ${
            scrolled ? 'text-[oklch(0.205_0_0)]' : 'text-white/90'
          }`}
        >
          MediTrack
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/lab/login"
          className={`inline-flex h-9 items-center rounded-md px-4 text-xs font-medium transition-all duration-500 ${
            scrolled
              ? 'border border-[oklch(0.8_0_0)] text-[oklch(0.5_0_0)] hover:border-[oklch(0.6_0_0)] hover:text-[oklch(0.3_0_0)]'
              : 'border border-white/20 text-white/70 hover:border-white/40 hover:text-white'
          }`}
        >
          Lab Portal
        </Link>
        <Link
          href="/signup"
          className={`inline-flex h-9 items-center rounded-md px-5 text-sm font-semibold transition-all duration-500 ${
            scrolled
              ? 'bg-[oklch(0.205_0_0)] text-white hover:bg-[oklch(0.3_0_0)]'
              : 'bg-white text-[oklch(0.205_0_0)] hover:bg-white/90'
          }`}
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}
