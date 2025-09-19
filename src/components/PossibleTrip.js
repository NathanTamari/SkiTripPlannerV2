import './PossibleTrip.css';

function PossibleTrip({ name, drivingTime, ticket_cost, score, housing_cost }) {
    return (
        <div className='trip-main'>
            <h3 className="head">{name}</h3>
             <p>{drivingTime} drive.</p>
             <p >${ticket_cost} lift ticket</p>
             <p>{score}/10 popularity</p>
             <p>Est. Housing Cost: ${housing_cost}</p>
        </div>
    )
}

export default PossibleTrip;