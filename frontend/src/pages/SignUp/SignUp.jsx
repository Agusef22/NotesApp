import { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import PasswordInput from '../../components/Input/PasswordInput'
import { Link, useNavigate } from 'react-router-dom'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'

const SignUp = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignUp = async (e) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!password) {
      setError('Please enter the password')
      return
    }

    if (!name) {
      setError('Please enter the name')
      return
    }

    setError('')
    try {
      const response = await axiosInstance.post('/create-account', {
        fullName: name,
        email: email,
        password: password
      })

      if (response.data && response.data.error) {
        setError(response.data.message)
        return
      }

      if (response.data && response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken)
        navigate('/dashboard')
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message)
      } else {
        setError('An unexpected error ocurred, please try again')
      }
    }
  }

  return (
    <div>
      <div className='flex items-center justify-center mt-28 gap-16'>
        <div className=''>
          <h2 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl'>
            Notes App
          </h2>
        </div>
        <div className='w-96 border rounded bg-white px-7 py-10'>
          <form onSubmit={handleSignUp}>
            <h4 className='text-2xl mb-7'>SignUp</h4>

            <input
              type='text'
              placeholder='Name'
              className='input-box'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type='text'
              placeholder='Email'
              className='input-box'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}

            <button type='submit' className='btn-primary'>
              Creact Account
            </button>

            <p className='text-sm text-center mt-4'>
              Already have an account?{''}
              <Link to='/login' className='font-medium text-primary underline'>
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignUp
