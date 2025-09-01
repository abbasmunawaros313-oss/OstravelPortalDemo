import { useState } from "react";
import { MdFlightTakeoff } from "react-icons/md";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      // The onAuthStateChanged listener in AuthContext will handle the redirect.
      // We can navigate to a default loading page or just wait.
      // For simplicity, we'll let the router in App.jsx handle the redirect
      // after the user state is updated.
      toast.success("Login successful!");
      // The navigation will be handled by the main App component based on user role.
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Invalid email or password!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        {/* Logo & Title */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <MdFlightTakeoff className="text-blue-500 text-4xl" />
          <h1 className="text-2xl font-bold">
            <span className="text-blue-500">Os</span>
            <span className="text-gray-800">Travel</span>
            <span className="text-green-500">Portal</span>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
