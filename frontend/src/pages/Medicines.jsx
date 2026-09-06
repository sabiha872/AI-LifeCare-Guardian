function Medicines() {

  return (
    <div style={{ padding: "40px" }}>

      <h1>💊 Medicine Reminders</h1>

      <p>
        Medicine module is working!
      </p>

      <div style={{ marginTop: "30px" }}>

        <input
          type="text"
          placeholder="Medicine name"
        />

        <input
          type="time"
          defaultValue="08:00"
          style={{ marginLeft: "10px" }}
        />

        <button style={{ marginLeft: "10px" }}>
          + Add Medicine
        </button>

      </div>

    </div>
  );
}

export default Medicines;