'use client'
import { useSession, getSession } from 'next-auth/react' // usesession is a react hook which rereners the component when the session changes
import React from 'react'
import { signIn, signOut } from 'next-auth/react'

function LoginBtn() {
    const { data: session, status } = useSession()
  return (
    (!session) ? (<div>
        <button onClick ={() => signIn("google")}>
            Sign in
        </button>
    </div>)
    :
    <div>
        <button onClick = {
            () => signOut()
        }>
            Sign Out
        </button>
    </div>
  )
}

export default LoginBtn