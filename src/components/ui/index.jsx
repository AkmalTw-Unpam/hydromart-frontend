import { X } from 'lucide-react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

// ===== MODAL =====
export function Modal({ open, onClose, title, children, size = 'md', footer }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className={clsx('relative w-full card shadow-2xl', sizes[size])}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-navy-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
              <button onClick={onClose} className="btn-ghost w-8 h-8 p-0 rounded-lg"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && <div className="px-6 py-4 border-t border-slate-100 dark:border-navy-800 flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ===== PAGE HEADER =====
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ===== STAT CARD =====
export function StatCard({ label, value, icon: Icon, gradient, sub, trend }) {
  return (
    <div className={clsx('rounded-2xl p-5 text-white shadow-lg', gradient)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold mt-1 leading-none">{value}</p>
          {sub && <p className="text-white/60 text-xs mt-2">{sub}</p>}
          {trend && <p className="text-white/70 text-xs mt-1">↑ {trend} dari kemarin</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

// ===== STATUS BADGE =====
export function StockBadge({ status }) {
  const map = {
    empty:  { cls: 'badge-red',   label: 'Habis' },
    low:    { cls: 'badge-amber', label: 'Menipis' },
    normal: { cls: 'badge-green', label: 'Normal' },
  }
  const { cls, label } = map[status] || map.normal
  return <span className={cls}><span className="w-1.5 h-1.5 rounded-full bg-current inline-block" /> {label}</span>
}

// ===== SKELETON =====
export function Skeleton({ className }) {
  return <div className={clsx('skeleton', className)} />
}

export function TableSkeleton({ cols = 5, rows = 8 }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-navy-800">
        <Skeleton className="h-5 w-32" />
      </div>
      <table className="table">
        <thead>
          <tr>{Array.from({ length: cols }).map((_, i) => <th key={i}><Skeleton className="h-3 w-20" /></th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}><Skeleton className="h-4 w-full" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ===== PAGINATION =====
export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-slate-500 dark:text-slate-400">
      <p>Menampilkan {meta.from}–{meta.to} dari {meta.total} data</p>
      <div className="flex items-center gap-1">
        <button
          disabled={meta.current_page === 1}
          onClick={() => onPageChange(meta.current_page - 1)}
          className="btn-outline btn-sm disabled:opacity-40"
        >← Prev</button>
        {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
          const page = meta.current_page <= 3 ? i + 1
            : meta.current_page >= meta.last_page - 2 ? meta.last_page - 4 + i
            : meta.current_page - 2 + i
          if (page < 1 || page > meta.last_page) return null
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={clsx('w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                page === meta.current_page
                  ? 'bg-primary-500 text-white'
                  : 'btn-outline'
              )}
            >{page}</button>
          )
        })}
        <button
          disabled={meta.current_page === meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
          className="btn-outline btn-sm disabled:opacity-40"
        >Next →</button>
      </div>
    </div>
  )
}

// ===== EMPTY STATE =====
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center mb-4">
        <Icon size={26} className="text-slate-400 dark:text-slate-500" />
      </div>
      <p className="font-semibold text-slate-700 dark:text-slate-300">{title}</p>
      {description && <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ===== CONFIRM DIALOG =====
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading, danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || 'Konfirmasi'}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Batal</button>
          <button onClick={onConfirm} disabled={loading} className={danger ? 'btn-danger' : 'btn-primary'}>
            {loading ? 'Memproses...' : 'Ya, Lanjutkan'}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
    </Modal>
  )
}

// ===== FORM FIELD =====
export function FormField({ label, error, children, required }) {
  return (
    <div>
      <label className="input-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ===== SEARCH INPUT =====
export function SearchInput({ value, onChange, placeholder = 'Cari...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9"
      />
    </div>
  )
}
