'use client'

import { useState } from 'react'
import Header from '../header'
import Footer from '../components/Footer'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <>
      <Header />

      <main id="mainContent" className="inner-page">
        <section className="auth-shell">
          <h1>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</h1>

          <form onSubmit={(event) => event.preventDefault()} className="auth-form">
            {!isLogin ? (
              <label>
                Full Name
                <input type="text" placeholder="Enter your full name" />
              </label>
            ) : null}

            <label>
              Email
              <input type="email" placeholder="Enter your email" />
            </label>

            <label>
              Password
              <input type="password" placeholder="Enter your password" />
            </label>

            <button type="submit">{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</button>
          </form>

          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button type="button" onClick={() => setIsLogin((prev) => !prev)}>
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </section>
      </main>

      <Footer />
    </>
  )
}
