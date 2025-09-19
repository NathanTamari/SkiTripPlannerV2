import { useState } from "react";
import axios from "axios";

export default function PredictPrice({ data }) {
    const [price, setPrice] = useState(null);
    const[loading, setLoading] = useState(false);

    const handlePredictPrice = async () => {
        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:8000/predict_price",data );
                setPrice(response.data.predicted_price);
        } catch (error) {
                  setPrice("Error fetching prediction");
        }
        setLoading(false);
    };
    return { price, loading, handlePredictPrice};
    }