import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { to: "/", label: "Detect" },
  { to: "/research", label: "Research" },
  { to: "/about", label: "About" },
]

export default function Layout() {
  const loc = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Masthead / Nav */}
      <header className="border-b border-rule">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-12 py-4 sm:py-6 flex items-center justify-between gap-6">
          <Link to="/" onClick={() => setOpen(false)} className="flex items-baseline gap-3">
            <span className="text-[28px] sm:text-[36px] leading-none font-display font-light tracking-tight">
              Deep<span className="font-italic-display text-accent">Detect</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative py-1 text-[13px] font-mono uppercase tracking-[0.18em] transition-colors",
                    isActive ? "text-ink" : "text-ink-muted hover:text-ink"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-[6px] left-0 right-0 h-[2px] bg-accent"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="md:hidden p-2 -mr-2 text-ink"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-rule overflow-hidden"
            >
              <div className="px-5 py-4 flex flex-col gap-1">
                {NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "py-2.5 font-mono uppercase tracking-[0.18em] text-sm",
                        isActive ? "text-accent" : "text-ink-soft"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={loc.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-rule py-6">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.22em] text-ink-faint">
          <div className="flex flex-col gap-1.5">
            <span>© 2026 DeepDetect · MGM&rsquo;s CoET. All rights reserved.</span>
            <span>Built with 💚 for Indian students.</span>
          </div>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-ink transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-ink transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
