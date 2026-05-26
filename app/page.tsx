import Link from 'next/link'
import Image from 'next/image'
import { LandingNav } from '@/components/LandingNav'

const styles = `
  @keyframes fade-in-up {
    0% { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-fade-in { animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.35s; }
  .stagger-4 { animation-delay: 0.5s; }
  .stagger-5 { animation-delay: 0.65s; }
  .hero-clip { clip-path: polygon(12% 0, 100% 0, 100% 100%, 0 100%); }
  @media (max-width: 768px) {
    .hero-clip { clip-path: none; }
  }
`

export default function LandingPage() {
  return (
    <>
      <style>{styles}</style>

      <LandingNav />

      {/* Hero */}
      <section className="relative min-h-[90vh] overflow-hidden bg-[oklch(0.205_0_0)]">
        <div className="mx-auto flex min-h-[90vh] max-w-[1440px] flex-col md:flex-row">
          {/* Text side */}
          <div className="flex flex-1 flex-col justify-center px-6 py-32 md:px-16 md:py-0 lg:px-24">
            <div className="max-w-[600px]">
              <p className="animate-fade-in-up stagger-1 mb-4 text-xs font-medium tracking-[0.2em] uppercase text-[oklch(0.7_0_0)]">
                Healthcare management
              </p>
              <h1 className="animate-fade-in-up stagger-2 mb-6 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[oklch(0.985_0_0)]">
                Your health data,
                <br />
                <span className="text-[oklch(0.85_0_0)]">clear and calm.</span>
              </h1>
              <p className="animate-fade-in-up stagger-3 mb-10 max-w-[460px] text-base leading-relaxed text-[oklch(0.65_0_0)]">
                MediTrack brings your lab results, appointments, and health records
                together in one place. No confusion. No clutter. Just clarity.
              </p>
              <div className="animate-fade-in-up stagger-4 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center rounded-[6px] bg-[oklch(0.985_0_0)] px-7 text-sm font-semibold text-[oklch(0.205_0_0)] transition-all duration-300 hover:bg-[oklch(0.9_0_0)]"
                >
                  Create free account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center rounded-[6px] border border-[oklch(0.4_0_0)] px-7 text-sm font-medium text-[oklch(0.8_0_0)] transition-all duration-300 hover:border-[oklch(0.6_0_0)] hover:text-[oklch(0.985_0_0)]"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          {/* Image side */}
          <div className="relative flex-1 md:min-h-0">
            <div className="hero-clip absolute inset-0 left-[-8%] md:left-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.205_0_0)] via-[oklch(0.205_0_0)/60%] to-transparent md:via-transparent z-10" />
              <Image
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=85"
                alt="Medical professional reviewing patient data on a tablet in a calm clinical setting"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-[oklch(0.922_0_0)] bg-[oklch(0.97_0_0)]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center px-6 py-5 md:px-16 lg:px-24">
          <p className="text-xs font-medium tracking-[0.15em] uppercase text-[oklch(0.5_0_0)]">
            Used by patients and clinics across the country
          </p>
        </div>
      </section>

      {/* Feature 1 */}
      <section className="bg-[oklch(1_0_0)]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 py-24 md:flex-row md:px-16 md:py-32 lg:px-24 lg:gap-20">
          <div className="flex-1">
            <p className="mb-6 text-xs font-medium tracking-[0.2em] uppercase text-[oklch(0.6_0_0)]">
              01
            </p>
            <h2 className="mb-5 text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[oklch(0.145_0_0)]">
              Understand your results
            </h2>
            <p className="max-w-[440px] text-base leading-relaxed text-[oklch(0.45_0_0)]">
              Every test result comes with clear normal ranges and AI-powered explanations.
              No more decoding medical jargon or waiting for a callback. Your numbers, your
              context, your peace of mind.
            </p>
          </div>
          <div className="relative h-[320px] w-full flex-1 overflow-hidden rounded-[14px] md:h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=85"
              alt="Close up of a stethoscope on a calm clinical surface, representing clear medical understanding"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Feature 2 */}
      <section className="bg-[oklch(0.97_0_0)]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-6 py-24 md:flex-row-reverse md:px-16 md:py-32 lg:px-24 lg:gap-20">
          <div className="flex-1">
            <p className="mb-6 text-xs font-medium tracking-[0.2em] uppercase text-[oklch(0.6_0_0)]">
              02
            </p>
            <h2 className="mb-5 text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[oklch(0.145_0_0)]">
              Book with confidence
            </h2>
            <p className="max-w-[440px] text-base leading-relaxed text-[oklch(0.45_0_0)]">
              Schedule appointments at your preferred labs in seconds. Choose your test,
              pick a time that works for you, and get reminders so you never miss a visit.
              Healthcare on your terms.
            </p>
          </div>
          <div className="relative h-[320px] w-full flex-1 overflow-hidden rounded-[14px] md:h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=85"
              alt="Calendar and scheduling interface representing seamless appointment booking"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[oklch(1_0_0)]">
        <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-16 md:py-32 lg:px-24">
          <div className="mb-20 max-w-[560px]">
            <p className="mb-4 text-xs font-medium tracking-[0.2em] uppercase text-[oklch(0.6_0_0)]">
              How it works
            </p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[oklch(0.145_0_0)]">
              Three steps to clarity
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-16">
            {[
              {
                step: '01',
                title: 'Create your account',
                text: 'Sign up in under a minute. Your data is encrypted and secure from the start.',
              },
              {
                step: '02',
                title: 'Book a test or upload results',
                text: 'Choose from a range of lab tests or upload results from your recent visits.',
              },
              {
                step: '03',
                title: 'Get clear insights',
                text: 'View your results with plain-language explanations and track changes over time.',
              },
            ].map((item) => (
              <div key={item.step}>
                <p className="mb-5 text-[2.5rem] font-bold leading-none tracking-[-0.03em] text-[oklch(0.85_0_0)]">
                  {item.step}
                </p>
                <h3 className="mb-3 text-lg font-semibold text-[oklch(0.145_0_0)]">
                  {item.title}
                </h3>
                <p className="max-w-[340px] text-sm leading-relaxed text-[oklch(0.45_0_0)]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-[oklch(0.97_0_0)]">
        <div className="mx-auto max-w-[880px] px-6 py-24 md:py-32 lg:px-24">
          <div className="relative">
            <div className="absolute -top-8 left-0 text-[6rem] font-bold leading-none text-[oklch(0.85_0_0)] select-none">
              &ldquo;
            </div>
            <blockquote className="relative">
              <p className="mb-8 text-[clamp(1.25rem,2.5vw,1.75rem)] font-medium leading-[1.4] tracking-[-0.01em] text-[oklch(0.145_0_0)]">
                I used to dread reading my lab results. Now I actually understand what
                everything means. MediTrack turned something stressful into something I
                can manage with confidence.
              </p>
              <footer>
                <p className="text-sm font-semibold text-[oklch(0.205_0_0)]">
                  Sarah Chen
                </p>
                <p className="text-xs text-[oklch(0.5_0_0)]">
                  MediTrack patient since 2025
                </p>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[oklch(0.205_0_0)]">
        <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-16 md:py-32 lg:px-24">
          <div className="mx-auto max-w-[600px] text-center">
            <h2 className="mb-5 text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[oklch(0.985_0_0)]">
              Ready to take control of your health?
            </h2>
            <p className="mb-10 text-base leading-relaxed text-[oklch(0.6_0_0)]">
              Join thousands of patients who manage their health data with clarity and
              calm. Free to start, always secure.
            </p>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-[6px] bg-[oklch(0.985_0_0)] px-8 text-sm font-semibold text-[oklch(0.205_0_0)] transition-all duration-300 hover:bg-[oklch(0.9_0_0)]"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[oklch(0.922_0_0)] bg-[oklch(1_0_0)]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-16 lg:px-24">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[oklch(0.205_0_0)] text-[oklch(0.985_0_0)] text-xs font-bold tracking-tight">
              M
            </div>
            <span className="text-xs font-medium text-[oklch(0.5_0_0)]">
              MediTrack &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-xs text-[oklch(0.5_0_0)] transition-colors hover:text-[oklch(0.205_0_0)]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-xs text-[oklch(0.5_0_0)] transition-colors hover:text-[oklch(0.205_0_0)]"
            >
              Sign up
            </Link>
            <Link
              href="/lab/login"
              className="text-xs text-[oklch(0.5_0_0)] transition-colors hover:text-[oklch(0.205_0_0)]"
            >
              Lab Portal
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
