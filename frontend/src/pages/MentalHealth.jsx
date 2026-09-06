import { useState } from "react";
import {
  Brain,
  Heart,
  Smile,
  Meh,
  Frown,
  Send
} from "lucide-react";

function MentalHealth() {

  const [mood, setMood] = useState("");

  const [answers, setAnswers] = useState({
    sleep: "",
    stress: "",
    energy: "",
    concentration: ""
  });

  const [result, setResult] = useState("");

  const [loading, setLoading] = useState(false);


  const moods = [
    {
      name: "Great",
      icon: <Smile size={25} />
    },
    {
      name: "Good",
      icon: <Smile size={25} />
    },
    {
      name: "Okay",
      icon: <Meh size={25} />
    },
    {
      name: "Low",
      icon: <Frown size={25} />
    },
    {
      name: "Very Low",
      icon: <Frown size={25} />
    }
  ];


  const handleAnswer = (question, value) => {

    setAnswers((previous) => ({
      ...previous,
      [question]: value
    }));

  };


  const getSupport = async () => {

    if (!mood) {

      alert("Please select your mood first.");

      return;
    }


    setLoading(true);

    setResult("");


    try {

      const response = await fetch(
        "http://127.0.0.1:5000/api/mental-health",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            mood,
            answers
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.error || "Something went wrong"
        );

      }


      setResult(data.reply);

    }


    catch (error) {

      console.error(error);

      setResult(
        "Unable to connect to the AI assistant right now."
      );

    }


    finally {

      setLoading(false);

    }

  };


  return (

    <div className="mental-page">


      {/* HEADER */}

      <div className="page-heading">

        <span>MENTAL WELLNESS</span>

        <h1>
          How are you feeling today? 🧠
        </h1>

        <p>
          Take a moment to check in with yourself.
        </p>

      </div>



      {/* MOOD */}

      <div className="mental-card">

        <div className="card-heading">

          <Heart size={20} />

          <div>

            <h2>
              Daily Mood Check-in
            </h2>

            <p>
              Choose the option that best describes
              how you feel today.
            </p>

          </div>

        </div>


        <div className="mood-options">

          {moods.map((item) => (

            <button

              key={item.name}

              className={
                mood === item.name
                  ? "mood-option selected"
                  : "mood-option"
              }

              onClick={() =>
                setMood(item.name)
              }

            >

              {item.icon}

              <span>
                {item.name}
              </span>

            </button>

          ))}

        </div>

      </div>



      {/* QUESTIONS */}

      <div className="mental-card">

        <div className="card-heading">

          <Brain size={20} />

          <div>

            <h2>
              Wellness Check
            </h2>

            <p>
              A few simple questions about today.
            </p>

          </div>

        </div>


        <div className="questions">


          <Question
            title="How well did you sleep?"
            value={answers.sleep}
            onChange={(value) =>
              handleAnswer("sleep", value)
            }
          />


          <Question
            title="How stressed do you feel?"
            value={answers.stress}
            onChange={(value) =>
              handleAnswer("stress", value)
            }
          />


          <Question
            title="How is your energy today?"
            value={answers.energy}
            onChange={(value) =>
              handleAnswer("energy", value)
            }
          />


          <Question
            title="How is your concentration?"
            value={answers.concentration}
            onChange={(value) =>
              handleAnswer("concentration", value)
            }
          />

        </div>


        <button
          className="support-button"
          onClick={getSupport}
          disabled={loading}
        >

          <Send size={17} />

          {loading
            ? "Getting support..."
            : "Get AI Wellness Support"}

        </button>

      </div>



      {/* RESULT */}

      {result && (

        <div className="mental-result">

          <div className="result-heading">

            <Brain size={20} />

            <h2>
              Your AI Wellness Companion
            </h2>

          </div>


          <div className="result-text">

            {result}

          </div>


          <div className="mental-disclaimer">

            💚 This feature provides general wellness
            support and is not a diagnosis or substitute
            for professional mental-health care.

          </div>

        </div>

      )}

    </div>

  );
}


function Question({
  title,
  value,
  onChange
}) {

  const options = [
    "Poor",
    "Okay",
    "Good"
  ];


  return (

    <div className="question">

      <strong>
        {title}
      </strong>


      <div className="answer-options">

        {options.map((option) => (

          <button

            key={option}

            className={
              value === option
                ? "answer selected"
                : "answer"
            }

            onClick={() =>
              onChange(option)
            }

          >

            {option}

          </button>

        ))}

      </div>

    </div>

  );

}


export default MentalHealth;