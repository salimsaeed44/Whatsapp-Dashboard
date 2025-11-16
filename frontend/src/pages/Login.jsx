import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect to the page user was trying to access, or default to /chats
        const from = location.state?.from?.pathname || '/chats';
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      console.error('Login form error:', err);
      // Better error message handling
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.error) {
        errorMessage = err.error;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-whatsapp-dark-bg whatsapp-bg-pattern">
      <div className="max-w-md w-full space-y-8 p-8 bg-whatsapp-dark-panel rounded-lg shadow-xl border border-whatsapp-border">
        <div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-whatsapp-green rounded-full flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-whatsapp-text-primary">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-center text-sm text-whatsapp-text-secondary">
            WhatsApp Business Dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-whatsapp-input-bg border border-whatsapp-border placeholder-whatsapp-text-tertiary text-whatsapp-text-primary rounded-t-md focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green focus:z-10 sm:text-sm"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-whatsapp-input-bg border border-whatsapp-border placeholder-whatsapp-text-tertiary text-whatsapp-text-primary rounded-b-md focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green focus:z-10 sm:text-sm"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-whatsapp-green hover:bg-whatsapp-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-whatsapp-green disabled:opacity-50 transition-colors"
            >
              {loading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

