import { useState } from "react";
import {
  Salad,
  Activity,
  Moon,
  Target,
  Sparkles
} from "lucide-react";

function Lifestyle() {

  const [form, setForm] = useState({
    goal: "",
    activity: "",
    diet: "",
    sleep: "",
    water: ""
  });

  const [result, setResult] = useState("");

  const [loading, setLoading] = useState(false);


  const updateForm = (field, value) => {

    setForm((previous) => ({
      ...previous,
      [field]: value
    }));

  };


  const generatePlan = async () => {

    if (!form.goal || !form.activity || !form.diet) {

      alert(
        "Please select your goal, activity level and diet preference."
      );

      return;
    }


    setLoading(true);

    setResult("");


    try {

      const response = await fetch(
        "http://127.0.0.1:5000/api/lifestyle",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(form)
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.error || "Unable to generate plan"
        );

      }


      setResult(data.reply);

    }


    catch (error) {

      console.error(error);

      setResult(
        "Unable to connect to the AI assistant."
      );

    }


    finally {

      setLoading(false);

    }

  };


  return (

    <div className="lifestyle-page">


      {/* HEADER */}

      <div className="page-heading">

        <span>LIFESTYLE & WELLNESS</span>

        <h1>
          Build healthier daily habits 🥗
        </h1>

        <p>
          Tell us about your lifestyle and get
          general wellness and food suggestions.
        </p>

      </div>



      {/* FORM */}

      <div className="lifestyle-card">

        <div className="card-heading">

          <Target size={20} />

          <div>

            <h2>
              Your Lifestyle
            </h2>

            <p>
              Help us understand your daily routine.
            </p>

          </div>

        </div>



        {/* GOAL */}

        <div className="lifestyle-field">

          <label>
            What's your main goal?
          </label>

          <div className="choice-grid">

            {[
              "Improve overall health",
              "Increase energy",
              "Improve fitness",
              "Better sleep",
              "Healthy eating"
            ].map((item) => (

              <button
                key={item}
                className={
                  form.goal === item
                    ? "choice selected"
                    : "choice"
                }
                onClick={() =>
                  updateForm("goal", item)
                }
              >
                {item}
              </button>

            ))}

          </div>

        </div>



        {/* ACTIVITY */}

        <div className="lifestyle-field">

          <label>
            Daily activity level
          </label>

          <div className="choice-grid">

            {[
              "Low",
              "Moderate",
              "High"
            ].map((item) => (

              <button
                key={item}
                className={
                  form.activity === item
                    ? "choice selected"
                    : "choice"
                }
                onClick={() =>
                  updateForm("activity", item)
                }
              >
                <Activity size={15} />
                {item}
              </button>

            ))}

          </div>

        </div>



        {/* DIET */}

        <div className="lifestyle-field">

          <label>
            Food preference
          </label>

          <div className="choice-grid">

            {[
              "Vegetarian",
              "Non-vegetarian",
              "Vegan",
              "No preference"
            ].map((item) => (

              <button
                key={item}
                className={
                  form.diet === item
                    ? "choice selected"
                    : "choice"
                }
                onClick={() =>
                  updateForm("diet", item)
                }
              >
                <Salad size={15} />
                {item}
              </button>

            ))}

          </div>

        </div>



        {/* SLEEP */}

        <div className="lifestyle-field">

          <label>
            Average sleep
          </label>

          <select
            value={form.sleep}
            onChange={(e) =>
              updateForm("sleep", e.target.value)
            }
          >

            <option value="">
              Select
            </option>

            <option value="Less than 5 hours">
              Less than 5 hours
            </option>

            <option value="5-6 hours">
              5-6 hours
            </option>

            <option value="7-8 hours">
              7-8 hours
            </option>

            <option value="More than 8 hours">
              More than 8 hours
            </option>

          </select>

        </div>



        {/* WATER */}

        <div className="lifestyle-field">

          <label>
            Daily water intake
          </label>

          <select
            value={form.water}
            onChange={(e) =>
              updateForm("water", e.target.value)
            }
          >

            <option value="">
              Select
            </option>

            <option value="Less than 1 litre">
              Less than 1 litre
            </option>

            <option value="1-2 litres">
              1-2 litres
            </option>

            <option value="2-3 litres">
              2-3 litres
            </option>

            <option value="More than 3 litres">
              More than 3 litres
            </option>

          </select>

        </div>



        <button
          className="generate-plan"
          onClick={generatePlan}
          disabled={loading}
        >

          <Sparkles size={17} />

          {loading
            ? "Creating your plan..."
            : "Create My Wellness Plan"}

        </button>

      </div>



      {/* RESULT */}

      {result && (

        <div className="lifestyle-result">

          <div className="result-heading">

            <Salad size={20} />

            <h2>
              Your AI Wellness Plan
            </h2>

          </div>


          <div className="result-text">

            {result}

          </div>


          <div className="lifestyle-disclaimer">

            ⚠️ These are general wellness suggestions,
            not a medical diet or treatment plan.
            If you have a medical condition, food allergy,
            or special dietary requirement, consult a
            qualified healthcare professional.

          </div>

        </div>

      )}

    </div>

  );
}

export default Lifestyle;