import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import './HomePage.css';
import backgroundVideo from '../media/ski-video.mp4';
import FormInput from '../components/FormInput';
import Dropdown from "../components/Dropdown";
import CheckBox from "../components/CheckBox";
import DateSelector from "../components/DateSelector";
import SubmitPage from "./SubmitPage";

function HomePage() {
    const [init, setInit] = useState(false);
    const [data, setData] = useState(null);
    const [formValues, setFormValues] = useState({});

const handleFormChange = (title, value) => {
    setFormValues(prev => {
        if (title === "Start Date") {
            return { ...prev, [title]: value, "End Date": value };
        } else {
            return { ...prev, [title]: value };
        }
    });
};


    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const options = useMemo(
        () => ({
            autoPlay: true,
            clear: true,
            delay: 0.1,
            detectRetina: true,
            fpsLimit: 120, 
            interactivity: {
                events: {
                    onClick: { enable: false, mode: "push" }, 
                    onHover: { enable: true, mode: "repulse" }, 
                },
                modes: {
                    push: { quantity: 4 }, 
                    repulse: { distance: 260, duration: 0.4 }, 
                },
            },
            particles: {
                color: { value: "rgba(255, 255, 255, 0)" }, 
                links: {
                    color: "#ffffff", // Link color
                    distance: 150, // Distance between linked particles
                    enable: true, // Enable particle links
                    opacity: 0.9, // Link opacity
                    width: 5, // Link width
                },
                move: {
                    direction: "none", // No specific direction for particle movement
                    enable: true,
                    outModes: { default: "bounce" }, // Bounce off the edges of the canvas
                    random: false,
                    speed: 6, // Particle movement speed
                    straight: false,
                },
                number: {
                    density: { enable: true }, // Enable density control
                    value: 60, // Number of particles
                },
                opacity: { value: 0.8 }, // Particle opacity
                shape: { type: "circle" }, // Shape of particles
                size: { value: { min: 2, max: 7 } }, // Particle size range
            },
            pauseOnBlur: true, // Pause particles animation on window blur
            pauseOnOutsideViewport: false, // Pause when the canvas goes outside the viewport
            responsive: [], // Responsive settings (optional)
            smooth: true, // Enable smooth animations
            style: {}, // Add additional styles here if needed
            themes: [], // Theme options if required
            zLayers: 1, // Number of layers for particles
        }),
        []
    );

        const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const rawData = { ...Object.fromEntries(formData.entries()), ...formValues };

        // Convert Dayjs to string for submission
        const formObject = {
            ...rawData,
            "Start Date": rawData["Start Date"]?.format("YYYY-MM-DD") || "",
            "End Date": rawData["End Date"]?.format("YYYY-MM-DD") || "",
        };

        const response = await new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, data: formObject }), 1500)
        );

        if (response.success) {
            setData(response.data);
        } else {
            throw new Error("Failed to fetch data");
        }
    };


    const startDate = formValues["Start Date"] || "";
    const endDate = formValues["End Date"] || "";

    const datesAreValid = () => {
        if (!startDate && !endDate) return true;
        if (!startDate || !endDate) return false;
        return !dayjs(startDate).isAfter(dayjs(endDate));
    };


    return (
        <div className='outer'>
            <div className="video-container">
                <video autoPlay muted loop playsInline>
                    <source src={backgroundVideo} type="video/mp4" />
                    Ski Video
                </video>
                <div className="video-overlay"></div>
            </div>

            {init && ( <Particles id="tsparticles" options={options}/>)}

         { data ? ( 
            <div>
                <SubmitPage data={data}/>
            </div>

         ) : (
            <div className="input-form">
                <form onSubmit={handleSubmit}>
                    <div className="row-container">
                        <Dropdown options={["All", "Rockies", "West", "Northeast", "Midatlantic", "Midwest"]} label={"Region"} onChange={handleFormChange}/>
                        <CheckBox name={"Willing to fly?"} onChange={handleFormChange}/>
                        <Dropdown options={["AirBnB", "Hotel", "Both"]} label={"Stay"} onChange={handleFormChange}/>
                    </div>
                    <div className="row-container">
                        <FormInput name="Zip Code" placeholder="e.g. 90210" min='5' max='5' type='text'/>
                        <FormInput name='Number of Guests' label='# of guests' type='number' minValue='1' maxValue='1,000,000'/>
            
                        <CheckBox name={"Epic Pass"} onChange={handleFormChange}/>
                        <CheckBox name={"Ikon Pass"} onChange={handleFormChange}/>
                    </div>
                    <div className="date-row-wrapper">
                    <div className="row-container">
                        <DateSelector
                            name="Start Date"
                            value={formValues["Start Date"]}
                            onChange={handleFormChange}
                        />
                        <DateSelector
                            name="End Date"
                            value={formValues["End Date"]}
                            onChange={handleFormChange}
                        />
                    </div>

                    {!datesAreValid() && (
                        <p className="error-text">
                        {(!startDate || !endDate)
                            ? "Please fill out both start and end dates."
                            : "Start date must be before end date."}
                        </p>
                    )}
                    </div>
                    <button type="submit" disabled={!datesAreValid()}>
                        Find Best Trip...
                    </button>
                </form>
            </div>
         ) } 
        </div>
    );
}

export default HomePage;