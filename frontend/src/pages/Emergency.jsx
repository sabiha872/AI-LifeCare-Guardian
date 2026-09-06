import { useState } from "react";
import {
  Siren,
  MapPin,
  Phone,
  CheckCircle
} from "lucide-react";

function Emergency() {

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [message, setMessage] = useState("");

  const emergencyNumber = "112";


  // Get current location
  const getLocation = () => {

    setLocationLoading(true);
    setMessage("");

    if (!navigator.geolocation) {

      setMessage(
        "Location is not supported by this browser."
      );

      setLocationLoading(false);

      return;
    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        setLocation({
          latitude,
          longitude
        });

        setLocationLoading(false);

        setMessage(
          "Your current location has been detected."
        );

      },

      () => {

        setLocationLoading(false);

        setMessage(
          "Unable to get your location. Please allow location permission."
        );

      }

    );

  };


  // SOS
  const handleSOS = () => {

    const confirmSOS = window.confirm(
      "Are you sure you want to start an emergency call?"
    );


    if (!confirmSOS) {
      return;
    }


    window.location.href = `tel:${emergencyNumber}`;

  };


  // Share location
  const shareLocation = async () => {

    if (!location) {

      getLocation();

      return;
    }


    const locationURL =
      `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;


    if (navigator.share) {

      try {

        await navigator.share({

          title: "My Emergency Location",

          text: "I need help. This is my current location:",

          url: locationURL

        });

      } catch (error) {

        console.log("Share cancelled.");

      }

    } else {

      await navigator.clipboard.writeText(
        locationURL
      );

      setMessage(
        "Location link copied to clipboard."
      );

    }

  };


  return (

    <div className="emergency-page">


      {/* HEADER */}

      <div className="page-heading">

        <span>EMERGENCY ASSISTANCE</span>

        <h1>
          Get help when you need it 🚨
        </h1>

        <p>
          Quick access to emergency services,
          your location and help resources.
        </p>

      </div>



      {/* SOS */}

      <div className="sos-card">

        <div className="sos-icon">

          <Siren size={35} />

        </div>


        <h2>
          Emergency SOS
        </h2>

        <p>
          If you are in immediate danger,
          contact emergency services.
        </p>


        <button
          className="sos-button"
          onClick={handleSOS}
        >

          <Phone size={20} />

          CALL 112

        </button>


        <small>
          India's emergency response number
        </small>

      </div>



      {/* LOCATION */}

      <div className="emergency-grid">


        <div className="emergency-card">

          <div className="emergency-card-icon">

            <MapPin size={22} />

          </div>


          <h3>
            My Location
          </h3>


          {!location ? (

            <p>
              Location not detected yet.
            </p>

          ) : (

            <div className="location-info">

              <CheckCircle size={16} />

              <span>
                Location detected
              </span>

            </div>

          )}


          <button
            className="emergency-action"
            onClick={getLocation}
          >

            {locationLoading
              ? "Detecting..."
              : "📍 Detect My Location"}

          </button>


          {location && (

            <p className="coordinates">

              {location.latitude.toFixed(5)},
              {" "}
              {location.longitude.toFixed(5)}

            </p>

          )}

        </div>



        {/* SHARE */}

        <div className="emergency-card">

          <div className="emergency-card-icon">

            <Phone size={22} />

          </div>


          <h3>
            Share My Location
          </h3>

          <p>
            Send your current location to
            someone you trust.
          </p>


          <button
            className="emergency-action"
            onClick={shareLocation}
          >

            📤 Share Location

          </button>

        </div>


      </div>



      {/* MESSAGE */}

      {message && (

        <div className="emergency-message">

          {message}

        </div>

      )}



      {/* SAFETY */}

      <div className="emergency-info">

        <h3>
          ⚠️ Important
        </h3>

        <p>
          LifeCare Guardian is an assistance tool.
          In a serious or life-threatening emergency,
          contact emergency services directly.
        </p>

      </div>

    </div>

  );
}

export default Emergency;