"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  document?: string
  isEmailVerified: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "REGISTER_START" }
  | { type: "REGISTER_SUCCESS"; payload: User }
  | { type: "REGISTER_FAILURE" }
  | { type: "LOAD_USER"; payload: User | null }

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return {
        ...state,
        isLoading: true,
      }

    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
      }

    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }

    case "LOAD_USER":
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: !!action.payload,
      }

    default:
      return state
  }
}

const AuthContext = createContext<{
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => Promise<void>
  logout: () => void
} | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("vtex-user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        dispatch({ type: "LOAD_USER", payload: user })
      } catch (error) {
        console.error("Failed to load user from localStorage:", error)
        dispatch({ type: "LOAD_USER", payload: null })
      }
    } else {
      dispatch({ type: "LOAD_USER", payload: null })
    }
  }, [])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("vtex-user", JSON.stringify(state.user))
    } else {
      localStorage.removeItem("vtex-user")
    }
  }, [state.user])

  const login = async (email: string, password: string) => {
    dispatch({ type: "LOGIN_START" })

    try {
      // Simulate API call - replace with actual VTEX authentication
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data - replace with actual API response
      const user: User = {
        id: "user-123",
        email,
        firstName: "John",
        lastName: "Doe",
        phone: "+1234567890",
        document: "123.456.789-00",
        isEmailVerified: true,
      }

      dispatch({ type: "LOGIN_SUCCESS", payload: user })
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" })
      throw new Error("Login failed. Please check your credentials.")
    }
  }

  const register = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => {
    dispatch({ type: "REGISTER_START" })

    try {
      // Simulate API call - replace with actual VTEX user creation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data - replace with actual API response
      const user: User = {
        id: "user-" + Date.now(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isEmailVerified: false,
      }

      dispatch({ type: "REGISTER_SUCCESS", payload: user })
    } catch (error) {
      dispatch({ type: "REGISTER_FAILURE" })
      throw new Error("Registration failed. Please try again.")
    }
  }

  const logout = () => {
    dispatch({ type: "LOGOUT" })
  }

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
