export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return regex.test(email)
}

export const getInitials = (name) => {
  if (!name) return ''

  return name
    .split(' ')
    .map((name) => name.charAt(0).toUpperCase())
    .join('')
}
