import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store'
import { authApi } from '../../services/api'
import { PageHeader, FormField } from '../../components/ui'
import { User, Lock, Camera, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user: rawUser, updateUser } = useAuthStore()
  
  // UNTUK MEMBONGKAR BUNGKUSAN: Jika data terbungkus di dalam .user, kita ambil data utamanya langsung
  const user = rawUser?.user || rawUser

  const [tab, setTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', department: '' })
  const [passForm, setPassForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [saving, setSaving] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  // Sinkronisasi data saat user dari store tersedia
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        department: user.department || ''
      })
      setAvatarPreview(user.avatar_url)
    }
  }, [user])

  const handleAvatarChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setAvatar(f)
    setAvatarPreview(URL.createObjectURL(f))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(profileForm).forEach(([k, v]) => fd.append(k, v))
      if (avatar) fd.append('avatar', avatar)
      
      const { data } = await authApi.updateProfile(fd)
      // Mengambil data dari response yang mungkin terbungkus 'user'
      updateUser(data.user || data) 
      toast.success('Profil berhasil diperbarui.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil.')
    }
    setSaving(false)
  }

  const handleSavePassword = async () => {
    setSaving(true)
    try {
      await authApi.changePassword(passForm)
      toast.success('Password berhasil diubah.')
      setPassForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password.')
    }
    setSaving(false)
  }

  const ROLE_COLORS = { admin: 'badge-red', manager: 'badge-blue', staff: 'badge-green' }

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Profil Saya" subtitle="Kelola informasi akun dan keamanan" />

      {/* Avatar Card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="relative">
          <img src={avatarPreview || user?.avatar_url || '/default-avatar.png'} alt={user?.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-100 dark:ring-primary-900/30" />
          <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-600 transition-colors">
            <Camera size={13} className="text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{user?.name || 'Ahmad Fauzi'}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <span className={`mt-1.5 inline-block ${ROLE_COLORS[user?.role] || 'badge-slate'}`}>{user?.role_label || 'Administrator'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white dark:bg-navy-900 rounded-2xl border border-slate-100 dark:border-navy-800 w-fit">
        {[{ id: 'profile', label: 'Informasi Profil', icon: User }, { id: 'password', label: 'Keamanan', icon: Lock }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-navy-800'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* Profile Form */}
      {tab === 'profile' && (
        <div className="card p-6 space-y-4">
          <FormField label="Nama Lengkap" required>
            <input className="input" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
          </FormField>
          <FormField label="No. Telepon">
            <input className="input" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+62..." />
          </FormField>
          <FormField label="Departemen">
            <input className="input" value={profileForm.department} onChange={e => setProfileForm(p => ({ ...p, department: e.target.value }))} placeholder="Nama departemen..." />
          </FormField>
          <div className="pt-2">
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
              <Save size={15} />{saving ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </div>
      )}

      {/* Password Form */}
      {tab === 'password' && (
        <div className="card p-6 space-y-4">
          <FormField label="Password Saat Ini" required>
            <input type="password" className="input" value={passForm.current_password} onChange={e => setPassForm(p => ({ ...p, current_password: e.target.value }))} />
          </FormField>
          <FormField label="Password Baru" required>
            <input type="password" className="input" value={passForm.password} onChange={e => setPassForm(p => ({ ...p, password: e.target.value }))} />
          </FormField>
          <FormField label="Konfirmasi Password Baru" required>
            <input type="password" className="input" value={passForm.password_confirmation} onChange={e => setPassForm(p => ({ ...p, password_confirmation: e.target.value }))} />
          </FormField>
          <div className="pt-2">
            <button onClick={handleSavePassword} disabled={saving} className="btn-primary">
              <Lock size={15} />{saving ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}