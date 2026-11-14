
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Mail, Lock, Eye, EyeOff, ArrowRight,
  ArrowLeft, Globe2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GlobalGlobe from '../components/GlobalGlobe';
import './Login.css';

export default function Login() {
  const [screen, setScreen] = useState('welcome');
  const [form, setForm] = useState({
    email: 'admin@supplychain.com',
    password: 'admin123'
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="lc-entry">

      <AnimatePresence mode="wait">

        {screen === 'welcome' ? (
          <motion.section
            key="welcome"
            className="lc-welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.5 }}
          >

            <GlobalGlobe />

            <header className="lc-brand">
              <div className="lc-brand-icon">
                <Truck size={23} />
              </div>
              <div>
                <h1>LogiCommand</h1>
                <span>GLOBAL OPERATIONS</span>
              </div>
            </header>

            <div className="lc-welcome-content">
              <div className="lc-welcome-label">
                <span className="lc-status-dot" />
                GLOBAL SUPPLY CHAIN VISIBILITY
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <h2>
                  Welcome to your
                  <span> Command Center.</span>
                </h2>

                <p>
                  Every shipment. Every route. One unified view.
                  Stay connected to your global supply chain.
                </p>

                <button
                  className="lc-enter-button"
                  onClick={() => setScreen('login')}
                >
                  Enter Command Center
                  <ArrowRight size={19} />
                </button>
              </motion.div>
            </div>

            <footer className="lc-welcome-footer">
              <span>LOGICOMMAND</span>
              <span>CONNECTING GLOBAL OPERATIONS</span>
            </footer>

          </motion.section>

        ) : (

          <motion.section
            key="login"
            className="lc-login-screen"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >

            <button
              className="lc-back-button"
              onClick={() => {
                setError('');
                setScreen('welcome');
              }}
            >
              <ArrowLeft size={17} />
              Back to welcome
            </button>

            <div className="lc-login-card">

              <div className="lc-login-logo">
                <div className="lc-brand-icon">
                  <Truck size={22} />
                </div>
              </div>

              <div className="lc-login-heading">
                <h2>LogiCommand</h2>
                <p>Sign in to continue</p>
                <span>
                  Access your supply chain operations workspace.
                </span>
              </div>

              {error && (
                <div className="lc-error">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="lc-form">

                <div className="lc-field">
                  <label htmlFor="lc-email">Email address</label>

                  <div className="lc-input-wrap">
                    <Mail size={18} />
                    <input
                      id="lc-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="Enter your email"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="lc-field">
                  <label htmlFor="lc-password">Password</label>

                  <div className="lc-input-wrap">
                    <Lock size={18} />
                    <input
                      id="lc-password"
                      type={showPass ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      className="lc-eye-button"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass
                        ? <EyeOff size={18} />
                        : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="lc-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="lc-spinner" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

              </form>

              <div className="lc-login-footer">
                <Globe2 size={15} />
                Secure access to LogiCommand
              </div>

            </div>

            <div className="lc-login-copyright">
              © 2026 LogiCommand. All rights reserved.
            </div>

          </motion.section>

        )}

      </AnimatePresence>
    </main>
  );
}
