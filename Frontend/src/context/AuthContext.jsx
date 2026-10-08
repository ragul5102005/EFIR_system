import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('aegisfir-user') || 'null'))
  const signIn = (nextUser) => { setUser(nextUser); localStorage.setItem('aegisfir-user', JSON.stringify(nextUser)) }
  const signOut = () => { setUser(null); localStorage.removeItem('aegisfir-user') }
  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
