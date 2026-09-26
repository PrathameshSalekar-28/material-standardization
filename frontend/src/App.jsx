import { useState } from "react";

import {
  BrainCircuit,
  Database,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import AdminDashboard from "./pages/AdminDashboard";
import CPSEUserDashboard from "./pages/CPSEUserDashboard";

import "./App.css";


function App() {

  const [role, setRole] = useState("CPSE User");

  const [isLoggedIn, setIsLoggedIn] = useState(false);


  /* =====================================================
     LOGIN HANDLER
     ===================================================== */

  const handleLogin = (e) => {

    e.preventDefault();

    if (role === "Admin" || role === "CPSE User") {

      setIsLoggedIn(true);

    }

  };


  /* =====================================================
     ADMIN DASHBOARD
     ===================================================== */

  if (isLoggedIn && role === "Admin") {

    return <AdminDashboard />;

  }


  /* =====================================================
     CPSE USER DASHBOARD
     ===================================================== */

  if (isLoggedIn && role === "CPSE User") {

    return <CPSEUserDashboard />;

  }


  /* =====================================================
     LOGIN PAGE
     ===================================================== */

  return (

    <div className="login-page">


      {/* =================================================
          LEFT BRAND PANEL
          ================================================= */}

      <section className="brand-panel">


        {/* BRAND HEADER */}

        <div className="brand-header">

          <div className="brand-icon">

            <BrainCircuit
              size={27}
              strokeWidth={2.2}
            />

          </div>


          <div className="brand-title">

            <h1>
              MaterialAI
            </h1>

            <p>
              Material Intelligence Platform
            </p>

          </div>

        </div>


        {/* MAIN BRAND CONTENT */}

        <div className="brand-main">


          <div className="eyebrow">

            AI-DRIVEN MATERIAL STANDARDIZATION

          </div>


          <h2>

            One Nation.

            <br />

            <span>
              One Material Code.
            </span>

          </h2>


          <p className="brand-description">

            Identify similar materials, eliminate duplicate
            entries and create standardized material codes
            across CPSEs.

          </p>


          {/* PLATFORM CAPABILITIES */}

          <div className="capabilities">


            {/* AI MATCHING */}

            <div className="capability">

              <div className="capability-icon">

                <BrainCircuit size={19} />

              </div>


              <div className="capability-content">

                <h3>
                  AI Material Matching
                </h3>

                <p>
                  Detect identical and near-duplicate materials.
                </p>

              </div>

            </div>


            {/* MATERIAL MASTER */}

            <div className="capability">

              <div className="capability-icon">

                <Database size={19} />

              </div>


              <div className="capability-content">

                <h3>
                  Unified Material Master
                </h3>

                <p>
                  Harmonize descriptions, specifications and codes.
                </p>

              </div>

            </div>


            {/* HUMAN GOVERNANCE */}

            <div className="capability">

              <div className="capability-icon">

                <ShieldCheck size={19} />

              </div>


              <div className="capability-content">

                <h3>
                  Human-in-the-Loop
                </h3>

                <p>
                  Review and approve AI-generated proposals.
                </p>

              </div>

            </div>


          </div>

        </div>


        {/* BRAND FOOTER */}

        <div className="brand-bottom">

          <span>
            National Material Intelligence
          </span>


          <div className="status">

            <span className="status-dot"></span>

            <span>
              Prototype Demo
            </span>

          </div>

        </div>


      </section>


      {/* =================================================
          RIGHT LOGIN PANEL
          ================================================= */}

      <section className="login-panel">


        <div className="login-card">


          {/* LOGIN HEADER */}

          <div className="login-heading">

            <div className="secure-label">

              SECURE ACCESS

            </div>


            <h2>
              Welcome back
            </h2>


            <p>
              Sign in to continue to MaterialAI.
            </p>

          </div>


          {/* LOGIN FORM */}

          <form onSubmit={handleLogin}>


            {/* ACCESS ROLE */}

            <div className="field">

              <label>
                Access Role
              </label>


              <div className="role-selector">


                {[
                  "Admin",
                  "CPSE User",
                ].map((item) => (

                  <button

                    key={item}

                    type="button"

                    className={
                      role === item
                        ? "role-button active"
                        : "role-button"
                    }

                    onClick={() => setRole(item)}

                  >

                    {item}

                  </button>

                ))}


              </div>

            </div>


            {/* EMAIL */}

            <div className="field">

              <label htmlFor="email">
                Email address
              </label>


              <input

                id="email"

                type="email"

                placeholder="name@organization.gov.in"

                required

              />

            </div>


            {/* PASSWORD */}

            <div className="field">


              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>


                <button
                  type="button"
                  className="forgot"
                >

                  Forgot password?

                </button>

              </div>


              <input

                id="password"

                type="password"

                placeholder="Enter your password"

                required

              />

            </div>


            {/* REMEMBER ME */}

            <label className="remember">

              <input
                type="checkbox"
              />

              <span>
                Keep me signed in
              </span>

            </label>


            {/* LOGIN BUTTON */}

            <button

              type="submit"

              className="login-button"

            >

              <span>
                Continue to MaterialAI
              </span>

              <ArrowRight size={18} />

            </button>


          </form>


          {/* SECURITY FOOTER */}

          <div className="login-security">

            <ShieldCheck size={15} />

            <span>
              Protected enterprise access
            </span>

          </div>


        </div>


      </section>


    </div>

  );

}


export default App;