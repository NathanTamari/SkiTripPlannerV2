import './SubmitPage.css'
import { calculateResortsDriving } from '../scripts/drivingTimeLogic';
import PossibleTrip from '../components/PossibleTrip';
import { useState } from 'react';
import Dropdown from '../components/Dropdown';
import { sort_resorts } from '../scripts/sort';

function SubmitPage({ data }) {
  const [resorts, setResorts] = useState(()=>
    calculateResortsDriving(data.Region, data["Zip Code"]));

  const handleFormChange  = (title , value) => {
    handleSubmit({title, value});
};

  const handleSubmit = async ({value}) =>  {
    const sorted = sort_resorts(resorts, value);
    setResorts(sorted);
  };

  let header = `Available ski trips in the ${data.Region}`
  header += data["Zip Code"] ? ` leaving from ${data["Zip Code"]}:` : ':'; 

      return (
        <div className="submit-page">
          <div className='data-handling'>
            <div className='top-row'>
              <h2>{header}</h2>
              <form onChange={handleSubmit} className='sort-by'>  
                <Dropdown options={["Relevant", "Distance", "Price", "Most Trails"]} label={""} onChange={handleFormChange}/>
              </form>
            </div>
            
              {resorts.length > 0 ? (
              <div>
                <div className='resort-grid'>
                {resorts.map((element, index) => (
                    <PossibleTrip key={index} name={element.name} drivingTime={element.drivingTime}/>
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
      )
    }
    
    export default SubmitPage;