import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream-50 p-6 text-center">
      <Compass size={32} className="text-gold-500" />
      <p className="text-xl font-bold text-forest-950">Page not found</p>
      <p className="text-sm text-ink-900/60">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="mt-2 rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-forest-950 hover:bg-gold-600">
        Back to Dashboard
      </Link>
    </div>
  )
}