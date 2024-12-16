import React, { useEffect, useState } from 'react'
import { SlArrowLeft } from 'react-icons/sl'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  const deleteUser = async (userID) => {
    try {
      const response = await axiosInstance.delete('/delete-user/' + userID)

      if (response.data && !response.data.error) {
        console.log('User Deleted Successfully')
        getAllUsers()
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log('An unexpected error, please try again')
      }
    }
  }

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get('/users')
      if (response.data) {
        setUsers(response.data)
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error(
          'Unauthorized. Only the administrator can access this information.'
        )
      } else if (error.response && error.response.status === 401) {
        localStorage.clear()
        navigate('/login')
      } else {
        console.error('Error getting user list:', error)
      }
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/get-user')
        if (response.data.user.email !== 'Admin@gmail.com') {
          navigate('/')
        } else {
          await getAllUsers()
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchUsers()
  }, [])

  const navigate = useNavigate()
  const backBottom = () => {
    navigate(-1)
  }
  return (
    <div>
      <button
        onClick={backBottom}
        className='w-10 h-10 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute left-5 top-5'
      >
        <SlArrowLeft className='text-[16px] text-white' />
      </button>

      <div className='relative overflow-x-auto shadow-md sm:rounded-lg m-4 mt-20 '>
        <h2 className='text-4xl text-center pb-5 font-sans font-thin'>
          Users Table
        </h2>
        <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
          <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            <tr>
              <th scope='col' className='px-6 py-3'>
                FullName
              </th>
              <th scope='col' className='px-6 py-3'>
                Email
              </th>
              <th scope='col' className='px-6 py-3'>
                Created On
              </th>
              <th scope='col' className='px-6 py-3'>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className='odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700'
              >
                <th
                  scope='row'
                  className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'
                >
                  {user.fullName}
                </th>
                <td className='px-6 py-4'>{user.email}</td>
                <td className='px-6 py-4'>{user.createdOn}</td>
                <td className='px-6 py-4'>
                  {user.fullName === 'Admin' ? (
                    ''
                  ) : (
                    <a
                      onClick={() => deleteUser(user._id)}
                      className='font-medium text-red-600 cursor-pointer'
                    >
                      Delete
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Admin
