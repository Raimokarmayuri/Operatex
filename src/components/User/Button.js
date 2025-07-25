import React from 'react'
import { Navigate } from 'react-router-dom'

const Button = ({children, gethandleClick}) => {

    const navigate = Navigate()

    const handleClick = () => {
        navigate(-1)
    }

  return (
    <button   onClick={handleClick}>
        {children}
    </button>
  )
}

export default Button