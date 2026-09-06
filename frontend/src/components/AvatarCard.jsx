import {
  HeartPulse,
  Pill,
  Brain,
  Activity,
  ArrowRight
} from "lucide-react";

import StatCard from "../components/StatCard";
import AvatarCard from "../components/AvatarCard";

function Dashboard() {

  return (

    <div className="dashboard">

      <div className="welcome-section">

        <div>

          <span className="welcome-label">
            PERSONAL HEALTH DASHBOARD
          </span>

          <h1>
            Good afternoon, Sabiha 👋
          </h1>

          <p>
            Here's your health overview for today.
          </p>

        </div>

        <div className="health-score">

          <div className="score-circle">
            82%
          </div>

          <div>
            <strong>Health Score</strong>
            <span>Looking good today</span>
          </div>

        </div>

      </div>


      <div className="stats-grid">

        <StatCard
          title="Health Score"
          value="82%"
          subtitle="↑ 5% from last week"
          icon={<HeartPulse />}
          type="health"
        />

        <StatCard
          title="Medicines"
          value="2 / 3"
          subtitle="1 medicine remaining"
          icon={<Pill />}
        />

        <StatCard
          title="Mood"
          value="Good"
          subtitle="Better than yesterday"
          icon={<Brain />}
        />

        <StatCard
          title="Activity"
          value="6,240"
          subtitle="Steps today"
          icon={<Activity />}
        />

      </div>


      <AvatarCard />


      <div className="dashboard-grid">

        <div className="health-tasks">

          <div className="section-heading">

            <div>
              <h2>Today's Health Tasks</h2>
              <p>Stay consistent with your wellness goals</p>
            </div>

            <button>
              View all <ArrowRight size={16} />
            </button>

          </div>

          <div className="task-list">

            <div className="task completed">
              <span>✓</span>
              <div>
                <strong>Morning medicine</strong>
                <small>8:00 AM</small>
              </div>
            </div>

            <div className="task">
              <span>○</span>
              <div>
                <strong>Drink 2 glasses of water</strong>
                <small>10:00 AM</small>
              </div>
            </div>

            <div className="task">
              <span>○</span>
              <div>
                <strong>30 minute walk</strong>
                <small>5:00 PM</small>
              </div>
            </div>

          </div>

        </div>


        <div className="wellness-card">

          <span>WELLNESS TIP</span>

          <h2>
            Take care of your mind as much as your body. 🧠
          </h2>

          <p>
            Take a few minutes today for deep breathing
            and mindful relaxation.
          </p>

          <button>
            Start exercise <ArrowRight size={16} />
          </button>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;