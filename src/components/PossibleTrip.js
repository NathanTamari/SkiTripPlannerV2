import './PossibleTrip.css';

function PossibleTrip({ name, drivingTime }) {

    return (
        <div className='trip-main'>
            <h3 className="head">{name}</h3>
             <p className='head'>{drivingTime} drive.</p>
        </div>
    )
}

export default PossibleTrip;