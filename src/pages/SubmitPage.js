import './SubmitPage.css'
import { calculateResortsDriving } from '../scripts/drivingTimeLogic';
import PossibleTrip from '../components/PossibleTrip';
import { useState } from 'react';
import { sort_resorts } from '../scripts/sort';
import SortByDropdown from '../components/SortByDropdown';

function SubmitPage({ data }) {
  const [resorts, setResorts] = useState(() =>
    calculateResortsDriving(data.Region, data["Zip Code"])
  );

  const handleFormChange = (_title, value) => {
    handleSubmit(value);
  };

  const handleSubmit = (value) => {
    const sorted = sort_resorts(resorts, value);
    setResorts(sorted);
  };

  let header = `Available ski trips in the ${data.Region ?? "U.S."}`;
  header += data["Zip Code"] ? ` leaving from ${data["Zip Code"]}:` : ":";

  return (
    <div className="submit-page">
      <div className="data-handling">
        <div className="top-row">
          <h2>{header}</h2>
          <div className="sort-by">
            <SortByDropdown
              options={["Relevant", "Distance", "Price", "Most Trails"]}
              label="Sort By"
              onChange={handleFormChange}
            />
          </div>
        </div>

        {resorts.length > 0 ? (
          <div>
            <div className="resort-grid">
              {resorts.map((element, index) => (
                <PossibleTrip
                  key={index}
                  name={element.name}
                  drivingTime={element.drivingTime}
                  ticket_cost={element.ticket_cost}
                  score={element.popularity}
                  housing_cost={7}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h1>Invalid zip code. try again</h1>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmitPage;
