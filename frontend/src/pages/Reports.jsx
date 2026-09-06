import { useState } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  AlertCircle
} from "lucide-react";

function Reports() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);


  const handleFileChange = (event) => {

    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setResult("");

  };


  const analyzeReport = async () => {

    if (!file) {

      alert("Please select a medical report first.");

      return;

    }


    setLoading(true);
    setResult("");


    const formData = new FormData();

    formData.append("file", file);


    try {

      const response = await fetch(
        "http://127.0.0.1:5000/api/analyze-report",
        {
          method: "POST",
          body: formData
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.error || "Unable to analyze report"
        );

      }


      setResult(data.reply);

    }

    catch (error) {

      console.error(error);

      setResult(
        "❌ " + error.message
      );

    }

    finally {

      setLoading(false);

    }

  };


  return (

    <div className="reports-page">

      <div className="page-heading">

        <span>
          MEDICAL REPORT ANALYZER
        </span>

        <h1>
          Understand your reports 🩺
        </h1>

        <p>
          Upload a medical report and get a
          simple AI-generated explanation.
        </p>

      </div>


      <div className="report-upload-card">

        <div className="report-upload-icon">

          <FileText size={25} />

        </div>


        <h2>
          Upload Medical Report
        </h2>


        <p>
          PDF, JPG, JPEG and PNG supported
        </p>


        <label className="upload-button">

          <Upload size={17} />

          Choose Report

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            hidden
          />

        </label>


        {file && (

          <div className="selected-file">

            📄 {file.name}

          </div>

        )}


        <button
          className="analyze-button"
          onClick={analyzeReport}
          disabled={!file || loading}
        >

          <Sparkles size={17} />

          {loading
            ? "Analyzing..."
            : "Analyze Report"}

        </button>

      </div>


      {result && (

        <div className="report-result">

          <div className="result-heading">

            <Sparkles size={19} />

            <h2>
              AI Report Explanation
            </h2>

          </div>


          <div
            className="result-text"
            style={{
              whiteSpace: "pre-wrap",
              padding: "25px",
              lineHeight: "1.7",
              fontSize: "13px"
            }}
          >

            {result}

          </div>


          <div className="report-warning">

            <AlertCircle size={17} />

            <span>

              AI-generated information is for
              educational purposes only and is not
              a medical diagnosis.

            </span>

          </div>

        </div>

      )}

    </div>

  );

}


export default Reports;