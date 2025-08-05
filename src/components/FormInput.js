import './FormInput.css';

const FormInput = (props) => {
    return <div className="form">
        <label><h3>{props.name}</h3></label>
        <input placeholder={props.placeholder} name={props.name} minLength={props.min} maxLength={props.max} max={props.maxValue}
        type={props.type}
        min={props.minValue}
        />
    </div>
}

export default FormInput;