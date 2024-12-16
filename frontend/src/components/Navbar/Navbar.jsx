import ProfileInfo from '../Cards/ProfileInfo'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../SearchBar/SearchBar'
import { useState } from 'react'

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const onLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const adminNavigate = () => {
    navigate('/Admin')
  }

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery)
    }
  }

  const onClearSearch = () => {
    setSearchQuery('')
    handleClearSearch()
  }

  return (
    <div className='bg-white flex items-center justify-between px-6 py-2 drop-shadow'>
      <h2 className='text-xl font-medium text-black py-2'>Notes</h2>

      <SearchBar
        value={searchQuery}
        onChange={({ target }) => {
          setSearchQuery(target.value)
        }}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />
      <div className='flex gap-4'>
        {userInfo?.email === 'Admin@gmail.com' ? (
          <button
            className='text-sm text-slate-700 underline'
            onClick={adminNavigate}
          >
            Admin
          </button>
        ) : (
          ''
        )}

        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      </div>
    </div>
  )
}

export default Navbar
