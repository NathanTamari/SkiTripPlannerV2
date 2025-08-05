import { useState, useRef, useEffect } from "react";
import './Dropdown.css';

function Dropdown({ onChange, label, options}) {
    const[isOpen, setIsOpen] = useState(false);
    const toggleDropDown = () => setIsOpen((prev)=> !prev);
    const [message, setMessage] = useState("Choose Option");
    const dropdownRef = useRef(null);


    const changeMessage = (m) => {
        setMessage(m);
        setIsOpen(false);
        onChange(label, m);
    }

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };



    }, []);

    return ( 
        <div className="dropdown-container" ref={dropdownRef}>
            <div className="dropdown">
                <label><h3>{label}</h3></label>
                <button type="button" className="dropdown-button" onClick={toggleDropDown}>
                {message}
                </button> 

                {isOpen && (
                    <ul className="dropdown-menu">
                        {options.map((option, index) => (
                            <div className="element" key={index}>
                                <button type="button" className="element-button" onClick={() => changeMessage(option)}>{option}</button>
                            </div>
                        ))}
                    </ul>
                )}
            </div>
        </div>
        
    );
}

export default Dropdown;