import { useState } from "react";
import './CheckBox.css';

const CheckBox = ({ name, onChange}) => {
    const[isTrue, changeTrue] = useState(false);
    const toggleTrue = () => {
        changeTrue(!isTrue)
        onChange(name, !isTrue);
    };
    return <div className="form-checkbox">
        <label><h3>{name}</h3></label>
        <button type='button' onClick={toggleTrue}>{isTrue ? "☑" : "☐"}</button>
    </div>
}

export default CheckBox;